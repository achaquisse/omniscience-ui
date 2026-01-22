const API_BASE_URL = import.meta.env.VITE_API_URL

export const fetchStudentClasses = async (accessToken, {startDate, endDate} = {}) => {
  const params = new URLSearchParams()

  if (startDate) {
    params.append('startDate', startDate)
  }

  if (endDate) {
    params.append('endDate', endDate)
  }

  const url = `${API_BASE_URL}/student-classes${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch student classes')
  }

  return response.json()
}

export const fetchStudentClass = async (accessToken, studentClassId) => {
  const classes = await fetchStudentClasses(accessToken)
  const studentClass = classes.find(cls => cls.ID === parseInt(studentClassId))

  if (!studentClass) {
    throw new Error('Student class not found')
  }

  return studentClass
}

export const fetchRegistrations = async (accessToken, studentClassId) => {
  const params = new URLSearchParams()
  params.append('studentClassId', studentClassId)

  const url = `${API_BASE_URL}/registrations?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch registrations')
  }

  return response.json()
}

export const recordAttendance = async (accessToken, attendanceData) => {
  const url = `${API_BASE_URL}/attendance`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendanceData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to record attendance')
  }

  return response.json()
}

export const recordBulkAttendance = async (accessToken, attendanceDataArray) => {
  const url = `${API_BASE_URL}/attendance/bulk`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendanceDataArray),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to record bulk attendance')
  }

  return response.json()
}

export const fetchClassAttendanceReport = async (accessToken, studentClassId, {
  startDate,
  endDate,
  period = 'day'
} = {}) => {
  const params = new URLSearchParams()
  params.append('student_class_id', studentClassId)

  if (startDate) {
    params.append('start_date', startDate)
  }

  if (endDate) {
    params.append('end_date', endDate)
  }

  params.append('period', period)

  const url = `${API_BASE_URL}/attendance/class-report?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch class attendance report')
  }

  return response.json()
}

export const fetchStudentAttendanceReport = async (accessToken, studentId, studentClassId, {
  startDate,
  endDate
} = {}) => {
  const params = new URLSearchParams()
  params.append('student_id', studentId)
  params.append('student_class_id', studentClassId)

  if (startDate) {
    params.append('start_date', startDate)
  }

  if (endDate) {
    params.append('end_date', endDate)
  }

  const url = `${API_BASE_URL}/attendance/report?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch student attendance report')
  }

  return response.json()
}
