import { useEffect, useState } from 'react'
import { Plus, Archive, ArchiveRestore, Users } from 'lucide-react'
import ConfirmButton from '../ui/ConfirmButton'
import { SECTION } from '../../lib/theme'

const ACCENT = SECTION.classes.accent
const TINT = SECTION.classes.tint

export default function ClassesTab({ data }) {
  const { classes, students, addClass, deleteClass, archiveClass, restoreClass, addStudent, deleteStudent } = data
  const activeClasses = classes.filter((c) => !c.archived)
  const archivedClasses = classes.filter((c) => c.archived)

  const [newClassName, setNewClassName] = useState('')
  const [manageClassId, setManageClassId] = useState('')
  const [newStudentName, setNewStudentName] = useState('')

  useEffect(() => {
    if (!activeClasses.find((c) => c.id === manageClassId)) {
      setManageClassId(activeClasses[0]?.id || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes])

  const manageClass = activeClasses.find((c) => c.id === manageClassId)
  const classStudents = students.filter((s) => s.classId === manageClassId)

  function handleAddClass(e) {
    e.preventDefault()
    const id = addClass(newClassName)
    if (id) setManageClassId(id)
    setNewClassName('')
  }

  function handleAddStudent(e) {
    e.preventDefault()
    if (!manageClassId) return
    addStudent(manageClassId, newStudentName)
    setNewStudentName('')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <section className="border border-slate-300 bg-white p-3">
        <h2 className="text-sm font-semibold mb-2" style={{ color: ACCENT }}>
          Классы
        </h2>
        <form onSubmit={handleAddClass} className="flex gap-2 mb-3">
          <input
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Название класса, напр. 9А"
            className="flex-1 border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-2 py-1 text-sm text-white cursor-pointer"
            style={{ background: ACCENT, borderRadius: 3 }}
          >
            <Plus size={14} /> Добавить
          </button>
        </form>

        {activeClasses.length === 0 ? (
          <p className="text-sm text-slate-500">Классов пока нет — добавьте первый класс выше.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {activeClasses.map((c) => {
                const count = students.filter((s) => s.classId === c.id).length
                return (
                  <tr key={c.id} style={{ background: manageClassId === c.id ? TINT : 'transparent' }}>
                    <td
                      className="py-1.5 px-2 border-b border-slate-200 font-medium cursor-pointer"
                      onClick={() => setManageClassId(c.id)}
                    >
                      {c.name}
                    </td>
                    <td
                      className="py-1.5 px-2 border-b border-slate-200 text-slate-500 cursor-pointer"
                      onClick={() => setManageClassId(c.id)}
                    >
                      {count} уч.
                    </td>
                    <td className="py-1.5 px-2 border-b border-slate-200 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => archiveClass(c.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs cursor-pointer"
                          style={{ border: '1px solid #cbd5e1', borderRadius: 3, color: '#475569' }}
                          title="Перенести в архив"
                        >
                          <Archive size={12} /> В архив
                        </button>
                        <ConfirmButton onConfirm={() => deleteClass(c.id)} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {archivedClasses.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Архив</h3>
            <table className="w-full text-sm">
              <tbody>
                {archivedClasses.map((c) => (
                  <tr key={c.id}>
                    <td className="py-1.5 px-2 border-b border-slate-200 text-slate-500">{c.name}</td>
                    <td className="py-1.5 px-2 border-b border-slate-200 text-right">
                      <button
                        type="button"
                        onClick={() => restoreClass(c.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs cursor-pointer ml-auto"
                        style={{ border: `1px solid ${ACCENT}`, borderRadius: 3, color: ACCENT }}
                      >
                        <ArchiveRestore size={12} /> Восстановить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border border-slate-300 bg-white p-3">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: ACCENT }}>
          <Users size={15} />
          Ученики{manageClass ? ` — ${manageClass.name}` : ''}
        </h2>

        {!manageClass ? (
          <p className="text-sm text-slate-500">Выберите или создайте класс слева, чтобы добавить учеников.</p>
        ) : (
          <>
            <form onSubmit={handleAddStudent} className="flex gap-2 mb-3">
              <input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Имя и фамилия ученика"
                className="flex-1 border border-slate-300 px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-2 py-1 text-sm text-white cursor-pointer"
                style={{ background: ACCENT, borderRadius: 3 }}
              >
                <Plus size={14} /> Добавить
              </button>
            </form>

            {classStudents.length === 0 ? (
              <p className="text-sm text-slate-500">В этом классе пока нет учеников.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {classStudents.map((s, i) => (
                    <tr key={s.id}>
                      <td className="py-1.5 px-2 border-b border-slate-200 text-slate-400 w-6">{i + 1}</td>
                      <td className="py-1.5 px-2 border-b border-slate-200">{s.name}</td>
                      <td className="py-1.5 px-2 border-b border-slate-200 text-right">
                        <ConfirmButton onConfirm={() => deleteStudent(s.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>
    </div>
  )
}
