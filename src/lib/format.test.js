import {describe, expect, it} from 'vitest'
import {formatShortDate, ATTENDANCE_COLORS, getChartColorByName, getStatusBadgeClass} from './format'

describe('formatShortDate', () => {
  it('returns N/A for falsy input', () => {
    expect(formatShortDate(null)).toBe('N/A')
    expect(formatShortDate(undefined)).toBe('N/A')
    expect(formatShortDate('')).toBe('N/A')
  })

  it('formats a date string', () => {
    const result = formatShortDate('2024-03-15')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/2024/)
  })
})

describe('getChartColorByName', () => {
  it('returns correct colors for known statuses', () => {
    expect(getChartColorByName('Present')).toBe(ATTENDANCE_COLORS.present)
    expect(getChartColorByName('Absent')).toBe(ATTENDANCE_COLORS.absent)
    expect(getChartColorByName('Late')).toBe(ATTENDANCE_COLORS.late)
    expect(getChartColorByName('Excused')).toBe(ATTENDANCE_COLORS.excused)
  })

  it('returns default color for unknown status', () => {
    expect(getChartColorByName('Unknown')).toBe('#6b7280')
  })
})

describe('getStatusBadgeClass', () => {
  it('returns correct classes for known statuses', () => {
    expect(getStatusBadgeClass('PRESENT')).toContain('bg-green')
    expect(getStatusBadgeClass('ABSENT')).toContain('bg-red')
    expect(getStatusBadgeClass('LATE')).toContain('bg-yellow')
    expect(getStatusBadgeClass('EXCUSED')).toContain('bg-blue')
  })

  it('returns default class for unknown status', () => {
    expect(getStatusBadgeClass('OTHER')).toContain('bg-gray')
  })
})
