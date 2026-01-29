import Layout from '../components/Layout'

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Settings</h2>
        <div className="bg-white p-4 rounded shadow">Configure connectors, alert thresholds, and integrations here.</div>
      </div>
    </Layout>
  )
}
