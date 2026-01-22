import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchStudentClasses, fetchClassAttendanceReport} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Grid, List, Loader2} from 'lucide-react'

export default function StudentClasses() {
  const {accessToken} = useAuth()
  const navigate = useNavigate()

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

  const [classesWithAttendance, setClassesWithAttendance] = useState(new Set())

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
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex)

  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (!accessToken || paginatedClasses.length === 0) return

      const attendanceChecks = paginatedClasses.map(async (cls) => {
        try {
          const report = await fetchClassAttendanceReport(accessToken, cls.ID, {
            startDate: today,
            endDate: today,
            period: 'day'
          })
          
          if (report?.dailyData && report.dailyData.length > 0) {
            const todayData = report.dailyData.find(day => day.date.split('T')[0] === today)
            if (todayData && (todayData.presentCount > 0 || todayData.absentCount > 0 || todayData.lateCount > 0 || todayData.excusedCount > 0)) {
              return cls.ID
            }
          }
          return null
        } catch {
          return null
        }
      })

      const results = await Promise.all(attendanceChecks)
      const classIdsWithAttendance = results.filter(id => id !== null)
      setClassesWithAttendance(new Set(classIdsWithAttendance))
    }

    checkTodayAttendance()
  }, [accessToken, paginatedClasses, today])

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Class Attendance</h1>

        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter classes by activity period and search</CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                {filtersExpanded ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
              </Button>
            </div>
          </CardHeader>
          {filtersExpanded && <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search by name or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedClasses.length} of {filteredClasses.length} classes
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon-sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="size-4"/>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon-sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="size-4"/>
                </Button>
              </div>
            </div>
          </CardContent>}
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="size-8 animate-spin text-primary"/>
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        ) : paginatedClasses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No student classes found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              {paginatedClasses.map((cls) => (
                <Card
                  key={cls.ID}
                  className="hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => navigate(`/student-classes/${cls.ID}/registrations`)}
                >
                  {classesWithAttendance.has(cls.ID) && (
                    <div className="absolute top-3 right-3">
                      <div className="size-2.5 rounded-full bg-green-500" title="Attendance recorded today" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{cls.Name}</CardTitle>
                    <CardDescription>{cls.Course?.Name || 'No Course'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Period:</span>{' '}
                      {formatDate(cls.Period?.Start)} - {formatDate(cls.Period?.End)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4 mr-1"/>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="size-4 ml-1"/>
                </Button>
              </div>
            )}
          </>
        )}
    </div>
  )
}
