import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { generateDemoAnalyses } from '../utils/demo'
import DiffViewer from '../components/DiffViewer'
import { AlertTriangle, Trash2, Database, Copy, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const loadAlerts = () => {
    try {
      const stored = window.localStorage.getItem('ai_fraud_recent_analyses')
      const list = stored ? JSON.parse(stored) : []
      // Filtering for critical threats (Risk >= 85)
      const filtered = list.filter((x: any) => (x.risk_score ?? x.raw?.risk_score) >= 85)
      setAlerts(filtered)
    } catch (e) {
      setAlerts([])
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const handleGenerateDemo = () => {
    generateDemoAnalyses()
    loadAlerts()
  }

  const handleClear = () => {
    window.localStorage.removeItem('ai_fraud_recent_analyses')
    setAlerts([])
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 md:py-10 animate-fade-in">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Security Alerts</h1>
              <p className="text-gray-500 text-sm">Real-time monitoring for high-criticality fraud vectors (Score ≥ 85).</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleGenerateDemo}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Database size={16} /> Demo Data
            </button>
            <button 
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-red-600 border border-red-100 dark:border-red-900/30 text-sm font-bold rounded-xl hover:bg-red-50 transition-all"
            >
              <Trash2 size={16} /> Clear Logs
            </button>
          </div>
        </header>

        {/* Alerts Feed */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <ShieldAlert size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No critical threats currently active.</p>
            </div>
          ) : (
            alerts.map((a, i) => (
              <AlertItem 
                key={i} 
                alert={a} 
                isOpen={expandedId === i} 
                toggle={() => setExpandedId(expandedId === i ? null : i)} 
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

function AlertItem({ alert, isOpen, toggle }: any) {
  const score = alert.risk_score ?? alert.raw?.risk_score ?? 0
  
  const [orig, aiFake, ruleFake] = [
    alert.raw?.original_text ?? alert.raw?.text ?? alert.raw?.source_text ?? '',
    alert.raw?.ai_fake_text ?? alert.raw?.ai_generated ?? alert.raw?.generated_text ?? '',
    alert.raw?.rule_fake_text ?? alert.raw?.text_based_fake ?? alert.raw?.heuristic_fake ?? ''
  ]

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(JSON.stringify(alert.raw))
  }

  return (
    <div className={`group overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 ${
      isOpen ? 'ring-2 ring-red-500 shadow-xl' : 'border-gray-100 dark:border-gray-700 hover:border-red-200 hover:shadow-md'
    }`}>
      <div 
        onClick={toggle}
        className="p-5 cursor-pointer flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 font-black shrink-0">
            {score}
          </div>
          <div className="truncate">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
              {alert.raw?.details?.message ?? alert.raw?.message ?? 'Critical Fraud Pattern Detected'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-wider">
              {new Date(alert.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            title="Copy Raw Data"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Copy size={18} />
          </button>
          <div className="text-gray-300 dark:text-gray-600 mx-1">|</div>
          {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-6 animate-slide-up">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-tighter">
            <ShieldAlert size={14} /> Comprehensive Forensic Analysis
          </div>
          <DiffViewer original={orig} aiFake={aiFake} ruleFake={ruleFake} raw={alert.raw} />
        </div>
      )}
    </div>
  )
}