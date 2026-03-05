import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {ChevronDown, ChevronUp, Grid, List} from 'lucide-react'

export default function ClassFilters({
  filtersExpanded,
  setFiltersExpanded,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  paginatedCount,
  filteredCount
}) {
  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Filter classes by activity period and search</CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" className="flex-shrink-0">
            {filtersExpanded ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
          </Button>
        </div>
      </CardHeader>
      {filtersExpanded && <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Search</label>
            <Input
              type="text"
              placeholder="Search by name or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 pt-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Showing {paginatedCount} of {filteredCount} classes
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
  )
}
