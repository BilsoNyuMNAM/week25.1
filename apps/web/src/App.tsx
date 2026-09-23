import { useState, useEffect, useCallback } from 'react'
import './App.css'

interface User {
  id: string
  username: string
  password?: string
}

const BACKEND_URL = 'http://localhost:3002'

export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // New user form state
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [formMessage, setFormMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BACKEND_URL}/users`)
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while fetching users'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setFormMessage({ text: 'Please enter both username and password', isError: true })
      return
    }

    setSubmitting(true)
    setFormMessage(null)
    try {
      const response = await fetch(`${BACKEND_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setFormMessage({ text: 'User created successfully in database!', isError: false })
      setUsername('')
      setPassword('')
      // Refresh the user list from database
      await fetchUsers()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setFormMessage({ text: errorMessage, isError: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="badge">PostgreSQL &bull; Prisma &bull; Express</div>
        <h1>Database Users</h1>
        <p className="subtitle">
          Data fetched directly from the database via backend server (<code>{BACKEND_URL}</code>)
        </p>
      </header>

      <main className="content">
        {/* Create User Form Section */}
        <section className="card form-card">
          <h2>Add New User</h2>
          <form onSubmit={handleCreateUser} className="user-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={submitting}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User in DB'}
            </button>
          </form>
          {formMessage && (
            <div className={`message ${formMessage.isError ? 'message-error' : 'message-success'}`}>
              {formMessage.text}
            </div>
          )}
        </section>

        {/* Fetched Data Display Section */}
        <section className="card list-card">
          <div className="card-header">
            <div className="title-with-count">
              <h2>Users in Database</h2>
              <span className="count-pill">{users.length}</span>
            </div>
            <button onClick={fetchUsers} className="btn btn-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : '🔄 Refresh Data'}
            </button>
          </div>

          {loading && (
            <div className="state-box loading-state">
              <div className="spinner"></div>
              <p>Fetching data from database...</p>
            </div>
          )}

          {error && !loading && (
            <div className="state-box error-state">
              <p className="error-title">⚠️ Failed to load database records</p>
              <p className="error-details">{error}</p>
              <p className="hint">Make sure the backend server is running on port 3002 (<code>pnpm dev</code> or <code>pnpm --filter http-server dev</code>) and your database is connected.</p>
              <button onClick={fetchUsers} className="btn btn-retry">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="state-box empty-state">
              <p className="empty-title">No users found in database</p>
              <p className="empty-desc">Create your first user above to see it appear here.</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User ID</th>
                    <th>Username</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td className="col-index">{index + 1}</td>
                      <td className="col-id">
                        <code>{user.id}</code>
                      </td>
                      <td className="col-username">
                        <strong>{user.username}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
