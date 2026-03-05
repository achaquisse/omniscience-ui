import {Link, useLocation, useParams} from 'react-router-dom'
import {ChevronRight, Home} from 'lucide-react'
import {useEffect, useState} from 'react'
import {fetchStudentClass, fetchRegistrations} from '@/lib/api'
import {useAuth} from '@/contexts/AuthContext'

export default function Breadcrumbs() {
  const location = useLocation()
  const params = useParams()
  const {accessToken} = useAuth()
  const [classData, setClassData] = useState(null)
  const [studentData, setStudentData] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (params.classId && accessToken) {
        try {
          const data = await fetchStudentClass(accessToken, params.classId)
          setClassData(data)

          if (params.studentId) {
            const registrations = await fetchRegistrations(accessToken, params.classId)
            const registration = registrations.find(reg => reg.StudentID === parseInt(params.studentId))
            if (registration?.Student) {
              setStudentData({
                id: registration.StudentID,
                name: `${registration.Student.FirstName} ${registration.Student.LastName}`
              })
            }
          }
        } catch (err) {
          console.error('Failed to load data for breadcrumbs:', err)
        }
      }
    }
    loadData()
  }, [params.classId, params.studentId, accessToken])

  const pathSegments = location.pathname.split('/').filter(Boolean)

  if (pathSegments.length === 0) {
    return null
  }

  const breadcrumbItems = []

  breadcrumbItems.push({
    label: 'Home',
    path: '/',
    icon: <Home className="size-4"/>
  })

  let currentPath = ''
  let skipNext = false
  
  const isIndividualReportOldPath = pathSegments.includes('student-classes') && 
                                    pathSegments.includes('students') && 
                                    pathSegments.includes('attendance-report') &&
                                    params.studentId
  const isIndividualReportNewPath = pathSegments.includes('attendance') && 
                                    pathSegments.includes('students') && 
                                    pathSegments[pathSegments.length - 1] === 'report' &&
                                    params.studentId
  const isIndividualReport = isIndividualReportOldPath || isIndividualReportNewPath
  const isGlobalReport = pathSegments.includes('student-classes') && 
                         pathSegments.includes('attendance-report') && 
                         !params.studentId
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    if (skipNext) {
      skipNext = false
      return
    }

    if (segment === 'attendance') {
      breadcrumbItems.push({
        label: 'Attendance',
        path: '/attendance'
      })
    } else if (segment === params.classId && pathSegments[index - 1] === 'attendance') {
      breadcrumbItems.push({
        label: classData?.Name || 'Class',
        path: `/attendance/${params.classId}/registrations`
      })
    } else if (segment === 'student-classes' && params.classId) {
      if (isIndividualReport || isGlobalReport) {
        breadcrumbItems.push({
          label: 'Attendance',
          path: '/attendance'
        })
      }
      breadcrumbItems.push({
        label: classData?.Name || 'Class',
        path: `/student-classes/${params.classId}/registrations`
      })
      skipNext = true
    } else if (segment === params.studentId && isIndividualReport) {
      if (isIndividualReportOldPath) {
        breadcrumbItems.push({
          label: `${studentData?.name || 'Student'} report`,
          path: `/student-classes/${params.classId}/students/${params.studentId}/attendance-report`
        })
        skipNext = true
      }
    } else if (segment === 'attendance-report' && isGlobalReport) {
      breadcrumbItems.push({
        label: 'Global Report',
        path: currentPath
      })
    } else if (segment === 'grades') {
      if (params.classId) {
        breadcrumbItems.push({
          label: 'Grades',
          path: '/grades'
        })
        breadcrumbItems.push({
          label: classData?.Name || 'Class',
          path: `/grades/${params.classId}`
        })
      } else {
        breadcrumbItems.push({
          label: 'Grades',
          path: '/grades'
        })
      }
    } else if (segment === 'certificates') {
      if (params.classId) {
        breadcrumbItems.push({
          label: 'Certificates',
          path: '/certificates'
        })
        breadcrumbItems.push({
          label: classData?.Name || 'Class',
          path: `/certificates/${params.classId}`
        })
      } else {
        breadcrumbItems.push({
          label: 'Certificates',
          path: '/certificates'
        })
      }
    } else if (segment === 'report') {
      breadcrumbItems.push({
        label: isIndividualReportNewPath ? 'Individual Report' : 'Global Report',
        path: currentPath
      })
    } else if (segment === 'students' && params.studentId && pathSegments[index - 1] === params.classId && !isIndividualReport) {
      breadcrumbItems.push({
        label: classData?.Name || 'Class',
        path: `/attendance/${params.classId}/registrations`
      })
    }
  })

  return (
    <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto pb-1">
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {index > 0 && <ChevronRight className="size-3 sm:size-4"/>}
          {index === breadcrumbItems.length - 1 ? (
            <span className="font-medium text-foreground flex items-center gap-1 whitespace-nowrap">
              {item.icon}
              <span className="truncate max-w-[120px] sm:max-w-none">{item.label}</span>
            </span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              {item.icon}
              <span className="truncate max-w-[80px] sm:max-w-none">{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
