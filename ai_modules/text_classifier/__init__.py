"""
Text Classifier Module
Lightweight AI text classification for detecting:
- AI-generated text
- Normal human conversation
- Fake/Scam messages
"""

from .text_classifier import (
    TextClassifier,
    ClassificationResult,
    MessageType,
    RiskLevel,
    quick_classify
)

__all__ = [
    'TextClassifier',
    'ClassificationResult', 
    'MessageType',
    'RiskLevel',
    'quick_classify'
]

