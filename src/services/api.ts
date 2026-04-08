const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  sendCampaign(data: { campaignId: string; orgId: string; templateId: string; employeeIds: string[] }) {
    return request<{ success: boolean; trackingUrls: string[] }>('/api/send-campaign', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getCampaignStats(campaignId: string) {
    return request<{ sent: number; opened: number; clicked: number; reported: number; trainingCompleted: number }>(
      `/api/campaign/${encodeURIComponent(campaignId)}/stats`
    )
  },

  trackClick(campaignId: string, resultId: string) {
    return request<{ redirect: string }>(`/api/campaign/${encodeURIComponent(campaignId)}/track-click`, {
      method: 'POST',
      body: JSON.stringify({ resultId }),
    })
  },

  getRiskSummary(orgId: string) {
    return request<{ avgClickRate: number; riskScore: 'high' | 'medium' | 'low'; employeeRiskBreakdown: Record<string, number> }>(
      `/api/org/${encodeURIComponent(orgId)}/risk-summary`
    )
  },
}
