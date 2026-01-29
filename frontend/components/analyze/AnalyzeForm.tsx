"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFraudStore } from '@/store/useFraudStore';
import { analyzeText } from '@/lib/gemini';
import { DEMO_DATASET } from '@/data/demo_dataset';
import { Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { GoogleLinkCheck } from './GoogleLinkCheck';

export function AnalyzeForm() {
    const router = useRouter();
    const {
        inputText, setInputText,
        setIsAnalyzing, setResult,
        demoMode, setDemoMode,
        fillDemoData
    } = useFraudStore();

    const [extractedUrl, setExtractedUrl] = useState<string>('');

    // Auto-extract URL
    useEffect(() => {
        const urlMatch = inputText.match(/(https?:\/\/[^\s]+)/g);
        setExtractedUrl(urlMatch ? urlMatch[0] : '');
    }, [inputText]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setIsAnalyzing(true);
        // Clear previous results to trigger animation on new page
        setResult(null);

        // Navigate immediately to dashboard to show loading state there
        router.push('/dashboard');

        // Perform analysis
        const result = await analyzeText(inputText, demoMode);
        setResult(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    Fraud Analysis
                </label>

                {/* Demo Mode Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Demo Mode</span>
                    <select
                        className="bg-background border border-border rounded-md text-sm px-2 py-1 focus:ring-2 focus:ring-primary"
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                                setDemoMode(false);
                                setInputText('');
                            } else {
                                setDemoMode(true);
                                fillDemoData(val);
                            }
                        }}
                    >
                        <option value="custom">-- Select Scenario --</option>
                        {DEMO_DATASET.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste message text, email content, or URL here..."
                    className="w-full h-40 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-all text-lg"
                />

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>{inputText.length} characters</span>
                    {extractedUrl && <span className="text-blue-500">URL Detected</span>}
                </div>

                {extractedUrl && <GoogleLinkCheck url={extractedUrl} />}

                <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-foreground text-background rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                    Analyze Risk
                    <ArrowRight className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
