import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

    expect(screen.getByText('Original')).toBeInTheDocument()
    expect(screen.getByText('AI-generated Fake')).toBeInTheDocument()
    expect(screen.getByText('Rule/text-based Fake')).toBeInTheDocument()
    expect(screen.getByText('Original text')).toBeInTheDocument()
    expect(screen.getByText('AI generated fake text')).toBeInTheDocument()
    expect(screen.getByText('Rule based fake text')).toBeInTheDocument()
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

    const toggleButton = screen.getByText('Show raw data')
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(screen.getByText('Hide raw data')).toBeInTheDocument()
    expect(screen.getByText(JSON.stringify(mockRaw, null, 2))).toBeInTheDocument()

    fireEvent.click(screen.getByText('Hide raw data'))
    expect(screen.getByText('Show raw data')).toBeInTheDocument()
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

    // Check for added/removed styling
    const addedElements = screen.getAllByText(/fake|rule/)
    addedElements.forEach(el => {
      expect(el).toHaveClass('bg-green-100', 'text-green-800')
    })
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