import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchStudentClasses,
  fetchStudentClass,
  fetchRegistrations,
  recordAttendance,
  recordBulkAttendance,
  fetchClassAttendanceReport,
  fetchStudentAttendanceReport
} from './api'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

const TOKEN = 'test-token'

describe('fetchStudentClasses', () => {
  it('fetches classes without date params', async () => {
    const mockData = [{ ID: 1, Name: 'Class A' }]
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchStudentClasses(TOKEN)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/student-classes'),
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      })
    )
    expect(result).toEqual(mockData)
  })

  it('appends date params when provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await fetchStudentClasses(TOKEN, { startDate: '2024-01-01', endDate: '2024-12-31' })

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('startDate=2024-01-01')
    expect(calledUrl).toContain('endDate=2024-12-31')
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    })

    await expect(fetchStudentClasses(TOKEN)).rejects.toThrow('Unauthorized')
  })

  it('throws default message when no error in body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await expect(fetchStudentClasses(TOKEN)).rejects.toThrow('Failed to fetch student classes')
  })
})

describe('fetchStudentClass', () => {
  it('returns matching class by ID', async () => {
    const mockData = [
      { ID: 1, Name: 'Class A' },
      { ID: 2, Name: 'Class B' },
    ]
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchStudentClass(TOKEN, '2')
    expect(result).toEqual({ ID: 2, Name: 'Class B' })
  })

  it('throws when class not found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ ID: 1, Name: 'Class A' }]),
    })

    await expect(fetchStudentClass(TOKEN, '999')).rejects.toThrow('Student class not found')
  })
})

describe('fetchRegistrations', () => {
  it('fetches registrations for a class', async () => {
    const mockData = [{ ID: 1, StudentID: 10 }]
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchRegistrations(TOKEN, 5)

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('studentClassId=5')
    expect(result).toEqual(mockData)
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    })

    await expect(fetchRegistrations(TOKEN, 5)).rejects.toThrow('Not found')
  })
})

describe('recordAttendance', () => {
  it('posts attendance data', async () => {
    const attendanceData = { registration_id: 1, date: '2024-01-01', status: 'PRESENT' }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    const result = await recordAttendance(TOKEN, attendanceData)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/attendance'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(attendanceData),
      })
    )
    expect(result).toEqual({ success: true })
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await expect(recordAttendance(TOKEN, {})).rejects.toThrow('Failed to record attendance')
  })
})

describe('recordBulkAttendance', () => {
  it('posts bulk attendance data', async () => {
    const data = [
      { registration_id: 1, date: '2024-01-01', status: 'PRESENT' },
      { registration_id: 2, date: '2024-01-01', status: 'ABSENT' },
    ]
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    const result = await recordBulkAttendance(TOKEN, data)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/attendance/bulk'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(data),
      })
    )
    expect(result).toEqual({ success: true })
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    })

    await expect(recordBulkAttendance(TOKEN, [])).rejects.toThrow('Server error')
  })
})

describe('fetchClassAttendanceReport', () => {
  it('fetches report with default params', async () => {
    const mockReport = { totalStudents: 30 }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReport),
    })

    const result = await fetchClassAttendanceReport(TOKEN, 1)

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('student_class_id=1')
    expect(calledUrl).toContain('period=day')
    expect(result).toEqual(mockReport)
  })

  it('includes date params and period', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await fetchClassAttendanceReport(TOKEN, 1, {
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      period: 'week',
    })

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('start_date=2024-01-01')
    expect(calledUrl).toContain('end_date=2024-06-30')
    expect(calledUrl).toContain('period=week')
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await expect(fetchClassAttendanceReport(TOKEN, 1)).rejects.toThrow('Failed to fetch class attendance report')
  })
})

describe('fetchStudentAttendanceReport', () => {
  it('fetches student report', async () => {
    const mockReport = { summary: { percentage: 95 } }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReport),
    })

    const result = await fetchStudentAttendanceReport(TOKEN, 10, 1)

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('student_id=10')
    expect(calledUrl).toContain('student_class_id=1')
    expect(result).toEqual(mockReport)
  })

  it('includes date params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await fetchStudentAttendanceReport(TOKEN, 10, 1, {
      startDate: '2024-01-01',
      endDate: '2024-06-30',
    })

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('start_date=2024-01-01')
    expect(calledUrl).toContain('end_date=2024-06-30')
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Student not found' }),
    })

    await expect(fetchStudentAttendanceReport(TOKEN, 10, 1)).rejects.toThrow('Student not found')
  })
})
