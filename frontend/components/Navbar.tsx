import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">AI Fraud</div>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link href="/ingest" className="text-sm text-gray-600 hover:text-gray-900">Ingest</Link>
          <Link href="/alerts" className="text-sm text-gray-600 hover:text-gray-900">Alerts</Link>
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="#" className="text-sm text-gray-600">Docs</Link>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-ai-modal'))} className="px-3 py-1 bg-blue-600 text-white rounded">AI Modal</button>
        </div>
      </div>
    </nav>
  )
}
