import {useState} from 'react'
import {useAuth} from '@/contexts/AuthContext'
import {generateCertificate} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Loader2} from 'lucide-react'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleDateString('en-US', {month: 'short'})
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const detectTemplate = (courseName = '') => {
  const lower = courseName.toLowerCase()
  return lower.includes('english') || lower.includes('inglês') || lower.includes('ingles')
    ? 'english'
    : 'portuguese'
}

const composeCertDescription = ({template, level, startDate, endDate, marks}) => {
  if (template === 'english') {
    return `For his active and invaluable participation during the ${level} of the Essential English Course at Omniscience School from ${startDate} to ${endDate}, and finished the level with ${marks} marks.`
  }
  return `Por sua participação activa e inestimável ao Curso de Fundamentos de Informática na Omniscience School de ${startDate} a ${endDate}, tendo terminado o curso com ${marks} valores.`
}

const validateGrade = (value) => {
  if (value === '' || value == null) return 'Grade is required'
  const num = parseFloat(value)
  if (isNaN(num)) return 'Grade must be a number'
  if (num < 0 || num > 20) return 'Grade must be between 0 and 20'
  return ''
}

export default function GenerateCertificateDialog({open, onClose, studentClass, registration, initialGrade}) {
  const {accessToken} = useAuth()

  const isGradeReadOnly = initialGrade != null
  const [grade, setGrade] = useState('')
  const [gradeError, setGradeError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  const effectiveGrade = isGradeReadOnly ? String(initialGrade) : grade

  const handleClose = () => {
    if (generating) return
    setGrade('')
    setGradeError('')
    setGenerateError('')
    onClose()
  }

  const handleGenerate = async () => {
    const err = validateGrade(effectiveGrade)
    if (err) {
      setGradeError(err)
      return
    }

    try {
      setGenerating(true)
      setGenerateError('')

      const courseName = studentClass?.Course?.Name || ''
      const template = detectTemplate(courseName)
      const studentName = `${registration.Student?.FirstName} ${registration.Student?.LastName}`
      const certDescription = composeCertDescription({
        template,
        level: (studentClass?.Name || '').split(' - ')[0],
        startDate: formatDate(studentClass?.Period?.Start),
        endDate: formatDate(studentClass?.Period?.End),
        marks: effectiveGrade,
      })

      const blob = await generateCertificate(accessToken, {template, studentName, certDescription})

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = studentName.replace(/\s+/g, '_')
      const safeClass = (studentClass?.Name || '').replace(/\s+/g, '_')
      a.download = `Certificate_${safeName}_${safeClass}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      handleClose()
    } catch (err) {
      setGenerateError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {if (!o) handleClose()}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Certificate</DialogTitle>
        </DialogHeader>

        {registration && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to generate a certificate of participation for the following student.
            </p>

            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium">
                  {registration.Student?.FirstName} {registration.Student?.LastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Class</span>
                <span className="font-medium">{studentClass?.Name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{formatDate(studentClass?.Period?.Start)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">{formatDate(studentClass?.Period?.End)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Grade <span className="text-muted-foreground">(0 – 20)</span>
              </label>
              <Input
                type="number"
                min="0"
                max="20"
                step="0.01"
                placeholder="e.g. 15.5"
                value={effectiveGrade}
                readOnly={isGradeReadOnly}
                disabled={isGradeReadOnly}
                onChange={isGradeReadOnly ? undefined : (e) => {
                  setGrade(e.target.value)
                  setGradeError(validateGrade(e.target.value))
                }}
                className={`text-sm${isGradeReadOnly ? ' bg-muted cursor-not-allowed border-dashed' : ''}`}
              />
              {gradeError && (
                <p className="text-xs text-destructive">{gradeError}</p>
              )}
            </div>

            {generateError && (
              <p className="text-xs text-destructive">{generateError}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating} data-faro-user-action-name="generate-certificate">
            {generating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin"/>
                Generating...
              </>
            ) : (
              'Generate Certificate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
