import Layout from '../components/Layout'

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4 animate-fade-in">Settings</h2>
        <div className="bg-white p-4 rounded shadow transition-all duration-300 hover:shadow-lg">
          <p className="text-gray-600 mb-4">Configure connectors, alert thresholds, and integrations here.</p>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded transition-all duration-300 hover:bg-blue-700 hover:animate-elastic hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50">Save Settings</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded transition-all duration-300 hover:bg-gray-200 hover:animate-skew-x dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">Reset Defaults</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded transition-all duration-300 hover:bg-green-700 hover:animate-pulse-glow">Export Config</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
