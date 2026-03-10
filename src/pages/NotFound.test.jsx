import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import NotFound from './NotFound'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('NotFound', () => {
  it('renders 404 heading', () => {
    render(
      <MemoryRouter>
        <NotFound/>
      </MemoryRouter>
    )
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(
      <MemoryRouter>
        <NotFound/>
      </MemoryRouter>
    )
    expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument()
  })

  it('navigates to home when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NotFound/>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Go to Home'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
