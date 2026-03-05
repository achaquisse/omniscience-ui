import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'

const mockNavigate = vi.fn()
const mockSignOut = vi.fn().mockResolvedValue({})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'user@test.com' },
    signOut: mockSignOut,
  }),
}))

vi.mock('@/components/Breadcrumbs', () => ({
  default: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>,
}))

describe('Layout', () => {
  it('renders app name', () => {
    render(
      <MemoryRouter>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    )
    expect(screen.getByText('Omniscience')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <MemoryRouter>
        <Layout><div>Child Content</div></Layout>
      </MemoryRouter>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    render(
      <MemoryRouter>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    )
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
  })

  it('navigates home when logo is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Omniscience'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('signs out and navigates to login', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Sign Out'))
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
