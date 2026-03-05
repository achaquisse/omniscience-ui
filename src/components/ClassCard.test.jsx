import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClassCard from './ClassCard'

const mockCls = {
  ID: 1,
  Name: 'Math 101',
  Course: { Name: 'Mathematics' },
  Period: {
    Start: '2024-01-15T00:00:00Z',
    End: '2024-06-15T00:00:00Z',
  },
}

describe('ClassCard', () => {
  it('renders class name and course', () => {
    render(<ClassCard cls={mockCls} onClick={() => {}} />)
    expect(screen.getByText('Math 101')).toBeInTheDocument()
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
  })

  it('renders period dates', () => {
    render(<ClassCard cls={mockCls} onClick={() => {}} />)
    expect(screen.getByText(/Period:/)).toBeInTheDocument()
  })

  it('handles missing course', () => {
    const cls = { ...mockCls, Course: null }
    render(<ClassCard cls={cls} onClick={() => {}} />)
    expect(screen.getByText('No Course')).toBeInTheDocument()
  })

  it('handles missing period dates', () => {
    const cls = { ...mockCls, Period: { Start: null, End: null } }
    render(<ClassCard cls={cls} onClick={() => {}} />)
    expect(screen.getByText(/N\/A/)).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ClassCard cls={mockCls} onClick={onClick} />)

    await user.click(screen.getByText('Math 101'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows green indicator when showIndicator is true', () => {
    const { container } = render(
      <ClassCard cls={mockCls} onClick={() => {}} showIndicator={true} />
    )
    expect(container.querySelector('[title="Attendance recorded today"]')).toBeInTheDocument()
  })

  it('does not show indicator by default', () => {
    const { container } = render(
      <ClassCard cls={mockCls} onClick={() => {}} />
    )
    expect(container.querySelector('[title="Attendance recorded today"]')).not.toBeInTheDocument()
  })
})
