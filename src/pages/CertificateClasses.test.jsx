import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import CertificateClasses from './CertificateClasses'

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

describe('CertificateClasses', () => {
  it('renders page title', () => {
    mockUseStudentClasses.mockReturnValue(baseHookReturn)

    render(
      <MemoryRouter>
        <CertificateClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('Select a Class')).toBeInTheDocument()
  })

  it('shows loading spinner', () => {
    mockUseStudentClasses.mockReturnValue({...baseHookReturn, loading: true})

    const {container} = render(
      <MemoryRouter>
        <CertificateClasses/>
      </MemoryRouter>
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseStudentClasses.mockReturnValue({...baseHookReturn, error: 'Network error'})

    render(
      <MemoryRouter>
        <CertificateClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    mockUseStudentClasses.mockReturnValue(baseHookReturn)

    render(
      <MemoryRouter>
        <CertificateClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('No student classes found')).toBeInTheDocument()
  })

  it('renders class cards', () => {
    mockUseStudentClasses.mockReturnValue({
      ...baseHookReturn,
      classes: [
        {ID: 1, Name: 'English 101', Course: {Name: 'English'}, Period: {Start: '2024-01-01', End: '2024-06-30'}},
      ],
      filteredClasses: [{ID: 1}],
    })

    render(
      <MemoryRouter>
        <CertificateClasses/>
      </MemoryRouter>
    )
    expect(screen.getByText('English 101')).toBeInTheDocument()
  })
})
