import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchStudentAttendanceReport, fetchStudentClass} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {DateRangePicker} from '@/components/ui/date-range-picker'
import {ArrowLeft, Calendar, Loader2, TrendingUp} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function StudentAttendanceReport() {
  const {classId, studentId} = useParams()
  const {accessToken} = useAuth()
  const navigate = useNavigate()

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [datesInitialized, setDatesInitialized] = useState(false)

  useEffect(() => {
    const initializeDates = async () => {
      if (!accessToken || !classId || datesInitialized) return

      try {
        const studentClass = await fetchStudentClass(accessToken, classId)
        
        const periodStart = studentClass.Period?.Start 
          ? new Date(studentClass.Period.Start).toISOString().split('T')[0]
          : today
        
        const periodEnd = studentClass.Period?.End 
          ? new Date(studentClass.Period.End).toISOString().split('T')[0]
          : today
        
        setStartDate(periodStart)
        setEndDate(periodEnd)
        setDatesInitialized(true)
      } catch (err) {
        setStartDate(today)
        setEndDate(today)
        setDatesInitialized(true)
      }
    }

    initializeDates()
  }, [accessToken, classId, datesInitialized, today])

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchStudentAttendanceReport(accessToken, studentId, classId, {
          startDate,
          endDate
        })
        setReport(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && studentId && classId && startDate && endDate) {
      loadReport()
    }
  }, [accessToken, studentId, classId, startDate, endDate])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatPercentage = (value) => {
    return `${Math.round(value)}%`
  }

  const COLORS = {
    present: '#22c55e',
    absent: '#ef4444',
    late: '#eab308',
    excused: '#3b82f6'
  }

  const getColorByName = (name) => {
    switch(name) {
      case 'Present':
        return COLORS.present
      case 'Absent':
        return COLORS.absent
      case 'Late':
        return COLORS.late
      case 'Excused':
        return COLORS.excused
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="size-8 animate-spin text-primary"/>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(`/student-classes/${classId}/registrations`)} variant="outline" size="icon">
            <ArrowLeft className="size-4"/>
          </Button>
          <h1 className="text-3xl font-bold">Student Attendance Report</h1>
        </div>
        <Card className="border-destructive bg-red-50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) {
    return null
  }

  const summaryPieData = [
    {name: 'Present', value: report.summary?.presentCount || 0},
    {name: 'Absent', value: report.summary?.absentCount || 0},
    {name: 'Late', value: report.summary?.lateCount || 0},
    {name: 'Excused', value: report.summary?.excusedCount || 0}
  ].filter(item => item.value > 0)

  const weeklyChartData = report.weeklyTrends?.map(week => ({
    week: week.week,
    percentage: week.percentage,
    present: week.presentCount,
    total: week.totalDays
  })) || []

  const monthlyChartData = report.monthlyTrends?.map(month => ({
    month: month.month,
    percentage: month.percentage,
    present: month.presentCount,
    total: month.totalDays
  })) || []

  const getStatusColor = (status) => {
    switch(status) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(`/student-classes/${classId}/registrations`)} variant="outline" size="icon">
            <ArrowLeft className="size-4"/>
          </Button>
          <h1 className="text-3xl font-bold">Student Attendance Report</h1>
        </div>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Select the period for the report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangePicker
              initialDateFrom={startDate}
              initialDateTo={endDate}
              showCompare={false}
              onUpdate={(values) => {
                if (values.range?.from) {
                  setStartDate(values.range.from.toISOString().split('T')[0])
                }
                if (values.range?.to) {
                  setEndDate(values.range.to.toISOString().split('T')[0])
                }
              }}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-green-600"/>
                <span className="text-3xl font-bold">{formatPercentage(report.summary?.percentage || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-600"/>
                <span className="text-3xl font-bold">{report.summary?.totalDays || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present Days</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-green-600">{report.summary?.presentCount || 0}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absent Days</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-red-600">{report.summary?.absentCount || 0}</span>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {summaryPieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={summaryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {summaryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorByName(entry.name)}/>
                      ))}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Detailed breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-green-500"/>
                    <span className="text-sm">Present</span>
                  </div>
                  <span className="font-semibold">{report.summary?.presentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-500"/>
                    <span className="text-sm">Absent</span>
                  </div>
                  <span className="font-semibold">{report.summary?.absentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-yellow-500"/>
                    <span className="text-sm">Late</span>
                  </div>
                  <span className="font-semibold">{report.summary?.lateCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-blue-500"/>
                    <span className="text-sm">Excused</span>
                  </div>
                  <span className="font-semibold">{report.summary?.excusedCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {weeklyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Trend</CardTitle>
              <CardDescription>Attendance percentage by week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="week"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="percentage" fill={COLORS.present} name="Attendance %"/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {monthlyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Trend</CardTitle>
              <CardDescription>Attendance percentage by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="percentage" stroke={COLORS.present} name="Attendance %"/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {report.records?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Complete record of attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.records.map((record, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatDate(record.date)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                    {record.remarks && (
                      <span className="text-xs text-muted-foreground italic">{record.remarks}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
