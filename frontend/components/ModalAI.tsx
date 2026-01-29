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
      if (mode === 'text') {
        res = await ingestText({ source: 'ui', content: text })
      } else if (mode === 'url') {
        res = await ingestUrl({ url })
      } else if (mode === 'transaction') {
        res = await ingestTransaction({ user_id: 'ui', transaction_id: 'tx-ui', amount: 1.0 })
      } else if (mode === 'image' && file) {
        res = await ingestImage(file)
      } else if (mode === 'audio' && file) {
        res = await ingestAudio(file)
      }
      onResult(res)
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
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="ai-modal-title" className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 z-10 transform transition-transform duration-200 ease-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 id="ai-modal-title" className="text-lg font-medium">AI Analysis</h3>
          <button onClick={onClose} aria-label="Close AI Analysis" className="text-gray-600">✕</button>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Mode</label>
          <select value={mode} onChange={(e) => { setMode(e.target.value as any); setErrors(null); }} className="border p-2 rounded w-full">
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="transaction">Transaction</option>
          </select>
        </div>

        {mode === 'text' && (
          <div>
            <label className="sr-only">Text input</label>
            <textarea aria-label="Text to analyze" className="w-full border p-2 rounded" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        )}

        {mode === 'url' && (
          <div>
            <label className="sr-only">URL input</label>
            <input aria-label="URL to analyze" className="w-full border p-2 rounded" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
        )}

        {(mode === 'image' || mode === 'audio') && (
          <div>
            <label className="sr-only">File input</label>
            <input aria-label="File upload" type="file" accept={mode === 'image' ? 'image/*' : 'audio/*'} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        )}

        {mode === 'transaction' && (
          <div className="text-sm text-gray-600">A sample transaction will be sent. Use backend integration for real transactions.</div>
        )}

        {errors && <div className="mt-3 text-sm text-red-600">{errors}</div>}

        <div className="mt-4 flex justify-end items-center space-x-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={submit} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center" disabled={loading}>
            {loading ? <LoadingSpinner /> : null}
            <span className="ml-2">{loading ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
