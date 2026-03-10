import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GenerateCertificateDialog from './GenerateCertificateDialog'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({accessToken: 'token'}),
}))

const mockGenerateCertificate = vi.fn()

vi.mock('@/lib/api', () => ({
  generateCertificate: (...args) => mockGenerateCertificate(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const studentClass = {
  Name: 'Level 1 - English Basics',
  Course: {Name: 'Essential English Course'},
  Period: {Start: '2024-01-01', End: '2024-06-30'},
}

const registration = {
  ID: 1,
  Student: {FirstName: 'John', LastName: 'Doe'},
  Status: 'ACTIVE',
}

describe('GenerateCertificateDialog', () => {
  it('renders dialog with student info when open', () => {
    render(
      <GenerateCertificateDialog
        open={true}
        onClose={vi.fn()}
        studentClass={studentClass}
        registration={registration}
      />
    )
    expect(screen.getByRole('heading', {name: 'Generate Certificate'})).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Level 1 - English Basics')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <GenerateCertificateDialog
        open={false}
        onClose={vi.fn()}
        studentClass={studentClass}
        registration={registration}
      />
    )
    expect(screen.queryByText('Generate Certificate')).not.toBeInTheDocument()
  })

  it('shows grade input field', () => {
    render(
      <GenerateCertificateDialog
        open={true}
        onClose={vi.fn()}
        studentClass={studentClass}
        registration={registration}
      />
    )
    expect(screen.getByPlaceholderText('e.g. 15.5')).toBeInTheDocument()
  })

  it('shows validation error when generating without grade', async () => {
    const user = userEvent.setup()
    render(
      <GenerateCertificateDialog
        open={true}
        onClose={vi.fn()}
        studentClass={studentClass}
        registration={registration}
      />
    )

    await user.click(screen.getByRole('button', {name: 'Generate Certificate'}))
    expect(screen.getByText('Grade is required')).toBeInTheDocument()
  })

  it('renders with read-only grade when initialGrade is provided', () => {
    render(
      <GenerateCertificateDialog
        open={true}
        onClose={vi.fn()}
        studentClass={studentClass}
        registration={registration}
        initialGrade={15}
      />
    )
    const input = screen.getByDisplayValue('15')
    expect(input).toBeDisabled()
  })
})
