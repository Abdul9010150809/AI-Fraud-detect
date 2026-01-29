"""
Lightweight AI Text Classification Module
Classifies messages into: AI-generated, Normal, or Fake/Scam
Uses NLP-based feature extraction with weighted scoring
"""

import re
import logging
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class MessageType(Enum):
    AI_GENERATED = "ai_generated"
    NORMAL = "normal"
    FAKE_SCAM = "fake_scam"


class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass
class Indicator:
    """Represents a detected indicator with its weight"""
    name: str
    weight: float
    detected: bool
    description: str = ""


@dataclass
class ClassificationResult:
    """Result of text classification"""
    label: str
    risk_level: str
    confidence: float
    explanation: str
    indicators: List[Dict[str, Any]]
    processing_time: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "label": self.label,
            "risk_level": self.risk_level,
            "confidence": round(self.confidence, 2),
            "explanation": self.explanation,
            "indicators": self.indicators,
            "processing_time": round(self.processing_time, 3)
        }


class TextClassifier:
    """
    Lightweight text classifier using rule-based heuristics + NLP features.
    Designed for speed and explainability.
    """
    
    # Weighted indicators for each classification type
    FAKE_SCAM_INDICATORS = {
        # Urgency indicators (weight: 0.25)
        "urgency": {
            "weight": 0.25,
            "patterns": [
                r'\burgent\b', r'\bimmediately\b', r'\bright away\b', r'\bnow\b',
                r'\bact now\b', r'\bwithin \d+ (hour|minute|day)s?\b',
                r'\bexpires?\b', r'\bdeadline\b', r'\bdon\'t delay\b',
                r'\bact fast\b', r'\b hurry\b', r'\b limited time\b'
            ],
            "description": "Urgency or time pressure"
        },
        # Threat indicators (weight: 0.20)
        "threat": {
            "weight": 0.20,
            "patterns": [
                r'\bsuspended\b', r'\bterminated\b', r'\bblocked\b',
                r'\balert\b', r'\bwarning\b', r'\baction required\b',
                r'\baccount (will be|has been)\b', r'\byou must\b',
                r'\bfailure to\b', r'\bconsequences\b', r'\blegal action\b',
                r'\bearrest\b', r'\b追訴\b', r'\b逮捕\b'  # Chinese: prosecution/arrest
            ],
            "description": "Threatening tone or consequences"
        },
        # Verification/credential request (weight: 0.20)
        "verification_request": {
            "weight": 0.20,
            "patterns": [
                r'\bverify\b', r'\bverify your\b', r'\bconfirm\b',
                r'\bvalidate\b', r'\bauthentication\b', r'\blogin\b',
                r'\bpassword\b', r'\bpin\b', r'\bsecurity code\b',
                r'\b(one-time |otp |verification )?code\b',
                r'\bCVV\b', r'\bcredit card\b'
            ],
            "description": "Request for verification or credentials"
        },
        # Money/financial indicators (weight: 0.15)
        "money_request": {
            "weight": 0.15,
            "patterns": [
                r'\bfree\b', r'\bwin\b', r'\bwinner\b', r'\bprize\b',
                r'\bmoney\b', r'\bcash\b', r'\bdollar\b', r'\b\$\d+\b',
                r'\btransfer\b', r'\bwire\b', r'\bsend (money|bitcoin|crypto)\b',
                r'\binheritance\b', r'\blottery\b', r'\blucky winner\b',
                r'\bbitcoin\b', r'\bcrypto\b', r'\bwallet\b'
            ],
            "description": "Financial incentive or request"
        },
        # Link indicators (weight: 0.10)
        "suspicious_link": {
            "weight": 0.10,
            "patterns": [
                r'https?://', r'www\.', r'\.com\b', r'\.net\b',
                r'\.org\b', r'\.tk\b', r'\.ml\b', r'\.xyz\b',
                r'bit\.ly\b', r'tinyurl\b', r'ow\.ly\b'
            ],
            "description": "Contains links/URLs"
        },
        # Generic greeting (weight: 0.05)
        "generic_greeting": {
            "weight": 0.05,
            "patterns": [
                r'\bdear (customer|user|member|client)\b',
                r'\bdear email user\b', r'\bvalued customer\b',
                r'\bour customer\b', r'\bimportant notice\b'
            ],
            "description": "Generic impersonal greeting"
        },
        # Spelling/grammar issues (weight: 0.05)
        "spelling_issues": {
            "weight": 0.05,
            "patterns": [
                r'\b[you]{2,}\b', r'\b[Ii]nternet\bbanking\b',
                r'\bgrammer\b', r'\brecieve\b', r'\boccured\b'
            ],
            "description": "Spelling or grammar anomalies"
        }
    }
    
    AI_GENERATED_INDICATORS = {
        # Perfect grammar (weight: 0.25) - actually lower score if too perfect
        "perfect_grammar": {
            "weight": -0.15,  # Negative weight - too perfect is suspicious
            "patterns": [],
            "description": "Overly formal or perfect grammar"
        },
        # Lack of personal touches (weight: 0.20)
        "no_personal_touch": {
            "weight": 0.20,
            "patterns": [
                r'^dear\s+\w+$', r'^dear\s+customer\b',
                r'\bsincerely\b', r'\bbest regards\b',
                r'^hello\b.*\buser\b', r'\bvalued customer\b'
            ],
            "description": "Impersonal or template-like"
        },
        # Repetitive structure (weight: 0.20)
        "repetitive_structure": {
            "weight": 0.20,
            "patterns": [
                r'(.{20,})\1',  # Repeated phrases
                r'\bhowever\b.*\bhowever\b',
                r'\bfirstly\b.*\bsecondly\b.*\bthirdly\b'
            ],
            "description": "Repetitive or formulaic structure"
        },
        # Lack of emotion (weight: 0.15)
        "lack_of_emotion": {
            "weight": 0.15,
            "patterns": [],
            "description": "Lack of emotional expression or personal tone"
        },
        # Overly formal tone (weight: 0.15)
        "overly_formal": {
            "weight": 0.15,
            "patterns": [
                r'\bpursuant to\b', r'\bfurthermore\b',
                r'\bnotwithstanding\b', r'\bherewith\b',
                r'\bkindly\b', r'\bgood day\b'
            ],
            "description": "Overly formal or business-like tone"
        },
        # Vague content (weight: 0.10)
        "vague_content": {
            "weight": 0.10,
            "patterns": [
                r'\bsome\b.*\bsome\b', r'\bcertain\b',
                r'\bvarious\b', r'\bseveral\b', r'\bnumerous\b'
            ],
            "description": "Vague or non-specific content"
        }
    }
    
    NORMAL_INDICATORS = {
        # Natural conversation (weight: 0.30)
        "natural_conversation": {
            "weight": 0.30,
            "patterns": [
                r'\bi\b', r'\bme\b', r'\bmy\b', r'\bmine\b',
                r'\byou\b', r'\byour\b', r'\byours\b',
                r'\bhey\b', r'\bhi\b', r'\bwhat\'s up\b',
                r':\)', r':-\)', r':-\(', r':-D'  # Emojis/smileys (fixed)
            ],
            "description": "Natural conversational tone"
        },
        # Personal references (weight: 0.25)
        "personal_references": {
            "weight": 0.25,
            "patterns": [
                r'\bmy friend\b', r'\bmy mom\b', r'\bmy dad\b',
                r'\bmy boss\b', r'\bsomeone i know\b',
                r'\blast night\b', r'\btomorrow\b'
            ],
            "description": "Personal stories or references"
        },
        # Emotional expression (weight: 0.20)
        "emotional_expression": {
            "weight": 0.20,
            "patterns": [
                r'\b(ha){2,}\b', r'\blol\b', r'\blmao\b',
                r'\bomg\b', r'\bwow\b', r'\bugh\b',
                r'\bawesome\b', r'\bterrible\b', r'\bamazing\b',
                r'[!]{2,}', r'[?]{3,}'
            ],
            "description": "Emotional expression or casual language"
        },
        # Varied sentence structure (weight: 0.15)
        "varied_structure": {
            "weight": 0.15,
            "patterns": [],
            "description": "Natural variation in sentence structure"
        },
        # First-person narrative (weight: 0.10)
        "first_person": {
            "weight": 0.10,
            "patterns": [
                r'\bi (think|feel|believe|know|remember)\b',
                r'\bi was\b', r'\bi am\b', r'\bi will\b'
            ],
            "description": "First-person narrative style"
        }
    }
    
    def __init__(self, log_analyses: bool = True):
        self.log_analyses = log_analyses
        self.analysis_log: List[Dict[str, Any]] = []
        
        # Common legitimate service keywords (reduce false positives)
        self.legitimate_services = [
            'netflix', 'spotify', 'amazon', 'apple', 'google',
            'microsoft', 'paypal', 'stripe', 'github', 'dropbox'
        ]
    
    def _check_patterns(self, text: str, patterns: List[str]) -> List[str]:
        """Check text against list of regex patterns"""
        matched = []
        text_lower = text.lower()
        for pattern in patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                matched.append(pattern)
        return matched
    
    def _count_sentences(self, text: str) -> int:
        """Count number of sentences in text"""
        sentences = re.split(r'[.!?]+', text)
        return len([s for s in sentences if s.strip()])
    
    def _avg_word_length(self, text: str) -> float:
        """Calculate average word length"""
        words = re.findall(r'\b\w+\b', text)
        if not words:
            return 0
        return sum(len(w) for w in words) / len(words)
    
    def _has_emoji(self, text: str) -> bool:
        """Check if text contains emojis"""
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE)
        return bool(emoji_pattern.search(text))
    
    def _calculate_fake_scam_score(self, text: str) -> List[Indicator]:
        """Calculate fake/scam indicators and their weights"""
        indicators = []
        
        for name, config in self.FAKE_SCAM_INDICATORS.items():
            matched = self._check_patterns(text, config["patterns"])
            detected = len(matched) > 0
            indicator = Indicator(
                name=name,
                weight=config["weight"],
                detected=detected,
                description=config["description"]
            )
            indicators.append(indicator)
        
        return indicators
    
    def _calculate_ai_generated_score(self, text: str) -> List[Indicator]:
        """Calculate AI-generated indicators"""
        indicators = []
        words = text.split()
        sentence_count = self._count_sentences(text)
        avg_word_len = self._avg_word_length(text)
        
        for name, config in self.AI_GENERATED_INDICATORS.items():
            matched = self._check_patterns(text, config["patterns"])
            detected = len(matched) > 0
            
            # Special handling for perfect grammar (negative weight)
            if name == "perfect_grammar":
                # Very formal words might indicate AI
                formal_words = r'\bfurthermore\b|\btherefore\b|\bconsequently\b|\bmoreover\b'
                formal_count = len(self._check_patterns(text, [formal_words]))
                if formal_count > 0:
                    detected = True
            
            # Check for repetitive structure
            if name == "repetitive_structure":
                if len(words) > 20:
                    # Check for repeated bigrams
                    bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]
                    unique_bigrams = set(bigrams)
                    if len(unique_bigrams) / len(bigrams) < 0.7:
                        detected = True
            
            indicator = Indicator(
                name=name,
                weight=config["weight"],
                detected=detected,
                description=config["description"]
            )
            indicators.append(indicator)
        
        return indicators
    
    def _calculate_normal_score(self, text: str) -> List[Indicator]:
        """Calculate normal conversation indicators"""
        indicators = []
        words = text.split()
        
        for name, config in self.NORMAL_INDICATORS.items():
            matched = self._check_patterns(text, config["patterns"])
            detected = len(matched) > 0
            
            # Special handling for varied structure
            if name == "varied_structure":
                if len(words) > 10:
                    sentences = self._count_sentences(text)
                    if sentences > 1:
                        # Check if sentence lengths vary
                        sentence_lengths = [len(s.split()) for s in re.split(r'[.!?]+', text) if s.strip()]
                        if len(sentence_lengths) > 1:
                            avg = sum(sentence_lengths) / len(sentence_lengths)
                            variance = sum((l - avg) ** 2 for l in sentence_lengths) / len(sentence_lengths)
                            if variance > 2:  # Some variation in sentence length
                                detected = True
            
            indicator = Indicator(
                name=name,
                weight=config["weight"],
                detected=detected,
                description=config["description"]
            )
            indicators.append(indicator)
        
        return indicators
    
    def _calculate_confidence(self, indicators: List[Indicator]) -> float:
        """Calculate confidence score based on detected indicators"""
        total_weight = sum(abs(i.weight) for i in indicators)
        detected_weight = sum(i.weight for i in indicators if i.detected)
        
        if total_weight == 0:
            return 0.5
        
        # Base confidence from indicator coverage
        base_conf = abs(detected_weight) / total_weight
        
        # Adjust for uncertainty (fewer indicators = less confident)
        detected_count = sum(1 for i in indicators if i.detected)
        uncertainty_penalty = max(0, (5 - detected_count) * 0.05)
        
        confidence = min(0.95, max(0.5, base_conf - uncertainty_penalty))
        return confidence
    
    def _determine_risk_level(self, score: float) -> str:
        """Determine risk level based on score"""
        if score < 0.33:
            return RiskLevel.LOW.value
        elif score < 0.66:
            return RiskLevel.MEDIUM.value
        else:
            return RiskLevel.HIGH.value
    
    def _generate_explanation(self, label: str, indicators: List[Indicator], 
                            detected_indicators: List[Indicator]) -> str:
        """Generate human-readable explanation"""
        if label == MessageType.FAKE_SCAM.value:
            reasons = [i.description for i in detected_indicators if i.weight > 0]
            if not reasons:
                return "No obvious scam indicators detected."
            return f"Detected: {', '.join(reasons[:3])}."
        
        elif label == MessageType.AI_GENERATED.value:
            reasons = [i.description for i in detected_indicators if i.weight > 0]
            if not reasons:
                return "Message shows characteristics of AI-generated content."
            return f"Indicators: {', '.join(reasons[:3])}."
        
        else:
            positive = [i.description for i in detected_indicators if i.weight > 0]
            return f"Natural conversation with {', '.join(positive[:3]) if positive else 'typical characteristics'}."
    
    def classify(self, text: str) -> ClassificationResult:
        """
        Main classification method.
        
        Args:
            text: The message text to classify
            
        Returns:
            ClassificationResult with label, confidence, explanation, etc.
        """
        start_time = time.time()
        
        # Input validation
        if not text or not text.strip():
            return ClassificationResult(
                label="unknown",
                risk_level="low",
                confidence=0.0,
                explanation="Empty or invalid input",
                indicators=[],
                processing_time=time.time() - start_time
            )
        
        text = text.strip()
        
        # Calculate scores for each category
        fake_indicators = self._calculate_fake_scam_score(text)
        ai_indicators = self._calculate_ai_generated_score(text)
        normal_indicators = self._calculate_normal_score(text)
        
        # Calculate weighted scores
        fake_score = sum(i.weight for i in fake_indicators if i.detected)
        ai_score = sum(i.weight for i in ai_indicators if i.detected)
        normal_score = sum(i.weight for i in normal_indicators if i.detected)
        
        # Apply legitimate service check (reduce fake score for known services)
        text_lower = text.lower()
        for service in self.legitimate_services:
            if service in text_lower:
                fake_score = max(0, fake_score - 0.15)
                logger.debug(f"Reduced fake score for legitimate service: {service}")
        
        # Normalize scores
        max_possible_fake = sum(i.weight for i in fake_indicators)
        max_possible_ai = sum(i.weight for i in ai_indicators)
        max_possible_normal = sum(i.weight for i in normal_indicators)
        
        fake_score = min(1.0, fake_score / max_possible_fake) if max_possible_fake > 0 else 0
        ai_score = min(1.0, ai_score / max_possible_ai) if max_possible_ai > 0 else 0
        normal_score = min(1.0, normal_score / max_possible_normal) if max_possible_normal > 0 else 0
        
        # Determine label based on highest score
        scores = {
            MessageType.FAKE_SCAM.value: fake_score,
            MessageType.AI_GENERATED.value: ai_score,
            MessageType.NORMAL.value: normal_score
        }
        
        label = max(scores, key=scores.get)
        
        # Get indicators for the determined label
        if label == MessageType.FAKE_SCAM.value:
            all_indicators = fake_indicators
        elif label == MessageType.AI_GENERATED.value:
            all_indicators = ai_indicators
        else:
            all_indicators = normal_indicators
        
        detected_indicators = [i for i in all_indicators if i.detected]
        
        # Calculate confidence
        confidence = self._calculate_confidence(all_indicators)
        
        # Determine risk level
        risk_level = self._determine_risk_level(scores[label])
        
        # Generate explanation
        explanation = self._generate_explanation(label, all_indicators, detected_indicators)
        
        # Convert indicators to dict format
        indicators_dict = [
            {
                "name": i.name,
                "weight": i.weight,
                "detected": i.detected,
                "description": i.description
            }
            for i in all_indicators
        ]
        
        processing_time = time.time() - start_time
        
        result = ClassificationResult(
            label=label,
            risk_level=risk_level,
            confidence=confidence,
            explanation=explanation,
            indicators=indicators_dict,
            processing_time=processing_time
        )
        
        # Log analysis if enabled
        if self.log_analyses:
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "text": text,
                "label": label,
                "confidence": confidence,
                "scores": scores,
                "processing_time": processing_time
            }
            self.analysis_log.append(log_entry)
            logger.info(f"Logged analysis: {label} (conf: {confidence:.2f})")
        
        return result
    
    def get_analysis_log(self) -> List[Dict[str, Any]]:
        """Return the analysis log for dataset expansion"""
        return self.analysis_log
    
    def clear_log(self):
        """Clear the analysis log"""
        self.analysis_log = []
        logger.info("Analysis log cleared")


# Convenience function for quick classification
def quick_classify(text: str) -> Dict[str, Any]:
    """Quick classification function for simple use cases"""
    classifier = TextClassifier(log_analyses=False)
    result = classifier.classify(text)
    return result.to_dict()


if __name__ == "__main__":
    # Demo usage
    classifier = TextClassifier()
    
    test_messages = [
        "URGENT: Your account will be suspended! Verify your identity now or lose access. Click here: http://suspicious-link.com",
        "Hey! Want to grab coffee tomorrow? Been a while since we caught up :)",
        "Dear Customer, pursuant to our records, kindly verify your account information to avoid service interruption. Best regards, Support Team",
        "Congratulations! You've won $1,000,000 in our lottery! Send your bank details to claim your prize!",
        "Hey, just checking if you're free this weekend. Want to hang out?"
    ]
    
    print("=" * 60)
    print("AI Text Classification Demo")
    print("=" * 60)
    
    for msg in test_messages:
        result = classifier.classify(msg)
        print(f"\n📝 Message: {msg[:50]}...")
        print(f"   Label: {result.label}")
        print(f"   Risk: {result.risk_level}")
        print(f"   Confidence: {result.confidence:.2%}")
        print(f"   Explanation: {result.explanation}")
        print(f"   Processing Time: {result.processing_time:.3f}s")

