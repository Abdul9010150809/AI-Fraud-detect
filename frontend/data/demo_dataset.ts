export const DEMO_DATASET = [
    // User's Real-World Evaluation Examples
    {
        id: 'eval-1',
        label: 'Eval: Subtle Bank Scam',
        text: "Dear customer, due to recent RBI guidelines, limited services may be affected. Please confirm your details to avoid inconvenience. Link: https://sbi-update-info.xyz/login",
        riskLevel: 'HIGH',
        fraudType: 'Phishing',
        explanation: "Reference to 'RBI guidelines' creates false authority. URL 'sbi-update-info.xyz' is a classic spoofing domain."
    },
    {
        id: 'eval-2',
        label: 'Eval: Casual Delivery Scam',
        text: "Hi, your parcel couldn’t be delivered today. Just confirm address here and we’ll try again. Link: https://bit.ly/3Fh2X9p",
        riskLevel: 'MEDIUM',
        fraudType: 'Delivery Scam',
        explanation: "Friendly tone masks the intent. Use of bit.ly hides the destination."
    },
    {
        id: 'eval-3',
        label: 'Eval: AI Polite Scam',
        text: "Dear valued user, we kindly request your cooperation in verifying your account to ensure uninterrupted access to our services.",
        riskLevel: 'HIGH',
        fraudType: 'AI Generated',
        explanation: "Overly polite, generic phrasing ('valued user', 'kindly request') is typical of AI-generated phishing templates."
    },
    {
        id: 'eval-4',
        label: 'Eval: Personal OTP Trap',
        text: "Bro I’m stuck, phone battery dead. You’ll get an OTP, just tell me fast.",
        riskLevel: 'CRITICAL',
        fraudType: 'Social Engineering',
        explanation: "High-pressure social engineering. Leveraging personal connection ('Bro') to bypass security mindset."
    },
    {
        id: 'eval-5',
        label: 'Eval: SAFE Amazon Order',
        text: "Your Amazon order #402-98123 has been delivered successfully. Track: https://www.amazon.in/orders",
        riskLevel: 'LOW',
        fraudType: 'None',
        explanation: "Legitimate transactional message. Link points to official domain 'amazon.in'."
    },

    // Existing Mock Data
    {
        id: 'safe-1',
        label: 'Safe: Casual Conversation',
        text: "Hi bro, can you send the notes?",
        riskLevel: 'LOW',
        fraudType: 'None',
        explanation: "Normal informal conversation."
    },
    {
        id: 'phishing-1',
        label: 'Bank Phishing (High Risk)',
        text: "Your SBI account will be blocked today. Verify immediately: http://sbi-secure-login.xyz",
        riskLevel: 'CRITICAL',
        fraudType: 'Phishing',
        explanation: "High urgency and spoofed domain."
    }
];
