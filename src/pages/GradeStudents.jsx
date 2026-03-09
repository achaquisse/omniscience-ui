import {useEffect, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {fetchGradeDetail, fetchGrades, fetchStudentClass, patchGrade, postGrade} from '@/lib/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Award, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, Pencil, X} from 'lucide-react'

function EvalRowHeader() {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="w-4 shrink-0"/>
      <span className="flex-1 text-xs text-muted-foreground">Marks (0–20)</span>
      <span className="flex-1 text-xs text-muted-foreground">Date</span>
      <span className="w-[60px] shrink-0"/>
    </div>
  )
}

function EvalActions({hasValue, hasDate, isEditing, onEdit, onCancel, onSave}) {
  const canSave = hasValue && hasDate
  return (
    <div className="w-[60px] shrink-0 flex items-center justify-end gap-0.5">
      {hasValue && !isEditing && (
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
          <Pencil className="size-3"/>
          <span className="sr-only">Edit</span>
        </Button>
      )}
      {isEditing && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onCancel}
          >
            <X className="size-3"/>
            <span className="sr-only">Cancel</span>
          </Button>
          {canSave && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={onSave}
            >
              <Check className="size-3"/>
              <span className="sr-only">Save</span>
            </Button>
          )}
        </>
      )}
    </div>
  )
}

function EvalSection({title, evaluations, catIndex, editingEvals, onStart, onCancel, onSave, onUpdateField}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
        {title}
      </p>
      <EvalRowHeader/>
      <div className="space-y-1.5">
        {evaluations.map((ev, evIndex) => {
          const key = `${catIndex}-${evIndex}`
          const hasValue = ev.marks != null
          const isEditing = editingEvals.has(key)
          const disabled = hasValue && !isEditing
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                {evIndex + 1}.
              </span>
              <Input
                type="number"
                min="0"
                max="20"
                step="0.1"
                placeholder="—"
                value={ev.marks ?? ''}
                disabled={disabled}
                onChange={(e) => onUpdateField(evIndex, 'marks', e.target.value === '' ? null : parseFloat(e.target.value))}
                className="flex-1 text-sm h-8 disabled:opacity-60"
              />
              <Input
                type="date"
                value={ev.date ?? ''}
                disabled={disabled}
                onChange={(e) => onUpdateField(evIndex, 'date', e.target.value || null)}
                className="flex-1 text-sm h-8 disabled:opacity-60"
              />
              <EvalActions
                hasValue={hasValue}
                hasDate={!!ev.date}
                isEditing={isEditing}
                onEdit={() => onStart(key, {marks: ev.marks, date: ev.date})}
                onCancel={() => onCancel(key, (snap) => {
                  onUpdateField(evIndex, 'marks', snap.marks)
                  onUpdateField(evIndex, 'date', snap.date)
                })}
                onSave={() => onSave(key)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function GradeStudents() {
  const {classId} = useParams()
  const {accessToken} = useAuth()

  const [studentClass, setStudentClass] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [filteredRegistrations, setFilteredRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const [selectedReg, setSelectedReg] = useState(null)
  const [dialogDetailData, setDialogDetailData] = useState(null)
  const [dialogDetailLoading, setDialogDetailLoading] = useState(false)
  const [editingEvals, setEditingEvals] = useState(new Set())
  const [evalSnapshots, setEvalSnapshots] = useState({})
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [classData, gradesData] = await Promise.all([
          fetchStudentClass(accessToken, classId),
          fetchGrades(accessToken, classId)
        ])
        setStudentClass(classData)
        setRegistrations(gradesData)
        setFilteredRegistrations(gradesData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && classId) {
      loadData()
    }
  }, [accessToken, classId])

  useEffect(() => {
    let filtered = registrations

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(reg =>
        reg.Student?.FirstName?.toLowerCase().includes(query) ||
        reg.Student?.LastName?.toLowerCase().includes(query) ||
        reg.Status?.toLowerCase().includes(query)
      )
    }

    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal

      if (sortField === 'name') {
        aVal = `${a.Student?.FirstName || ''} ${a.Student?.LastName || ''}`.toLowerCase()
        bVal = `${b.Student?.FirstName || ''} ${b.Student?.LastName || ''}`.toLowerCase()
      } else if (sortField === 'status') {
        aVal = a.Status?.toLowerCase() || ''
        bVal = b.Status?.toLowerCase() || ''
      } else {
        aVal = a.ID
        bVal = b.ID
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredRegistrations(filtered)
    setCurrentPage(1)
  }, [searchQuery, sortField, sortOrder, registrations])

  const subjectNames = useMemo(() => {
    const names = []
    const seen = new Set()
    registrations.forEach(reg => {
      reg.Grades?.Subjects?.forEach(s => {
        if (!seen.has(s.Name)) {
          seen.add(s.Name)
          names.push(s.Name)
        }
      })
    })
    return names
  }, [registrations])

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex)

  const handlePreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1))
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1))

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = date.toLocaleDateString('en-US', {month: 'short'})
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getApprovalStatus = (finalGrade, examGrade) => {
    if (finalGrade == null) return null
    if (examGrade == null || examGrade === 0) return null
    return finalGrade >= 10 ? 'Approved' : 'Failed'
  }

  const initEditingState = (data) => {
    const newEditing = new Set()
    const newSnapshots = {}
    data.categories?.forEach((cat, catIndex) => {
      cat.evaluations?.forEach((ev, evIndex) => {
        if (ev.marks == null) {
          const key = `${catIndex}-${evIndex}`
          newEditing.add(key)
          newSnapshots[key] = {marks: null, date: null}
        }
      })
    })
    if (data.exam?.marks == null) {
      newEditing.add('exam')
      newSnapshots['exam'] = {marks: null, date: null}
    }
    setEditingEvals(newEditing)
    setEvalSnapshots(newSnapshots)
  }

  const refreshDialogData = async (registrationId) => {
    const data = await fetchGradeDetail(accessToken, registrationId)
    setDialogDetailData(data)
    initEditingState(data)
    return data
  }

  const openDialog = async (reg) => {
    setSelectedReg(reg)
    setDialogDetailData(null)
    setDialogDetailLoading(true)
    setSaveError(null)
    setEditingEvals(new Set())
    setEvalSnapshots({})
    try {
      await refreshDialogData(reg.ID)
    } finally {
      setDialogDetailLoading(false)
    }
  }

  const refreshRegistrations = async () => {
    const gradesData = await fetchGrades(accessToken, classId)
    setRegistrations(gradesData)
  }

  const closeDialog = async () => {
    setSelectedReg(null)
    setDialogDetailData(null)
    setDialogDetailLoading(false)
    setEditingEvals(new Set())
    setEvalSnapshots({})
    setSaveError(null)
    await refreshRegistrations()
  }

  const startEditEval = (key, snapshot) => {
    setEvalSnapshots(prev => ({...prev, [key]: snapshot}))
    setEditingEvals(prev => {
      const s = new Set(prev);
      s.add(key);
      return s
    })
  }

  const cancelEditEval = (key, onRestore) => {
    const snap = evalSnapshots[key]
    onRestore(snap)
    if (snap?.marks != null) {
      setEditingEvals(prev => {
        const s = new Set(prev);
        s.delete(key);
        return s
      })
      setEvalSnapshots(prev => {
        const {[key]: _, ...rest} = prev;
        return rest
      })
    }
  }

  const saveEditEval = async (key) => {
    const snapshot = evalSnapshots[key]
    const registrationId = selectedReg.ID
    const isNew = snapshot?.marks == null

    let currentEv
    let categoryId
    if (key === 'exam') {
      currentEv = dialogDetailData.exam
      categoryId = currentEv.id
    } else {
      const [ci, ei] = key.split('-').map(Number)
      const cat = dialogDetailData.categories[ci]
      categoryId = cat.id
      currentEv = cat.evaluations[ei]
    }
    if (currentEv.marks == null || !currentEv.date) return

    setSaveError(null)
    try {
      if (isNew) {
        await postGrade(accessToken, registrationId, {
          evaluation_category_id: categoryId,
          marks: currentEv.marks,
          date: currentEv.date,
        })
      } else {
        const gradeId = key === 'exam' ? currentEv.gradeId : currentEv.id
        await patchGrade(accessToken, registrationId, gradeId, {
          marks: currentEv.marks,
          date: currentEv.date,
        })
      }
      await refreshDialogData(registrationId)
    } catch (err) {
      setSaveError(err.message)
    }
  }

  const updateEvalField = (catIndex, evalIndex, field, value) => {
    setDialogDetailData(prev => {
      const categories = prev.categories.map((cat, ci) => {
        if (ci !== catIndex) return cat
        const evaluations = cat.evaluations.map((ev, ei) =>
          ei === evalIndex ? {...ev, [field]: value} : ev
        )
        return {...cat, evaluations}
      })
      return {...prev, categories}
    })
  }

  const updateExamField = (field, value) => {
    setDialogDetailData(prev => ({...prev, exam: {...prev.exam, [field]: value}}))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {studentClass?.Name || 'Loading...'}
          </h1>
          {studentClass && (
            <p className="text-sm text-muted-foreground mt-1">
              {studentClass.Course?.Name} • {formatDate(studentClass.Period?.Start)} - {formatDate(studentClass.Period?.End)}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Search and sort students</CardDescription>
            </div>
            <Button variant="ghost" size="icon-sm" className="flex-shrink-0">
              {filtersExpanded ? <ChevronUp className="size-4"/> : <ChevronDown className="size-4"/>}
            </Button>
          </div>
        </CardHeader>
        {filtersExpanded && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search by name or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Sort By</label>
                <select
                  value={sortField}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground pt-2">
              Showing {paginatedRegistrations.length} of {filteredRegistrations.length} students
            </div>
          </CardContent>
        )}
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="size-8 animate-spin text-primary"/>
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      ) : paginatedRegistrations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No students found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">#</th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Student
                    Name
                  </th>
                  {subjectNames.map(name => (
                    <th key={name}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {name}
                    </th>
                  ))}
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Exam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Final
                    Grade
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Approval
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap sticky right-0 bg-background shadow-[-1px_0_0_0_hsl(var(--border))]">Action
                  </th>
                </tr>
                </thead>
                <tbody>
                {paginatedRegistrations.map((reg, index) => {
                  const grades = reg.Grades
                  const approvalStatus = getApprovalStatus(grades?.FinalGrade, grades?.ExamGrade)
                  const isCanceled = reg.Status?.toUpperCase() === 'CANCELED' || reg.Status?.toUpperCase() === 'CANCELLED'
                  return (
                    <tr key={reg.ID}
                        className={`border-b last:border-0 ${isCanceled ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'hover:bg-muted/50'}`}>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                        {reg.Student?.FirstName} {reg.Student?.LastName}
                      </td>
                      {subjectNames.map(name => {
                        const subject = grades?.Subjects?.find(s => s.Name === name)
                        return (
                          <td key={name} className="px-4 py-3 text-xs whitespace-nowrap">
                            {subject?.Marks != null
                              ? (
                                <span>
                                  {subject.Marks}
                                  {subject.EvaluationsTotal > 1 && (
                                    <span className="text-muted-foreground ml-1">
                                      ({subject.EvaluationsDone}/{subject.EvaluationsTotal})
                                    </span>
                                  )}
                                </span>
                              )
                              : <span className="text-muted-foreground">—</span>
                            }
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {grades?.FrequencyGrade != null
                          ? grades.FrequencyGrade
                          : <span className="text-muted-foreground">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {grades?.ExamGrade != null
                          ? grades.ExamGrade
                          : <span className="text-muted-foreground">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                        {grades?.FinalGrade != null
                          ? grades.FinalGrade
                          : <span className="text-muted-foreground font-normal">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {approvalStatus ? (
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                            approvalStatus === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {approvalStatus}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 sticky right-0 shadow-[-1px_0_0_0_hsl(var(--border))] ${isCanceled ? 'bg-red-50' : 'bg-background'}`}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openDialog(reg)}
                          >
                            <Pencil className="size-3.5"/>
                            <span className="sr-only">Update grades</span>
                          </Button>
                          {approvalStatus === 'Approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-green-700 hover:text-green-800 hover:bg-green-50"
                              onClick={() => {
                              }}
                            >
                              <Award className="size-3.5"/>
                              <span className="sr-only">Generate certificate</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <ChevronLeft className="size-3 sm:size-4 sm:mr-1"/>
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="size-3 sm:size-4 sm:ml-1"/>
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedReg} onOpenChange={(open) => {
        if (!open) closeDialog()
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Update Grades
              {selectedReg && (
                <span className="font-normal text-muted-foreground ml-2 text-sm">
                  — {selectedReg.Student?.FirstName} {selectedReg.Student?.LastName}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {saveError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-xs text-destructive">{saveError}</p>
            </div>
          )}

          {dialogDetailLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="size-6 animate-spin text-primary"/>
            </div>
          ) : dialogDetailData && (
            <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
              {dialogDetailData.categories.map((cat, catIndex) => (
                <EvalSection
                  key={cat.name}
                  title={cat.name}
                  evaluations={cat.evaluations}
                  catIndex={catIndex}
                  editingEvals={editingEvals}
                  onStart={(key, snap) => startEditEval(key, snap)}
                  onCancel={(key, restore) => cancelEditEval(key, restore)}
                  onSave={(key) => saveEditEval(key)}
                  onUpdateField={(evIndex, field, val) => updateEvalField(catIndex, evIndex, field, val)}
                />
              ))}

              {dialogDetailData.exam && (() => {
                const ev = dialogDetailData.exam
                const key = 'exam'
                const hasValue = ev.marks != null
                const isEditing = editingEvals.has(key)
                const disabled = hasValue && !isEditing
                return (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
                      Exam
                    </p>
                    <EvalRowHeader/>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4 text-right shrink-0">1.</span>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        placeholder="—"
                        value={ev.marks ?? ''}
                        disabled={disabled}
                        onChange={(e) => updateExamField('marks', e.target.value === '' ? null : parseFloat(e.target.value))}
                        className="flex-1 text-sm h-8 disabled:opacity-60"
                      />
                      <Input
                        type="date"
                        value={ev.date ?? ''}
                        disabled={disabled}
                        onChange={(e) => updateExamField('date', e.target.value || null)}
                        className="flex-1 text-sm h-8 disabled:opacity-60"
                      />
                      <EvalActions
                        hasValue={hasValue}
                        hasDate={!!ev.date}
                        isEditing={isEditing}
                        onEdit={() => startEditEval(key, {marks: ev.marks, date: ev.date})}
                        onCancel={() => cancelEditEval(key, (snap) => {
                          updateExamField('marks', snap.marks)
                          updateExamField('date', snap.date)
                        })}
                        onSave={() => saveEditEval(key)}
                      />
                    </div>
                  </div>
                )
              })()}

              <div className="space-y-2 rounded-md bg-muted/40 border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Computed Grades
                </p>
                <p className="text-xs text-muted-foreground">These values are calculated and cannot be edited.</p>
                <div className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-2 items-center pt-1">
                  <label className="text-sm font-medium">Frequency</label>
                  <Input
                    type="number"
                    value={dialogDetailData.frequencyGrade ?? ''}
                    readOnly
                    className="text-sm h-8 bg-muted cursor-not-allowed border-dashed"
                  />
                  <label className="text-sm font-medium">Final Grade</label>
                  <Input
                    type="number"
                    value={dialogDetailData.finalGrade ?? ''}
                    readOnly
                    className="text-sm h-8 bg-muted cursor-not-allowed border-dashed font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
