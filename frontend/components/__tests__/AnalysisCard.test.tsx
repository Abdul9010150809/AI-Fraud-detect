import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AnalysisCard from '../AnalysisCard'

test('renders AnalysisCard and toggles details', () => {
  const mock = {
    risk_score: 10,
    confidence: 0.9,
    processing_time: 0.02,
    alert: null,
    details: { ai_fake: 'AI fake', rule_fake: 'Rule fake' },
    __request: { content: 'hello' }
  }
  render(<AnalysisCard result={mock} />)
  expect(screen.getByText(/Normal conversation/i)).toBeInTheDocument()
  const btn = screen.getByRole('button', { name: /view details/i })
  fireEvent.click(btn)
  expect(screen.getByText(/AI-generated Fake|AI fake/i)).toBeInTheDocument()
})
