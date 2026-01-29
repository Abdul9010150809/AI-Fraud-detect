import Link from 'next/link'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">AI Fraud Detection</h1>
        <p className="text-gray-600 mb-6">Welcome to the AI Fraud Detection dashboard. Monitor alerts, ingest data, and review risk scoring.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard" className="p-4 bg-white rounded shadow hover:shadow-md">Dashboard</Link>
          <Link href="/ingest" className="p-4 bg-white rounded shadow hover:shadow-md">Ingest Data</Link>
          <Link href="/alerts" className="p-4 bg-white rounded shadow hover:shadow-md">Alerts</Link>
          <Link href="/settings" className="p-4 bg-white rounded shadow hover:shadow-md">Settings</Link>
        </div>
      </div>
    </Layout>
  )
}
