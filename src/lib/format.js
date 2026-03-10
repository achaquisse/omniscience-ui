export const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleDateString('en-US', {month: 'short'})
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export const ATTENDANCE_COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  late: '#eab308',
  excused: '#3b82f6'
}

export const getChartColorByName = (name) => {
  switch (name) {
    case 'Present':
      return ATTENDANCE_COLORS.present
    case 'Absent':
      return ATTENDANCE_COLORS.absent
    case 'Late':
      return ATTENDANCE_COLORS.late
    case 'Excused':
      return ATTENDANCE_COLORS.excused
    default:
      return '#6b7280'
  }
}

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PRESENT':
      return 'bg-green-100 text-green-800'
    case 'ABSENT':
      return 'bg-red-100 text-red-800'
    case 'LATE':
      return 'bg-yellow-100 text-yellow-800'
    case 'EXCUSED':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
