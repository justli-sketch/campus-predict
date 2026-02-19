import { useEffect, useState } from 'react'
import { api } from '../api'
import { Link } from 'react-router-dom'

function Home() {
  const [markets, setMarkets] = useState([])
  const [me, setMe] = useState(null)

  const [pointsByMarket, setPointsByMarket] = useState({})
  const [messageByMarket, setMessageByMarket] = useState({})

  const loadMarkets = async () => {
    const res = await api.get('markets/')
    setMarkets(res.data)
  }

  const loadMe = async () => {
    try {
      const res = await api.get('me/')
      setMe(res.data)
    } catch {
      setMe(null)
    }
  }

  useEffect(() => {
    loadMarkets()
    loadMe()
  }, [])

  const setPoints = (marketId, value) => {
    setPointsByMarket((prev) => ({ ...prev, [marketId]: value }))
  }

  const setMsg = (marketId, msg) => {
    setMessageByMarket((prev) => ({ ...prev, [marketId]: msg }))
  }

  const placeBet = async (marketId, choice) => {
    try {
      const token = localStorage.getItem('access')
      if (!token) {
        setMsg(marketId, 'You need to log in to bet! (go to /login)')
        return
      }

      const raw = pointsByMarket[marketId] ?? ''
      const points = parseInt(raw, 10)

      if (!Number.isFinite(points) || points <= 0) {
        setMsg(marketId, 'Enter a positive number of points.')
        return
      }

      const res = await api.post(`markets/${marketId}/bet/`, { choice, points })
      setMsg(marketId, `${res.data.message} New balance: ${res.data.new_balance}`)

      // refresh UI
      await loadMarkets()
      await loadMe()

      // optional: clear the input after a successful bet
      setPointsByMarket((prev) => ({ ...prev, [marketId]: '' }))
    } catch (err) {
      const msg =
        err?.response?.data?.error ??
        (err?.response?.status === 401 ? 'Not logged in (go to /login).' : 'Something went wrong.')
      setMsg(marketId, msg)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      <h1>Campus Predict</h1>
        <p>
            <Link to="/leaderboard">View Leaderboard</Link>
        </p>


      {me ? (
        <p>
          Logged in as <b>{me.username}</b> — Balance: <b>{me.points_balance}</b> points
        </p>
      ) : (
        <p>
          Not logged in — go to <code>/login</code>
        </p>
      )}

      <p>
        View markets and place bets. (If betting fails, make sure you logged in at <code>/login</code>.)
      </p>

      {markets.map((m) => (
        <div
          key={m.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 10,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <h2 style={{ marginTop: 0 }}>{m.title}</h2>

          <Link to={`/markets/${m.id}`}>View Market</Link>

          <p>{m.description}</p>
          <p>
            YES: {m.yes_prob}% | NO: {100 - m.yes_prob}%
          </p>
          <p>Closes: {new Date(m.closes_at).toLocaleString()}</p>
          <p>Created by: {m.creator}</p>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <input
              style={{ width: 140, padding: 8 }}
              placeholder="Points"
              value={pointsByMarket[m.id] ?? ''}
              onChange={(e) => setPoints(m.id, e.target.value)}
            />
            <button onClick={() => placeBet(m.id, 'yes')}>Bet YES</button>
            <button onClick={() => placeBet(m.id, 'no')}>Bet NO</button>
          </div>

          {messageByMarket[m.id] && <p style={{ marginTop: 10 }}>{messageByMarket[m.id]}</p>}
        </div>
      ))}
    </div>
  )
}

export default Home
