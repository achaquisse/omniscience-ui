import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchRegistrations} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2} from 'lucide-react'

export default function Registrations() {
  const {classId} = useParams()
  const {accessToken} = useAuth()
  const navigate = useNavigate()

  const [registrations, setRegistrations] = useState([])
  const [filteredRegistrations, setFilteredRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')

  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/student-classes')} variant="outline" size="icon">
              <ArrowLeft className="size-4"/>
            </Button>
            <h1 className="text-3xl font-bold">Class Registrations</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filters & Sorting</CardTitle>
                <CardDescription>Search and sort registrations</CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                {filtersExpanded ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
              </Button>
            </div>
          </CardHeader>
          {filtersExpanded && <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search by name or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="id">ID</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Order</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground pt-2">
              Showing {paginatedRegistrations.length} of {filteredRegistrations.length} registrations
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
        ) : paginatedRegistrations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No registrations found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedRegistrations.map((reg) => (
                <Card key={reg.ID} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono">
                            #{reg.ID}
                          </span>
                          <h3 className="text-lg font-semibold">
                            {reg.Student?.FirstName} {reg.Student?.LastName}
                          </h3>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Student ID: {reg.StudentID}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${reg.Status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            reg.Status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'}
                        `}>
                          {reg.Status}
                        </span>
                      </div>
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
    </div>
  )
}
