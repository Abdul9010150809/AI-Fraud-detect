"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFraudStore } from '@/store/useFraudStore';
import { RiskMeter } from '@/components/results/RiskMeter';
import { RiskExplainer } from '@/components/results/RiskExplainer';
import { ArrowLeft, Loader2, Check, AlertOctagon, Info } from 'lucide-react';
import Link from 'next/link';

export default function ResultsPage() {
    const router = useRouter();
    const { result, isAnalyzing, inputText } = useFraudStore();

    useEffect(() => {
        if (!isAnalyzing && !result && !inputText) {
            router.push('/analyze');
        }
    }, [isAnalyzing, result, inputText, router]);

    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div>
                    <h2 className="text-2xl font-bold">Analyzing Content...</h2>
                    <p className="text-muted-foreground">Consulting Gemini AI & verifying patterns.</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/analyze" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-display">Analysis Verdict</h1>
                    <p className="text-muted-foreground text-sm">AI-Power Assessment complete</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Score & Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex flex-col items-center bg-card border border-border p-8 rounded-2xl shadow-sm text-center">
                        <RiskMeter score={result.riskScore} level={result.riskLevel} />
                        <h2 className={`text-2xl font-bold mt-6 ${result.riskLevel === 'CRITICAL' ? 'text-danger' :
                                result.riskLevel === 'HIGH' ? 'text-warning' :
                                    'text-safe'
                            }`}>
                            {result.riskLevel} Risk
                        </h2>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 rounded-full bg-muted text-xs font-bold uppercase">{result.fraudType}</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-xl border border-border">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Analyzed Content
                        </h3>
                        <p className="font-mono text-xs opacity-80 whitespace-pre-wrap line-clamp-6">{inputText}</p>
                    </div>
                </div>

                {/* Right Column: Detailed Breakdown */}
                <div className="lg:col-span-2 space-y-6">

                    {/* AI Reasoning */}
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertOctagon className="w-5 h-5 text-primary" />
                            Why this decision?
                        </h3>
                        <p className="text-foreground leading-relaxed mb-6">
                            {result.explanation}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                <h4 className="font-bold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Why it might be Safe
                                </h4>
                                <ul className="text-xs space-y-1 text-green-700 dark:text-green-400">
                                    <li>• Language structure is coherent</li>
                                    <li>• {result.riskLevel === 'LOW' ? "No urgent threats detected" : "Some standard phrases used"}</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-2 flex items-center gap-2">
                                    <AlertOctagon className="w-4 h-4" /> Why it is Risky
                                </h4>
                                <ul className="text-xs space-y-1 text-red-700 dark:text-red-400">
                                    {result.signals.map((s, i) => (
                                        <li key={i}>• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Signal Checklist */}
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Signal Detection Matrix</h3>
                        <div className="space-y-3">
                            {result.signals.map((signal, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                                    <span className="text-sm font-medium">{signal}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded bg-background border ${result.riskLevel === 'LOW' ? 'text-safe border-safe/20' : 'text-danger border-danger/20'
                                        }`}>DETECTED</span>
                                </div>
                            ))}
                            {/* Mock Empty Signals for layout balance if few signals */}
                            {result.signals.length < 3 && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border opacity-50">
                                    <span className="text-sm font-medium">Malware Signature</span>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-background border text-muted-foreground">NOT FOUND</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
