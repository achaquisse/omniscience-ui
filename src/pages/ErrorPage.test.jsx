import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import ErrorPage from './ErrorPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ErrorPage', () => {
  it('renders 500 heading and message', () => {
    render(
      <MemoryRouter>
        <ErrorPage/>
      </MemoryRouter>
    )
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
  })

  it('displays error details when provided', () => {
    const error = new Error('Test error message')
    render(
      <MemoryRouter>
        <ErrorPage error={error}/>
      </MemoryRouter>
    )
    expect(screen.getByText(/Test error message/)).toBeInTheDocument()
  })

  it('displays component stack when errorInfo is provided', () => {
    const error = new Error('Error')
    const errorInfo = {componentStack: '\n    at Component\n    at App'}
    render(
      <MemoryRouter>
        <ErrorPage error={error} errorInfo={errorInfo}/>
      </MemoryRouter>
    )
    expect(screen.getByText('Component Stack')).toBeInTheDocument()
  })

  it('calls onReset and navigates home when Go to Home is clicked', async () => {
    const onReset = vi.fn()
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ErrorPage onReset={onReset}/>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Go to Home'))
    expect(onReset).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders Reload Page button', () => {
    render(
      <MemoryRouter>
        <ErrorPage/>
      </MemoryRouter>
    )
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
  })
})
