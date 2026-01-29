import { useState } from 'react'
import Layout from '../components/Layout'
import { 
  Plus, 
  Minus, 
  ShieldCheck, 
  Lock, 
  Briefcase, 
  HelpCircle, 
  MessageCircle 
} from 'lucide-react'

export default function FAQ() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 md:py-16 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
              <HelpCircle size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Common Questions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Everything you need to know about our fraud detection engine and data privacy protocols.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          <FAQSection title="Technology & Detection" icon={<ShieldCheck size={20} />}>
            <FAQItem 
              question="How does the detection engine work?" 
              answer="Our system employs a hybrid approach. It combines rule-based heuristics to flag known scam patterns with Large Language Model (LLM) features that analyze linguistic artifacts typical of synthetic, AI-generated text."
            />
            <FAQItem 
              question="What types of fraud can it identify?" 
              answer="The engine is trained to detect phishing attempts, social engineering tactics, urgency-based scams, typosquatting in links, and AI-generated misinformation."
            />
          </FAQSection>

          <FAQSection title="Privacy & Security" icon={<Lock size={20} />}>
            <FAQItem 
              question="Is my data stored or used for training?" 
              answer="Security is our priority. No user data is stored on our servers or used to train models unless you explicitly opt-in for history or advanced analytics features."
            />
            <FAQItem 
              question="Are the analysis results encrypted?" 
              answer="All data processed through our pipeline is encrypted in transit and handled within secure, isolated environments to prevent data leakage."
            />
          </FAQSection>

          <FAQSection title="Usage & Licensing" icon={<Briefcase size={20} />}>
            <FAQItem 
              question="Can I use this for commercial purposes?" 
              answer="Absolutely. This tool is architected for both personal and professional use, including enterprise-level security auditing and content verification."
            />
          </FAQSection>
        </div>

        {/* Footer Support */}
        <div className="mt-20 p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 text-center">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-gray-500 mb-6">Can't find the answer you're looking for? Reach out to our technical team.</p>
          <button className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <MessageCircle size={18} /> Contact Support
          </button>
        </div>
      </div>
    </Layout>
  )
}

function FAQSection({ title, icon, children }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="text-blue-500">{icon}</div>
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: any) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`group transition-all duration-300 rounded-3xl border ${
      isOpen 
        ? 'bg-white dark:bg-gray-800 border-blue-500/30 shadow-xl' 
        : 'bg-white/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-blue-500/20'
    }`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex items-center justify-between gap-4"
      >
        <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {question}
        </span>
        <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 animate-slide-up">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm italic">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}