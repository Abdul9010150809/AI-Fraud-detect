// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import ModalAI from './ModalAI'

describe('ModalAI integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('submits text and calls onResult and onClose', async () => {
    const result = { risk_score: 5 }
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(result) } as any)))

    const onResult = vi.fn()
    const onClose = vi.fn()

    render(<ModalAI open={true} onClose={onClose} onResult={onResult} />)

    const textarea = screen.getByLabelText('Text to analyze') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'suspicious text' } })

    const analyze = screen.getByText('Analyze')
    fireEvent.click(analyze)

    // wait for fetch to resolve
    await new Promise((r) => setTimeout(r, 50))

    expect(onResult).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
