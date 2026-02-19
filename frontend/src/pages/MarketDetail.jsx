import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'

function MarketDetail() {
  const { id } = useParams()

  const [market, setMarket] = useState(null)
  const [history, setHistory] = useState([])
  const [points, setPoints] = useState('')
  const [message, setMessage] = useState('')

  // COMMENTS
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')

  const loadMarket = async () => {
    const res = await api.get(`markets/${id}/`)
    setMarket(res.data)
  }

  const loadHistory = async () => {
    const res = await api.get(`markets/${id}/history/`)
    setHistory(res.data)
  }

  const loadComments = async () => {
    const res = await api.get(`markets/${id}/comments/`)
    setComments(res.data)
  }

  useEffect(() => {
    loadMarket()
    loadHistory()
    loadComments()
  }, [id])

  const placeBet = async (choice) => {
    try {
      const n = parseInt(points, 10)
      if (!Number.isFinite(n) || n <= 0) {
        setMessage('Enter valid points.')
        return
      }

      await api.post(`markets/${id}/bet/`, { choice, points: n })
      setMessage('Bet placed!')
      setPoints('')

      await loadMarket()
      await loadHistory()
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Something went wrong.')
    }
  }

  const postComment = async () => {
    try {
      const text = commentText.trim()
      if (!text) return

      const res = await api.post(`markets/${id}/comments/`, { text })
      setCommentText('')
      setComments((prev) => [res.data, ...prev])
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Could not post comment (are you logged in?)')
    }
  }

  if (!market) return <p>Loading...</p>

  const isClosed = market.status !== 'open'

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <Link to="/">← Back</Link>

      <h1>{market.title}</h1>

      <p>
        Status: <b>{market.status}</b>
      </p>

        <div style={{ margin: '12px 0' }}>
            <button onClick={() => resolve('yes')}>Resolve YES</button>
            <button onClick={() => resolve('no')} style={{ marginLeft: 8 }}>Resolve NO</button>
        </div>


      <p>{market.description}</p>

      <h3>Probability History</h3>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="yes_prob" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3>Current</h3>
      <p>YES: {market.yes_prob}%</p>
      <p>NO: {100 - market.yes_prob}%</p>

      <div style={{ marginTop: 20 }}>
        <input
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Points"
          disabled={isClosed}
        />
        <button onClick={() => placeBet('yes')} disabled={isClosed}>
          Bet YES
        </button>
        <button onClick={() => placeBet('no')} disabled={isClosed}>
          Bet NO
        </button>

        {isClosed && (
          <p style={{ marginTop: 10 }}>
            This market is closed. No more bets allowed.
          </p>
        )}
      </div>

      {message && <p>{message}</p>}

      <hr style={{ margin: '24px 0' }} />

      <h3>Comments</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button onClick={postComment}>Post</button>
      </div>

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={{ borderTop: '1px solid #eee', padding: '10px 0' }}>
            <b>{c.user}</b>{' '}
            <span style={{ color: '#777' }}>({new Date(c.created_at).toLocaleString()})</span>
            <div>{c.text}</div>
          </div>
        ))
      )}
    </div>
  )
}

const resolve = async (outcome) => {
  try {
    const res = await api.post(`markets/${id}/resolve/`, { outcome })
    setMessage(res.data.message)
    await loadMarket()
  } catch (err) {
    setMessage(err?.response?.data?.error || 'Could not resolve.')
  }
}

export default MarketDetail
