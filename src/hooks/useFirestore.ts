import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/services/firebase'

export function useFirestore<T extends DocumentData & { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const getAll = useCallback(async (constraints: QueryConstraint[] = []) => {
    setLoading(true)
    const q = query(collection(db, collectionName), ...constraints)
    const snap = await getDocs(q)
    const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T))
    setData(items)
    setLoading(false)
    return items
  }, [collectionName])

  const getOne = useCallback(async (id: string) => {
    const snap = await getDoc(doc(db, collectionName, id))
    if (!snap.exists()) return null
    return { ...snap.data(), id: snap.id } as T
  }, [collectionName])

  const add = useCallback(async (item: Omit<T, 'id'>) => {
    const ref = await addDoc(collection(db, collectionName), item)
    return ref.id
  }, [collectionName])

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    await updateDoc(doc(db, collectionName, id), updates as DocumentData)
  }, [collectionName])

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, collectionName, id))
  }, [collectionName])

  const subscribe = useCallback((constraints: QueryConstraint[] = [], callback?: (items: T[]) => void) => {
    const q = query(collection(db, collectionName), ...constraints)
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T))
      setData(items)
      setLoading(false)
      callback?.(items)
    })
  }, [collectionName])

  return { data, loading, getAll, getOne, add, update, remove, subscribe }
}

export function useFirestoreQuery<T extends DocumentData & { id: string }>(
  collectionName: string,
  orgId: string | null,
  additionalConstraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orgId) return
    const constraints: QueryConstraint[] = [
      where('orgId', '==', orgId),
      ...additionalConstraints,
    ]
    const q = query(collection(db, collectionName), ...constraints)
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T))
      setData(items)
      setLoading(false)
    })
    return unsub
  }, [collectionName, orgId])

  return { data, loading }
}

export { where, orderBy, query } from 'firebase/firestore'
