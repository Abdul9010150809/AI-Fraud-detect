"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFraudStore } from '@/store/useFraudStore';
import { analyzeText } from '@/lib/gemini';
import { Zap, AlertTriangle, ShieldCheck, Box, MessageSquare } from 'lucide-react';

export default function AnalyzePage() {
    const router = useRouter();
    const {
        inputText, setInputText,
        setIsAnalyzing, setResult,
        fillDemoData, language
    } = useFraudStore();

    const [tone, setTone] = useState<string>('Normal');

    // Simple live tone detection logic
    useEffect(() => {
        const lower = inputText.toLowerCase();
        if (lower.includes('urgent') || lower.includes('immediately') || lower.includes('block')) {
            setTone('Urgent');
        } else if (lower.includes('kindly') && lower.includes('verify')) {
            setTone('AI-Like');
        } else if (lower.includes('offer') || lower.includes('winner') || lower.includes('prize')) {
            setTone('Manipulative');
        } else {
            setTone('Normal');
        }
    }, [inputText]);

    const handleSimulate = (id: string) => {
        fillDemoData(id);
    };

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        setIsAnalyzing(true);
        setResult(null);
        router.push('/results');
        const result = await analyzeText(inputText);
        setResult(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold font-display">Fraud Analysis Engine</h1>
                <p className="text-muted-foreground">Paste any message or URL below to verify its legitimacy.</p>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">

                {/* Simulator Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => handleSimulate('safe-1')} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-safe/10 hover:border-safe transition-colors group">
                        <MessageSquare className="w-5 h-5 text-safe group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Load Safe Msg</span>
                    </button>

                    <button onClick={() => handleSimulate('phishing-1')} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-danger/10 hover:border-danger transition-colors group">
                        <AlertTriangle className="w-5 h-5 text-danger group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Bank Scam</span>
                    </button>

                    <button onClick={() => handleSimulate('scam-1')} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-warning/10 hover:border-warning transition-colors group">
                        <Box className="w-5 h-5 text-warning group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Delivery Scam</span>
                    </button>

                    <button onClick={() => handleSimulate('otp-scam')} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-danger/10 hover:border-danger transition-colors group">
                        <ShieldCheck className="w-5 h-5 text-danger group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">OTP Scam</span>
                    </button>
                </div>

                {/* Input Area */}
                <div className="relative">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={language === 'hi' ? "Sandesh yahan paste karein..." : "Paste message text, email content, or URL here..."}
                        className="w-full h-60 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none resize-none text-lg leading-relaxed"
                    />

                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                        {/* Character Counter */}
                        <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border border-border">
                            {inputText.length} chars
                        </span>

                        {/* Live Tone Badge */}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${tone === 'Normal' ? 'bg-green-100 text-green-700 border-green-200' :
                                tone === 'Urgent' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                            Tone: {tone}
                        </span>
                    </div>
                </div>

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={!inputText.trim()}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap className="w-5 h-5 fill-current" />
                    {language === 'hi' ? 'Abhi Analyze Karein' : 'Analyze Now'}
                </button>

            </div>
        </div>
    );
}
