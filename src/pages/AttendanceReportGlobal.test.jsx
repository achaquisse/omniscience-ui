import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AttendanceReportGlobal from './AttendanceReportGlobal'

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

const mockFetchClassAttendanceReport = vi.fn()
const mockFetchStudentClass = vi.fn()

vi.mock('@/lib/api', () => ({
  fetchClassAttendanceReport: (...args) => mockFetchClassAttendanceReport(...args),
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
    <MemoryRouter initialEntries={['/student-classes/1/attendance-report']}>
      <Routes>
        <Route path="/student-classes/:classId/attendance-report" element={<AttendanceReportGlobal />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AttendanceReportGlobal', () => {
  it('shows loading spinner initially', () => {
    mockFetchStudentClass.mockReturnValue(new Promise(() => {}))
    mockFetchClassAttendanceReport.mockReturnValue(new Promise(() => {}))

    const { container } = renderWithRoute()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockFetchStudentClass.mockResolvedValue({
      Period: { Start: '2024-01-01', End: '2024-06-30' },
    })
    mockFetchClassAttendanceReport.mockRejectedValue(new Error('Report error'))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Report error')).toBeInTheDocument()
    })
  })

  it('renders report data', async () => {
    mockFetchStudentClass.mockResolvedValue({
      Name: 'Math 101',
      Course: { Name: 'Mathematics' },
      Period: { Start: '2024-01-01', End: '2024-06-30' },
    })
    mockFetchClassAttendanceReport.mockResolvedValue({
      totalStudents: 25,
      overallSummary: {
        percentage: 90,
        totalDays: 100,
        presentCount: 90,
        absentCount: 5,
        lateCount: 3,
        excusedCount: 2,
      },
      dailyData: [],
      weeklyData: [],
      monthlyData: [],
      studentSummaries: [],
    })

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument()
    })
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText(/Attendance Report of/)).toBeInTheDocument()
  })
})
