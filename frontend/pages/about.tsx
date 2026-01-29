import Layout from '../components/Layout'
import { ShieldCheck, Cpu, Fingerprint, Lock, Zap, Search } from 'lucide-react'

export default function About() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 md:py-16 animate-fade-in">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck size={14} /> Intelligence Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Advanced Fraud <span className="text-blue-600">Forensics</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Protecting digital communication through high-fidelity LLM analysis and 
            real-time heuristic detection of AI-generated threats.
          </p>
        </section>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <FeatureCard 
            icon={<Cpu className="text-blue-500" />}
            title="LLM Analysis"
            desc="Leverages state-of-the-art Large Language Models to identify sterile AI patterns and synthetic text."
          />
          <FeatureCard 
            icon={<Fingerprint className="text-purple-500" />}
            title="Linguistic Forensics"
            desc="Detects social engineering triggers, urgency tactics, and brand impersonation attempts."
          />
          <FeatureCard 
            icon={<Zap className="text-emerald-500" />}
            title="Link Scrutiny"
            desc="Scans embedded URLs for typosquatting, malicious redirects, and TLD risk factors."
          />
        </div>

        {/* Technical Architecture Section */}
        <div className="bg-gray-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
             <Cpu size={200} />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Search className="text-blue-400" /> Explainable AI (XAI)
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Unlike "black-box" classifiers, our system provides a logical breakdown for every flag. 
              By combining rule-based heuristics with deep-learning insights, we offer 
              audit-ready results for security professionals.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Real-time Scam Database Synchronization
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Multi-modal Text Vectorization
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Automated Risk Severity Scoring
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <span>Version 1.0.4</span>
            <span className="text-gray-200 dark:text-gray-700">|</span>
            <span>Build 2026.01</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AI Fraud Shield. All security vectors monitored.
          </p>
        </footer>
      </div>
    </Layout>
  )
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all group">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}