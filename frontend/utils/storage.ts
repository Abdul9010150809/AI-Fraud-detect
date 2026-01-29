const KEY = 'ai_fraud_recent_analyses'
const MAX_ITEMS = 50

export type AnalysisRecord = {
  id?: string
  timestamp: string
  mode?: string
  risk_score?: number
  confidence?: number
  raw?: any
}

export function getRecentAnalyses(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to read recent analyses', e)
    return []
  }
}

export function saveRecentAnalyses(items: AnalysisRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  } catch (e) {
    console.warn('Failed to save recent analyses', e)
  }
}

export function addAnalysis(r: any, mode?: string) {
  try {
    const list = getRecentAnalyses()
    const rec: AnalysisRecord = {
      id: (r?.details?.id) || (r?.transaction_id) || (r?.metadata?.id) || String(Date.now()),
      timestamp: new Date().toISOString(),
      mode: mode || (r?.source) || undefined,
      risk_score: typeof r?.risk_score === 'number' ? r.risk_score : (typeof r?.risk === 'number' ? r.risk : undefined),
      confidence: r?.confidence,
      raw: r,
    }
    list.unshift(rec)
    saveRecentAnalyses(list)
    return rec
  } catch (e) {
    console.warn('Failed to add analysis', e)
    return null
  }
}

export function clearAnalyses() {
  try {
    localStorage.removeItem(KEY)
  } catch (e) {
    console.warn('Failed to clear analyses', e)
  }
}
