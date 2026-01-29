import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { generateDemoAnalyses } from '../utils/demo'
import DiffViewer from '../components/DiffViewer'

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    // derive alerts from recent analyses where risk_score >= 85
    try {
      const stored = window.localStorage.getItem('ai_fraud_recent_analyses')
      const list = stored ? JSON.parse(stored) : []
      const filtered = list.filter((x:any) => (x.risk_score ?? x.raw?.risk_score) >= 85)
      setAlerts(filtered)
    } catch (e) {
      setAlerts([])
    }
  }, [])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">High-risk analyses (risk &gt;= 85)</div>
          <div className="space-x-2">
            <button onClick={() => { generateDemoAnalyses(); const stored = window.localStorage.getItem('ai_fraud_recent_analyses'); const list = stored ? JSON.parse(stored) : []; const filtered = list.filter((x:any) => (x.risk_score ?? x.raw?.risk_score) >= 85); setAlerts(filtered); }} className="px-3 py-1 bg-green-600 text-white rounded">Generate Demo Data</button>
            <button onClick={() => { window.localStorage.removeItem('ai_fraud_recent_analyses'); setAlerts([]) }} className="px-3 py-1 bg-red-600 text-white rounded">Clear</button>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 && <div className="text-sm text-gray-500">No alerts</div>}
          {alerts.map((a, i) => {
            const [orig, aiFake, ruleFake] = [
              a.raw?.original_text ?? a.raw?.text ?? a.raw?.source_text ?? '',
              a.raw?.ai_fake_text ?? a.raw?.ai_generated ?? a.raw?.generated_text ?? '',
              a.raw?.rule_fake_text ?? a.raw?.text_based_fake ?? a.raw?.heuristic_fake ?? ''
            ]
            return (
            <div key={i} className="p-4 bg-white rounded shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{a.raw?.details?.message ?? a.raw?.message ?? 'FRAUD detected'}</div>
                  <div className="text-sm text-gray-500">{new Date(a.timestamp).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold">{a.risk_score ?? a.raw?.risk_score ?? '-'}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <button onClick={() => {
                  const el = document.getElementById('details-' + i)
                  if (el) el.classList.toggle('hidden')
                }} className="px-2 py-1 bg-gray-100 text-sm rounded">Toggle details</button>
                <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(a.raw)); }} className="px-2 py-1 bg-gray-100 text-sm rounded">Copy raw</button>
              </div>
              <div id={'details-' + i} className="hidden">
                <DiffViewer original={orig} aiFake={aiFake} ruleFake={ruleFake} raw={a.raw} />
              </div>
            </div>
          )})}
        </div>
      </div>
    </Layout>
  )
}
