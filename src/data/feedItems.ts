export type FeedItem = {
  id: string
  name: string
  description: string
  language: string
  stars: number
}

export const feedItems: FeedItem[] = [
  { id: '1', name: 'react-hooks-notes', description: 'Short notes and examples on React hooks.', language: 'TypeScript', stars: 120 },
  { id: '2', name: 'algorithms-visualizer', description: 'Visualize sorting and searching algorithms.', language: 'JavaScript', stars: 340 },
  { id: '3', name: 'linear-algebra-tutorial', description: 'Matrices, vectors, and eigenvalues with exercises.', language: 'Python', stars: 88 },
  { id: '4', name: 'big-o-cheatsheet', description: 'Quick reference for time and space complexity.', language: 'Markdown', stars: 512 },
]