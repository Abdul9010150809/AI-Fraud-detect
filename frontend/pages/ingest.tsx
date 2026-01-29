import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import ModalAI from '../components/ModalAI'
import Toast from '../components/Toast'
import { addAnalysis } from '../utils/storage'

export default function Ingest() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-ai-modal', handler)
    return () => window.removeEventListener('open-ai-modal', handler)
  }, [])

  const handleResult = (r: any) => {
    if (r?.error) setToast(`Error: ${r.error}`)
    else setToast(`Risk ${r?.risk_score ?? ''} · Confidence ${r?.confidence ?? ''}`)
    // persist to localStorage for dashboard/alerts
    try { addAnalysis(r) } catch (e) { console.warn(e) }
    setTimeout(() => setToast(''), 5000)
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Ingest Data</h2>

        <div className="bg-white p-4 rounded shadow">
          <p className="mb-4">Use the AI Modal to analyze text, images, audio, URLs, or transactions.</p>
          <div className="space-x-2">
            <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Open AI Modal</button>
          </div>
        </div>
      </div>

      <ModalAI open={open} onClose={() => setOpen(false)} onResult={handleResult} />
      <Toast message={toast} />
    </Layout>
  )
}

