import Layout from '../components/Layout'
import { extractUrls, isLinkSuspicious } from '../utils/linkAnalysis'
import { useState, useRef } from 'react'
import { analyzeText } from '../utils/api'
import { 
  Search, Info, ExternalLink, Zap, Activity, 
  AlertTriangle, ShieldCheck, Fingerprint, 
  MessageSquare, Globe, AlertCircle, Copy
} from 'lucide-react'

export default function Analyze() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  const urls = extractUrls(text)

  // 10+ Fraud Analysis Features (Simulated logic/UI triggers)
  const analyzeForensics = (input: string) => {
    return {
      urgencyDetected: /\b(urgent|immediately|action required|suspended|unauthorized)\b/i.test(input),
      typoCount: (input.match(/\b\w*[^\w\s]{2,}\w*\b/g) || []).length, // Checks for odd character placements
      aiLikelihood: input.length > 100 && !input.includes('I ') ? 0.85 : 0.3, // Simple heuristic for AI coldness
      linkSafety: urls.every(u => !isLinkSuspicious(u)),
      sensitiveDataRequest: /\b(password|ssn|credit card|cvv|pin)\b/i.test(input),
      financialTrigger: /\b(bank|transfer|refund|invoice|payment)\b/i.test(input),
      greetingAnomaly: /^(Dear customer|Dear user|Valued member)/i.test(input),
      domainAgeMaturity: urls.some(u => u.includes('.xyz') || u.includes('.info')), // TLD risk
      characterSubstitution: /[0-9].*[a-z]|[a-z].*[0-9]/.test(input.split('.')[0]), // e.g., g00gle
      grammarScore: input.split(' ').length > 5 && !/[.!?]$/.test(input) ? 'Poor' : 'Professional'
    }
  }

  const handleAnalyze = async () => {
    if (!text.trim()) return setError('Input cannot be empty')
    setError(''); setLoading(true); setResult(null);

    try {
      const res = await analyzeText(text)
      setResult(res)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e: any) {
      setError(e.message || 'Service unreachable.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSearch = (query: string) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent('scam check: ' + query)}`
    window.open(searchUrl, '_blank')
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
            <Zap className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Enterprise Fraud Engine</h1>
            <p className="text-gray-500">Deep-scan for AI-generated text, phishing, and typosquatting.</p>
          </div>
        </div>

        {/* Input Terminal */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-2xl border border-gray-100 dark:border-gray-800 mb-8 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <MessageSquare size={14} /> Analysis Buffer
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious SMS, email, or link here..."
            className="w-full bg-transparent p-2 outline-none min-h-[160px] dark:text-white resize-none text-lg font-medium"
          />
          <div className="flex flex-wrap gap-3 mt-4 justify-between border-t border-gray-50 dark:border-gray-800 pt-4">
            <button 
              onClick={() => setText('')}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleGoogleSearch(text.slice(0, 100))}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <Globe size={18} /> Search Scam Database
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2 justify-center shadow-lg shadow-indigo-500/20"
              >
                {loading ? <Activity className="animate-spin" size={18} /> : 'Execute Deep Scan'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-bold animate-shake">⚠️ {error}</div>}

        {/* Advanced Results Engine */}
        {result && (
          <div ref={resultRef} className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Feature 1: Urgency/Risk Meter */}
              <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center ${
                result.risk_level === 'high' ? 'bg-red-50/50 border-red-100 text-red-700' : 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
              }`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Threat Probability</p>
                <p className="text-5xl font-black mb-4">{Math.round((result.risk_score || 0) * 100)}%</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${result.risk_level === 'high' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(result.risk_score || 0) * 100}%` }} />
                </div>
              </div>

              {/* Feature 2: Reasoning & Forensics */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold mb-4 text-indigo-600 uppercase text-xs tracking-widest">
                    <Fingerprint size={16} /> Linguistic Fingerprint
                  </h3>
                  <div className="space-y-4">
                     <ForensicToggle label="AI-Pattern Detected" active={analyzeForensics(text).aiLikelihood > 0.7} />
                     <ForensicToggle label="High-Urgency Tactics" active={analyzeForensics(text).urgencyDetected} />
                     <ForensicToggle label="Financial Coercion" active={analyzeForensics(text).financialTrigger} />
                     <ForensicToggle label="Brand Impersonation" active={analyzeForensics(text).characterSubstitution} />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-indigo-600 uppercase text-xs tracking-widest">
                      <Info size={16} /> Logic Breakdown
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
                      {result.explanation}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.explanation)}
                    className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-tighter"
                  >
                    <Copy size={12} /> Copy Findings
                  </button>
                </div>
              </div>
            </div>

            {/* Feature 3: Link & Spell-Check Security */}
            <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck size={120} className="text-emerald-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                 <Globe className="text-indigo-400" /> Asset & Link Security Scan
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* URL List */}
                 <div className="md:col-span-2 space-y-3">
                   {urls.length === 0 ? (
                     <p className="text-gray-500 italic text-sm">No external links identified in this block.</p>
                   ) : (
                     urls.map((u, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                         <div className="min-w-0">
                           <p className="text-xs font-mono text-indigo-300 truncate">{u}</p>
                           <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Heuristic: {isLinkSuspicious(u) ? 'SUSPICIOUS' : 'VERIFIED'}</p>
                         </div>
                         <button 
                           onClick={() => handleGoogleSearch(u)}
                           className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                         >
                           <Search size={16} />
                         </button>
                       </div>
                     ))
                   )}
                 </div>

                 {/* Feature Table: Spell & Grammar Check */}
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Integrity Check</h4>
                    <div className="space-y-4">
                       <MetricRow label="Spelling" value={analyzeForensics(text).typoCount > 2 ? 'Anomalous' : 'Clean'} alert={analyzeForensics(text).typoCount > 2} />
                       <MetricRow label="Urgency" value={analyzeForensics(text).urgencyDetected ? 'High' : 'Low'} alert={analyzeForensics(text).urgencyDetected} />
                       <MetricRow label="Data Req." value={analyzeForensics(text).sensitiveDataRequest ? 'YES' : 'No'} alert={analyzeForensics(text).sensitiveDataRequest} />
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

function ForensicToggle({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      {active ? (
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500"><AlertCircle size={12} /> FLAG</span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500"><ShieldCheck size={12} /> PASS</span>
      )}
    </div>
  )
}

function MetricRow({ label, value, alert }: { label: string, value: string, alert: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className={`font-black ${alert ? 'text-red-400' : 'text-emerald-400'}`}>{value}</span>
    </div>
  )
}