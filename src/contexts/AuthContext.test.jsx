import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'

const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
      signInWithPassword: (...args) => mockSignInWithPassword(...args),
      signOut: (...args) => mockSignOut(...args),
    },
  },
}))

function TestConsumer() {
  const { user, accessToken, loading, signIn, signOut } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.email || 'none'}</span>
      <span data-testid="token">{accessToken || 'none'}</span>
      <button onClick={() => signIn('test@test.com', 'pass')}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
})

describe('AuthContext', () => {
  it('provides loading state initially', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(screen.getByTestId('token').textContent).toBe('none')
  })

  it('sets user from existing session', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { email: 'user@test.com' },
          access_token: 'abc123',
        },
      },
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user@test.com')
    })

    expect(screen.getByTestId('token').textContent).toBe('abc123')
  })

  it('calls signInWithPassword on signIn', async () => {
    const user = userEvent.setup()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await user.click(screen.getByText('Sign In'))

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pass',
    })
  })

  it('calls supabase signOut', async () => {
    const user = userEvent.setup()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockSignOut.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await user.click(screen.getByText('Sign Out'))

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('returns empty context when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { getByTestId } = render(<TestConsumer />)
    expect(getByTestId('user').textContent).toBe('none')

    spy.mockRestore()
  })
})
