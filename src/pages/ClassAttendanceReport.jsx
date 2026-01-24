import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchClassAttendanceReport, fetchStudentClass} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {DateRangePicker} from '@/components/ui/date-range-picker'
import {ArrowLeft, BarChart3, Calendar, Loader2, TrendingUp, Users} from 'lucide-react'
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

export default function ClassAttendanceReport() {
  const {classId} = useParams()
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
        const data = await fetchClassAttendanceReport(accessToken, classId, {
          startDate,
          endDate,
          period: 'day'
        })
        setReport(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && classId && startDate && endDate) {
      loadReport()
    }
  }, [accessToken, classId, startDate, endDate])

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
          <h1 className="text-3xl font-bold">Attendance Report</h1>
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

  const overallPieData = [
    {name: 'Present', value: report.overallSummary?.presentCount || 0},
    {name: 'Absent', value: report.overallSummary?.absentCount || 0},
    {name: 'Late', value: report.overallSummary?.lateCount || 0},
    {name: 'Excused', value: report.overallSummary?.excusedCount || 0}
  ].filter(item => item.value > 0)

  const dailyChartData = report.dailyData?.map(day => ({
    date: formatDate(day.date),
    present: day.presentCount,
    absent: day.absentCount,
    late: day.lateCount,
    excused: day.excusedCount,
    percentage: day.percentage
  })) || []

  const weeklyChartData = report.weeklyData?.map(week => ({
    week: week.week,
    present: week.presentCount,
    total: week.totalDays,
    percentage: week.percentage
  })) || []

  const monthlyChartData = report.monthlyData?.map(month => ({
    month: month.month,
    present: month.presentCount,
    total: month.totalDays,
    percentage: month.percentage
  })) || []

  const topStudents = [...(report.studentSummaries || [])]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button onClick={() => navigate(`/student-classes/${classId}/registrations`)} variant="outline" size="icon" className="flex-shrink-0">
            <ArrowLeft className="size-4"/>
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Attendance Report</h1>
        </div>
      </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Report Parameters</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Select date range</CardDescription>
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="size-4 sm:size-5 text-primary flex-shrink-0"/>
                <span className="text-2xl sm:text-3xl font-bold">{report.totalStudents || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="size-4 sm:size-5 text-green-600 flex-shrink-0"/>
                <span className="text-2xl sm:text-3xl font-bold">{formatPercentage(report.overallSummary?.percentage || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="size-4 sm:size-5 text-blue-600 flex-shrink-0"/>
                <span className="text-2xl sm:text-3xl font-bold">{report.overallSummary?.totalDays || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Present Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <BarChart3 className="size-4 sm:size-5 text-green-600 flex-shrink-0"/>
                <span className="text-2xl sm:text-3xl font-bold">{report.overallSummary?.presentCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Attendance Distribution</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Overall attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={overallPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {overallPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorByName(entry.name)}/>
                    ))}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Attendance Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Detailed breakdown by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 sm:size-3 rounded-full bg-green-500 flex-shrink-0"/>
                    <span className="text-xs sm:text-sm">Present</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{report.overallSummary?.presentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 sm:size-3 rounded-full bg-red-500 flex-shrink-0"/>
                    <span className="text-xs sm:text-sm">Absent</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{report.overallSummary?.absentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 sm:size-3 rounded-full bg-yellow-500 flex-shrink-0"/>
                    <span className="text-xs sm:text-sm">Late</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{report.overallSummary?.lateCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 sm:size-3 rounded-full bg-blue-500 flex-shrink-0"/>
                    <span className="text-xs sm:text-sm">Excused</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{report.overallSummary?.excusedCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {dailyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Daily Attendance Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Attendance percentage by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date" tick={{fontSize: 12}}/>
                    <YAxis tick={{fontSize: 12}}/>
                    <Tooltip/>
                    <Legend wrapperStyle={{fontSize: 12}}/>
                    <Line type="monotone" dataKey="percentage" stroke={COLORS.present} name="Attendance %"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {dailyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Daily Status Breakdown</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Number of students by status each day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date" tick={{fontSize: 12}}/>
                    <YAxis tick={{fontSize: 12}}/>
                    <Tooltip/>
                    <Legend wrapperStyle={{fontSize: 12}}/>
                    <Bar dataKey="present" stackId="a" fill={COLORS.present} name="Present"/>
                    <Bar dataKey="late" stackId="a" fill={COLORS.late} name="Late"/>
                    <Bar dataKey="excused" stackId="a" fill={COLORS.excused} name="Excused"/>
                    <Bar dataKey="absent" stackId="a" fill={COLORS.absent} name="Absent"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {weeklyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Weekly Attendance Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Attendance percentage by week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="week" tick={{fontSize: 12}}/>
                    <YAxis tick={{fontSize: 12}}/>
                    <Tooltip/>
                    <Legend wrapperStyle={{fontSize: 12}}/>
                    <Bar dataKey="percentage" fill={COLORS.present} name="Attendance %"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {monthlyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Monthly Attendance Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Attendance percentage by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="month" tick={{fontSize: 12}}/>
                    <YAxis tick={{fontSize: 12}}/>
                    <Tooltip/>
                    <Legend wrapperStyle={{fontSize: 12}}/>
                    <Bar dataKey="percentage" fill={COLORS.present} name="Attendance %"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {topStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Top 10 Students by Attendance</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Students with highest attendance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {topStudents.map((student, index) => (
                  <div key={student.studentId} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm sm:text-base truncate">{student.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-shrink-0">
                      <span className="text-muted-foreground hidden sm:inline">
                        {student.presentCount}/{student.totalDays} days
                      </span>
                      <span className="font-bold text-green-600">{formatPercentage(student.percentage)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {report.studentSummaries?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">All Students Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Complete attendance summary for all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">Student Name</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">Total</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">Present</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">Absent</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">Late</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">Excused</th>
                      <th className="text-center py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.studentSummaries.map((student) => (
                      <tr key={student.studentId} className="border-b hover:bg-gray-50">
                        <td className="py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">{student.studentName}</td>
                        <td className="text-center py-2 sm:py-3 px-1 sm:px-2">{student.totalDays}</td>
                        <td className="text-center py-2 sm:py-3 px-1 sm:px-2 text-green-600 font-medium">{student.presentCount}</td>
                        <td className="text-center py-2 sm:py-3 px-1 sm:px-2 text-red-600 font-medium">{student.absentCount}</td>
                        <td className="text-center py-2 sm:py-3 px-1 sm:px-2 text-yellow-600 font-medium">{student.lateCount}</td>
                        <td className="text-center py-2 sm:py-3 px-1 sm:px-2 text-blue-600 font-medium">{student.excusedCount}</td>
                        <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold">{formatPercentage(student.percentage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
