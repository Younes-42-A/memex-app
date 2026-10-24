import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type ErrorStatus = 'To review' | 'Practicing' | 'Mastered'
type ErrorCategory = 'Conceptual' | 'Calculation' | 'Code'

export type WeaknessEntry = {
  id: string
  title: string
  subject: string
  category: ErrorCategory
  status: ErrorStatus
  note: string
  lastSeen: string
}

const initialEntries: WeaknessEntry[] = [
  {
    id: 'weakness-1',
    title: 'Forgetting to check boundary cases',
    subject: 'Data Structures',
    category: 'Code',
    status: 'To review',
    note: 'Remember to test empty inputs and the first/last array positions.',
    lastSeen: '2026-10-21T12:00:00.000Z',
  },
  {
    id: 'weakness-2',
    title: 'Confusing correlation with causation',
    subject: 'Statistics',
    category: 'Conceptual',
    status: 'Practicing',
    note: 'A relationship between variables does not by itself prove causality.',
    lastSeen: '2026-10-19T12:00:00.000Z',
  },
  {
    id: 'weakness-3',
    title: 'Sign error in integration',
    subject: 'Calculus II',
    category: 'Calculation',
    status: 'Mastered',
    note: 'Recheck the sign when applying substitution and evaluating limits.',
    lastSeen: '2026-10-16T12:00:00.000Z',
  },
]

type ErrorRegisterViewProps = {
  initialItems?: WeaknessEntry[]
  loading?: boolean
  error?: string | null
}

export default function ErrorRegisterView({ initialItems = initialEntries, loading = false, error = null }: ErrorRegisterViewProps) {
  const [entries, setEntries] = useState(initialItems)
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const subjects = useMemo(() => [...new Set(entries.map((entry) => entry.subject))].sort(), [entries])
  const filteredEntries = useMemo(() => entries.filter((entry) => {
    const matchesSubject = subjectFilter === 'all' || entry.subject === subjectFilter
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter
    const query = search.trim().toLocaleLowerCase()
    const matchesSearch = !query || `${entry.title} ${entry.subject} ${entry.note} ${entry.category}`.toLocaleLowerCase().includes(query)
    return matchesSubject && matchesStatus && matchesSearch
  }), [entries, search, statusFilter, subjectFilter])
  const openCount = entries.filter((entry) => entry.status !== 'Mastered').length
  const masteredCount = entries.length - openCount

  function advanceStatus(entry: WeaknessEntry) {
    const nextStatus: ErrorStatus = entry.status === 'To review'
      ? 'Practicing'
      : entry.status === 'Practicing' ? 'Mastered' : 'To review'
    setEntries((current) => current.map((item) => item.id === entry.id ? { ...item, status: nextStatus } : item))
    setReviewingId(null)
  }

  function handleAddEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    const subject = String(formData.get('subject') ?? '').trim()
    const note = String(formData.get('note') ?? '').trim()
    const categoryValue = formData.get('category')
    if (!title || !subject || !note) {
      setFormError('Add a title, subject, and a short note before saving.')
      return
    }

    const category: ErrorCategory = categoryValue === 'Calculation' || categoryValue === 'Code'
      ? categoryValue
      : 'Conceptual'
    setEntries((current) => [{
      id: crypto.randomUUID(),
      title,
      subject,
      category,
      status: 'To review',
      note,
      lastSeen: new Date().toISOString(),
    }, ...current])
    setFormOpen(false)
    setFormError('')
    event.currentTarget.reset()
  }

  return (
    <section className="error-register" aria-labelledby="error-register-title">
      <header className="error-register-heading">
        <div>
          <p className="section-kicker">LEARN FROM EVERY MISTAKE</p>
          <h1 id="error-register-title">Review my weaknesses</h1>
          <p>Track the ideas and skills you want to strengthen, then revisit them as you study.</p>
        </div>
        <div className="error-register-heading-actions">
          <div className="error-register-progress" aria-label={`${masteredCount} of ${entries.length} weaknesses mastered`}>
            <span className="error-register-progress-ring" aria-hidden="true">✦</span>
            <span><strong>{masteredCount}/{entries.length}</strong><small>mastered</small></span>
          </div>
          <button className="primary-button" type="button" onClick={() => { setFormOpen((open) => !open); setFormError('') }}>
            {formOpen ? 'Cancel' : '＋ Log weakness'}
          </button>
        </div>
      </header>

      {formOpen && (
        <form className="weakness-entry-form" onSubmit={handleAddEntry}>
          <label>
            <span>Mistake or concept</span>
            <input name="title" required maxLength={100} placeholder="e.g. Mixing up stack and queue operations" />
          </label>
          <label>
            <span>Subject</span>
            <input name="subject" required maxLength={60} placeholder="e.g. Data Structures" />
          </label>
          <label>
            <span>Category</span>
            <select name="category" defaultValue="Conceptual">
              <option>Conceptual</option>
              <option>Calculation</option>
              <option>Code</option>
            </select>
          </label>
          <label className="weakness-entry-note">
            <span>What should you remember?</span>
            <textarea name="note" required maxLength={400} rows={2} placeholder="Add a short explanation or reminder." />
          </label>
          {formError && <p className="error-register-alert" role="alert">{formError}</p>}
          <button className="primary-button weakness-entry-submit" type="submit">Save to error register</button>
        </form>
      )}

      <div className="error-register-stats" aria-label="Weakness summary">
        <article><span className="error-stat-icon review" aria-hidden="true">↻</span><span><strong>{openCount}</strong><small>To work on</small></span></article>
        <article><span className="error-stat-icon mastered" aria-hidden="true">✓</span><span><strong>{masteredCount}</strong><small>Mastered</small></span></article>
        <article><span className="error-stat-icon total" aria-hidden="true">▤</span><span><strong>{entries.length}</strong><small>Total logged</small></span></article>
      </div>

      <div className="error-register-toolbar">
        <label className="error-register-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={search} placeholder="Search your error log" aria-label="Search weaknesses" onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="error-register-filter">
          <span className="visually-hidden">Filter by subject</span>
          <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </label>
        <label className="error-register-filter">
          <span className="visually-hidden">Filter by status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="To review">To review</option>
            <option value="Practicing">Practicing</option>
            <option value="Mastered">Mastered</option>
          </select>
        </label>
      </div>

      {error && <p className="error-register-alert" role="alert">{error}</p>}
      {loading ? (
        <div className="error-register-empty" role="status"><strong>Loading your error log…</strong></div>
      ) : filteredEntries.length === 0 ? (
        <div className="error-register-empty">
          <span aria-hidden="true">✦</span>
          <strong>{entries.length === 0 ? 'No weaknesses logged yet' : 'No matching mistakes'}</strong>
          <p>{entries.length === 0 ? 'When you log a mistake, it will appear here for review.' : 'Try changing your search or filters.'}</p>
          {(search || subjectFilter !== 'all' || statusFilter !== 'all') && (
            <button type="button" onClick={() => { setSearch(''); setSubjectFilter('all'); setStatusFilter('all') }}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="error-register-list">
          {filteredEntries.map((entry) => (
            <article className="weakness-card" key={entry.id}>
              <div className={`weakness-category-icon ${entry.category.toLowerCase()}`} aria-hidden="true">
                {entry.category === 'Code' ? '</>' : entry.category === 'Calculation' ? '∑' : '✦'}
              </div>
              <div className="weakness-card-content">
                <div className="weakness-card-heading">
                  <h2>{entry.title}</h2>
                  <span className={`weakness-status ${entry.status.toLowerCase().replace(' ', '-')}`}>{entry.status}</span>
                </div>
                <p>{entry.note}</p>
                <div className="weakness-card-meta">
                  <span className="weakness-subject">{entry.subject}</span>
                  <span className="weakness-category">{entry.category}</span>
                  <span>Last seen {new Date(entry.lastSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                {reviewingId === entry.id && (
                  <div className="weakness-review-prompt" role="status">
                    <span>Take a moment to explain this concept in your own words.</span>
                    <button type="button" onClick={() => advanceStatus(entry)}>
                      {entry.status === 'To review' ? 'Start practicing' : entry.status === 'Practicing' ? 'Mark mastered' : 'Review again'}
                    </button>
                  </div>
                )}
              </div>
              {reviewingId !== entry.id && (
                <button className="weakness-review-button" type="button" onClick={() => setReviewingId(entry.id)}>
                  Review <span aria-hidden="true">→</span>
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
