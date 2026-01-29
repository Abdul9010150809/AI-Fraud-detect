import asyncio
import logging
from typing import Dict, List, Any
import torch
from transformers import BertTokenizer, BertForSequenceClassification, pipeline
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# Download NLTK data if not present
nltk.download('vader_lexicon', quiet=True)

class NLPProcessor:
    def __init__(self, model_name: str = "bert-base-uncased"):
        self.logger = logging.getLogger(__name__)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.fraud_keywords = [
            "urgent", "account suspended", "verify now", "click here",
            "free money", "lottery winner", "inheritance", "wire transfer"
        ]

    async def load_model(self):
        """Load BERT model and tokenizer asynchronously"""
        try:
            self.tokenizer = BertTokenizer.from_pretrained(self.model_name)
            self.model = BertForSequenceClassification.from_pretrained(
                self.model_name, num_labels=2
            ).to(self.device)
            self.logger.info(f"Loaded BERT model: {self.model_name}")
        except Exception as e:
            self.logger.error(f"Failed to load model: {e}")
            raise

    async def preprocess_text(self, text: str) -> str:
        """Preprocess text for analysis"""
        # Basic cleaning
        text = text.lower().strip()
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text

    async def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment using VADER"""
        try:
            scores = self.sentiment_analyzer.polarity_scores(text)
            return {
                "positive": scores["pos"],
                "negative": scores["neg"],
                "neutral": scores["neu"],
                "compound": scores["compound"]
            }
        except Exception as e:
            self.logger.error(f"Sentiment analysis failed: {e}")
            return {"positive": 0.0, "negative": 0.0, "neutral": 1.0, "compound": 0.0}

    async def detect_fraud_patterns(self, text: str) -> Dict[str, Any]:
        """Detect fraud patterns in text"""
        fraud_score = 0.0
        detected_patterns = []

        for keyword in self.fraud_keywords:
            if keyword in text.lower():
                fraud_score += 0.1
                detected_patterns.append(keyword)

        # Cap fraud score at 1.0
        fraud_score = min(fraud_score, 1.0)

        return {
            "fraud_score": fraud_score,
            "detected_patterns": detected_patterns,
            "is_suspicious": fraud_score > 0.3
        }

    async def classify_text(self, text: str) -> Dict[str, Any]:
        """Classify text using BERT (placeholder for fine-tuned model)"""
        # For now, return mock classification
        # In production, this would use a fine-tuned BERT model
        return {
            "label": "legitimate",
            "confidence": 0.85,
            "probabilities": {"legitimate": 0.85, "fraudulent": 0.15}
        }

    async def process_content(self, content: str, content_type: str) -> Dict[str, Any]:
        """Main processing method for text content"""
        try:
            start_time = asyncio.get_event_loop().time()

            # Preprocess
            processed_text = await self.preprocess_text(content)

            # Run analyses in parallel
            sentiment_task = self.analyze_sentiment(processed_text)
            fraud_task = self.detect_fraud_patterns(processed_text)
            classification_task = self.classify_text(processed_text)

            sentiment, fraud_detection, classification = await asyncio.gather(
                sentiment_task, fraud_task, classification_task
            )

            processing_time = asyncio.get_event_loop().time() - start_time

            result = {
                "content_type": content_type,
                "processed_text": processed_text,
                "sentiment": sentiment,
                "fraud_detection": fraud_detection,
                "classification": classification,
                "processing_time": processing_time,
                "success": True
            }

            self.logger.info(f"Processed {content_type} in {processing_time:.3f}s")
            return result

        except Exception as e:
            self.logger.error(f"Processing failed: {e}")
            return {
                "content_type": content_type,
                "error": str(e),
                "success": False
            }