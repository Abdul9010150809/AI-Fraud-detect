import { describe, it, expect, beforeEach } from 'vitest'
import { addAnalysis, getRecentAnalyses, clearAnalyses } from './storage'

describe('storage helpers', () => {
  beforeEach(() => {
    clearAnalyses()
  })

  it('adds and retrieves an analysis', () => {
    const sample = { risk_score: 90, confidence: 0.8, source: 'test' }
    addAnalysis(sample, 'text')
    const all = getRecentAnalyses()
    expect(all.length).toBeGreaterThan(0)
    expect(all[0].risk_score).toBe(90)
  })
})
