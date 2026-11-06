import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { feedItems } from '../data/feedItems'
import { askAxi } from '../services/axi'
import {
  loadRepositories,
  saveRepository,
  saveRepositoryFiles,
} from '../workspaceStorage'
import type { StoredRepository, StoredRepositoryFile } from '../workspaceStorage'

export type FeedAction = 'create-repository' | 'add-files'

type FeedProps = {
  requestedAction: FeedAction | null
  onActionHandled: () => void
}

const emptyRepository = { name: '', description: '', language: '' }

export default function Feed({ requestedAction, onActionHandled }: FeedProps) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [repositories, setRepositories] = useState<StoredRepository[]>([])
  const [repositoryFiles, setRepositoryFiles] = useState<StoredRepositoryFile[]>([])
  const [repositoryForm, setRepositoryForm] = useState(emptyRepository)
  const [selectedRepositoryId, setSelectedRepositoryId] = useState('')
  const [filesToAdd, setFilesToAdd] = useState<File[]>([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    let cancelled = false
    loadRepositories()
      .then(({ repositories: savedRepositories, files: savedFiles }) => {
        if (cancelled) return
        setRepositories(savedRepositories)
        setRepositoryFiles(savedFiles)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus(`Repositories could not be loaded: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const availableRepositories = useMemo(() => [
    ...feedItems.map((item) => ({ id: item.id, name: item.name, description: item.description, language: item.language })),
    ...repositories,
  ], [repositories])
  const activeAction = requestedAction
  const targetRepositoryId = selectedRepositoryId || availableRepositories[0]?.id || ''

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const items = [
      ...feedItems,
      ...repositories.map((repository) => ({
        ...repository,
        stars: 0,
      })),
    ]
    if (!q) return items
    return items.filter((item) =>
      `${item.name} ${item.description} ${item.language}`.toLowerCase().includes(q),
    )
  }, [query, repositories])

  async function handleAsk() {
    if (!query.trim()) return
    setLoading(true)
    try {
      const response = await askAxi({
        question: query,
        context: results.map((item) => item.name),
      })
      setAnswer(response.answer)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const repository: StoredRepository = {
      id: crypto.randomUUID(),
      name: repositoryForm.name.trim(),
      description: repositoryForm.description.trim(),
      language: repositoryForm.language.trim() || 'Other',
      createdAt: Date.now(),
    }
    try {
      await saveRepository(repository)
      setRepositories((current) => [...current, repository])
      setSelectedRepositoryId(repository.id)
      setRepositoryForm(emptyRepository)
      onActionHandled()
      setStatus(`Repository "${repository.name}" created.`)
    } catch (error) {
      setStatus(`Repository could not be created: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
    }
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    setFilesToAdd(Array.from(event.target.files ?? []))
    setStatus('')
  }

  async function handleAddFiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!targetRepositoryId || filesToAdd.length === 0) return

    const addedAt = Date.now()
    const records: StoredRepositoryFile[] = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      repositoryId: targetRepositoryId,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      size: file.size,
      addedAt,
      blob: file,
    }))
    try {
      await saveRepositoryFiles(records)
      setRepositoryFiles((current) => [...records, ...current])
      setFilesToAdd([])
      onActionHandled()
      setStatus(`${records.length} file${records.length === 1 ? '' : 's'} added to the repository.`)
    } catch (error) {
      setStatus(`Files could not be added: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
    }
  }

  return (
    <>
      <section className="feed-page" aria-labelledby="feed-title">
        <header className="feed-heading">
          <h1 id="feed-title">
            {activeAction === 'create-repository'
              ? 'Create a repository'
              : activeAction === 'add-files'
                ? 'Add files to a repository'
                : 'Feed'}
          </h1>
          {activeAction ? (
            <a className="feed-back-link" href="#feed">Back to Feed</a>
          ) : (
            <input
              type="search"
              className="feed-search"
              placeholder="Search repositories..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          )}
        </header>

        {activeAction === 'create-repository' && (
          <form className="feed-action-panel" onSubmit={handleCreateRepository}>
            <label>
              Repository name
              <input
                required
                value={repositoryForm.name}
                onChange={(event) => setRepositoryForm({ ...repositoryForm, name: event.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                value={repositoryForm.description}
                onChange={(event) => setRepositoryForm({ ...repositoryForm, description: event.target.value })}
                rows={3}
              />
            </label>
            <label>
              Language
              <input
                value={repositoryForm.language}
                onChange={(event) => setRepositoryForm({ ...repositoryForm, language: event.target.value })}
              />
            </label>
            <div className="feed-form-actions">
              <button className="primary-button" type="submit">Create repository</button>
              <button className="secondary-button" type="button" onClick={onActionHandled}>Cancel</button>
            </div>
          </form>
        )}

        {activeAction === 'add-files' && (
          <form className="feed-action-panel" onSubmit={handleAddFiles}>
            <label>
              Existing repository
              <select
                required
                value={targetRepositoryId}
                onChange={(event) => setSelectedRepositoryId(event.target.value)}
              >
                {availableRepositories.map((repository) => (
                  <option key={repository.id} value={repository.id}>{repository.name}</option>
                ))}
              </select>
            </label>
            <label>
              Files
              <input type="file" multiple required onChange={handleFileSelection} />
            </label>
            <div className="feed-form-actions">
              <button className="primary-button" type="submit" disabled={!targetRepositoryId || filesToAdd.length === 0}>
                Add files
              </button>
              <button className="secondary-button" type="button" onClick={onActionHandled}>Cancel</button>
            </div>
          </form>
        )}

        {status && <p className="feed-status" role="status">{status}</p>}

        {!activeAction && (results.length === 0 ? (
          <p className="feed-empty">No results for “{query}”.</p>
        ) : (
          <div className="feed-grid">
            {results.map((item) => {
              const fileCount = repositoryFiles.filter((file) => file.repositoryId === item.id).length
              return (
                <article className="feed-card" key={item.id}>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <footer>
                    <span>{item.language}</span>
                    <span>★ {item.stars}</span>
                  </footer>
                  {fileCount > 0 && (
                    <p className="feed-file-count">{fileCount} file{fileCount === 1 ? '' : 's'} added</p>
                  )}
                </article>
              )
            })}
          </div>
        ))}
      </section>
      {!activeAction && (
        <>
          <button type="button" className="primary-button" onClick={handleAsk} disabled={loading}>
            {loading ? 'AXI Thinking...' : 'Ask AXI'}
          </button>
          {answer && <p className="axi-answer">{answer}</p>}
        </>
      )}
    </>
  )
}
