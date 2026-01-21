import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchClassAttendanceReport} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
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
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  
  const [startDate, setStartDate] = useState(firstDayOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchClassAttendanceReport(accessToken, classId, {
          startDate,
          endDate,
          period
        })
        setReport(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && classId) {
      loadReport()
    }
  }, [accessToken, classId, startDate, endDate, period])

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(`/student-classes/${classId}/registrations`)} variant="outline" size="icon">
            <ArrowLeft className="size-4"/>
          </Button>
          <h1 className="text-3xl font-bold">Attendance Report</h1>
        </div>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Select date range and period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={today}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={today}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Period</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary"/>
                <span className="text-3xl font-bold">{report.totalStudents || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-green-600"/>
                <span className="text-3xl font-bold">{formatPercentage(report.overallSummary?.percentage || 0)}</span>
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
                <span className="text-3xl font-bold">{report.overallSummary?.totalDays || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-green-600"/>
                <span className="text-3xl font-bold">{report.overallSummary?.presentCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
              <CardDescription>Overall attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overallPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Detailed breakdown by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-green-500"/>
                    <span className="text-sm">Present</span>
                  </div>
                  <span className="font-semibold">{report.overallSummary?.presentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-500"/>
                    <span className="text-sm">Absent</span>
                  </div>
                  <span className="font-semibold">{report.overallSummary?.absentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-yellow-500"/>
                    <span className="text-sm">Late</span>
                  </div>
                  <span className="font-semibold">{report.overallSummary?.lateCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-blue-500"/>
                    <span className="text-sm">Excused</span>
                  </div>
                  <span className="font-semibold">{report.overallSummary?.excusedCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {dailyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trend</CardTitle>
              <CardDescription>Attendance percentage by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="percentage" stroke={COLORS.present} name="Attendance %"/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {dailyChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Status Breakdown</CardTitle>
              <CardDescription>Number of students by status each day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="present" stackId="a" fill={COLORS.present} name="Present"/>
                  <Bar dataKey="late" stackId="a" fill={COLORS.late} name="Late"/>
                  <Bar dataKey="excused" stackId="a" fill={COLORS.excused} name="Excused"/>
                  <Bar dataKey="absent" stackId="a" fill={COLORS.absent} name="Absent"/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

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
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="percentage" fill={COLORS.present} name="Attendance %"/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {topStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Students by Attendance</CardTitle>
              <CardDescription>Students with highest attendance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium">{student.studentName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
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
              <CardTitle>All Students Summary</CardTitle>
              <CardDescription>Complete attendance summary for all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-2">Student Name</th>
                      <th className="text-center py-3 px-2">Total Days</th>
                      <th className="text-center py-3 px-2">Present</th>
                      <th className="text-center py-3 px-2">Absent</th>
                      <th className="text-center py-3 px-2">Late</th>
                      <th className="text-center py-3 px-2">Excused</th>
                      <th className="text-center py-3 px-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.studentSummaries.map((student) => (
                      <tr key={student.studentId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">{student.studentName}</td>
                        <td className="text-center py-3 px-2">{student.totalDays}</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">{student.presentCount}</td>
                        <td className="text-center py-3 px-2 text-red-600 font-medium">{student.absentCount}</td>
                        <td className="text-center py-3 px-2 text-yellow-600 font-medium">{student.lateCount}</td>
                        <td className="text-center py-3 px-2 text-blue-600 font-medium">{student.excusedCount}</td>
                        <td className="text-center py-3 px-2 font-semibold">{formatPercentage(student.percentage)}</td>
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
