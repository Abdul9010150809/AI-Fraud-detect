export const DEMO_DATASET = [
    {
        id: 'safe-1',
        label: 'Safe: Casual Conversation',
        text: "Hi bro, can you send the notes?",
        riskLevel: 'LOW',
        fraudType: 'None',
        explanation: "This is a normal, informal conversation between likely acquaintances. No urgency, financial requests, or suspicious links detected."
    },
    {
        id: 'safe-2',
        label: 'Safe: Amazon Delivery',
        text: "Your Amazon order has been delivered successfully.",
        riskLevel: 'LOW',
        fraudType: 'None',
        explanation: "Standard transactional message. While delivery texts can be spoofed, this lacks a suspicious link or demand for immediate payment."
    },
    {
        id: 'phishing-1',
        label: 'Bank Phishing (High Risk)',
        text: "Your SBI account will be blocked today. Verify immediately: http://sbi-secure-login.xyz",
        riskLevel: 'CRITICAL',
        fraudType: 'Phishing',
        explanation: "High urgency ('blocked today') combined with a suspicious, non-official domain ('sbi-secure-login.xyz'). Classic phishing pattern."
    },
    {
        id: 'scam-1',
        label: 'Delivery Scam (Medium Risk)',
        text: "Your package is on hold. Pay ₹50 to release: bit.ly/3xyz",
        riskLevel: 'HIGH',
        fraudType: 'Delivery Scam',
        explanation: "Small payment request for package release is a common scam tactic. specific URL shortener usage masks the destination."
    },
    {
        id: 'otp-scam',
        label: 'OTP Scam',
        text: "Dear user, share the OTP to complete KYC.",
        riskLevel: 'CRITICAL',
        fraudType: 'Identity Theft',
        explanation: "Legitimate organizations NEVER ask for OTPs via text or call. Direct request for sensitive security credentials."
    },
    {
        id: 'ai-scam',
        label: 'AI Generated Scam',
        text: "Dear valued customer, we kindly request immediate verification to ensure uninterrupted service.",
        riskLevel: 'HIGH',
        fraudType: 'AI Generated',
        explanation: "Over-polite, generic, and grammatically perfect phrasing combined with a vague urgency ('immediate verification') suggests AI generation."
    },
    // Real Dataset Examples
    {
        id: 'real-dataset-1',
        label: 'Dataset: Medical Promo (Spam)',
        text: "CREDITED: Rs.75 wallet money. Use it to order medicines and get FLAT 22% OFF. Code. PHMY22 *TC PharmEasy https://peasy.in/RjXCN6",
        riskLevel: 'MEDIUM',
        fraudType: 'Promotional Spam',
        explanation: "Typical promotional message. Contains link and financial incentive. Likely spam but low-level fraud."
    },
    {
        id: 'real-dataset-2',
        label: 'Dataset: MTN Phishing',
        text: "Keep up with MTN Broadband! Visit https://apps.mtn.ng/newsletter/c/mtn-broadband-july-newsletter to read our latest newsletter, \"Owning The Home\".",
        riskLevel: 'HIGH',
        fraudType: 'Phishing / Spam',
        explanation: "Redirects to a specific newsletter link. While it looks official, such messages are often used to mask phishing attempts."
    },
    {
        id: 'real-dataset-3',
        label: 'Dataset: Lottery/Prize Scam',
        text: "JAZA POCHI SAA HII! SHINDA THAO TANO EVERY HOUR PLAY NOW> https://aviator254.ke/ STEPS NI TATU TU JOIN, BECOME THE BIG CRASHER, WIN! STOP *456*9*5#",
        riskLevel: 'CRITICAL',
        fraudType: 'Gambling / Scam',
        explanation: "Aggressive all-caps text, promises of winning money ('SHINDA THAO TANO'), and direct gambling link. High-risk unsolicited message."
    }
];
