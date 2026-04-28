import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function PrivateRoute({ auth, children }) {
  return auth ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [auth, setAuth] = useState(false)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setAuth(true)} />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute auth={auth}>
              <Dashboard onLogout={() => setAuth(false)} />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={auth ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}