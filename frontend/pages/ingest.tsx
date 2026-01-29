import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ChatMessage from '../components/ChatMessage';
import ModalAI from '../components/ModalAI';
import Toast from '../components/Toast';
import { getRecentAnalyses, addAnalysis, clearAnalyses } from '../utils/storage';
import { 
  Database, 
  PlusCircle, 
  Trash2, 
  History, 
  UploadCloud, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function Ingest() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [recent, setRecent] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    try {
      setRecent(getRecentAnalyses())
    } catch (e) { console.warn(e) }
  }, [])

  const handleResult = (r: any) => {
    setIsProcessing(true)
    setTimeout(() => {
      if (r?.error) {
        setToast(`Analysis Failed: ${r.error}`)
      } else {
        const risk = r?.risk_level?.toUpperCase() || 'UNKNOWN'
        setToast(`Success: ${risk} Risk Profile Ingested`)
        const rec = addAnalysis(r, r?.__request?.mode || 'Manual Ingest')
        setRecent(prev => rec ? [rec, ...prev] : prev)
      }
      setIsProcessing(false)
    }, 800)
    setTimeout(() => setToast(''), 5000)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 space-y-10 animate-fade-in">
        {/* Header & Global Controls */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em]">
              <Database size={14} /> Intelligence Pipeline
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Data Ingestion
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mt-2">
              Process external vectors through our LLM-fraud detection layer. Supports multi-modal analysis for text and metadata.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { clearAnalyses(); setRecent([]); }} 
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-all"
            >
              <Trash2 size={18} /> Purge Logs
            </button>
          </div>
        </header>

        {/* Ingestion Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IngestCard 
            title="Manual Inspection"
            desc="Paste text, emails, or chat logs for instant forensic scanning."
            icon={<PlusCircle className="text-blue-500" />}
            onClick={() => setOpen(true)}
            primary
          />
          <IngestCard 
            title="Batch Upload"
            desc="Process multiple records via CSV or JSON formats (System Default)."
            icon={<UploadCloud className="text-emerald-500" />}
            onClick={() => setToast('Batch processing is available in Enterprise tier.')}
          />
        </div>

        {/* Audit Log Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase tracking-tighter">
              <History size={22} className="text-blue-500" /> Forensic Audit Trail
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> Scanned</span>
              <span className="flex items-center gap-1"><AlertCircle size={12} className="text-blue-500" /> Logged</span>
            </div>
          </div>
          
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/20">
              <FileText size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-400 font-bold italic tracking-tight">Pipeline currently idle. No active datasets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recent.map((r, index) => (
                <div 
                  key={`${r.id}-${index}`} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="group relative bg-white dark:bg-gray-900 p-1 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-300">
                    <div className="absolute top-4 right-6 text-[10px] font-mono text-gray-400 group-hover:text-blue-500 transition-colors">
                      ID: {r.id?.slice(0, 8) || 'SYSTEM'}
                    </div>
                    <ChatMessage 
                      content={r.raw?.__request?.content || r.raw?.content || 'Unstructured Content'} 
                      result={r.raw} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ModalAI open={open} onClose={() => setOpen(false)} onResult={handleResult} />
      {isProcessing && (
        <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm font-black uppercase tracking-widest dark:text-white">Decrypting Vectors...</p>
          </div>
        </div>
      )}
      <Toast message={toast} />
    </Layout>
  )
}

function IngestCard({ title, desc, icon, onClick, primary = false }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer group flex flex-col justify-between min-h-[200px] ${
        primary 
          ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/20 hover:scale-[1.02]' 
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-emerald-500/50 hover:shadow-xl'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl ${primary ? 'bg-white/10' : 'bg-gray-50 dark:bg-gray-800'}`}>
          {icon}
        </div>
        <ArrowRight className={`transition-transform group-hover:translate-x-2 ${primary ? 'text-white/50' : 'text-gray-300'}`} />
      </div>
      <div>
        <h3 className={`text-xl font-black tracking-tight mb-2 ${primary ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed ${primary ? 'text-blue-100' : 'text-gray-500'}`}>
          {desc}
        </p>
      </div>
    </div>
  )
}