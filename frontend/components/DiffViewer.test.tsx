import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DiffViewer from './DiffViewer'

describe('DiffViewer', () => {
  const mockRaw = {
    reasons: 'Test reason for being fake',
    explanation: 'Detailed explanation',
    details: { reasons: 'Nested reasons' }
  }

  it('renders original, AI fake, and rule fake text correctly', () => {
    render(
      <DiffViewer
        original="Original text"
        aiFake="AI generated fake text"
        ruleFake="Rule based fake text"
        raw={mockRaw}
      />
    )

    // match the header labels (they are rendered as small divs)
    expect(screen.getByText('Original', { selector: 'div' })).toBeInTheDocument()
    expect(screen.getByText('AI-generated Fake', { selector: 'div' })).toBeInTheDocument()
    expect(screen.getByText('Rule/text-based Fake', { selector: 'div' })).toBeInTheDocument()
    // original panel contains the full original text
    expect(screen.getByText('Original text')).toBeInTheDocument()
    // AI and Rule fake panels render tokenized spans; assert their container includes the expected text when normalized
    const aiHeader = screen.getByText('AI-generated Fake', { selector: 'div' })
    const aiContainer = aiHeader.nextElementSibling as HTMLElement
    const aiText = aiContainer.textContent?.replace(/\s+/g, ' ').trim() || ''
    expect(aiText).toContain('AI')
    expect(aiText).toContain('generated')
    expect(aiText).toContain('fake')
    const ruleHeader = screen.getByText('Rule/text-based Fake', { selector: 'div' })
    const ruleContainer = ruleHeader.nextElementSibling as HTMLElement
    const ruleText = ruleContainer.textContent?.replace(/\s+/g, ' ').trim() || ''
    expect(ruleText).toContain('Rule')
    expect(ruleText).toContain('based')
    expect(ruleText).toContain('fake')
  })

  it('displays reasons correctly', () => {
    render(
      <DiffViewer
        original="Original text"
        aiFake="AI generated fake text"
        ruleFake="Rule based fake text"
        raw={mockRaw}
      />
    )

    expect(screen.getByText('Why it\'s Fake')).toBeInTheDocument()
    expect(screen.getByText('Test reason for being fake')).toBeInTheDocument()
  })

  it('toggles raw data display', () => {
    render(
      <DiffViewer
        original="Original text"
        aiFake="AI generated fake text"
        ruleFake="Rule based fake text"
        raw={mockRaw}
      />
    )

    const toggleButton = screen.getByRole('button', { name: /show raw data/i })
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(screen.getByRole('button', { name: /hide raw data/i })).toBeInTheDocument()
    // the raw JSON is rendered inside a <pre>; assert a snippet is present
    const pre = document.querySelector('pre')
    expect(pre).toBeTruthy()
    expect(pre?.textContent).toContain('Test reason for being fake')

    fireEvent.click(screen.getByRole('button', { name: /hide raw data/i }))
    expect(screen.getByRole('button', { name: /show raw data/i })).toBeInTheDocument()
  })

  it('handles empty props gracefully', () => {
    render(<DiffViewer />)

    expect(screen.getByText('(no original text)')).toBeInTheDocument()
    expect(screen.getAllByText('(none)')).toHaveLength(2)
  })

  it('applies correct styling for diff segments', () => {
    render(
      <DiffViewer
        original="Hello world"
        aiFake="Hello fake world"
        ruleFake="Hello rule world"
        raw={mockRaw}
      />
    )

    // Check for added styling elements by class in the rendered container
    const { container } = render(
      <DiffViewer
        original="Hello world"
        aiFake="Hello fake world"
        ruleFake="Hello rule world"
        raw={mockRaw}
      />
    )
    const addedSpans = container.querySelectorAll('.bg-green-100')
    expect(addedSpans.length).toBeGreaterThan(0)
    addedSpans.forEach(s => expect(s.classList.contains('text-green-800')).toBe(true))
  })

  it('is accessible with proper ARIA labels', () => {
    render(
      <DiffViewer
        original="Original text"
        aiFake="AI generated fake text"
        ruleFake="Rule based fake text"
        raw={mockRaw}
      />
    )

    // Check for semantic structure
    expect(screen.getByRole('button', { name: /show raw data/i })).toBeInTheDocument()
  })
})