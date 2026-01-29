import Layout from '../components/Layout'
import { useState, useEffect, useRef } from 'react'
import { analyzeText } from '../utils/api'

// Example messages for quick testing
const EXAMPLES = [
  {
    label: 'Scam',
    type: 'scam',
    color: 'text-red-600',
    bg: 'bg-red-50',
    message: 'URGENT: Your account will be suspended! Verify your identity now or lose access forever. Click here: http://suspicious-link.com/verify'
  },
  {
    label: 'AI-Generated',
    type: 'ai',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    message: 'Dear Valued Customer, pursuant to our records, kindly verify your account information to avoid service interruption. Best regards, Support Team.'
  },
  {
    label: 'Normal',
    type: 'normal',
    color: 'text-green-600',
    bg: 'bg-green-50',
    message: 'Hey! Want to grab coffee tomorrow? Been a while since we caught up. Let me know what time works for you! ☕'
  }
]

export default function Analyze() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [demoMode, setDemoMode] = useState(true)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter a message to analyze')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)

    try {
      const res = await analyzeText(text)
      setResult(res)
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  const getLabelConfig = (label: string) => {
    const configs: Record<string, { label: string; color: string; icon: string }> = {
      fake_scam: { label: 'Fake / Scam', color: 'bg-red-100 text-red-800', icon: '🚨' },
      ai_generated: { label: 'AI-Generated', color: 'bg-indigo-100 text-indigo-800', icon: '🤖' },
      normal: { label: 'Normal', color: 'bg-green-100 text-green-800', icon: '💬' }
    }
    return configs[label] || configs.normal
  }

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return colors[risk] || colors.low
  }

  const getConfidenceColor = (conf: number) => {
    if (conf < 0.5) return 'bg-green-500'
    if (conf < 0.75) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Text Classifier</h1>
        <p className="text-gray-600 mb-8">Detect AI-generated text, fraud, and scam messages instantly</p>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm text-gray-700">
            <strong>Demo Mode:</strong> Show detailed indicators and explanations
          </span>
        </div>

        {/* Input Area */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <label htmlFor="messageInput" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a message to analyze
          </label>
          <textarea
            id="messageInput"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError('')
            }}
            placeholder="Paste or type a message to analyze..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            maxLength={10000}
          />
          <div className="flex justify-between items-center mt-4">
            <span className={`text-sm ${text.length > 8000 ? 'text-yellow-600' : 'text-gray-500'}`}>
              {text.length} / 10000 characters
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:animate-elastic hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform duration-300 hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Analyze Message
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Result Card */}
        {result && (
          <div ref={resultRef} className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(result.risk_level)}`}>
                    {result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Risk
                  </span>
                  <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getLabelConfig(result.label).color.split(' ')[0]}`}>
                    <span className="text-xl">{getLabelConfig(result.label).icon}</span>
                    <span className={`font-semibold ${getLabelConfig(result.label).color.split(' ')[1]}`}>
                      {getLabelConfig(result.label).label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-800">
                    {Math.round(result.confidence * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Confidence</div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getConfidenceColor(result.confidence)} transition-all duration-500`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-6 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why this result?
              </h3>
              <p className="text-gray-600">{result.explanation}</p>
            </div>

            {/* Indicators (Demo Mode Only) */}
            {demoMode && result.indicators && result.indicators.length > 0 && (
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detected Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.indicators.map((ind: any, idx: number) => (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg ${ind.detected ? 'bg-green-50' : 'bg-gray-100'}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${ind.detected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="flex-1 text-sm text-gray-700">{ind.description || ind.name}</span>
                      <span className={`text-xs font-medium ${ind.detected ? 'text-green-700' : 'text-gray-500'}`}>
                        {ind.detected ? '+' : ''}{(ind.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Processed in {(result.processing_time * 1000).toFixed(1)}ms
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Try with example messages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXAMPLES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setText(example.message)}
                className={`p-4 rounded-lg border-2 border-transparent transition-all duration-300 text-left hover:animate-flip-y hover:shadow-xl hover:-translate-y-1 ${example.bg}`}
                style={{ color: example.color }}
              >
                <div className="font-semibold text-sm mb-2">{example.label}</div>
                <div className="text-xs opacity-80 line-clamp-3">{example.message}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

