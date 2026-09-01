import { useEffect, useState } from 'react'
import { loadClasses, saveClasses, loadStudents, saveStudents } from '../lib/storage'
import { makeId } from '../lib/id'

export function useAppData() {
  const [classes, setClasses] = useState(() => loadClasses())
  const [students, setStudents] = useState(() => loadStudents())

  useEffect(() => {
    saveClasses(classes)
  }, [classes])

  useEffect(() => {
    saveStudents(students)
  }, [students])

  function addClass(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    const cls = { id: makeId(), name: trimmed, archived: false }
    setClasses((prev) => [...prev, cls])
    return cls.id
  }

  function deleteClass(classId) {
    setClasses((prev) => prev.filter((c) => c.id !== classId))
    setStudents((prev) => prev.filter((s) => s.classId !== classId))
  }

  function archiveClass(classId) {
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, archived: true } : c)))
  }

  function restoreClass(classId) {
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, archived: false } : c)))
  }

  function addStudent(classId, name) {
    const trimmed = name.trim()
    if (!trimmed) return
    const student = { id: makeId(), classId, name: trimmed }
    setStudents((prev) => [...prev, student])
    return student.id
  }

  function deleteStudent(studentId) {
    setStudents((prev) => prev.filter((s) => s.id !== studentId))
  }

  return {
    classes,
    students,
    addClass,
    deleteClass,
    archiveClass,
    restoreClass,
    addStudent,
    deleteStudent,
  }
}
