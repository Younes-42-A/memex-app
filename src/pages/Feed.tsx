import { useMemo, useState } from 'react'
import { feedItems } from '../data/feedItems'
import { askAxi } from '../services/axi'

export default function Feed() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return feedItems
    return feedItems.filter((item) =>
      `${item.name} ${item.description} ${item.language}`.toLowerCase().includes(q),
    )
  }, [query])

  async function handleAsk() {
    if (!query.trim()) return
    setLoading(true)
    const response = await askAxi({
      question: query,
      context: results.map((item) => item.name),
    })
    setAnswer(response.answer)
    setLoading(false)
  }

  return (
    <>
      <section className="feed-page" aria-labelledby="feed-title">
      <header className="feed-heading">
        <h1 id="feed-title">Feed</h1>
        <input
          type="search"
          className="feed-search"
          placeholder="Search repositories..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </header>

      {results.length === 0 ? (
        <p className="feed-empty">No results for “{query}”.</p>
      ) : (
        <div className="feed-grid">
          {results.map((item) => (
            <article className="feed-card" key={item.id}>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <footer>
                <span>{item.language}</span>
                <span>★ {item.stars}</span>
              </footer>
            </article>
          ))}
        </div>
      )}
      </section>
      <button type="button" className="primary-button" onClick={handleAsk} disabled={loading}>
        {loading ? 'AXI Thinking...' : 'Ask AXI'}
      </button>
      {answer && <p className="axi-answer">{answer}</p>}
    </>
  )
}