import { useEffect, useRef, useState } from 'react'
import { Send, Shield, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { sendCopilotMessage } from '@/services/api'

type ChatRole = 'assistant' | 'user'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  typing?: boolean
}

interface SecurityCopilotProps {
  orgId: string | null
  context: Record<string, unknown>
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your Security Copilot. Ask me anything about your phishing results, POPIA compliance, or what to do next. 🛡️",
}

const SUGGESTED_PROMPTS = [
  'Which employees are highest risk?',
  'Help me write a board report',
  'What should I do after a high click rate?',
]

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function trimMessages(messages: ChatMessage[]) {
  if (messages.length <= 21) return messages
  return [messages[0], ...messages.slice(-20)]
}

export function SecurityCopilot({ orgId, context }: SecurityCopilotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [panelMounted, setPanelMounted] = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPanelMounted(true)
      const frame = window.requestAnimationFrame(() => setPanelVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }

    setPanelVisible(false)
    const timeout = window.setTimeout(() => setPanelMounted(false), 200)
    return () => window.clearTimeout(timeout)
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, panelVisible])

  const closePanel = () => setIsOpen(false)

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE])
    setInputValue('')
  }

  const sendMessage = async (overrideText?: string) => {
    const message = (overrideText ?? inputValue).trim()
    if (!message || isSending) return

    if (!hasInteracted) setHasInteracted(true)
    setInputValue('')
    setIsSending(true)

    const userMessage: ChatMessage = { id: createId(), role: 'user', content: message }
    const typingMessage: ChatMessage = { id: `${userMessage.id}-typing`, role: 'assistant', content: '', typing: true }

    setMessages((current) => trimMessages([...current, userMessage, typingMessage]))

    try {
      const result = await sendCopilotMessage(message, orgId ?? '', context ?? {})
      const reply = result?.response?.trim() || 'AI analysis temporarily unavailable. Please try again shortly.'

      setMessages((current) => {
        const next = current.map((entry) =>
          entry.id === typingMessage.id ? { ...entry, typing: false, content: reply } : entry
        )
        return trimMessages(next)
      })
    } catch {
      toast.error('Security Copilot is temporarily unavailable')
      setMessages((current) => {
        const next = current.map((entry) =>
          entry.id === typingMessage.id
            ? { ...entry, typing: false, content: 'AI analysis temporarily unavailable. Please try again shortly.' }
            : entry
        )
        return trimMessages(next)
      })
    } finally {
      setIsSending(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
    void sendMessage(prompt)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setHasInteracted(true)
          setIsOpen((current) => !current)
        }}
        className={`fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full bg-cyan text-navy shadow-2xl flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan/50 ${!hasInteracted ? 'animate-pulse' : ''}`}
        aria-label="Open Security Copilot"
      >
        <Shield className="h-6 w-6" />
      </button>

      {panelMounted && (
        <div
          className={`fixed bottom-24 right-6 z-[9999] w-[380px] h-[500px] rounded-xl shadow-2xl overflow-hidden border border-border bg-card transition-all duration-200 ease-out ${
            panelVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
        >
          <div className="bg-navy/95 border-b border-border px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-cyan/20 flex items-center justify-center text-cyan">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-text-1">Security Copilot</h3>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-text-2">
                <span className="h-2 w-2 rounded-full bg-green" />
                <span>Online</span>
                <button
                  type="button"
                  onClick={resetChat}
                  className="ml-2 text-cyan hover:text-cyan-dim transition-colors"
                >
                  Clear chat
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={closePanel}
              className="p-1 text-text-2 hover:text-text-1 transition-colors"
              aria-label="Close Security Copilot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex h-[calc(100%-56px-64px)] flex-col overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 shrink-0 rounded-full bg-cyan/20 flex items-center justify-center text-cyan">
                    <Shield className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-6 whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-cyan text-navy rounded-tr-sm'
                      : 'bg-surface text-text-1 rounded-tl-sm border border-border'
                  }`}
                >
                  {message.typing ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-2 w-2 rounded-full bg-cyan animate-bounce [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-cyan animate-bounce [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 rounded-full bg-cyan animate-bounce" />
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-text-2">Suggested prompts</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      className="rounded-full border border-border bg-surface px-3 py-2 text-xs text-text-1 hover:border-cyan hover:text-cyan transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-card p-3">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void sendMessage()
              }}
              className="flex items-center gap-2"
            >
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask your Security Copilot..."
                className="flex-1 rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 placeholder:text-text-2/50 transition-colors focus:outline-none focus:border-cyan"
              />
              <Button type="submit" size="sm" loading={isSending} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
