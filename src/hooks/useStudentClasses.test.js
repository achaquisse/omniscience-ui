import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStudentClasses } from './useStudentClasses'

vi.mock('@/lib/api', () => ({
  fetchStudentClasses: vi.fn(),
}))

import { fetchStudentClasses } from '@/lib/api'

const mockClasses = [
  { ID: 1, Name: 'Math 101', Course: { Name: 'Mathematics' } },
  { ID: 2, Name: 'Physics 201', Course: { Name: 'Physics' } },
  { ID: 3, Name: 'Chem 101', Course: { Name: 'Chemistry' } },
  { ID: 4, Name: 'Bio 101', Course: { Name: 'Biology' } },
  { ID: 5, Name: 'Eng 101', Course: { Name: 'English' } },
  { ID: 6, Name: 'CS 101', Course: { Name: 'Computer Science' } },
  { ID: 7, Name: 'Hist 101', Course: { Name: 'History' } },
  { ID: 8, Name: 'Art 101', Course: { Name: 'Art' } },
  { ID: 9, Name: 'Music 101', Course: { Name: 'Music' } },
  { ID: 10, Name: 'PE 101', Course: { Name: 'Physical Ed' } },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStudentClasses', () => {
  it('starts in loading state', () => {
    fetchStudentClasses.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useStudentClasses('token'))
    expect(result.current.loading).toBe(true)
  })

  it('loads classes successfully', async () => {
    fetchStudentClasses.mockResolvedValue(mockClasses)
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.allClasses).toEqual(mockClasses)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    fetchStudentClasses.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
  })

  it('does not fetch without access token', () => {
    const { result } = renderHook(() => useStudentClasses(null))
    expect(fetchStudentClasses).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(true)
  })

  it('filters classes by search query', async () => {
    fetchStudentClasses.mockResolvedValue(mockClasses)
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSearchQuery('Math')
    })

    expect(result.current.filteredClasses).toHaveLength(1)
    expect(result.current.filteredClasses[0].Name).toBe('Math 101')
  })

  it('filters by course name', async () => {
    fetchStudentClasses.mockResolvedValue(mockClasses)
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSearchQuery('Physics')
    })

    expect(result.current.filteredClasses).toHaveLength(1)
  })

  it('paginates to 9 items per page', async () => {
    fetchStudentClasses.mockResolvedValue(mockClasses)
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.classes).toHaveLength(9)
    expect(result.current.totalPages).toBe(2)
    expect(result.current.currentPage).toBe(1)
  })

  it('navigates pages', async () => {
    fetchStudentClasses.mockResolvedValue(mockClasses)
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handleNextPage()
    })

    expect(result.current.currentPage).toBe(2)
    expect(result.current.classes).toHaveLength(1)

    act(() => {
      result.current.handlePreviousPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('does not go below page 1', async () => {
    fetchStudentClasses.mockResolvedValue(mockClasses)
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handlePreviousPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('resets to page 1 when search changes', async () => {
    fetchStudentClasses.mockResolvedValue(mockClasses)
    const { result } = renderHook(() => useStudentClasses('token'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handleNextPage()
    })

    expect(result.current.currentPage).toBe(2)

    act(() => {
      result.current.setSearchQuery('Math')
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('toggles view mode', async () => {
    fetchStudentClasses.mockResolvedValue([])
    const { result } = renderHook(() => useStudentClasses('token'))

    expect(result.current.viewMode).toBe('grid')

    act(() => {
      result.current.setViewMode('list')
    })

    expect(result.current.viewMode).toBe('list')
  })

  it('toggles filters expanded', async () => {
    fetchStudentClasses.mockResolvedValue([])
    const { result } = renderHook(() => useStudentClasses('token'))

    expect(result.current.filtersExpanded).toBe(false)

    act(() => {
      result.current.setFiltersExpanded(true)
    })

    expect(result.current.filtersExpanded).toBe(true)
  })
})
