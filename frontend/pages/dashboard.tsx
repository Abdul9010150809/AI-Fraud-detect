import Layout from '../components/Layout'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { getRecentAnalyses, clearAnalyses } from '../utils/storage'
import DiffViewer from '../components/DiffViewer'

const Chart = dynamic(() => import('../components/DashboardChart'), { ssr: false })

export default function Dashboard() {
  const [data, setData] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    // sample data - replace with API call
    setData([
      { name: '00:00', score: 12 },
      { name: '01:00', score: 20 },
      { name: '02:00', score: 8 },
      { name: '03:00', score: 30 },
      { name: '04:00', score: 50 },
      { name: '05:00', score: 70 },
    ])
    // load recent analyses from localStorage
    setRecent(getRecentAnalyses())
  }, [])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Risk Dashboard</h2>
        <div className="bg-white rounded shadow p-4">
          <Chart data={data} />
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Recent Analyses</h3>
            <button onClick={() => { clearAnalyses(); setRecent([]) }} className="text-sm text-red-600">Clear</button>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && <div className="text-sm text-gray-500">No recent analyses</div>}
            {recent.map((r:any, idx:number) => {
              const [orig, aiFake, ruleFake] = [
                r.raw?.original_text ?? r.raw?.text ?? r.raw?.source_text ?? '',
                r.raw?.ai_fake_text ?? r.raw?.ai_generated ?? r.raw?.generated_text ?? '',
                r.raw?.rule_fake_text ?? r.raw?.text_based_fake ?? r.raw?.heuristic_fake ?? ''
              ]
              return (
              <div key={idx} className="p-3 bg-white rounded shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{r.mode ?? r.raw?.fusion_type ?? 'analysis'}</div>
                    <div className="text-sm text-gray-500">{new Date(r.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{r.risk_score ?? (r.raw?.risk_score ?? '-')}</div>
                    <div className="text-sm text-gray-500">conf {r.confidence ?? r.raw?.confidence ?? '-'}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <button onClick={() => { const el = document.getElementById('recent-' + idx); if (el) el.classList.toggle('hidden') }} className="px-2 py-1 text-sm bg-gray-100 rounded">View details</button>
                </div>
                <div id={'recent-' + idx} className="hidden mt-2">
                  <DiffViewer original={orig} aiFake={aiFake} ruleFake={ruleFake} raw={r.raw} />
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </Layout>
  )
}
