"""
Text Analysis API Router
Provides /analyze endpoint for AI text classification
"""

import asyncio
import logging
import time
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, validator
from datetime import datetime

from backend.models import schemas

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/analyze", tags=["analyze"])

# Simple in-memory rate limiter (per-IP) - production should use Redis
_RATE_LIMIT_STORE: Dict[str, Dict[str, Any]] = {}
_RATE_LIMIT_LOCK = asyncio.Lock()
RATE_LIMIT = 30  # requests
RATE_WINDOW = 60  # seconds

# Maximum text length
MAX_TEXT_LENGTH = 10000

# Analysis log for dataset expansion
_ANALYSIS_LOG: list = []


async def rate_limiter(request: Request):
    """Simple rate limiter based on client IP"""
    client = request.client.host if request.client else "anonymous"
    now = time.time()
    async with _RATE_LIMIT_LOCK:
        rec = _RATE_LIMIT_STORE.get(client)
        if not rec or now - rec['start'] > RATE_WINDOW:
            _RATE_LIMIT_STORE[client] = {'count': 1, 'start': now}
            return
        if rec['count'] >= RATE_LIMIT:
            raise HTTPException(
                status_code=429, 
                detail="Too many requests. Please try again later."
            )
        rec['count'] += 1


class TextAnalyzeRequest(BaseModel):
    """Request model for text analysis"""
    text: str = Field(
        ..., 
        min_length=1, 
        max_length=MAX_TEXT_LENGTH,
        description="The text message to analyze"
    )
    user_id: Optional[str] = Field(
        None, 
        description="Optional user ID for logging"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Optional metadata"
    )
    
    @validator('text')
    def text_must_be_meaningful(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()


class TextAnalyzeResponse(BaseModel):
    """Response model for text analysis"""
    label: str = Field(..., description="Classification label")
    risk_level: str = Field(..., description="Risk level: low, medium, high")
    confidence: float = Field(..., description="Confidence score 0-1")
    explanation: str = Field(..., description="Human-readable explanation")
    indicators: list = Field(..., description="Detected indicators")
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    model: str = "text-classifier-v1"
    version: str = "1.0.0"


def sanitize_text(text: str) -> str:
    """Sanitize input text"""
    if not text:
        return text
    # Remove excessive whitespace
    cleaned = " ".join(text.strip().split())
    # Remove null bytes and control characters
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', cleaned)
    return cleaned


def log_analysis(request: Dict[str, Any], response: Dict[str, Any]):
    """Log analysis for dataset expansion"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "request": {
            "text_length": len(request.get("text", "")),
            "user_id": request.get("user_id"),
            "metadata": request.get("metadata", {})
        },
        "response": {
            "label": response.get("label"),
            "confidence": response.get("confidence"),
            "risk_level": response.get("risk_level"),
            "processing_time": response.get("processing_time")
        }
    }
    _ANALYSIS_LOG.append(log_entry)
    logger.debug(f"Logged analysis: {log_entry}")


@router.post("/text", response_model=TextAnalyzeResponse)
async def analyze_text(
    payload: TextAnalyzeRequest,
    request: Request,
    _rl: None = Depends(rate_limiter)
) -> TextAnalyzeResponse:
    """
    Analyze a text message for classification.
    
    Classifies into:
    - ai_generated: Likely AI-generated content
    - normal: Normal human conversation
    - fake_scam: Potential fraud/scam message
    
    Returns confidence score and explanation.
    """
    start_time = time.time()
    
    try:
        # Sanitize input
        text = sanitize_text(payload.text)
        
        # Import classifier
        from ai_modules.text_classifier import TextClassifier
        
        # Initialize and classify
        classifier = TextClassifier(log_analyses=False)
        result = classifier.classify(text)
        
        # Build response
        response_data = result.to_dict()
        response_data["timestamp"] = datetime.utcnow().isoformat()
        
        # Log analysis for dataset expansion
        log_analysis(payload.dict(), response_data)
        
        logger.info(
            f"Analyzed text: label={response_data['label']}, "
            f"confidence={response_data['confidence']:.2%}, "
            f"time={response_data['processing_time']:.3f}s"
        )
        
        return TextAnalyzeResponse(**response_data)
        
    except ImportError as e:
        logger.error(f"Failed to import text classifier: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Classification service unavailable"
        )
    except Exception as e:
        logger.exception(f"Error analyzing text: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error"
        )


@router.get("/health")
async def health_check() -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse()


@router.get("/log")
async def get_analysis_log():
    """Get analysis log (for debugging/dataset export)"""
    return {
        "count": len(_ANALYSIS_LOG),
        "entries": _ANALYSIS_LOG[-100:]  # Last 100 entries
    }


@router.delete("/log")
async def clear_analysis_log():
    """Clear the analysis log"""
    global _ANALYSIS_LOG
    _ANALYSIS_LOG = []
    return {"status": "cleared", "count": 0}


import re  # Import for sanitization function

