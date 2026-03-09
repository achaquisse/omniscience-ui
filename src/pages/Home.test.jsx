import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import Home from './Home'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Home', () => {
  it('renders page title', () => {
    render(
      <MemoryRouter>
        <Home/>
      </MemoryRouter>
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Select a module to get started')).toBeInTheDocument()
  })

  it('renders attendance module card', () => {
    render(
      <MemoryRouter>
        <Home/>
      </MemoryRouter>
    )
    expect(screen.getByText('Attendance')).toBeInTheDocument()
    expect(screen.getByText('Manage student class attendance')).toBeInTheDocument()
  })

  it('renders grades module card', () => {
    render(
      <MemoryRouter>
        <Home/>
      </MemoryRouter>
    )
    expect(screen.getByText('GradeStudents')).toBeInTheDocument()
    expect(screen.getByText('Student evaluations and grades')).toBeInTheDocument()
  })

  it('navigates to /student-classes when attendance card is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Home/>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Attendance'))
    expect(mockNavigate).toHaveBeenCalledWith('/student-classes')
  })

  it('navigates to /grades when grades card is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Home/>
      </MemoryRouter>
    )

    await user.click(screen.getByText('GradeStudents'))
    expect(mockNavigate).toHaveBeenCalledWith('/grades')
  })
})
