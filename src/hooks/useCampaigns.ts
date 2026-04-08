import { useCallback } from 'react'
import { where, Timestamp } from 'firebase/firestore'
import { useFirestore, useFirestoreQuery } from './useFirestore'
import { useAuth } from './useAuth'
import type { Campaign } from '@/types'

export function useCampaigns() {
  const { orgId } = useAuth()
  const store = useFirestore<Campaign>('campaigns')
  const { data: campaigns, loading } = useFirestoreQuery<Campaign>('campaigns', orgId)

  const getCampaigns = useCallback(async (statusFilter?: string) => {
    if (!orgId) return []
    const constraints = [where('orgId', '==', orgId)]
    if (statusFilter && statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter))
    }
    return store.getAll(constraints)
  }, [orgId, store])

  const getCampaign = useCallback(async (id: string) => {
    return store.getOne(id)
  }, [store])

  const createCampaign = useCallback(async (data: Omit<Campaign, 'id'>) => {
    return store.add(data)
  }, [store])

  const updateCampaignStatus = useCallback(async (id: string, status: Campaign['status']) => {
    const updates: Partial<Campaign> = { status }
    if (status === 'sent') updates.sentAt = Timestamp.now()
    if (status === 'completed') updates.completedAt = Timestamp.now()
    await store.update(id, updates)
  }, [store])

  return { campaigns, loading, getCampaigns, getCampaign, createCampaign, updateCampaignStatus }
}
