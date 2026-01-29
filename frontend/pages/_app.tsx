import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  // attach AI modal trigger from Navbar (simple global handler)
  useEffect(() => {
    const el = document.getElementById('ai-open')
    const handler = () => {
      const evt = new CustomEvent('open-ai-modal')
      window.dispatchEvent(evt)
    }
    el?.addEventListener('click', handler)
    return () => el?.removeEventListener('click', handler)
  }, [])

  return <Component {...pageProps} />
}
