import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Grades from './Grades'

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

const mockFetchStudentClass = vi.fn()
const mockFetchRegistrations = vi.fn()

vi.mock('@/lib/api', () => ({
  fetchStudentClass: (...args) => mockFetchStudentClass(...args),
  fetchRegistrations: (...args) => mockFetchRegistrations(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/grades/1']}>
      <Routes>
        <Route path="/grades/:classId" element={<Grades />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Grades', () => {
  it('shows loading spinner initially', () => {
    mockFetchStudentClass.mockReturnValue(new Promise(() => {}))
    mockFetchRegistrations.mockReturnValue(new Promise(() => {}))

    const { container } = renderWithRoute()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders class name after loading', async () => {
    mockFetchStudentClass.mockResolvedValue({
      ID: 1,
      Name: 'Math 101',
      Course: { Name: 'Mathematics' },
      Period: { Start: '2024-01-01', End: '2024-06-30' },
    })
    mockFetchRegistrations.mockResolvedValue([
      {
        ID: 1,
        StudentID: 10,
        Student: { FirstName: 'John', LastName: 'Doe' },
        Status: 'ACTIVE',
        EnrolledAt: '2024-01-01',
      },
    ])

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument()
    })
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockFetchStudentClass.mockRejectedValue(new Error('Failed to load'))
    mockFetchRegistrations.mockRejectedValue(new Error('Failed to load'))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('shows empty state', async () => {
    mockFetchStudentClass.mockResolvedValue({
      ID: 1,
      Name: 'Math 101',
      Course: { Name: 'Math' },
      Period: { Start: '2024-01-01', End: '2024-06-30' },
    })
    mockFetchRegistrations.mockResolvedValue([])

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('No students found')).toBeInTheDocument()
    })
  })
})
