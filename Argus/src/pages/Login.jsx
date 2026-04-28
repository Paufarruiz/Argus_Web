import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'

const EyeIcon = () => (
  <svg className={styles.eye} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="rgba(0,200,150,0.3)" strokeWidth="1" />
    <circle cx="24" cy="24" r="14" stroke="rgba(0,200,150,0.5)" strokeWidth="1" />
    <circle cx="24" cy="24" r="7" fill="none" stroke="#00c896" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="3" fill="#00c896" />
    <line x1="2"  y1="24" x2="10" y2="24" stroke="rgba(0,200,150,0.4)" strokeWidth="1" />
    <line x1="38" y1="24" x2="46" y2="24" stroke="rgba(0,200,150,0.4)" strokeWidth="1" />
    <line x1="24" y1="2"  x2="24" y2="10" stroke="rgba(0,200,150,0.4)" strokeWidth="1" />
    <line x1="24" y1="38" x2="24" y2="46" stroke="rgba(0,200,150,0.4)" strokeWidth="1" />
  </svg>
)

export default function Login({ onLogin }) {
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!user || !pass) {
      setError('Introduce tus credenciales de acceso.')
      return
    }
    setLoading(true)
    setError('')
    // Simulated auth — replace with real API call
    setTimeout(() => {
      setLoading(false)
      onLogin()
      navigate('/dashboard')
    }, 1200)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <EyeIcon />
          <span className={styles.logoText}>ARGUS</span>
          <span className={styles.logoSub}>Proactive Intelligence · Verified Exposure</span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="user">Identificador de Operador</label>
            <input
              id="user"
              type="text"
              placeholder="operator@argus.sec"
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="pass">Clave de Acceso</label>
            <input
              id="pass"
              type="password"
              placeholder="••••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className={styles.status}>
          <span className={styles.dot} />
          Sistema operativo · Tor activo · 3 scrapers en ejecución
        </div>
      </div>
    </div>
  )
}