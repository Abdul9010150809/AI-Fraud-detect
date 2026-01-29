import React, { useState } from 'react'
import DiffViewer from './DiffViewer'

export default function AnalysisCard({ result }: { result: any }) {
  const [open, setOpen] = useState(false)
  const r = result || {}

  // Determine message type
  let type: 'fraud' | 'ai' | 'normal' = 'normal';
  if (r.alert) type = 'fraud';
  else if (r?.details?.ai_generated) type = 'ai';

  // Badge/icon map
  const typeMap = {
    fraud: {
      label: 'Fraud',
      color: 'bg-red-100 text-red-800',
      icon: '🚨',
      desc: 'Fraudulent or suspicious content detected',
    },
    ai: {
      label: 'AI-generated',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '🤖',
      desc: 'AI-generated or synthetic message',
    },
    normal: {
      label: 'Normal',
      color: 'bg-green-100 text-green-800',
      icon: '💬',
      desc: 'Typical conversational message',
    },
  };

  return (
    <div className="max-w-md motion-safe:animate-fade-in">

      <div className="p-3 bg-white border rounded shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium gap-1 ${typeMap[type].color}`}>
              <span>{typeMap[type].icon}</span>
              {typeMap[type].label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{typeMap[type].desc}</div>
          </div>
          <div className="text-right text-sm">
            <div>Risk: <span className="font-medium">{r.risk_score ?? '—'}</span></div>
            <div>Confidence: <span className="font-medium">{Math.round((r.confidence ?? 0) * 100)}%</span></div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">Processed in {r.processing_time ?? '—'}s</div>
          <div>
            <button onClick={() => setOpen(s => !s)} className="text-blue-600 text-sm" aria-expanded={open}>{open ? 'Hide details' : 'View details'}</button>
          </div>
        </div>

        {open && (
          <div className="mt-3">
            <DiffViewer original={r.__request?.content} aiFake={r?.details?.ai_fake} ruleFake={r?.details?.rule_fake} raw={r} />
          </div>
        )}
      </div>
    </div>
  )
}
