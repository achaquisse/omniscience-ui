import {Link, useLocation, useParams} from 'react-router-dom'
import {ChevronRight, Home} from 'lucide-react'
import {useEffect, useState} from 'react'
import {fetchStudentClass} from '@/lib/api'
import {useAuth} from '@/contexts/AuthContext'

export default function Breadcrumbs() {
  const location = useLocation()
  const params = useParams()
  const {accessToken} = useAuth()
  const [classData, setClassData] = useState(null)

  useEffect(() => {
    const loadClassData = async () => {
      if (params.classId && accessToken) {
        try {
          const data = await fetchStudentClass(accessToken, params.classId)
          setClassData(data)
        } catch (err) {
          console.error('Failed to load class data for breadcrumbs:', err)
        }
      }
    }
    loadClassData()
  }, [params.classId, accessToken])

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
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`

    if (segment === 'student-classes') {
      breadcrumbItems.push({
        label: 'Class Attendance',
        path: '/student-classes'
      })
    } else if (segment === 'registrations') {
      breadcrumbItems.push({
        label: classData?.Name || 'Class',
        path: `/student-classes/${params.classId}/registrations`
      })
    } else if (segment === 'attendance-report') {
      if (params.studentId) {
        breadcrumbItems.push({
          label: 'Student Attendance',
          path: currentPath
        })
      } else {
        breadcrumbItems.push({
          label: 'Class Attendance Report',
          path: currentPath
        })
      }
    } else if (segment === 'students' && params.studentId) {
      breadcrumbItems.push({
        label: classData?.Name || 'Class',
        path: `/student-classes/${params.classId}/registrations`
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
