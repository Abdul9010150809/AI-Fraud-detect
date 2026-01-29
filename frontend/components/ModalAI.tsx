import React, { useState, useEffect, useRef } from 'react'
import { ingestText, ingestUrl, ingestImage, ingestAudio, ingestTransaction } from '../utils/api'
import LoadingSpinner from './LoadingSpinner'

function isValidUrl(s: string) {
  try {
    const u = new URL(s)
    return !!u.protocol && !!u.host
  } catch {
    return false
  }
}

export default function ModalAI({ open, onClose, onResult }: { open: boolean, onClose: () => void, onResult: (r: any) => void }) {
  const [mode, setMode] = useState<'text'|'url'|'image'|'audio'|'transaction'>('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any | null>(null)

  const modalRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Accessibility: focus trap and restore
  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement
    // focus first focusable element
    const el = modalRef.current?.querySelector('select, textarea, input, button') as HTMLElement | null
    el?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        // simple focus trap
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select')
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  // Listen for global open event and delegate to parent control
  useEffect(() => {
    const handler = () => {
      // parent page should open modal; if controlled open is false, do nothing
    }
    window.addEventListener('open-ai-modal', handler)
    return () => window.removeEventListener('open-ai-modal', handler)
  }, [])

  if (!open) return null

  const validate = () => {
    setErrors(null)
    if (mode === 'text') {
      if (!text.trim()) return 'Text cannot be empty'
    }
    if (mode === 'url') {
      if (!isValidUrl(url)) return 'Please enter a valid URL'
    }
    if ((mode === 'image' || mode === 'audio') && !file) return 'Please select a file'
    if (mode === 'transaction') {
      // For demo we accept transaction with default values, otherwise validate fields
    }
    return null
  }

  const submit = async () => {
    const v = validate()
    if (v) {
      setErrors(v)
      return
    }

    setLoading(true)
      try {
      let res
      let requestPayload: any = { mode }
      if (mode === 'text') {
        requestPayload.content = text
        res = await ingestText({ source: 'ui', content: text })
      } else if (mode === 'url') {
        requestPayload.url = url
        res = await ingestUrl({ url })
      } else if (mode === 'transaction') {
        requestPayload.transaction = { user_id: 'ui', transaction_id: 'tx-ui', amount: 1.0 }
        res = await ingestTransaction({ user_id: 'ui', transaction_id: 'tx-ui', amount: 1.0 })
      } else if (mode === 'image' && file) {
        requestPayload.file = file.name
        res = await ingestImage(file)
      } else if (mode === 'audio' && file) {
        requestPayload.file = file.name
        res = await ingestAudio(file)
      }
      // attach original request info so UI can show the message that was analyzed
      const resWithRequest = Object.assign({}, res || {}, { __request: requestPayload })
      setLastResult(resWithRequest)
      onResult(resWithRequest)
      onClose()
    } catch (e: any) {
      onResult({ error: e.message || String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" aria-hidden={false}>
      <div className="fixed inset-0 bg-black opacity-40 transition-opacity" onClick={onClose} />
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="ai-modal-title" className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-xl w-full p-6 z-10 transform transition-transform duration-200 ease-out scale-100 motion-safe:animate-scale-in border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 id="ai-modal-title" className="text-lg font-medium">AI Analysis</h3>
          <button onClick={onClose} aria-label="Close AI Analysis" className="text-gray-600">✕</button>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700 dark:text-gray-200">Mode</label>
          <select value={mode} onChange={(e) => { setMode(e.target.value as any); setErrors(null); }} className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="transaction">Transaction</option>
          </select>
        </div>

        {/* Accessible live region for analysis updates */}
        <div aria-live="polite" className="sr-only">
          {lastResult ? `Analysis complete: ${lastResult.alert ? 'Alert' : 'Normal conversation'}, risk ${lastResult.risk_score ?? '—'}` : ''}
        </div>

        {/* Preview of the message being analyzed with type badge */}
        {lastResult?.__request?.content && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">Last analyzed message</span>
              {/* Message type badge */}
              {(() => {
                // Determine type: fraud, ai-generated, or normal
                if (lastResult.alert) {
                  return <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-semibold animate-pulse">Fraud</span>;
                } else if (lastResult?.details?.ai_generated) {
                  return <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">AI-generated</span>;
                } else {
                  return <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold">Normal</span>;
                }
              })()}
            </div>
            <div className="mt-1">{lastResult.__request.content}</div>
          </div>
        )}

        {mode === 'text' && (
          <div>
            <label className="sr-only">Text input</label>
            <textarea aria-label="Text to analyze" className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        )}

        {mode === 'url' && (
          <div>
            <label className="sr-only">URL input</label>
            <input aria-label="URL to analyze" className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
        )}

        {(mode === 'image' || mode === 'audio') && (
          <div>
            <label className="sr-only">File input</label>
            <input aria-label="File upload" type="file" accept={mode === 'image' ? 'image/*' : 'audio/*'} className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        )}

        {mode === 'transaction' && (
          <div className="text-sm text-gray-600 dark:text-gray-300">A sample transaction will be sent. Use backend integration for real transactions.</div>
        )}

        {errors && <div className="mt-3 text-sm text-red-500 dark:text-red-400">{errors}</div>}

        <div className="mt-4 flex justify-end items-center space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:animate-skew-x hover:shadow-md text-gray-700 dark:text-gray-200">Cancel</button>
          <button onClick={submit} className="px-3 py-1.5 bg-blue-600 text-white rounded flex items-center transition-all duration-300 hover:bg-blue-700 hover:animate-elastic hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50" disabled={loading}>
            {loading ? <LoadingSpinner /> : null}
            <span className="ml-2">{loading ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
