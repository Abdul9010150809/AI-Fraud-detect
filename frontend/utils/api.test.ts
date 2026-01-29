import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ingestText } from './api'

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('posts JSON to ingest text endpoint', async () => {
    const fake = { risk_score: 10 }
    const fetchSpy = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(fake) } as any))
    vi.stubGlobal('fetch', fetchSpy)

    const res = await ingestText({ content: 'hello' })
    expect(res).toEqual(fake)
    expect(fetchSpy).toHaveBeenCalled()
  })
})
