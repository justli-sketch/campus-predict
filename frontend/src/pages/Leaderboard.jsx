import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

function Leaderboard() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    api.get('leaderboard/').then((res) => setRows(res.data))
  }, [])

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      <Link to="/">← Back</Link>
      <h1>Leaderboard</h1>
      <p>Top users by total points bet (simple version).</p>

      <div style={{ border: '1px solid #ddd', borderRadius: 10, overflow: 'hidden' }}>
        {rows.length === 0 ? (
          <p style={{ padding: 16 }}>No data yet.</p>
        ) : (
          rows.map((r, idx) => (
            <div
              key={r.username}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderTop: idx === 0 ? 'none' : '1px solid #eee',
              }}
            >
              <div>
                <b>#{idx + 1}</b> {r.username}
              </div>
              <div>{r.total_bet} pts bet</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Leaderboard
