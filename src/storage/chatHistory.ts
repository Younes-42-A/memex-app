/* Reads saved chat sessions and supplies the default session list. */
import type { ChatSession } from '../components/ChatSidebarWithHistory'

export function readSavedChatSessions(): ChatSession[] {
  const fallback: ChatSession[] = [
    { id: 'chat-today', title: 'Reviewing recursion examples', updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
    { id: 'chat-yesterday', title: 'Preparing for statistics quiz', updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString() },
    { id: 'chat-older', title: 'Big-O notation explained', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ]

  try {
    const stored = window.localStorage.getItem('memex-chat-history')
    if (!stored) return fallback
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) throw new Error('Saved chat history must be a list.')

    return parsed.filter((value): value is ChatSession => (
      typeof value === 'object'
      && value !== null
      && 'id' in value && typeof value.id === 'string'
      && 'title' in value && typeof value.title === 'string'
      && 'updatedAt' in value && typeof value.updatedAt === 'string'
    ))
  } catch {
    return fallback
  }
}
