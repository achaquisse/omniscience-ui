import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function ThrowingComponent({shouldThrow}) {
  if (shouldThrow) throw new Error('Test render error')
  return <div>Child rendered</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false}/>
        </ErrorBoundary>
      </MemoryRouter>
    )
    expect(screen.getByText('Child rendered')).toBeInTheDocument()
  })

  it('renders ErrorPage when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true}/>
        </ErrorBoundary>
      </MemoryRouter>
    )
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    expect(screen.getByText(/Test render error/)).toBeInTheDocument()
    spy.mockRestore()
  })
})
