// const API_BASE_URL = 'http://localhost:8080'
const API_BASE_URL = 'https://api.omniscience.co.mz'

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
