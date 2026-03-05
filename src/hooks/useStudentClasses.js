import {useEffect, useMemo, useState} from 'react'
import {fetchStudentClasses} from '@/lib/api'

export function useStudentClasses(accessToken) {
  const [classes, setClasses] = useState([])
  const [filteredClasses, setFilteredClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [searchQuery, setSearchQuery] = useState('')

  const [viewMode, setViewMode] = useState('grid')
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchStudentClasses(accessToken, {startDate, endDate})
        setClasses(data)
        setFilteredClasses(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken) {
      loadClasses()
    }
  }, [accessToken, startDate, endDate])

  useEffect(() => {
    let filtered = classes

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cls =>
        cls.Name?.toLowerCase().includes(query) ||
        cls.Course?.Name?.toLowerCase().includes(query)
      )
    }

    setFilteredClasses(filtered)
    setCurrentPage(1)
  }, [searchQuery, classes])

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClasses = useMemo(() => 
    filteredClasses.slice(startIndex, endIndex),
    [filteredClasses, startIndex, endIndex]
  )

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  return {
    classes: paginatedClasses,
    allClasses: classes,
    filteredClasses,
    loading,
    error,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filtersExpanded,
    setFiltersExpanded,
    currentPage,
    totalPages,
    handlePreviousPage,
    handleNextPage
  }
}
