import React, { useEffect, useRef } from 'react'

const DateInput = ({ value, onChange }) => {
  const [date, setDate] = React.useState(() => {
    const d = value ? new Date(value) : new Date()
    return {
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear()
    }
  })

  const monthRef = useRef(null)
  const dayRef = useRef(null)
  const yearRef = useRef(null)

  useEffect(() => {
    const d = value ? new Date(value) : new Date()
    setDate({
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear()
    })
  }, [value])

  const validateDate = (field, value) => {
    if (
      (field === 'day' && (value < 1 || value > 31)) ||
      (field === 'month' && (value < 1 || value > 12)) ||
      (field === 'year' && (value < 1000 || value > 9999))
    ) {
      return false
    }

    const newDate = { ...date, [field]: value }
    const d = new Date(newDate.year, newDate.month - 1, newDate.day)
    return d.getFullYear() === newDate.year && d.getMonth() + 1 === newDate.month && d.getDate() === newDate.day
  }

  const handleInputChange = (field) => (e) => {
    const newValue = e.target.value ? Number(e.target.value) : ''
    const isValid = typeof newValue === 'number' && validateDate(field, newValue)

    const newDate = { ...date, [field]: newValue }
    setDate(newDate)

    if (isValid) {
      onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
    }
  }

  const initialDate = useRef(date)

  const handleBlur = (field) => (e) => {
    if (!e.target.value) {
      setDate(initialDate.current)
      return
    }

    const newValue = Number(e.target.value)
    const isValid = validateDate(field, newValue)

    if (!isValid) {
      setDate(initialDate.current)
    } else {
      initialDate.current = { ...date, [field]: newValue }
    }
  }

  const handleKeyDown = (field) => (e) => {
    if (e.metaKey || e.ctrlKey) {
      return
    }

    if (
      !/^[0-9]$/.test(e.key) &&
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Backspace', 'Enter'].includes(e.key)
    ) {
      e.preventDefault()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      let newDate = { ...date }
      if (field === 'day') {
        if (date[field] === new Date(date.year, date.month, 0).getDate()) {
          newDate = {
            ...newDate,
            day: 1,
            month: (date.month % 12) + 1
          }
          if (newDate.month === 1) newDate.year += 1
        } else {
          newDate.day += 1
        }
      }
      if (field === 'month') {
        if (date[field] === 12) {
          newDate = {
            ...newDate,
            month: 1,
            year: date.year + 1
          }
        } else {
          newDate.month += 1
        }
      }
      if (field === 'year') {
        newDate.year += 1
      }
      setDate(newDate)
      onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      let newDate = { ...date }
      if (field === 'day') {
        if (date[field] === 1) {
          newDate.month -= 1
          if (newDate.month === 0) {
            newDate.month = 12
            newDate.year -= 1
          }
          newDate.day = new Date(newDate.year, newDate.month, 0).getDate()
        } else {
          newDate.day -= 1
        }
      }
      if (field === 'month') {
        if (date[field] === 1) {
          newDate = {
            ...newDate,
            month: 12,
            year: date.year - 1
          }
        } else {
          newDate.month -= 1
        }
      }
      if (field === 'year') {
        newDate.year -= 1
      }
      setDate(newDate)
      onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
    }

    if (e.key === 'ArrowRight') {
      if (
        e.currentTarget.selectionStart === e.currentTarget.value.length ||
        (e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === e.currentTarget.value.length)
      ) {
        e.preventDefault()
        if (field === 'month') dayRef.current?.focus()
        if (field === 'day') yearRef.current?.focus()
      }
    } else if (e.key === 'ArrowLeft') {
      if (
        e.currentTarget.selectionStart === 0 ||
        (e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === e.currentTarget.value.length)
      ) {
        e.preventDefault()
        if (field === 'day') monthRef.current?.focus()
        if (field === 'year') dayRef.current?.focus()
      }
    }
  }

  return (
    <div className="flex items-center border rounded-md px-3 py-1.5 text-sm">
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        value={date.day || ''}
        onChange={handleInputChange('day')}
        onKeyDown={handleKeyDown('day')}
        onFocus={(e) => {
          if (window.innerWidth > 1024) {
            e.target.select()
          }
        }}
        onBlur={handleBlur('day')}
        className="p-0 outline-none w-7 border-none text-center"
      />
      /
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={date.month || ''}
        onChange={handleInputChange('month')}
        onKeyDown={handleKeyDown('month')}
        onFocus={(e) => {
          if (window.innerWidth > 1024) {
            e.target.select()
          }
        }}
        onBlur={handleBlur('month')}
        className="p-0 outline-none w-6 border-none text-center"
      />
      /
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="YYYY"
        value={date.year || ''}
        onChange={handleInputChange('year')}
        onKeyDown={handleKeyDown('year')}
        onFocus={(e) => {
          if (window.innerWidth > 1024) {
            e.target.select()
          }
        }}
        onBlur={handleBlur('year')}
        className="p-0 outline-none w-12 border-none text-center"
      />
    </div>
  )
}

DateInput.displayName = 'DateInput'

export { DateInput }
