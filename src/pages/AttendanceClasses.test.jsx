import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AttendanceClasses from './AttendanceClasses'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'token' }),
}))

vi.mock('@/lib/api', () => ({
  fetchClassAttendanceReport: vi.fn().mockResolvedValue({ dailyData: [] }),
}))

const mockUseStudentClasses = vi.fn()

vi.mock('@/hooks/useStudentClasses', () => ({
  useStudentClasses: (...args) => mockUseStudentClasses(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AttendanceClasses', () => {
  it('renders page title', () => {
    mockUseStudentClasses.mockReturnValue({
      classes: [],
      filteredClasses: [],
      loading: false,
      error: null,
      startDate: '2024-01-01',
      setStartDate: vi.fn(),
      endDate: '2024-12-31',
      setEndDate: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      viewMode: 'grid',
      setViewMode: vi.fn(),
      filtersExpanded: false,
      setFiltersExpanded: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      handlePreviousPage: vi.fn(),
      handleNextPage: vi.fn(),
    })

    render(
      <MemoryRouter>
        <AttendanceClasses />
      </MemoryRouter>
    )
    expect(screen.getByText('Select a Class')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseStudentClasses.mockReturnValue({
      classes: [],
      filteredClasses: [],
      loading: true,
      error: null,
      startDate: '2024-01-01',
      setStartDate: vi.fn(),
      endDate: '2024-12-31',
      setEndDate: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      viewMode: 'grid',
      setViewMode: vi.fn(),
      filtersExpanded: false,
      setFiltersExpanded: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      handlePreviousPage: vi.fn(),
      handleNextPage: vi.fn(),
    })

    const { container } = render(
      <MemoryRouter>
        <AttendanceClasses />
      </MemoryRouter>
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseStudentClasses.mockReturnValue({
      classes: [],
      filteredClasses: [],
      loading: false,
      error: 'Failed to fetch',
      startDate: '2024-01-01',
      setStartDate: vi.fn(),
      endDate: '2024-12-31',
      setEndDate: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      viewMode: 'grid',
      setViewMode: vi.fn(),
      filtersExpanded: false,
      setFiltersExpanded: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      handlePreviousPage: vi.fn(),
      handleNextPage: vi.fn(),
    })

    render(
      <MemoryRouter>
        <AttendanceClasses />
      </MemoryRouter>
    )
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    mockUseStudentClasses.mockReturnValue({
      classes: [],
      filteredClasses: [],
      loading: false,
      error: null,
      startDate: '2024-01-01',
      setStartDate: vi.fn(),
      endDate: '2024-12-31',
      setEndDate: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      viewMode: 'grid',
      setViewMode: vi.fn(),
      filtersExpanded: false,
      setFiltersExpanded: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      handlePreviousPage: vi.fn(),
      handleNextPage: vi.fn(),
    })

    render(
      <MemoryRouter>
        <AttendanceClasses />
      </MemoryRouter>
    )
    expect(screen.getByText('No student classes found')).toBeInTheDocument()
  })

  it('renders class cards when data is loaded', () => {
    mockUseStudentClasses.mockReturnValue({
      classes: [
        { ID: 1, Name: 'Math 101', Course: { Name: 'Math' }, Period: { Start: '2024-01-01', End: '2024-06-30' } },
      ],
      filteredClasses: [{ ID: 1 }],
      loading: false,
      error: null,
      startDate: '2024-01-01',
      setStartDate: vi.fn(),
      endDate: '2024-12-31',
      setEndDate: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      viewMode: 'grid',
      setViewMode: vi.fn(),
      filtersExpanded: false,
      setFiltersExpanded: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      handlePreviousPage: vi.fn(),
      handleNextPage: vi.fn(),
    })

    render(
      <MemoryRouter>
        <AttendanceClasses />
      </MemoryRouter>
    )
    expect(screen.getByText('Math 101')).toBeInTheDocument()
  })
})
