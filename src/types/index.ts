import { Timestamp } from 'firebase/firestore'

export interface Organization {
  id: string
  name: string
  adminRole?: 'IT Manager' | 'Business Owner' | 'Compliance Officer' | 'Other'
  onboardingCompleted?: boolean
  plan: 'starter' | 'pro' | 'business'
  seatsLimit?: number
  seats: number
  billingStatus?: 'active' | 'trialing' | 'inactive'
  ownerId: string
  createdAt: Timestamp
  onboardingStartedAt?: Timestamp
  onboardingCompletedAt?: Timestamp
  planActivatedAt?: Timestamp
}

export interface Employee {
  id: string
  orgId: string
  name: string
  email: string
  department: string
  riskScore: 'high' | 'medium' | 'low'
  clickCount: number
  lastClickDate: Timestamp | null
  campaignsReceived: number
  trainingCompleted: number
  createdAt: Timestamp
}

export interface Campaign {
  id: string
  orgId: string
  name: string
  templateId: string
  status: 'draft' | 'scheduled' | 'sent' | 'completed'
  targetEmployeeIds: string[]
  scheduledAt: Timestamp
  sentAt: Timestamp | null
  completedAt: Timestamp | null
  stats: CampaignStats
  createdAt: Timestamp
}

export interface CampaignStats {
  sent: number
  opened: number
  clicked: number
  reported: number
  trainingCompleted: number
}

export interface CampaignResult {
  id: string
  campaignId: string
  employeeId: string
  orgId: string
  outcome: 'clicked' | 'reported' | 'ignored'
  trainingStatus: 'completed' | 'pending' | 'not_assigned'
  riskChange: 'higher' | 'lower' | 'same'
  clickedAt: Timestamp | null
  trainingCompletedAt: Timestamp | null
}

export interface Template {
  id: string
  name: string
  brand: string
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  previewHtml: string
  category: string
  orgId?: string
  isCustom?: boolean
  htmlContent?: string
  redFlags?: string[]
  createdAt?: Timestamp
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  search: string
  department: string
  riskLevel: string
  status: string
  dateRange: string
}
