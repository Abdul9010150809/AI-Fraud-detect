
import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ChatMessage from '../components/ChatMessage';
import ModalAI from '../components/ModalAI';
import Toast from '../components/Toast';
import { getRecentAnalyses, addAnalysis, clearAnalyses } from '../utils/storage';

// Animation utility for fade-in (if not already in Tailwind config)
// If you want to use custom keyframes, add them to your tailwind.config.js

export default function Ingest() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-ai-modal', handler)
    return () => window.removeEventListener('open-ai-modal', handler)
  }, [])

  useEffect(() => {
    try {
      setRecent(getRecentAnalyses())
    } catch (e) { console.warn(e) }
  }, [])

  const handleResult = (r: any) => {
    if (r?.error) setToast(`Error: ${r.error}`)
    else setToast(`Risk ${r?.risk_score ?? ''} · Confidence ${r?.confidence ?? ''}`)
    // persist to localStorage for dashboard/alerts and update local list
    try {
      const rec = addAnalysis(r, r?.__request?.mode)
      setRecent(prev => rec ? [rec, ...prev] : prev)
    } catch (e) { console.warn(e) }
    setTimeout(() => setToast(''), 5000)
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Ingest Data</h2>

        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow border border-gray-200 dark:border-gray-800">
          <p className="mb-4 text-gray-700 dark:text-gray-200">Use the AI Modal to analyze text, images, audio, URLs, or transactions.</p>
          <div className="space-x-2 flex flex-wrap gap-2">
            <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded transition-all duration-300 hover:bg-blue-700 hover:animate-elastic hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50">Open AI Modal</button>
            <button onClick={() => { clearAnalyses(); setRecent([]); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded transition-all duration-300 hover:bg-gray-200 hover:animate-skew-x hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-700">Clear Past Data</button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Recent Analyses</h3>
          <div>
            {recent.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">No analyses yet. Use the AI Modal to analyze a message.</div>
            )}
            <div className="space-y-4">
              {recent.map((r, index) => (
                <div
                  key={`${r.id}-${r.timestamp}-${index}`}
                  className="mb-4 animate-fade-in-up transition-all duration-700 ease-out opacity-0 animate-delay-[${index * 100}ms]"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <ChatMessage content={r.raw?.__request?.content || r.raw?.content || (r.raw?.__request?.url ? `URL: ${r.raw.__request.url}` : '(no content)')} result={r.raw} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ModalAI open={open} onClose={() => setOpen(false)} onResult={handleResult} />
      <Toast message={toast} />
    </Layout>
  )
}

