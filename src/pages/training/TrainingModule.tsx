import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Shield, AlertTriangle, CheckCircle, Mail, Link as LinkIcon, User } from 'lucide-react'
import type { CampaignResult } from '@/types'

export default function TrainingModule() {
  const { resultId } = useParams<{ resultId: string }>()
  const [, setResult] = useState<CampaignResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (!resultId) return
    getDoc(doc(db, 'campaignResults', resultId)).then((snap) => {
      if (snap.exists()) {
        const data = { ...snap.data(), id: snap.id } as CampaignResult
        setResult(data)
        if (data.trainingStatus === 'completed') setCompleted(true)
      }
      setLoading(false)
    })
  }, [resultId])

  const handleComplete = async () => {
    if (!resultId) return
    setCompleting(true)
    try {
      await updateDoc(doc(db, 'campaignResults', resultId), {
        trainingStatus: 'completed',
        trainingCompletedAt: Timestamp.now(),
      })
      setCompleted(true)
    } catch {
      // Ignore errors for now
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-96"><Skeleton variant="card" /></div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Training Complete!</h1>
          <p className="text-gray-600 mb-4">
            Great job! You've completed the security awareness training. Stay vigilant and remember to report suspicious emails.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Powered by PhishGuard Pro</span>
          </div>
        </div>
      </div>
    )
  }

  const cards = [
    {
      title: 'What gave it away?',
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm relative">
            <div className="space-y-2 text-gray-700">
              <div className="flex gap-2"><span className="font-medium text-gray-500">From:</span> refunds@sars-gov-za.com</div>
              <div className="flex gap-2"><span className="font-medium text-gray-500">Subject:</span> Your Tax Refund is Ready</div>
              <div className="mt-3 text-gray-600">Dear Taxpayer, your refund of R12,450.00 has been approved. Click below to verify...</div>
              <div className="mt-2 bg-green-700 text-white px-4 py-2 rounded text-center text-sm">Verify & Claim Refund</div>
            </div>
            {/* Annotations */}
            <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded flex items-center gap-1">
              <User className="h-3 w-3" /> Fake sender domain
            </div>
            <div className="absolute bottom-16 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Urgent language
            </div>
            <div className="absolute bottom-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded flex items-center gap-1">
              <LinkIcon className="h-3 w-3" /> Suspicious URL
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2"><span className="text-red-500 font-bold">1.</span> The domain "sars-gov-za.com" is not the real SARS website (sars.gov.za)</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">2.</span> Creates urgency with "verify within 48 hours"</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">3.</span> Links to a non-official URL</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'What should you do?',
      content: (
        <div className="space-y-4">
          <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Verify the sender</h4>
              <p className="text-sm text-gray-600">Check the email domain carefully. Legitimate organizations use their official domain.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <LinkIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Never click unexpected links</h4>
              <p className="text-sm text-gray-600">Hover over links before clicking. Go directly to the official website instead.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 bg-green-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Report suspicious emails to IT</h4>
              <p className="text-sm text-gray-600">Use your company's reporting options. This helps protect your colleagues too.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Quick Quiz',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-medium">Which of these emails is a phishing attempt?</p>
          <div className="space-y-3">
            <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${quizAnswer === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="quiz" checked={quizAnswer === 0} onChange={() => setQuizAnswer(0)} className="mt-1" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">From: support@payfast-secure-login.co.za</p>
                  <p className="text-gray-600">"Your PayFast account will be closed in 24 hours. Verify now."</p>
                </div>
              </div>
            </label>
            <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${quizAnswer === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="quiz" checked={quizAnswer === 1} onChange={() => setQuizAnswer(1)} className="mt-1" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">From: no-reply@payfast.co.za</p>
                  <p className="text-gray-600">"Your monthly statement is available in your dashboard."</p>
                </div>
              </div>
            </label>
          </div>
          {!quizSubmitted ? (
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={quizAnswer === null}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              Submit Answer
            </button>
          ) : (
            <div className={`p-4 rounded-lg ${quizAnswer === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-medium ${quizAnswer === 0 ? 'text-green-700' : 'text-red-700'}`}>
                {quizAnswer === 0 ? '✓ Correct!' : '✗ Not quite.'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                The first email uses a fake domain ("payfast-secure-login.co.za") and creates urgency. The second email comes from the real PayFast domain and doesn't ask you to click anything urgent.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Warning banner */}
      <div className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold text-lg">You clicked a phishing link!</p>
            <p className="text-red-100 text-sm">This was a simulated security test by your IT team.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-gray-600 mb-8 text-center">
          Don't worry — no real harm was done. Let's make sure you can spot the real thing.
        </p>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Current card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{cards[step].title}</h2>
          {cards[step].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
          >
            ← Previous
          </button>
          {step < cards.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          ) : null}
        </div>

        {/* Complete button */}
        {step === cards.length - 1 && quizSubmitted && (
          <Button
            onClick={handleComplete}
            loading={completing}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle className="h-5 w-5" /> Mark as Complete
          </Button>
        )}

        <div className="text-center text-sm text-gray-400 mt-8 flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" /> Powered by PhishGuard Pro
        </div>
      </div>
    </div>
  )
}
