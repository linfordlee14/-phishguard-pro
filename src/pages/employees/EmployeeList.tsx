import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmployees } from '@/hooks/useEmployees'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { parseCSV } from '@/utils/csvParser'
import { format } from 'date-fns'
import { Plus, Upload, Pencil, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Employee } from '@/types'

export default function EmployeeList() {
  const navigate = useNavigate()
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee, bulkAddEmployees } = useEmployees()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  // Add/Edit modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formDept, setFormDept] = useState('')
  const [saving, setSaving] = useState(false)

  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((e: Employee) => e.department))]
    return ['all', ...depts]
  }, [employees])

  const filtered = useMemo(() => {
    return employees.filter((e: Employee) => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
      const matchDept = deptFilter === 'all' || e.department === deptFilter
      const matchRisk = riskFilter === 'all' || e.riskScore === riskFilter
      return matchSearch && matchDept && matchRisk
    })
  }, [employees, search, deptFilter, riskFilter])

  const openAdd = () => {
    setEditingId(null)
    setFormName('')
    setFormEmail('')
    setFormDept('')
    setModalOpen(true)
  }

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id)
    setFormName(emp.name)
    setFormEmail(emp.email)
    setFormDept(emp.department)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateEmployee(editingId, { name: formName, email: formEmail, department: formDept || 'General' })
        toast.success('Employee updated')
      } else {
        await addEmployee({ name: formName, email: formEmail, department: formDept || 'General' })
        toast.success('Employee added')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id)
      toast.success('Employee removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = await parseCSV(file)
      await bulkAddEmployees(parsed)
      toast.success(`Imported ${parsed.length} employees`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    }
    e.target.value = ''
  }

  return (
    <>
      <Navbar title="Employees">
        <label className="cursor-pointer">
          <input type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-[var(--radius-btn)] text-text-2 hover:text-text-1 transition-colors">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </span>
        </label>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </Navbar>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            options={departments.map((d) => ({ value: d, label: d === 'all' ? 'All Departments' : d }))}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-44"
          />
          <Select
            options={[
              { value: 'all', label: 'All Risk Levels' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-text-2 font-medium">Name</th>
                  <th className="p-3 text-left text-text-2 font-medium">Email</th>
                  <th className="p-3 text-left text-text-2 font-medium">Department</th>
                  <th className="p-3 text-left text-text-2 font-medium">Risk</th>
                  <th className="p-3 text-left text-text-2 font-medium">Campaigns</th>
                  <th className="p-3 text-left text-text-2 font-medium">Last Click</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="p-3"><div className="h-4 bg-surface rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-2">
                      <Users className="h-10 w-10 mx-auto opacity-30 mb-2" />
                      No employees found. Add your team members to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp: Employee) => (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-surface/50">
                      <td className="p-3">
                        <button className="text-text-1 hover:text-cyan transition-colors text-left" onClick={() => navigate(`/employees/${emp.id}`)}>{emp.name}</button>
                      </td>
                      <td className="p-3 text-text-2">{emp.email}</td>
                      <td className="p-3 text-text-2">{emp.department}</td>
                      <td className="p-3">
                        <Badge variant={emp.riskScore === 'high' ? 'danger' : emp.riskScore === 'medium' ? 'warning' : 'success'}>{emp.riskScore}</Badge>
                      </td>
                      <td className="p-3 font-mono-data text-text-1">{emp.campaignsReceived}</td>
                      <td className="p-3 text-text-2">{emp.lastClickDate ? format(emp.lastClickDate.toDate(), 'dd MMM yyyy') : '—'}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(emp)} className="p-1.5 text-text-2 hover:text-cyan transition-colors"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-text-2 hover:text-red transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Employee' : 'Add Employee'}>
        <div className="space-y-4">
          <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Thandi Dlamini" required />
          <Input label="Email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="thandi@company.co.za" required />
          <Input label="Department" value={formDept} onChange={(e) => setFormDept(e.target.value)} placeholder="e.g. Finance" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
