import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_DATASET } from "@/data/demo_dataset";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// UPDATED: Injected Real Examples from local 'dataset/spam_texts.csv'
const FEW_SHOT_EXAMPLES = `
REFERENCE FRAUD DATABASE (LOCAL DATASET PATTERNS):
1. [DATASET_BANK_01]: "Dear Customer, Your SBI Bank Account has been blocked by 5:00 PM. Please update your PAN card immediately: http://bit.ly/sbikyc" -> Risk: CRITICAL. Signals: Urgency (5:00 PM), Account Blocked, Short Link.
2. [DATASET_LOTTERY_02]: "Congratulation! Your number has won 25,00,000 in KBC Lottery. Call Rana Pratap Singh 9876543210" -> Risk: HIGH. Signals: Lottery, Large Amount, Personal Name for Authority.
3. [DATASET_JOB_03]: "Part time job! Earn Rs 5000-10000 daily working from home. No investment. Contact WhatsApp: wa.me/9199xxxxxx" -> Risk: HIGH. Signals: Unrealistic Earnings, WhatsApp Redirection, No Investment trap.
4. [DATASET_ELECTRICITY_04]: "Dear User, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Call 890xxxx" -> Risk: CRITICAL. Signals: Utility Disconnection, Tonight Deadline, Personal Number.
5. [DATASET_LOAN_05]: "Pre-approved Personal Loan of Rs 5 Lakhs credited to your wallet. Click to claim: http://loan-bazaar.xyz" -> Risk: MEDIUM/HIGH. Signals: Pre-approved, Wallet Credit, Suspicious Domain.
`;

export interface AnalysisResponse {
    input_id?: string;
    is_fraud: boolean;
    risk_score: number;
    risk_level: "Safe" | "Suspicious" | "High" | "Gray" | "Critical";
    fraud_type: string[];
    why_fraud: string[];
    risky_phrases: string[];
    detected_signals: {
        urgency: boolean;
        impersonation: boolean;
        otp_request: boolean;
        suspicious_url: boolean;
        ai_generated_tone: boolean;
        image_text_mismatch?: boolean;
        fake_branding?: boolean;
        visual_artifacts?: boolean;
    };
    link_analysis: {
        domain: string;
        shortened: boolean;
        brand_spoofing: boolean;
        google_presence: "High" | "Medium" | "Low" | "Not Found";
    };
    similar_case_match?: {
        id: string;
        similarity_score: number;
        description: string;
    };
    text_error_analysis?: {
        typos: string[];
        grammar_issues: string[];
        score: number;
    };
    bank_verification?: {
        detected_bank: string | null;
        is_official_domain: boolean;
        risk_reason: string | null;
    };
    email_analysis?: {
        is_email: boolean;
        sender_domain_mismatch: boolean;
        suspicious_subject: boolean;
        attachment_risk: "None" | "Low" | "High";
        headers_analysis: string;
    };
    image_analysis?: {
        is_safe_content: boolean;
        visual_anomalies: string[];
        ocr_text_risk: "Low" | "Medium" | "High";
    };
    counterfactual_safe_conditions: string[];
    campaign_detected: boolean;
    recommended_action: string[];
    model_self_check: {
        possible_misclassification_reason: string;
        confidence_calibration: "High" | "Medium" | "Low";
    };
    confidence: number;
    explanation: string;
    signals: string[];
    tone: "Normal" | "Urgent" | "Manipulative" | "AI-Like";
}

export async function analyzeContent(text: string, imageBase64?: string, useMock: boolean = false): Promise<AnalysisResponse> {
    if (useMock || !API_KEY) {
        return getMockAnalysis(text);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an expert AI Fraud Intelligence Analyst.
      Analyze the content (Text, Image, Email) for fraud patterns using the Local Reference Database.

      ${FEW_SHOT_EXAMPLES}
      
      INPUT TEXT/EMAIL: "${text || "No text provided, analyze image text."}"
      ${imageBase64 ? "IMAGE PROVIDED: Run visual forensics." : "NO IMAGE PROVIDED."}
      
      TASK Checklist:
      1. **IMAGE PRE-CHECK**: If generic photo (no text/logos) -> MARK SAFE. 
      2. **EMAIL ANALYSIS**: Check Sender Mismatch, Subject Urgency, Attachments.
      3. **BANK VERIFICATION**: Check for Typosquatting (e.g. 'hdfkbank').
      4. **SIMILARITY**: Does this look like the [DATASET_*] patterns above?

      RETURN VALID JSON:
      {
        "is_fraud": boolean,
        "risk_score": number (0-100),
        "risk_level": "Safe" | "Suspicious" | "High" | "Gray" | "Critical",
        "fraud_type": ["Phishing", "Identity Theft", "Social Engineering", "AI Generated", "None", "Visual Scam", "Email Spoofing"],
        "why_fraud": ["Reason 1"],
        "risky_phrases": ["substring 1"],
        "detected_signals": {
            "urgency": boolean,
            "impersonation": boolean,
            "otp_request": boolean,
            "suspicious_url": boolean,
            "ai_generated_tone": boolean,
            "image_text_mismatch": boolean,
            "fake_branding": boolean,
            "visual_artifacts": boolean
        },
        "link_analysis": {
            "domain": "string",
            "shortened": boolean,
            "brand_spoofing": boolean,
            "google_presence": "High" | "Medium" | "Low" | "Not Found"
        },
        "similar_case_match": {
            "id": "PATTERN_ID_OR_NONE",
            "similarity_score": number, 
            "description": "reason"
        },
        "text_error_analysis": {
            "typos": ["list"],
            "grammar_issues": ["list"],
            "score": number
        },
        "bank_verification": {
            "detected_bank": "Name/null",
            "is_official_domain": boolean,
            "risk_reason": "string"
        },
        "email_analysis": {
            "is_email": boolean,
            "sender_domain_mismatch": boolean,
            "suspicious_subject": boolean,
            "attachment_risk": "None" | "Low" | "High",
            "headers_analysis": "Summary"
        },
        "image_analysis": {
            "is_safe_content": boolean,
            "visual_anomalies": ["list"],
            "ocr_text_risk": "Low" | "Medium" | "High"
        },
        "counterfactual_safe_conditions": ["If X"],
        "campaign_detected": boolean,
        "recommended_action": ["Action"],
        "model_self_check": {
            "possible_misclassification_reason": "Reason",
            "confidence_calibration": "High"
        },
        "confidence": number,
        "explanation": "Summary",
        "signals": ["List"],
        "tone": "Normal" | "Urgent" | "Manipulative"
      }
    `;

        const parts: any[] = [{ text: prompt }];
        if (imageBase64) {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const textOutput = response.text();
        const cleanedJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedJson) as AnalysisResponse;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return getMockAnalysis(text);
    }
}

function getMockAnalysis(text: string): AnalysisResponse {
    const demoMatch = DEMO_DATASET.find(d => d.text.includes(text) || text.includes(d.text));
    const isUrgent = /urgent|immediate|block|suspend|today/i.test(text);

    // Mock similarity
    let similarCase = undefined;
    if (/sbi|bank|kyc/i.test(text)) similarCase = { id: "DATASET_BANK_01", similarity_score: 95, description: "Matches local dataset pattern for KYC Fraud." };

    let bankVerif = undefined;
    if (/sbi|hdfc|icici/i.test(text)) {
        bankVerif = { detected_bank: "Detected Bank", is_official_domain: false, risk_reason: "Domain mismatch" };
    }

    if (demoMatch) {
        return {
            is_fraud: demoMatch.riskLevel !== 'LOW',
            risk_score: demoMatch.riskLevel === 'CRITICAL' ? 95 : 10,
            risk_level: demoMatch.riskLevel as any,
            fraud_type: [demoMatch.fraudType],
            why_fraud: [demoMatch.explanation],
            risky_phrases: isUrgent ? ["account blocked"] : [],
            detected_signals: { urgency: isUrgent, impersonation: false, otp_request: false, suspicious_url: true, ai_generated_tone: false, image_text_mismatch: false, fake_branding: false, visual_artifacts: false },
            link_analysis: { domain: "mock.com", shortened: false, brand_spoofing: false, google_presence: "Medium" },
            similar_case_match: similarCase,
            text_error_analysis: { typos: ["immedately"], grammar_issues: ["Poor grammar"], score: 50 },
            bank_verification: bankVerif,
            email_analysis: { is_email: false, sender_domain_mismatch: false, suspicious_subject: false, attachment_risk: "None", headers_analysis: "" },
            image_analysis: { is_safe_content: true, visual_anomalies: [], ocr_text_risk: "Low" },
            counterfactual_safe_conditions: ["None"],
            campaign_detected: false,
            recommended_action: ["Verify"],
            model_self_check: { possible_misclassification_reason: "Mock", confidence_calibration: "High" },
            confidence: 90,
            explanation: demoMatch.explanation,
            signals: ["Mock"],
            tone: "Normal"
        };
    }

    // Fallback
    return {
        is_fraud: true,
        risk_score: 60,
        risk_level: 'Suspicious',
        fraud_type: ['Possible Scam'],
        why_fraud: ["Keywords detected"],
        risky_phrases: [],
        detected_signals: { urgency: false, impersonation: false, otp_request: false, suspicious_url: false, ai_generated_tone: false, image_text_mismatch: false, fake_branding: false, visual_artifacts: false },
        link_analysis: { domain: "", shortened: false, brand_spoofing: false, google_presence: "Not Found" },
        similar_case_match: undefined,
        text_error_analysis: undefined,
        bank_verification: undefined,
        email_analysis: { is_email: false, sender_domain_mismatch: false, suspicious_subject: false, attachment_risk: "None", headers_analysis: "" },
        image_analysis: { is_safe_content: true, visual_anomalies: [], ocr_text_risk: "Low" },
        counterfactual_safe_conditions: [],
        campaign_detected: false,
        recommended_action: [],
        model_self_check: { possible_misclassification_reason: "Fallback", confidence_calibration: "Low" },
        confidence: 50,
        explanation: "Offline Fallback",
        signals: [],
        tone: "Normal"
    };
}
