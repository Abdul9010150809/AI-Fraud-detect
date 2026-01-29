import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_DATASET } from "@/data/demo_dataset";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AnalysisResponse {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    fraudType: string;
    confidence: number;
    explanation: string;
    signals: string[];
}

export async function analyzeText(text: string, useMock: boolean = false): Promise<AnalysisResponse> {
    // 1. Mock Mode Check
    if (useMock || !API_KEY) {
        console.log("Using Mock/Demo Mode");
        return getMockAnalysis(text);
    }

    try {
        // 2. Real API Call
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
      You are an expert AI Fraud Detector. Analyze the following text for scam, fraud, phishing attempts, or validity.
      
      TEXT: "${text}"
      
      INSTRUCTIONS:
      1. If the text is gibberish, random characters (e.g. "asdfg"), or completely nonsensical, classify as "Gibberish" with Low Risk but note it's invalid.
      2. If the text is a legitimate message, classify as "None" with Low Risk.
      3. If the text contains fraud signals (urgency, money requests, suspicious links), classify accordingly.
      
      Return ONLY a JSON object with this structure (no markdown):
      {
        "riskScore": number (0-100),
        "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "fraudType": "Phishing" | "Identity Theft" | "Delivery Scam" | "AI Generated" | "None" | "Gibberish" | "Other",
        "confidence": number (0-100),
        "explanation": "Short, clear explanation for a user. If gibberish, state that the input appears invalid.",
        "signals": ["List of 2-3 specific red flags or green flags found"]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();

        // Clean up markdown code blocks if present
        const cleanedJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedJson) as AnalysisResponse;

    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback to mock if API fails
        return getMockAnalysis(text);
    }
}

function getMockAnalysis(text: string): AnalysisResponse {
    // Check if text matches any demo dataset item
    const demoMatch = DEMO_DATASET.find(d => d.text.includes(text) || text.includes(d.text));

    if (demoMatch) {
        return {
            riskScore: demoMatch.riskLevel === 'CRITICAL' ? 95 : demoMatch.riskLevel === 'HIGH' ? 85 : demoMatch.riskLevel === 'LOW' ? 10 : 45,
            riskLevel: demoMatch.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
            fraudType: demoMatch.fraudType,
            confidence: 90,
            explanation: demoMatch.explanation,
            signals: demoMatch.riskLevel === 'LOW'
                ? ["Normal conversational tone", "No suspicious links", "No financial requests"]
                : ["Urgent language detected", "Suspicious link structure", "Unverified sender pattern"]
        };
    }

    // Gibberish Detection (Mock)
    if (text.length < 5 || /^[a-z]+$/i.test(text) && new Set(text).size < 4) {
        return {
            riskScore: 0,
            riskLevel: 'LOW',
            fraudType: 'Gibberish',
            confidence: 99,
            explanation: "The input appears to be random keystrokes or invalid text. No fraud risk detected, but it is not a valid message.",
            signals: ["Random character pattern", "Lacks semantic meaning"]
        };
    }

    // Generic Mock logic for unknown text
    const isSuspicious = /http|www|\.com|pay|urgent|verify|blocked/i.test(text);
    return {
        riskScore: isSuspicious ? 75 : 15,
        riskLevel: isSuspicious ? 'HIGH' : 'LOW',
        fraudType: isSuspicious ? 'Potential Scam' : 'None',
        confidence: 80,
        explanation: isSuspicious
            ? "Language contains common scam keywords and potential external links."
            : "Text appears to be normal conversation without typical fraud indicators.",
        signals: isSuspicious
            ? ["Contains 'urgent' or payment keywords", "External link detected"]
            : ["Natural language patterns", "No urgency detected"]
    };
}
