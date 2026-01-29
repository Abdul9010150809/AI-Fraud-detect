import Link from 'next/link'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 animate-fade-in">AI Fraud Detection</h1>
        <p className="text-gray-600 mb-6 animate-slide-up">Welcome to the AI Fraud Detection dashboard. Monitor alerts, ingest data, and review risk scoring.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard" className="p-4 bg-white rounded shadow transition-all duration-300 hover:animate-slide-right hover:shadow-lg hover:-translate-y-1 hover:shadow-blue-500/20">Dashboard</Link>
          <Link href="/ingest" className="p-4 bg-white rounded shadow transition-all duration-300 hover:animate-slide-left hover:shadow-lg hover:-translate-y-1 hover:shadow-green-500/20">Ingest Data</Link>
          <Link href="/alerts" className="p-4 bg-white rounded shadow transition-all duration-300 hover:animate-slide-right hover:shadow-lg hover:-translate-y-1 hover:shadow-red-500/20">Alerts</Link>
          <Link href="/settings" className="p-4 bg-white rounded shadow transition-all duration-300 hover:animate-slide-left hover:shadow-lg hover:-translate-y-1 hover:shadow-purple-500/20">Settings</Link>
        </div>
      </div>
    </Layout>
  )
}
