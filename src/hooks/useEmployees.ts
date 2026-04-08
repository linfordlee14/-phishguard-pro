import { useCallback } from 'react'
import { where, Timestamp } from 'firebase/firestore'
import { useFirestore, useFirestoreQuery } from './useFirestore'
import { useAuth } from './useAuth'
import type { Employee } from '@/types'

export function useEmployees() {
  const { orgId } = useAuth()
  const store = useFirestore<Employee>('employees')
  const { data: employees, loading } = useFirestoreQuery<Employee>('employees', orgId)

  const getEmployees = useCallback(async () => {
    if (!orgId) return []
    return store.getAll([where('orgId', '==', orgId)])
  }, [orgId, store])

  const addEmployee = useCallback(async (data: Omit<Employee, 'id' | 'orgId' | 'riskScore' | 'clickCount' | 'lastClickDate' | 'campaignsReceived' | 'trainingCompleted' | 'createdAt'>) => {
    if (!orgId) throw new Error('No org')
    return store.add({
      ...data,
      orgId,
      riskScore: 'low',
      clickCount: 0,
      lastClickDate: null,
      campaignsReceived: 0,
      trainingCompleted: 0,
      createdAt: Timestamp.now(),
    } as Omit<Employee, 'id'>)
  }, [orgId, store])

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>) => {
    await store.update(id, data)
  }, [store])

  const deleteEmployee = useCallback(async (id: string) => {
    await store.remove(id)
  }, [store])

  const bulkAddEmployees = useCallback(async (emps: { name: string; email: string; department: string }[]) => {
    if (!orgId) throw new Error('No org')
    const promises = emps.map((emp) =>
      store.add({
        ...emp,
        orgId,
        riskScore: 'low' as const,
        clickCount: 0,
        lastClickDate: null,
        campaignsReceived: 0,
        trainingCompleted: 0,
        createdAt: Timestamp.now(),
      } as Omit<Employee, 'id'>)
    )
    return Promise.all(promises)
  }, [orgId, store])

  return { employees, loading, getEmployees, addEmployee, updateEmployee, deleteEmployee, bulkAddEmployees }
}
