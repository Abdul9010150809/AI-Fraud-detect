import Layout from '../components/Layout'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { getRecentAnalyses, clearAnalyses } from '../utils/storage'
import DiffViewer from '../components/DiffViewer'
import { 
  ShieldAlert, 
  Link as LinkIcon, 
  FileText, 
  Trash2, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  Clock,
  Search
} from 'lucide-react'

const Chart = dynamic(() => import('../components/DashboardChart'), { ssr: false })

export default function Dashboard() {
  const [data, setData] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, highRisk: 0, avgConfidence: 0 })

  useEffect(() => {
    // Analytics Mock Data
    setData([
      { name: '00:00', score: 12 }, { name: '04:00', score: 50 },
      { name: '08:00', score: 35 }, { name: '12:00', score: 85 },
      { name: '16:00', score: 40 }, { name: '20:00', score: 65 },
    ])
    
    const stored = getRecentAnalyses()
    setRecent(stored)
    
    if (stored.length > 0) {
      const high = stored.filter((r: any) => (r.risk_score || 0) > 0.7).length
      const avgConf = stored.reduce((acc: number, curr: any) => acc + (curr.confidence || 0), 0) / stored.length
      setStats({ total: stored.length, highRisk: high, avgConfidence: Math.round(avgConf * 100) })
    }
  }, [])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
        {/* Professional Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">System Live</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Fraud Intelligence</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time heuristic and LLM text-vector analysis.</p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-all">
              <Search size={14} /> Global Search
            </button>
            <button 
              onClick={() => { clearAnalyses(); setRecent([]) }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/10 rounded-lg hover:bg-red-100 transition-all"
            >
              <Trash2 size={14} /> Clear Audit Logs
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Throughput" value={stats.total} subtitle="Total Scans" icon={<Activity className="text-blue-500" />} />
          <StatCard title="Critical" value={stats.highRisk} subtitle="Threats Detected" icon={<ShieldAlert className="text-red-500" />} color="text-red-600" />
          <StatCard title="Reliability" value={`${stats.avgConfidence}%`} subtitle="Avg. Confidence" icon={<ShieldCheck className="text-emerald-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Trend Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Threat Probability Trend</h3>
              <select className="text-xs bg-gray-50 dark:bg-gray-800 border-none rounded p-1 outline-none font-bold">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="h-[340px]">
              <Chart data={data} />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Audit Log</h3>
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold rounded-full">{recent.length}</span>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-50 dark:border-gray-800 rounded-2xl">
                  <Clock size={32} className="mb-2 opacity-20" />
                  <p className="text-xs italic">No activity recorded</p>
                </div>
              ) : (
                recent.map((r, idx) => <FeedItem key={idx} item={r} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ title, value, subtitle, icon, color = "text-gray-900 dark:text-white" }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-default">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <p className={`text-3xl font-black mt-1 ${color} tracking-tighter`}>{value}</p>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">{subtitle}</p>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
  )
}

function FeedItem({ item }: any) {
  const [showDetail, setShowDetail] = useState(false);
  const score = Math.round((item.risk_score || 0) * 100);
  
  return (
    <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${item.hasLinks ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'}`}>
            {item.hasLinks ? <LinkIcon size={14} /> : <FileText size={14} />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase truncate">
              {item.mode || 'Standard Scan'}
            </p>
            <p className="text-[9px] font-mono text-gray-400 flex items-center gap-1">
              <Clock size={10} /> {new Date(item.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${
          score > 70 ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 
          score > 30 ? 'bg-amber-500 text-white' : 
          'bg-emerald-500 text-white'
        }`}>
          {score}%
        </div>
      </div>
      
      <button 
        onClick={() => setShowDetail(!showDetail)}
        className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 hover:gap-2 transition-all uppercase"
      >
        Forensics <ChevronRight size={10} className={showDetail ? 'rotate-90' : ''} />
      </button>

      {showDetail && (
        <div className="mt-4 animate-slide-up border-t border-gray-100 dark:border-gray-700 pt-4">
           <DiffViewer 
             original={item.raw?.text || ''} 
             aiFake={item.raw?.ai_generated || ''} 
             ruleFake={item.raw?.heuristic_fake || ''} 
             raw={item.raw} 
           />
        </div>
      )}
    </div>
  )
}