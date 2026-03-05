import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AttendanceReportIndividual from './AttendanceReportIndividual'

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

const mockFetchStudentAttendanceReport = vi.fn()
const mockFetchStudentClass = vi.fn()

vi.mock('@/lib/api', () => ({
  fetchStudentAttendanceReport: (...args) => mockFetchStudentAttendanceReport(...args),
  fetchStudentClass: (...args) => mockFetchStudentClass(...args),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

vi.mock('@/components/ui/date-range-picker', () => ({
  DateRangePicker: () => <div data-testid="date-range-picker" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/student-classes/1/students/10/attendance-report']}>
      <Routes>
        <Route
          path="/student-classes/:classId/students/:studentId/attendance-report"
          element={<AttendanceReportIndividual />}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('AttendanceReportIndividual', () => {
  it('shows loading spinner initially', () => {
    mockFetchStudentClass.mockReturnValue(new Promise(() => {}))
    mockFetchStudentAttendanceReport.mockReturnValue(new Promise(() => {}))

    const { container } = renderWithRoute()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockFetchStudentClass.mockResolvedValue({
      Period: { Start: '2024-01-01', End: '2024-06-30' },
    })
    mockFetchStudentAttendanceReport.mockRejectedValue(new Error('Not found'))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument()
    })
  })

  it('renders report data', async () => {
    mockFetchStudentClass.mockResolvedValue({
      Period: { Start: '2024-01-01', End: '2024-06-30' },
    })
    mockFetchStudentAttendanceReport.mockResolvedValue({
      student: { firstName: 'John', lastName: 'Doe' },
      summary: {
        percentage: 85,
        totalDays: 50,
        presentCount: 42,
        absentCount: 5,
        lateCount: 2,
        excusedCount: 1,
      },
      records: [],
      weeklyTrends: [],
      monthlyTrends: [],
    })

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument()
    })
    expect(screen.getByText('Student Attendance Report')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })
})
