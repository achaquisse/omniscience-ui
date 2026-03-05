import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPrevious={() => {}} onNext={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders page info', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPrevious={() => {}} onNext={() => {}} />
    )
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPrevious={() => {}} onNext={() => {}} />
    )
    expect(screen.getByText('Previous').closest('button')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <Pagination currentPage={3} totalPages={3} onPrevious={() => {}} onNext={() => {}} />
    )
    expect(screen.getByText('Next').closest('button')).toBeDisabled()
  })

  it('calls onPrevious when clicked', async () => {
    const user = userEvent.setup()
    const onPrevious = vi.fn()
    render(
      <Pagination currentPage={2} totalPages={3} onPrevious={onPrevious} onNext={() => {}} />
    )

    await user.click(screen.getByText('Previous'))
    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(
      <Pagination currentPage={1} totalPages={3} onPrevious={() => {}} onNext={onNext} />
    )

    await user.click(screen.getByText('Next'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
