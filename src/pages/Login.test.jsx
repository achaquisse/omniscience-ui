import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

const mockNavigate = vi.fn()
const mockSignIn = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/contexts/AuthContext.jsx', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Login', () => {
  it('renders login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('submits form and navigates on success', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('shows error on failed sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows generic error on exception', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
  })
})
