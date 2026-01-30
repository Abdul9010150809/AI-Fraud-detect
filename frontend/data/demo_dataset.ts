export const DEMO_DATASET = [
    // User's Real-World Evaluation Examples - More Realistic
    {
        id: 'eval-1',
        label: 'Eval: Subtle Bank Notice',
        text: "Dear customer, as per new RBI compliance requirements, we need to update your account information. Please visit https://sbi-ekyc.co.in/verify to complete the process within 48 hours to avoid service interruption.",
        riskLevel: 'HIGH',
        fraudType: 'Phishing',
        explanation: "Uses official-sounding language and realistic domain (.co.in). The urgency (48 hours) and threat (service interruption) are subtle pressure tactics."
    },
    {
        id: 'eval-2',
        label: 'Eval: Package Delivery',
        text: "Your package from Amazon couldn't be delivered. Please confirm your address at https://amzn-delivery.info/track/IN2847392 to reschedule delivery.",
        riskLevel: 'MEDIUM',
        fraudType: 'Delivery Scam',
        explanation: "Uses a realistic-looking domain with 'amzn' prefix. The tracking number adds legitimacy, but the domain '.info' and non-official URL are red flags."
    },
    {
        id: 'eval-3',
        label: 'Eval: Professional Email',
        text: "Dear valued customer, we have noticed unusual activity on your account. For your security, please verify your identity by visiting our secure portal at https://accounts-verify.paypal-secure.com",
        riskLevel: 'HIGH',
        fraudType: 'Phishing',
        explanation: "Professional tone with security concern. Domain looks official (paypal-secure.com) but is actually a spoofed domain using hyphen trick."
    },
    {
        id: 'eval-4',
        label: 'Eval: Friend Request',
        text: "Hey! My phone died and I'm using a friend's number. Can you send me that OTP you just got? Need to login urgently for work.",
        riskLevel: 'CRITICAL',
        fraudType: 'Social Engineering',
        explanation: "Casual tone mimics friend communication. Creates urgency (work) and plausible excuse (phone died) to request sensitive OTP."
    },
    {
        id: 'eval-5',
        label: 'Eval: SAFE Amazon Order',
        text: "Your Amazon order #402-9812345-7893012 has been delivered successfully. Track your order: https://www.amazon.in/gp/css/order-history",
        riskLevel: 'LOW',
        fraudType: 'None',
        explanation: "Legitimate transactional message with official Amazon domain (amazon.in) and proper order number format."
    },

    // Existing Mock Data - Updated
    {
        id: 'safe-1',
        label: 'Safe: Casual Conversation',
        text: "Hi, can you send me the class notes from yesterday? Thanks!",
        riskLevel: 'LOW',
        fraudType: 'None',
        explanation: "Normal informal conversation with no fraud indicators."
    },
    {
        id: 'phishing-1',
        label: 'Bank Alert (High Risk)',
        text: "ALERT: Your State Bank account shows suspicious activity. Verify your details immediately at https://sbi-secure.net/login to prevent account suspension.",
        riskLevel: 'CRITICAL',
        fraudType: 'Phishing',
        explanation: "Uses urgency (immediately), threat (suspension), and fake domain (.net instead of official .in). Multiple high-risk indicators."
    }
];
