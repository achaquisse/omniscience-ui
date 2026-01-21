import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchRegistrations, fetchStudentAttendanceReport, recordBulkAttendance} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChartBar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Loader2,
  MessageSquare,
  Save,
  X,
  XCircle
} from 'lucide-react'

export default function Registrations() {
  const {classId} = useParams()
  const {accessToken} = useAuth()
  const navigate = useNavigate()

  const [registrations, setRegistrations] = useState([])
  const [filteredRegistrations, setFilteredRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [attendanceMap, setAttendanceMap] = useState({})
  const [existingAttendance, setExistingAttendance] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [attendanceMode, setAttendanceMode] = useState(false)
  const [remarksModal, setRemarksModal] = useState({open: false, registrationId: null, status: null})

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchRegistrations(accessToken, classId)
        setRegistrations(data)
        setFilteredRegistrations(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && classId) {
      loadRegistrations()
    }
  }, [accessToken, classId])

  useEffect(() => {
    const loadAttendanceForDate = async () => {
      if (registrations.length === 0) {
        return
      }

      setLoadingAttendance(true)
      try {
        const attendanceByStudent = {}

        await Promise.all(
          registrations.map(async (reg) => {
            try {
              const report = await fetchStudentAttendanceReport(
                accessToken,
                reg.StudentID,
                classId,
                {
                  startDate: selectedDate,
                  endDate: selectedDate
                }
              )

              console.log(`Attendance report for student ${reg.StudentID}:`, report)

              const recordForDate = report.records?.find(record => {
                const recordDate = record.date.split('T')[0]
                return recordDate === selectedDate
              })

              if (recordForDate) {
                console.log(`Found attendance for reg ${reg.ID}:`, recordForDate)
                attendanceByStudent[reg.ID] = {
                  status: recordForDate.status,
                  remarks: recordForDate.remarks || ''
                }
              }
            } catch (err) {
              console.error(`Failed to fetch attendance for student ${reg.StudentID}:`, err)
            }
          })
        )

        console.log('Setting existing attendance:', attendanceByStudent)
        setExistingAttendance(attendanceByStudent)
        setAttendanceMap({})
      } catch (err) {
        console.error('Failed to load attendance:', err)
        setExistingAttendance({})
        setAttendanceMap({})
      } finally {
        setLoadingAttendance(false)
      }
    }

    if (accessToken && classId && selectedDate && registrations.length > 0) {
      loadAttendanceForDate()
    }
  }, [accessToken, classId, selectedDate, registrations])

  useEffect(() => {
    let filtered = registrations

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(reg =>
        reg.Student?.FirstName?.toLowerCase().includes(query) ||
        reg.Student?.LastName?.toLowerCase().includes(query) ||
        reg.Status?.toLowerCase().includes(query)
      )
    }

    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal

      if (sortField === 'name') {
        aVal = `${a.Student?.FirstName || ''} ${a.Student?.LastName || ''}`.toLowerCase()
        bVal = `${b.Student?.FirstName || ''} ${b.Student?.LastName || ''}`.toLowerCase()
      } else if (sortField === 'status') {
        aVal = a.Status?.toLowerCase() || ''
        bVal = b.Status?.toLowerCase() || ''
      } else {
        aVal = a.ID
        bVal = b.ID
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredRegistrations(filtered)
    setCurrentPage(1)
  }, [searchQuery, sortField, sortOrder, registrations])

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    const dateString = newDate.toISOString().split('T')[0]

    if (dateString <= today) {
      setSelectedDate(dateString)
      setSaveSuccess(false)
    }
  }

  const setAttendanceStatus = (registrationId, status) => {
    if (status === 'LATE' || status === 'EXCUSED') {
      setRemarksModal({open: true, registrationId, status})
    } else {
      setAttendanceMap(prev => ({
        ...prev,
        [registrationId]: {
          ...prev[registrationId],
          status,
          remarks: ''
        }
      }))
    }
  }

  const handleRemarksSubmit = (remarks) => {
    const {registrationId, status} = remarksModal
    setAttendanceMap(prev => ({
      ...prev,
      [registrationId]: {
        ...prev[registrationId],
        status,
        remarks
      }
    }))
    setRemarksModal({open: false, registrationId: null, status: null})
  }

  const setAttendanceRemarks = (registrationId, remarks) => {
    setAttendanceMap(prev => ({
      ...prev,
      [registrationId]: {
        ...prev[registrationId],
        remarks
      }
    }))
  }

  const handleSaveAttendance = async () => {
    try {
      setSaving(true)
      setError(null)
      setSaveSuccess(false)

      const attendanceRecords = Object.entries(attendanceMap)
        .filter(([_, data]) => data.status)
        .map(([registrationId, data]) => ({
          registration_id: parseInt(registrationId),
          date: selectedDate,
          status: data.status,
          remarks: data.remarks || ''
        }))

      if (attendanceRecords.length === 0) {
        setError('No attendance records to save. Please mark at least one student.')
        return
      }

      await recordBulkAttendance(accessToken, attendanceRecords)
      setSaveSuccess(true)

      const attendanceByStudent = {}
      for (const record of attendanceRecords) {
        attendanceByStudent[record.registration_id] = {
          status: record.status,
          remarks: record.remarks
        }
      }

      setExistingAttendance(prev => ({...prev, ...attendanceByStudent}))
      setAttendanceMap({})

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAllPresent = () => {
    const newMap = {}
    filteredRegistrations.forEach(reg => {
      newMap[reg.ID] = {
        status: 'PRESENT',
        remarks: ''
      }
    })
    setAttendanceMap(newMap)
  }

  const getAttendanceStatus = (registrationId) => {
    const status = attendanceMap[registrationId]?.status || existingAttendance[registrationId]?.status || null
    if (status) {
      console.log(`Status for reg ${registrationId}:`, status, 'from', attendanceMap[registrationId]?.status ? 'attendanceMap' : 'existingAttendance')
    }
    return status
  }

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString)
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
    return date.toLocaleDateString('en-US', options)
  }

  const isToday = selectedDate === today
  const canEditAttendance = isToday && attendanceMode
  const hasChanges = Object.keys(attendanceMap).length > 0

  console.log('Render state:', {
    attendanceMode,
    selectedDate,
    existingAttendanceCount: Object.keys(existingAttendance).length,
    existingAttendance,
    attendanceMapCount: Object.keys(attendanceMap).length,
    loadingAttendance
  })

  const RemarksModal = () => {
    const [remarks, setRemarks] = useState('')

    if (!remarksModal.open) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Add Remarks</CardTitle>
            <CardDescription>
              {remarksModal.status === 'LATE' ? 'Why is the student late?' : 'Reason for excused absence'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Remarks</label>
              <textarea
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[100px]"
                placeholder="Enter remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRemarksModal({open: false, registrationId: null, status: null})}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleRemarksSubmit(remarks)}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <RemarksModal/>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/student-classes')} variant="outline" size="icon">
              <ArrowLeft className="size-4"/>
            </Button>
            <h1 className="text-3xl font-bold">Enrolled Students</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/student-classes/${classId}/attendance-report`)} variant="outline">
              <BarChart3 className="size-4 mr-2"/>
              View Report
            </Button>
            {!attendanceMode && isToday && (
              <Button onClick={() => setAttendanceMode(true)} variant="default">
                <ClipboardCheck className="size-4 mr-2"/>
                Record Today's Attendance
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5"/>
                  {formatDateDisplay(selectedDate)}
                  {loadingAttendance && <Loader2 className="size-4 animate-spin text-muted-foreground"/>}
                </CardTitle>
                <CardDescription>
                  {isToday && attendanceMode ? 'Recording attendance for today' : isToday ? 'Today' : 'Past attendance (read-only)'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange(-1)}
                  disabled={loading}
                >
                  <ChevronLeft className="size-4"/>
                  Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(today)}
                  disabled={isToday || loading}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange(1)}
                  disabled={isToday || loading}
                >
                  Next Day
                  <ChevronRight className="size-4"/>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {canEditAttendance && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {hasChanges ? `${Object.keys(attendanceMap).length} students marked` : 'No changes yet'}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAttendanceMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllPresent}
                    disabled={saving || loading}
                  >
                    <CheckCircle2 className="size-4 mr-2"/>
                    Mark All Present
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveAttendance}
                    disabled={!hasChanges || saving || loading}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin"/>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2"/>
                        Save Attendance
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {saveSuccess && (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="size-5"/>
                <span className="font-medium">Attendance saved successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="size-5"/>
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Search students</CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                {filtersExpanded ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
              </Button>
            </div>
          </CardHeader>
          {filtersExpanded && <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedRegistrations.length} of {filteredRegistrations.length} students
            </div>
          </CardContent>}
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="size-8 animate-spin text-primary"/>
          </div>
        ) : paginatedRegistrations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No students found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {paginatedRegistrations.map((reg) => {
                const currentStatus = getAttendanceStatus(reg.ID)
                return (
                  <Card
                    key={reg.ID}
                    className={`transition-all ${currentStatus === 'ABSENT' ? 'border-red-300 shadow-md' : ''}`}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold truncate">
                              {reg.Student?.FirstName} {reg.Student?.LastName}
                            </h3>
                            {currentStatus && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAttendanceColor(currentStatus)}`}>
                                {currentStatus}
                              </span>
                            )}
                            {!canEditAttendance && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/student-classes/${classId}/students/${reg.StudentID}/attendance-report`)
                                }}
                                className="ml-auto opacity-50 hover:opacity-100 transition-opacity"
                                title="View attendance report"
                              >
                                <ChartBar className="size-4"/>
                              </Button>
                            )}
                          </div>
                          {(attendanceMap[reg.ID]?.remarks || existingAttendance[reg.ID]?.remarks) && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MessageSquare className="size-3"/>
                              {attendanceMap[reg.ID]?.remarks || existingAttendance[reg.ID]?.remarks}
                            </div>
                          )}
                        </div>

                        {canEditAttendance && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant={attendanceMap[reg.ID]?.status === 'PRESENT' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setAttendanceStatus(reg.ID, 'PRESENT')}
                              className={attendanceMap[reg.ID]?.status === 'PRESENT' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                              <Check className="size-4 mr-1"/>
                              Present
                            </Button>
                            <Button
                              variant={attendanceMap[reg.ID]?.status === 'ABSENT' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setAttendanceStatus(reg.ID, 'ABSENT')}
                              className={attendanceMap[reg.ID]?.status === 'ABSENT' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                              <X className="size-4 mr-1"/>
                              Absent
                            </Button>
                            <Button
                              variant={attendanceMap[reg.ID]?.status === 'LATE' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setAttendanceStatus(reg.ID, 'LATE')}
                              className={attendanceMap[reg.ID]?.status === 'LATE' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                            >
                              Late
                            </Button>
                            <Button
                              variant={attendanceMap[reg.ID]?.status === 'EXCUSED' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setAttendanceStatus(reg.ID, 'EXCUSED')}
                              className={attendanceMap[reg.ID]?.status === 'EXCUSED' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                            >
                              Excused
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
    </>
  )
}
