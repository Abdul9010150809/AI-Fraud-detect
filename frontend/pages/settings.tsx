import Layout from '../components/Layout'
import { Save, RefreshCcw, Download, Shield } from 'lucide-react'

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 md:py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-500">Configure detection sensitivity and integration hooks.</p>
        </header>

        <div className="space-y-6">
          <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Shield className="text-blue-500" size={20} /> Security Thresholds
            </h3>
            <div className="space-y-6">
              <ToggleRow title="Enable Aggressive Scanning" description="AI will flag messages with even minor linguistic anomalies." />
              <ToggleRow title="Automatic Link Blocking" description="Blacklist high-risk URLs automatically in the dashboard." />
              <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  <Save size={18} /> Save Changes
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 transition-all">
                  <RefreshCcw size={18} /> Reset Defaults
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Export Data</h3>
            <p className="text-sm text-gray-500 mb-6">Download your analysis logs and custom blacklists as JSON/CSV.</p>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
              <Download size={18} /> Export Config (.json)
            </button>
          </section>
        </div>
      </div>
    </Layout>
  )
}

function ToggleRow({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-bold text-gray-800 dark:text-gray-200">{title}</p>
        <p className="text-sm text-gray-500 leading-snug">{description}</p>
      </div>
      <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer">
        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm translate-x-6 bg-blue-500" />
      </div>
    </div>
  )
}