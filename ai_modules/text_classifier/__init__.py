"""
Text Classifier Module
Lightweight AI text classification for detecting:
- Fraud/Scam messages
- Safe/Normal conversation
- Suspicious content
"""

from .text_classifier import (
    TextClassifier,
    FraudDetectionResult,
    RiskLevel,
    LinkIntelligence,
)

__all__ = [
    'TextClassifier',
    'FraudDetectionResult', 
    'RiskLevel',
    'LinkIntelligence',
]
