import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export default function ClassCard({cls, onClick, showIndicator = false}) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={onClick}
    >
      {showIndicator && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className="size-2 sm:size-2.5 rounded-full bg-green-500" title="Attendance recorded today" />
        </div>
      )}
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className={`text-base sm:text-lg ${showIndicator ? 'pr-4' : ''}`}>{cls.Name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{cls.Course?.Name || 'No Course'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5 sm:space-y-2">
        <div className="text-xs sm:text-sm">
          <span className="font-medium">Period:</span>{' '}
          <span className="text-muted-foreground">
            {formatDate(cls.Period?.Start)} - {formatDate(cls.Period?.End)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
