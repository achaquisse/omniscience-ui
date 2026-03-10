import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchRegistrations, fetchStudentClass} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2} from 'lucide-react'
import GenerateCertificateDialog from '@/components/GenerateCertificateDialog'
import {formatShortDate} from '@/lib/format'

export default function CertificateStudents() {
  const {classId} = useParams()
  const {accessToken} = useAuth()

  const [studentClass, setStudentClass] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [filteredRegistrations, setFilteredRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const [selectedReg, setSelectedReg] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [classData, registrationsData] = await Promise.all([
          fetchStudentClass(accessToken, classId),
          fetchRegistrations(accessToken, classId)
        ])
        setStudentClass(classData)
        setRegistrations(registrationsData)
        setFilteredRegistrations(registrationsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && classId) {
      loadData()
    }
  }, [accessToken, classId])

  useEffect(() => {
    let filtered = registrations

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(reg =>
        reg.Student?.FirstName?.toLowerCase().includes(query) ||
        reg.Student?.LastName?.toLowerCase().includes(query)
      )
    }

    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal

      if (sortField === 'name') {
        aVal = `${a.Student?.FirstName || ''} ${a.Student?.LastName || ''}`.toLowerCase()
        bVal = `${b.Student?.FirstName || ''} ${b.Student?.LastName || ''}`.toLowerCase()
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
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage)

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const [inactiveReg, setInactiveReg] = useState(null)

  const openDialog = (reg) => {
    if (reg.Status !== 'ACTIVE') {
      setInactiveReg(reg)
      return
    }
    setSelectedReg(reg)
  }

  const closeDialog = () => {
    setSelectedReg(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {studentClass?.Name || 'Loading...'}
          </h1>
          {studentClass && (
            <p className="text-sm text-muted-foreground mt-1">
              {studentClass.Course?.Name} • {formatShortDate(studentClass.Period?.Start)} - {formatShortDate(studentClass.Period?.End)}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Search and sort students</CardDescription>
            </div>
            <Button variant="ghost" size="icon-sm" className="flex-shrink-0">
              {filtersExpanded ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
            </Button>
          </div>
        </CardHeader>
        {filtersExpanded && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Sort By</label>
                <select
                  value={sortField}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="name">Name</option>
                </select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground pt-2">
              Showing {paginatedRegistrations.length} of {filteredRegistrations.length} students
            </div>
          </CardContent>
        )}
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
      ) : paginatedRegistrations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No students found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-muted-foreground">Student
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                </tr>
                </thead>
                <tbody>
                {paginatedRegistrations.map((reg, index) => (
                  <tr
                    key={reg.ID}
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => openDialog(reg)}
                    data-faro-user-action-name="open-certificate-dialog"
                  >
                    <td className="px-4 py-3 text-xs sm:text-sm text-muted-foreground">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3 text-xs sm:text-sm font-medium">
                      {reg.Student?.FirstName} {reg.Student?.LastName}
                    </td>
                    <td className="px-4 py-3 text-xs sm:text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                          reg.Status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {reg.Status}
                        </span>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <ChevronLeft className="size-3 sm:size-4 sm:mr-1"/>
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="size-3 sm:size-4 sm:ml-1"/>
              </Button>
            </div>
          )}
        </>
      )}

      <GenerateCertificateDialog
        open={!!selectedReg}
        onClose={closeDialog}
        studentClass={studentClass}
        registration={selectedReg}
      />

      <Dialog open={!!inactiveReg} onOpenChange={(open) => {
        if (!open) setInactiveReg(null)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cannot Generate Certificate</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Can&apos;t generate certificate for <span
            className="font-medium text-foreground">{inactiveReg?.Student?.FirstName} {inactiveReg?.Student?.LastName}</span> because
            the enrollment is canceled.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInactiveReg(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
