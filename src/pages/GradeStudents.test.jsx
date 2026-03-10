import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import GradeStudents from './GradeStudents.jsx'

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

const mockFetchStudentClass = vi.fn()
const mockFetchGrades = vi.fn()

vi.mock('@/lib/api', () => ({
  fetchStudentClass: (...args) => mockFetchStudentClass(...args),
  fetchGrades: (...args) => mockFetchGrades(...args),
  fetchGradeDetail: vi.fn(),
  postGrade: vi.fn(),
  patchGrade: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/grades/1']}>
      <Routes>
        <Route path="/grades/:classId" element={<GradeStudents/>}/>
      </Routes>
    </MemoryRouter>
  )
}

describe('GradeStudents', () => {
  it('shows loading spinner initially', () => {
    mockFetchStudentClass.mockReturnValue(new Promise(() => {
    }))
    mockFetchGrades.mockReturnValue(new Promise(() => {
    }))

    const {container} = renderWithRoute()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders class name after loading', async () => {
    mockFetchStudentClass.mockResolvedValue({
      ID: 1,
      Name: 'Math 101',
      Course: {Name: 'Mathematics'},
      Period: {Start: '2024-01-01', End: '2024-06-30'},
    })
    mockFetchGrades.mockResolvedValue([
      {
        ID: 1,
        StudentID: 10,
        Student: {FirstName: 'John', LastName: 'Doe'},
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
    mockFetchGrades.mockRejectedValue(new Error('Failed to load'))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('shows empty state', async () => {
    mockFetchStudentClass.mockResolvedValue({
      ID: 1,
      Name: 'Math 101',
      Course: {Name: 'Math'},
      Period: {Start: '2024-01-01', End: '2024-06-30'},
    })
    mockFetchGrades.mockResolvedValue([])

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('No students found')).toBeInTheDocument()
    })
  })
})
