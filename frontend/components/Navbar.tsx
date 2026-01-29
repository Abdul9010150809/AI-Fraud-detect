import React from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <nav className="bg-white shadow motion-safe:animate-slide-down" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold transition-all duration-300 group-hover:animate-bounce-gentle group-hover:shadow-lg group-hover:shadow-blue-500/50">AF</div>
            <div className="text-xl font-bold transition-all duration-300 group-hover:scale-105">AI Fraud</div>
          </Link>

          <div className="hidden sm:flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 btn-underline relative">Dashboard</Link>
            <Link href="/ingest" className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 btn-underline relative">Ingest</Link>
            <Link href="/analyze" className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 btn-underline relative">Analyze</Link>
            <Link href="/alerts" className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 btn-underline relative">Alerts</Link>
            <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 btn-underline relative">Settings</Link>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:animate-wiggle inline-block" aria-label="Documentation link">Docs</a>
          <ThemeToggle />
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-ai-modal'))} className="px-3 py-1.5 bg-blue-600 text-white rounded transition-all duration-300 hover:bg-blue-700 hover:animate-pulse-glow hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50" aria-label="Open AI Modal">AI Modal</button>
        </div>
      </div>
    </nav>
  )
}
