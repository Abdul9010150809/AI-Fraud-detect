import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navbar from './Navbar'

describe('Navbar', () => {
  it('renders the brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('AI Fraud')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Ingest')).toBeInTheDocument()
    expect(screen.getByText('Alerts')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders docs link', () => {
    render(<Navbar />)
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })

  it('renders AI Modal button', () => {
    render(<Navbar />)
    // match either 'AI Modal' or 'Open AI Modal' (aria-label)
    expect(screen.getByRole('button', { name: /(?:open\s*)?ai modal/i })).toBeInTheDocument()
  })

  it('has proper navigation structure', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('bg-white', 'shadow')
  })

  it('links have correct href attributes', () => {
    render(<Navbar />)
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Ingest').closest('a')).toHaveAttribute('href', '/ingest')
    expect(screen.getByText('Alerts').closest('a')).toHaveAttribute('href', '/alerts')
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings')
  })
})