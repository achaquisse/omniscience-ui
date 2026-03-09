import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import GradeClasses from './GradeClasses'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({accessToken: 'token'}),
}))

const mockUseStudentClasses = vi.fn()

vi.mock('@/hooks/useStudentClasses', () => ({
  useStudentClasses: (...args) => mockUseStudentClasses(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const baseHookReturn = {
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
}

describe('GradeClasses', () => {
  it('renders page title', () => {
    mockUseStudentClasses.mockReturnValue(baseHookReturn)

    render(
      <MemoryRouter>
        <GradeClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('GradeStudents')).toBeInTheDocument()
  })

  it('shows loading spinner', () => {
    mockUseStudentClasses.mockReturnValue({...baseHookReturn, loading: true})

    const {container} = render(
      <MemoryRouter>
        <GradeClasses/>
      </MemoryRouter>
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseStudentClasses.mockReturnValue({...baseHookReturn, error: 'Server error'})

    render(
      <MemoryRouter>
        <GradeClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    mockUseStudentClasses.mockReturnValue(baseHookReturn)

    render(
      <MemoryRouter>
        <GradeClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('No student classes found')).toBeInTheDocument()
  })

  it('renders class cards', () => {
    mockUseStudentClasses.mockReturnValue({
      ...baseHookReturn,
      classes: [
        {ID: 1, Name: 'Physics 101', Course: {Name: 'Physics'}, Period: {Start: '2024-01-01', End: '2024-06-30'}},
      ],
      filteredClasses: [{ID: 1}],
    })

    render(
      <MemoryRouter>
        <GradeClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('Physics 101')).toBeInTheDocument()
  })
})
