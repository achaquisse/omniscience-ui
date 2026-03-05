import {Button} from '@/components/ui/button'
import {ChevronLeft, ChevronRight} from 'lucide-react'

export default function Pagination({currentPage, totalPages, onPrevious, onNext}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-4 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
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
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="text-xs sm:text-sm px-2 sm:px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-3 sm:size-4 sm:ml-1"/>
      </Button>
    </div>
  )
}
