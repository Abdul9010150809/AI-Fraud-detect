import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ingestImage, ingestAudio } from './api'

describe('file upload API wrappers', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('uploads image via ingestImage', async () => {
    const fakeResp = { risk_score: 12 }
    const fetchSpy = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(fakeResp) } as any))
    vi.stubGlobal('fetch', fetchSpy)

    // Create a minimal File-like object
    const file = new File([new Blob(['data'])], 'pic.png', { type: 'image/png' })
    const res = await ingestImage(file)
    expect(res).toEqual(fakeResp)
    expect(fetchSpy).toHaveBeenCalled()
  })

  it('uploads audio via ingestAudio', async () => {
    const fakeResp = { risk_score: 22 }
    const fetchSpy = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(fakeResp) } as any))
    vi.stubGlobal('fetch', fetchSpy)

    const file = new File([new Blob(['audio'])], 'sound.wav', { type: 'audio/wav' })
    const res = await ingestAudio(file)
    expect(res).toEqual(fakeResp)
    expect(fetchSpy).toHaveBeenCalled()
  })
})
