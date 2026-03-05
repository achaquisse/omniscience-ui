import {useNavigate} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {useStudentClasses} from '@/hooks/useStudentClasses'
import {Card, CardContent} from '@/components/ui/card'
import {Loader2} from 'lucide-react'
import ClassFilters from '@/components/ClassFilters'
import ClassCard from '@/components/ClassCard'
import Pagination from '@/components/Pagination'

export default function GradeClasses() {
  const {accessToken} = useAuth()
  const navigate = useNavigate()

  const {
    classes,
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
  } = useStudentClasses(accessToken)

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Grades</h1>

      <ClassFilters
        filtersExpanded={filtersExpanded}
        setFiltersExpanded={setFiltersExpanded}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        paginatedCount={classes.length}
        filteredCount={filteredClasses.length}
      />

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
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No student classes found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
              : 'space-y-3 sm:space-y-4'
          }>
            {classes.map((cls) => (
              <ClassCard
                key={cls.ID}
                cls={cls}
                onClick={() => navigate(`/grades/${cls.ID}`)}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
          />
        </>
      )}
    </div>
  )
}
