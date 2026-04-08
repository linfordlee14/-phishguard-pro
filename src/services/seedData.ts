import { doc, setDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

const TEMPLATES = [
  { name: 'SARS Tax Refund', brand: 'SARS', difficulty: 'easy' as const, subject: 'Your SARS Tax Refund is Ready — Claim Now', category: 'Tax', previewHtml: '<div style="font-family:Arial;max-width:500px;margin:auto;background:#fff;padding:24px;border:1px solid #ddd"><div style="background:#006747;color:#fff;padding:12px 16px;font-size:18px;font-weight:bold">SARS eFiling</div><p style="color:#333;margin:16px 0">Dear Taxpayer,</p><p style="color:#333">Your tax refund of <strong>R12,450.00</strong> has been approved. Click below to verify your banking details and receive your refund within 48 hours.</p><a href="#" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#006747;color:#fff;text-decoration:none;border-radius:4px">Verify & Claim Refund</a><p style="color:#999;font-size:12px">South African Revenue Service | sars-refund-za.com</p></div>' },
  { name: 'FNB Fraud Alert', brand: 'FNB', difficulty: 'medium' as const, subject: 'Urgent: Suspicious Activity on Your FNB Account', category: 'Banking', previewHtml: '<div style="font-family:Arial;max-width:500px;margin:auto;background:#fff;padding:24px;border:1px solid #ddd"><div style="background:#009677;color:#fff;padding:12px 16px;font-size:18px;font-weight:bold">FNB Security Alert</div><p style="color:#333;margin:16px 0">Dear Customer,</p><p style="color:#333">We detected suspicious activity on your account ending in ****4521. A purchase of <strong>R8,999.00</strong> was attempted. If this wasn&apos;t you, verify your identity immediately.</p><a href="#" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#009677;color:#fff;text-decoration:none;border-radius:4px">Secure My Account</a><p style="color:#999;font-size:12px">First National Bank | fnb-secure-alerts.co.za</p></div>' },
  { name: 'Microsoft Login Expired', brand: 'Microsoft', difficulty: 'easy' as const, subject: 'Action Required: Your Microsoft 365 Password Has Expired', category: 'Tech', previewHtml: '<div style="font-family:Segoe UI,Arial;max-width:500px;margin:auto;background:#fff;padding:24px;border:1px solid #ddd"><div style="padding:12px 16px"><img alt="Microsoft" style="height:24px" /></div><p style="color:#333;margin:16px 0">Your Microsoft 365 password expired on 01 Apr 2026. You must update your password to continue accessing Outlook, Teams, and OneDrive.</p><a href="#" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0078d4;color:#fff;text-decoration:none;border-radius:4px">Update Password Now</a><p style="color:#999;font-size:12px">Microsoft Corporation | microsoft-login-update.com</p></div>' },
  { name: 'DHL Delivery Failed', brand: 'DHL', difficulty: 'medium' as const, subject: 'DHL: Your Package Delivery Failed — Reschedule Now', category: 'Delivery', previewHtml: '<div style="font-family:Arial;max-width:500px;margin:auto;background:#fff;padding:24px;border:1px solid #ddd"><div style="background:#FFCC00;padding:12px 16px;font-size:18px;font-weight:bold;color:#333">DHL Express</div><p style="color:#333;margin:16px 0">We attempted to deliver your package (Tracking: ZA8834921) but no one was available. A customs fee of <strong>R149.00</strong> is required.</p><a href="#" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#D40511;color:#fff;text-decoration:none;border-radius:4px">Pay & Reschedule</a><p style="color:#999;font-size:12px">DHL South Africa | dhl-delivery-za.com</p></div>' },
  { name: 'Vodacom Account Suspended', brand: 'Vodacom', difficulty: 'hard' as const, subject: 'Vodacom: Your Account Has Been Suspended', category: 'Telecom', previewHtml: '<div style="font-family:Arial;max-width:500px;margin:auto;background:#fff;padding:24px;border:1px solid #ddd"><div style="background:#E60000;color:#fff;padding:12px 16px;font-size:18px;font-weight:bold">Vodacom</div><p style="color:#333;margin:16px 0">Dear valued customer,</p><p style="color:#333">Your Vodacom account has been temporarily suspended due to an outstanding payment of <strong>R299.00</strong>. Restore your service immediately to avoid permanent deactivation.</p><a href="#" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#E60000;color:#fff;text-decoration:none;border-radius:4px">Restore My Account</a><p style="color:#999;font-size:12px">Vodacom (Pty) Ltd | vodacom-billing-za.net</p></div>' },
  { name: 'Standard Bank OTP Verification', brand: 'Standard Bank', difficulty: 'hard' as const, subject: 'Standard Bank: Verify Your OTP to Complete Transfer', category: 'Banking', previewHtml: '<div style="font-family:Arial;max-width:500px;margin:auto;background:#fff;padding:24px;border:1px solid #ddd"><div style="background:#003DA5;color:#fff;padding:12px 16px;font-size:18px;font-weight:bold">Standard Bank</div><p style="color:#333;margin:16px 0">A transfer of <strong>R25,000.00</strong> to account ****7832 is pending your approval. Enter the OTP sent to your registered number to complete or cancel this transaction.</p><a href="#" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#003DA5;color:#fff;text-decoration:none;border-radius:4px">Enter OTP</a><p style="color:#999;font-size:12px">The Standard Bank of South Africa | standardbank-verify-otp.co.za</p></div>' },
]

const SEED_EMPLOYEES = [
  { name: 'Thandi Dlamini', email: 'thandi@company.co.za', department: 'Finance', riskScore: 'high' as const, clickCount: 5, campaignsReceived: 3, trainingCompleted: 1 },
  { name: 'Sipho Nkosi', email: 'sipho@company.co.za', department: 'Operations', riskScore: 'medium' as const, clickCount: 2, campaignsReceived: 3, trainingCompleted: 2 },
  { name: 'Nadia van der Merwe', email: 'nadia@company.co.za', department: 'HR', riskScore: 'low' as const, clickCount: 0, campaignsReceived: 3, trainingCompleted: 3 },
  { name: 'Kagiso Sithole', email: 'kagiso@company.co.za', department: 'Sales', riskScore: 'high' as const, clickCount: 4, campaignsReceived: 3, trainingCompleted: 0 },
  { name: 'Priya Moodley', email: 'priya@company.co.za', department: 'Finance', riskScore: 'medium' as const, clickCount: 2, campaignsReceived: 3, trainingCompleted: 1 },
  { name: 'Andile Zulu', email: 'andile@company.co.za', department: 'IT', riskScore: 'low' as const, clickCount: 1, campaignsReceived: 3, trainingCompleted: 3 },
  { name: 'Chante Botha', email: 'chante@company.co.za', department: 'Marketing', riskScore: 'high' as const, clickCount: 4, campaignsReceived: 3, trainingCompleted: 0 },
  { name: 'Relebogile Mokoena', email: 'relebogile@company.co.za', department: 'Operations', riskScore: 'medium' as const, clickCount: 2, campaignsReceived: 3, trainingCompleted: 1 },
]

export async function seedTemplates() {
  for (const t of TEMPLATES) {
    const ref = doc(collection(db, 'templates'))
    await setDoc(ref, { ...t, id: ref.id })
  }
}

export async function seedInitialData(orgId: string) {
  // Seed templates
  const templateIds: string[] = []
  for (const t of TEMPLATES) {
    const ref = doc(collection(db, 'templates'))
    await setDoc(ref, { ...t, id: ref.id })
    templateIds.push(ref.id)
  }

  // Seed employees
  const employeeIds: string[] = []
  for (const emp of SEED_EMPLOYEES) {
    const ref = doc(collection(db, 'employees'))
    await setDoc(ref, {
      ...emp,
      id: ref.id,
      orgId,
      lastClickDate: emp.clickCount > 0 ? Timestamp.fromDate(new Date(2026, 2, 15)) : null,
      createdAt: Timestamp.fromDate(new Date(2026, 0, 1)),
    })
    employeeIds.push(ref.id)
  }

  // Seed 3 completed campaigns
  const campaignData = [
    { name: 'SARS Tax Refund — Jan 2026', templateId: templateIds[0], clickRate: 0.52, date: new Date(2026, 0, 15) },
    { name: 'FNB Fraud Alert — Feb 2026', templateId: templateIds[1], clickRate: 0.34, date: new Date(2026, 1, 15) },
    { name: 'Microsoft Login — Mar 2026', templateId: templateIds[2], clickRate: 0.21, date: new Date(2026, 2, 15) },
  ]

  for (const c of campaignData) {
    const sent = employeeIds.length
    const clicked = Math.round(sent * c.clickRate)
    const reported = Math.round(sent * 0.1)
    const trained = Math.max(0, clicked - 1)

    const ref = doc(collection(db, 'campaigns'))
    await setDoc(ref, {
      id: ref.id,
      orgId,
      name: c.name,
      templateId: c.templateId,
      status: 'completed',
      targetEmployeeIds: employeeIds,
      scheduledAt: Timestamp.fromDate(c.date),
      sentAt: Timestamp.fromDate(c.date),
      completedAt: Timestamp.fromDate(new Date(c.date.getTime() + 7 * 24 * 60 * 60 * 1000)),
      stats: { sent, opened: Math.round(sent * 0.8), clicked, reported, trainingCompleted: trained },
      createdAt: Timestamp.fromDate(c.date),
    })

    // Create campaign results
    for (let i = 0; i < employeeIds.length; i++) {
      const resultRef = doc(collection(db, 'campaignResults'))
      const wasClicked = i < clicked
      const wasReported = !wasClicked && i < clicked + reported
      await setDoc(resultRef, {
        id: resultRef.id,
        campaignId: ref.id,
        employeeId: employeeIds[i],
        orgId,
        outcome: wasClicked ? 'clicked' : wasReported ? 'reported' : 'ignored',
        trainingStatus: wasClicked && i < clicked - 1 ? 'completed' : wasClicked ? 'pending' : 'not_assigned',
        riskChange: wasClicked ? 'higher' : wasReported ? 'lower' : 'same',
        clickedAt: wasClicked ? Timestamp.fromDate(c.date) : null,
        trainingCompletedAt: wasClicked && i < clicked - 1 ? Timestamp.fromDate(new Date(c.date.getTime() + 2 * 24 * 60 * 60 * 1000)) : null,
      })
    }
  }
}
