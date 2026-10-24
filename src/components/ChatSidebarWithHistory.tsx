import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

export type ChatSession = {
  id: string
  title: string
  updatedAt: string
}

type ChatSidebarWithHistoryProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  currentDate: Date
  onNewChat: () => void
  onSelectChat: (session: ChatSession) => void
  onDeleteChat: (session: ChatSession) => void
  onRenameChat: (session: ChatSession, title: string) => void
  loading?: boolean
  error?: string | null
}

type ChatGroup = 'Today' | 'Yesterday' | 'Older'

function getDateGroup(dateValue: string, now: Date): ChatGroup {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Older'

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const today = todayDate.getTime()
  todayDate.setDate(todayDate.getDate() - 1)

  if (dateDay === today) return 'Today'
  if (dateDay === todayDate.getTime()) return 'Yesterday'
  return 'Older'
}

export default function ChatSidebarWithHistory({
  sessions,
  activeSessionId,
  currentDate,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  loading = false,
  error = null,
}: ChatSidebarWithHistoryProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<ChatSession | null>(null)
  const [chatToRename, setChatToRename] = useState<ChatSession | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const groupedSessions = useMemo(() => {
    const groups: Record<ChatGroup, ChatSession[]> = { Today: [], Yesterday: [], Older: [] }
    for (const session of sessions) {
      groups[getDateGroup(session.updatedAt, currentDate)].push(session)
    }

    return groups
  }, [currentDate, sessions])

  useEffect(() => {
    if (!chatToDelete) return
    cancelDeleteRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setChatToDelete(null)
      if (event.key === 'Tab') {
        const buttons = document.querySelectorAll<HTMLButtonElement>('.chat-delete-dialog button')
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [chatToDelete])

  useEffect(() => {
    if (chatToRename) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [chatToRename])

  function beginRename(session: ChatSession) {
    setChatToRename(session)
    setRenameDraft(session.title)
  }

  function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = renameDraft.trim()
    if (!chatToRename || !title) return
    onRenameChat(chatToRename, title)
    setChatToRename(null)
  }

  return (
    <>
    <aside className={`chat-history${collapsed ? ' is-collapsed' : ''}`} aria-label="Chat history">
      <div className="chat-history-header">
        {!collapsed && <span className="chat-history-title">Your chats</span>}
        <button
          className="chat-history-collapse"
          type="button"
          aria-label={collapsed ? 'Expand chat history' : 'Collapse chat history'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((current) => !current)}
        >
          <span aria-hidden="true">{collapsed ? '›' : '‹'}</span>
        </button>
      </div>

      <button
        className="chat-new-button"
        type="button"
        aria-label="Start a new chat"
        onClick={onNewChat}
      >
        <span aria-hidden="true">＋</span>
        {!collapsed && <span>New chat</span>}
      </button>

      {!collapsed && (
        <div className="chat-history-list" aria-live="polite">
          {error && <p className="chat-history-error" role="alert">{error}</p>}
          {loading ? (
            <p className="chat-history-message" role="status">Loading chats…</p>
          ) : sessions.length === 0 ? (
            <div className="chat-history-empty">
              <span aria-hidden="true">◷</span>
              <strong>No chats yet</strong>
              <p>Start a new chat and it will appear here.</p>
            </div>
          ) : (
            (['Today', 'Yesterday', 'Older'] as const).map((groupName) => (
              groupedSessions[groupName].length > 0 && (
                <section className="chat-history-group" key={groupName} aria-label={groupName}>
                  <h2>{groupName}</h2>
                  {groupedSessions[groupName].map((session) => (
                    <div className={`chat-history-row${activeSessionId === session.id ? ' active' : ''}`} key={session.id}>
                      {chatToRename?.id === session.id ? (
                        <form className="chat-history-rename-form" onSubmit={submitRename}>
                          <input
                            ref={renameInputRef}
                            aria-label="Chat name"
                            value={renameDraft}
                            maxLength={80}
                            onChange={(event) => setRenameDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') setChatToRename(null)
                            }}
                          />
                          <button className="chat-history-rename-save" type="submit" aria-label="Save chat name" disabled={!renameDraft.trim()}>
                            ✓
                          </button>
                        </form>
                      ) : (
                        <>
                          <button
                            className="chat-history-item"
                            type="button"
                            aria-current={activeSessionId === session.id ? 'page' : undefined}
                            title={session.title}
                            onClick={() => onSelectChat(session)}
                            onDoubleClick={() => beginRename(session)}
                          >
                            <span className="chat-history-item-icon" aria-hidden="true">◷</span>
                            <span className="chat-history-item-title">{session.title || 'Untitled chat'}</span>
                          </button>
                          <button
                            className="chat-history-rename"
                            type="button"
                            aria-label={`Rename ${session.title || 'Untitled chat'}`}
                            title="Rename chat"
                            onClick={() => beginRename(session)}
                          >
                            <span aria-hidden="true">✎</span>
                            <span className="visually-hidden">Edit name</span>
                          </button>
                        </>
                      )}
                      {chatToRename?.id !== session.id && (
                        <button
                          className="chat-history-delete"
                          type="button"
                          aria-label={`Delete ${session.title || 'Untitled chat'}`}
                          title="Delete chat"
                          onClick={() => setChatToDelete(session)}
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      )}
                    </div>
                  ))}
                </section>
              )
            ))
          )}
        </div>
      )}
    </aside>
    {chatToDelete && (
      <div
        className="chat-delete-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setChatToDelete(null)
        }}
      >
        <section
          className="chat-delete-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="chat-delete-title"
          aria-describedby="chat-delete-description"
        >
          <span className="chat-delete-icon" aria-hidden="true">⌫</span>
          <h2 id="chat-delete-title">Delete this chat?</h2>
          <p id="chat-delete-description">
            “{chatToDelete.title || 'Untitled chat'}” will be removed from your history. This cannot be undone.
          </p>
          <div className="chat-delete-actions">
            <button ref={cancelDeleteRef} className="chat-delete-cancel" type="button" onClick={() => setChatToDelete(null)}>
              Cancel
            </button>
            <button
              className="chat-delete-confirm"
              type="button"
              onClick={() => {
                onDeleteChat(chatToDelete)
                setChatToDelete(null)
              }}
            >
              Delete chat
            </button>
          </div>
        </section>
      </div>
    )}
    </>
  )
}
