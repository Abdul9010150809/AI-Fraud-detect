import React, { useState } from 'react'

type Seg = { text: string, type: 'equal'|'added'|'removed' }

function buildSimpleDiff(orig: string, other: string): Seg[] {
  if (!orig) return [{ text: other || '', type: 'added' }]
  if (!other) return [{ text: orig || '', type: 'removed' }]
  const a = orig.split(/(\s+)/)
  const b = other.split(/(\s+)/)

  const setA = new Set(a.filter(Boolean))
  const setB = new Set(b.filter(Boolean))

  // Mark tokens present only in other as added, only in orig as removed, else equal
  const out: Seg[] = []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const wa = a[i] ?? ''
    const wb = b[i] ?? ''
    if (wa === wb) {
      if (wa) out.push({ text: wa, type: 'equal' })
    } else {
      if (wa) out.push({ text: wa, type: setB.has(wa) ? 'equal' : 'removed' })
      if (wb) out.push({ text: wb, type: setA.has(wb) ? 'equal' : 'added' })
    }
  }
  return out
}

export default function DiffViewer({
  original,
  aiFake,
  ruleFake,
  raw
}: { original?: string, aiFake?: string, ruleFake?: string, raw?: any }) {
  const [showRaw, setShowRaw] = useState(false)

  const aiDiff = buildSimpleDiff(original || '', aiFake || '')
  const ruleDiff = buildSimpleDiff(original || '', ruleFake || '')

  const renderSegs = (segs: Seg[]) => segs.map((s, i) => (
    <span key={i} className={
      s.type === 'equal' ? 'text-gray-800' : s.type === 'added' ? 'bg-green-100 text-green-800 px-0.5 rounded' : 'bg-red-100 text-red-800 px-0.5 rounded'
    }>{s.text}</span>
  ))

  const reasons = raw?.reasons || raw?.explanation || raw?.details?.reasons || 'No reasons provided'

  return (
    <div className="mt-3 p-3 bg-gray-50 border rounded motion-safe:animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">Original</div>
          <div className="p-2 bg-white rounded text-sm text-gray-800 whitespace-pre-wrap">{original || <span className="text-gray-400">(no original text)</span>}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">AI-generated Fake</div>
          <div className="p-2 bg-white rounded text-sm whitespace-pre-wrap">{aiFake ? renderSegs(aiDiff) : <span className="text-gray-400">(none)</span>}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Rule/text-based Fake</div>
          <div className="p-2 bg-white rounded text-sm whitespace-pre-wrap">{ruleFake ? renderSegs(ruleDiff) : <span className="text-gray-400">(none)</span>}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs text-gray-500 mb-1">Why it&apos;s Fake</div>
        <div className="p-2 bg-white rounded text-sm text-gray-800 whitespace-pre-wrap">{reasons}</div>
      </div>

      <div className="mt-3 text-sm">
        <button onClick={() => setShowRaw(s => !s)} className="text-blue-600">{showRaw ? 'Hide' : 'Show'} raw data</button>
        {showRaw && <pre className="mt-2 p-2 bg-black text-white rounded max-h-40 overflow-auto text-xs">{JSON.stringify(raw, null, 2)}</pre>}
      </div>
    </div>
  )
}
