
import json
import re
import logging
import time
import urllib.parse
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from spellchecker import SpellChecker

logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    SAFE = "Safe"
    SUSPICIOUS = "Suspicious"
    HIGH = "High Fraud Risk"

@dataclass
class LinkIntelligence:
    domain_age_days: int
    tld_risk: bool
    brand_spoofing: bool
    google_presence: str  # High | Medium | Low | Not Found
    reputation_summary: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "domain_age_days": self.domain_age_days,
            "tld_risk": self.tld_risk,
            "brand_spoofing": self.brand_spoofing,
            "google_presence": self.google_presence,
            "reputation_summary": self.reputation_summary
        }

@dataclass
class FraudDetectionResult:
    is_fraud: bool
    risk_score: float
    risk_level: str
    fraud_type: List[str]
    why_fraud: List[str]
    detected_signals: Dict[str, bool]
    link_intelligence: Optional[Dict[str, Any]]
    recommended_action: List[str]
    confidence: float
    processing_time: float

    def to_json(self) -> Dict[str, Any]:
        return {
            "is_fraud": self.is_fraud,
            "risk_score": round(self.risk_score, 1),
            "risk_level": self.risk_level,
            "fraud_type": self.fraud_type,
            "why_fraud": self.why_fraud,
            "detected_signals": self.detected_signals,
            "link_intelligence": self.link_intelligence,
            "recommended_action": self.recommended_action,
            "confidence": round(self.confidence, 2)
        }

class TextClassifier:
    """
    AI Fraud Detection Engine V2
    Multi-layer intelligence: Text + URL + Hybrid Decision Engine
    """
    
    # ---------------------------
    # PATTERN KNOWLEDGE BASE
    # ---------------------------
    WEIGHTS_TEXT = {
        "urgency": 80,
        "threat": 90,
        "financial_request": 75,
        "credential_harvesting": 95,
        "impersonation": 80,
        "ai_generated": 60,
        "spam_repetition": 50,
        "generic_greeting": 30
    }

    PATTERNS = {
        "urgency": [
             r'\burgent\b', r'\bimmediately\b', r'\bact now\b', r'\b24 hours?\b', 
             r'\bexpires?\b', r'\bdeadline\b', r'\battention required\b', r'\bsuspended shortly\b',
             r'\bjaldi\b', r'\bkaro\b', r'\babhi\b' # Hinglish urgency
        ],
        "threat": [
            r'\bsuspended\b', r'\bterminated\b', r'\bblocked\b', r'\blegal action\b', 
            r'\barrest\b', r'\bpolice\b', r'\bwarrant\b', r'\bcharged\b',
            r'\bfir\b', r'\bcourt\b', r'\bband ho jayega\b' # Hinglish threat
        ],
        "financial_request": [
            r'\bwire transfer\b', r'\bcrypto\b', r'\bbitcoin\b', r'\bgift cards?\b',
            r'\bsend money\b', r'\bclaim your prize\b', r'\blottery\b', r'\bwinner\b',
            r'\binheritance\b', r'\bcost is free\b', r'\bkyc\b',
            r'\bpaisa\b', r'\bank\b', r'\btransfer karo\b', r'\bjiito\b' # Hinglish financial
        ],
        "credential_harvesting": [
            r'\bpassword\b', r'\bpin\b', r'\bverification code\b', r'\botp\b',
            r'\blogin details\b', r'\bupdate your account\b', r'\bverify your identity\b',
            r'\bconfirm your details\b', r'\bsocial security\b', r'\bcredit card\b',
            r'\baadhaar\b', r'\bpan card\b'
        ],
        "impersonation": [
            r'\bamazon\b', r'\bnetflix\b', r'\bpaypal\b', r'\birs\b', r'\bapple\b', 
            r'\bmicrosoft\b', r'\bgov\b', r'\busps\b', r'\bfedex\b', r'\bdhl\b',
            r'\bsbi\b', r'\bhdfc\b', r'\bicici\b', r'\bpaytm\b', r'\bphonepe\b'
        ],
        "ai_generated": [
            r'\bkindly\b', r'\bplease be advised\b', r'\bapologies for the inconvenience\b', 
            r'\bregards\b', r'\bvalued customer\b', r'\bensure compliance\b'
        ],
        "generic_greeting": [
            r'\bdear customer\b', r'\bdear user\b', r'\bdear sir\b', r'\bdear madam\b'
        ]
    }

    SAFE_PATTERNS = [
        r'\bhey\b', r'\bhi\b', r'\bwhat\'s up\b', r'\blol\b', r'\bhaha\b', 
        r'\bcan you\b', r'\bmeet\b', r'\blunch\b', r'\bdinner\b', r'\bproject\b',
        r'\bmeeting\b', r'\bcall me\b', r'\bhome\b', r'\bkids\b', r'\bschool\b',
        r'\bkya haal\b', r'\btheek hai\b', r'\bchalo\b'
    ]

    RISKY_TLDS = [
        '.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.club', '.online', '.work', '.info', '.site', '.cn'
    ]
    
    OFFICIAL_DOMAINS = {
        "amazon": "amazon.com", "paypal": "paypal.com", "netflix": "netflix.com",
        "google": "google.com", "apple": "apple.com", "microsoft": "microsoft.com",
        "irs": "irs.gov", "sbi": "onlinesbi.sbi", "hdfc": "hdfcbank.com", "icici": "icicibank.com"
    }

    def __init__(self):
        self.spell = SpellChecker()

    # ---------------------------
    # LINK INTELLIGENCE ENGINE
    # ---------------------------
    def _analyze_link(self, url: str) -> Tuple[float, LinkIntelligence]:
        """
        Simulate deep link analysis.
        Returns: (link_risk_score [0-100], LinkIntelligence Object)
        """
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower()
        if not domain and parsed.path: # Handle "bit.ly/xyz" w/o http
             domain = parsed.path.split('/')[0]

        risk_score = 0
        reputation_log = []
        
        # 1. TLD Risk
        tld_risk = False
        for tld in self.RISKY_TLDS:
            if domain.endswith(tld):
                tld_risk = True
                risk_score += 40
                reputation_log.append(f"Suspicious top-level domain ({tld})")
                break
        
        # 2. Shortened URL Detection (Heuristic)
        is_shortened = any(x in domain for x in ['bit.ly', 'goo.gl', 'tinyurl', 't.co', 'is.gd'])
        if is_shortened:
            risk_score += 20
            reputation_log.append("Uses URL shortener to hide destination")

        # 3. Brand Spoofing Check
        brand_spoofing = False
        for brand, official in self.OFFICIAL_DOMAINS.items():
            if brand in domain and official not in domain:
                # e.g., "amazon-support.com" vs "amazon.com"
                brand_spoofing = True
                risk_score += 50
                reputation_log.append(f"Spoofs known brand '{brand}'")
                break
        
        # 4. Google Presence Simulation (Heuristic based on patterns)
        # In a real system, this would call Google Safe Browsing API or Custom Search API
        google_presence = "Not Found"
        if brand_spoofing or tld_risk:
            google_presence = "Low"
        elif any(trusted in domain for trusted in self.OFFICIAL_DOMAINS.values()):
            google_presence = "High"
            risk_score = 0 # Official domains are safe
            reputation_log = ["Official Verified Domain"]
        else:
            google_presence = "Medium" # Unknown generic domain
        
        # 5. Domain Age Simulation
        # New/unknown info = 0 days or low days for demo
        domain_age = 0 if risk_score > 0 else 3650 

        # Cap score
        link_risk_score = min(100, risk_score)
        
        # Summary
        if not reputation_log:
            reputation_log.append("No specific link threats detected")
        
        return link_risk_score, LinkIntelligence(
            domain_age_days=domain_age,
            tld_risk=tld_risk,
            brand_spoofing=brand_spoofing,
            google_presence=google_presence,
            reputation_summary="; ".join(reputation_log)
        )

    # ---------------------------
    # CORE ANALYSIS
    # ---------------------------
    def _analyze_text(self, text: str) -> Tuple[float, Dict[str, bool], List[str]]:
        text_lower = text.lower()
        detected_signals = {
            "urgency": False,
            "impersonation": False,
            "otp_request": False,
            "suspicious_url": False, # Handled by link logic layer, but tracked here for text context
            "ai_generated_text": False
        }
        why_fraud = []
        raw_text_score = 0

        # Pattern Matching
        for category, patterns in self.PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    raw_text_score += self.WEIGHTS_TEXT.get(category, 10)
                    
                    # Map to specific signals
                    if category == "urgency": detected_signals["urgency"] = True
                    if category == "threat": detected_signals["urgency"] = True # Threat implies urgency
                    if category == "impersonation": detected_signals["impersonation"] = True
                    if category == "ai_generated": detected_signals["ai_generated_text"] = True
                    if category == "credential_harvesting" and "otp" in text_lower: detected_signals["otp_request"] = True
                    
                    # Explainability
                    if category == "urgency": why_fraud.append("Uses high-pressure urgency tactics")
                    if category == "threat": why_fraud.append("Uses threatening language to intimidate")
                    if category == "financial_request": why_fraud.append("Requests financial incentives or transfers")
                    if category == "credential_harvesting": why_fraud.append("Attempts to harvest credentials/OTP")
                    if category == "impersonation": why_fraud.append("appears to impersonate a known brand")
                    
                    break # One hit per category covers the risk

        # Safe Context Check
        safe_hits = 0
        for pattern in self.SAFE_PATTERNS:
            if re.search(pattern, text_lower):
                safe_hits += 1
        
        if safe_hits > 0:
            raw_text_score -= (safe_hits * 15)
            # If explicit safe conversation context ("lunch", "meeting"), drastically reduce risk
            if raw_text_score < 0: raw_text_score = 0

        return min(100, raw_text_score), detected_signals, list(set(why_fraud))

    # ---------------------------
    # MAIN CLASSIFICATION
    # ---------------------------
    def classify(self, text: str) -> FraudDetectionResult:
        start_time = time.time()
        
        # 1. Text Analysis
        text_score, signals, why_fraud_text = self._analyze_text(text)
        
        # 2. Link Analysis
        url_match = re.search(r'(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-z]{2,}(/[^\s]*)?)', text)
        url_score = 0
        link_intel = None
        
        if url_match:
            url = url_match.group(0)
            url_score, link_intel = self._analyze_link(url)
            signals["suspicious_url"] = url_score > 30
            if link_intel.brand_spoofing: 
                why_fraud_text.append(f"Domain '{url}' spoofs a legitimate brand")
            if link_intel.tld_risk:
                why_fraud_text.append("Uses a high-risk Top Level Domain (TLD)")
            if signals["suspicious_url"]:
                detection_reason = link_intel.reputation_summary
                if detection_reason not in why_fraud_text:
                     why_fraud_text.append(f"Link detected: {detection_reason}")

        # 3. Rule-Based Scoring (Contextual Fusion)
        rule_score = 0
        # Rule: High Urgency + Link = High Risk
        if signals["urgency"] and signals["suspicious_url"]:
            rule_score += 80
            why_fraud_text.append("Critical Risk combination: Urgency + Suspicious Link")
        # Rule: OTP + Link = Critical
        if signals["otp_request"] and (url_match or signals["suspicious_url"]):
            rule_score += 90
            why_fraud_text.append("Critical Risk: OTP Request with external link")
        # Rule: AI Text + Financial = Suspicious
        if signals["ai_generated_text"] and "financial" in str(why_fraud_text):
            rule_score += 50
        
        # 4. Hybrid Decision Engine Formula
        # final_risk_score = (0.45 * text_score) + (0.40 * url_score) + (0.15 * rule_score)
        
        # Adjust weights if no URL present to avoid dilution
        if not url_match:
            # If no URL, text is 85%, rule is 15%
            final_score = (0.85 * text_score) + (0.15 * rule_score)
        else:
            final_score = (0.45 * text_score) + (0.40 * url_score) + (0.15 * rule_score)

        final_score = min(100, final_score)
        
        # 5. Risk Classification & Actions
        if final_score <= 30:
            risk_level = RiskLevel.SAFE.value
            is_fraud = False
            # Clear frightening warnings for low scores
            if final_score < 10: why_fraud_text = ["No significant fraud risk detected."]
        elif 31 <= final_score <= 60:
            risk_level = RiskLevel.SUSPICIOUS.value
            is_fraud = True
        else:
            risk_level = RiskLevel.HIGH.value
            is_fraud = True
        
        actions = []
        if is_fraud:
            actions.append("Do NOT click any links.")
            if signals["otp_request"]: actions.append("Never share OTP/Pin.")
            actions.append("Block sender.")
        else:
            actions.append("No action needed.")
            
        # Confidence Estimation
        confidence = 0.70 + (final_score / 400) # Base 0.70, up to 0.95
        if not url_match and text_score < 20: confidence = 0.90 # High confidence in safe text

        return FraudDetectionResult(
            is_fraud=is_fraud,
            risk_score=final_score,
            risk_level=risk_level,
            fraud_type=list(set(["Phishing" if signals["suspicious_url"] else "Scam"] if is_fraud else [])),
            why_fraud=list(set(why_fraud_text)),
            detected_signals=signals,
            link_intelligence=link_intel.to_dict() if link_intel else None,
            recommended_action=actions,
            confidence=confidence,
            processing_time=time.time() - start_time
        )
