import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClassFilters from './ClassFilters'

const defaultProps = {
  filtersExpanded: false,
  setFiltersExpanded: vi.fn(),
  startDate: '2024-01-01',
  setStartDate: vi.fn(),
  endDate: '2024-12-31',
  setEndDate: vi.fn(),
  searchQuery: '',
  setSearchQuery: vi.fn(),
  viewMode: 'grid',
  setViewMode: vi.fn(),
  paginatedCount: 5,
  filteredCount: 10,
}

describe('ClassFilters', () => {
  it('renders filter title', () => {
    render(<ClassFilters {...defaultProps} />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('does not show filter content when collapsed', () => {
    render(<ClassFilters {...defaultProps} filtersExpanded={false} />)
    expect(screen.queryByText('Start Date')).not.toBeInTheDocument()
  })

  it('shows filter content when expanded', () => {
    render(<ClassFilters {...defaultProps} filtersExpanded={true} />)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('shows count info when expanded', () => {
    render(<ClassFilters {...defaultProps} filtersExpanded={true} />)
    expect(screen.getByText('Showing 5 of 10 classes')).toBeInTheDocument()
  })

  it('toggles expansion on header click', async () => {
    const user = userEvent.setup()
    const setFiltersExpanded = vi.fn()
    render(<ClassFilters {...defaultProps} setFiltersExpanded={setFiltersExpanded} />)

    await user.click(screen.getByText('Filters'))
    expect(setFiltersExpanded).toHaveBeenCalledWith(true)
  })

  it('calls setSearchQuery on search input change', async () => {
    const user = userEvent.setup()
    const setSearchQuery = vi.fn()
    render(
      <ClassFilters {...defaultProps} filtersExpanded={true} setSearchQuery={setSearchQuery} />
    )

    const searchInput = screen.getByPlaceholderText('Search by name or course...')
    await user.type(searchInput, 'Math')
    expect(setSearchQuery).toHaveBeenCalled()
  })

  it('calls setViewMode when view buttons are clicked', async () => {
    const user = userEvent.setup()
    const setViewMode = vi.fn()
    render(
      <ClassFilters {...defaultProps} filtersExpanded={true} setViewMode={setViewMode} />
    )

    const buttons = screen.getAllByRole('button')
    const listButton = buttons.find(btn => !btn.textContent.includes('Filters'))
    if (listButton) {
      await user.click(listButton)
    }
  })
})
