import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useFirestore } from '@/hooks/useFirestore'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Organization } from '@/types'

export default function Settings() {
  const { user, orgId, logout } = useAuth()
  const orgStore = useFirestore<Organization>('organizations')

  const [orgName, setOrgName] = useState('')
  const [notifyOnClick, setNotifyOnClick] = useState(true)
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!orgId) return
    orgStore.getOne(orgId).then((org) => {
      if (org) setOrgName(org.name)
    })
  }, [orgId])

  const handleSave = async () => {
    if (!orgId) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'organizations', orgId), { name: orgName })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Navbar title="Settings" />

      <div className="mt-6 space-y-6 max-w-2xl">
        {/* Organization settings */}
        <Card>
          <h3 className="font-semibold text-text-1 mb-4">Organization</h3>
          <div className="space-y-4">
            <Input label="Company Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            <Input label="Admin Email" value={user?.email || ''} disabled />
            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h3 className="font-semibold text-text-1 mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-text-1 text-sm">Click alerts</p>
                <p className="text-text-2 text-xs">Get notified when an employee clicks a phishing link</p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnClick}
                onChange={(e) => setNotifyOnClick(e.target.checked)}
                className="accent-cyan h-5 w-5"
              />
            </label>
            <div className="border-t border-border" />
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-text-1 text-sm">Weekly report</p>
                <p className="text-text-2 text-xs">Receive a weekly summary of campaign performance</p>
              </div>
              <input
                type="checkbox"
                checked={notifyWeeklyReport}
                onChange={(e) => setNotifyWeeklyReport(e.target.checked)}
                className="accent-cyan h-5 w-5"
              />
            </label>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-red/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red" />
            <h3 className="font-semibold text-red">Danger Zone</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-1 text-sm">Sign out</p>
                <p className="text-text-2 text-xs">Sign out of your account on this device</p>
              </div>
              <Button variant="secondary" size="sm" onClick={logout}>Sign Out</Button>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-1 text-sm">Delete organization</p>
                <p className="text-text-2 text-xs">Permanently delete all data. This cannot be undone.</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => toast.error('Contact support to delete your organization')}>
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
