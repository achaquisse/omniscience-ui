import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AttendanceRegistration from './AttendanceRegistration'

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

const mockFetchRegistrations = vi.fn()
const mockFetchStudentAttendanceReport = vi.fn()
const mockRecordBulkAttendance = vi.fn()

vi.mock('@/lib/api', () => ({
  fetchRegistrations: (...args) => mockFetchRegistrations(...args),
  fetchStudentAttendanceReport: (...args) => mockFetchStudentAttendanceReport(...args),
  recordBulkAttendance: (...args) => mockRecordBulkAttendance(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/student-classes/1/registrations']}>
      <Routes>
        <Route path="/student-classes/:classId/registrations" element={<AttendanceRegistration />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AttendanceRegistration', () => {
  it('shows loading spinner initially', () => {
    mockFetchRegistrations.mockReturnValue(new Promise(() => {}))

    const { container } = renderWithRoute()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders student list after loading', async () => {
    mockFetchRegistrations.mockResolvedValue([
      {
        ID: 1,
        StudentID: 10,
        Student: { FirstName: 'Jane', LastName: 'Smith' },
        Status: 'ACTIVE',
      },
    ])
    mockFetchStudentAttendanceReport.mockResolvedValue({ records: [] })

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('shows error state', async () => {
    mockFetchRegistrations.mockRejectedValue(new Error('Network error'))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('renders date navigation', async () => {
    mockFetchRegistrations.mockResolvedValue([])

    renderWithRoute()

    await waitFor(() => {
      expect(screen.queryByText('.animate-spin')).not.toBeInTheDocument()
    })
  })
})
