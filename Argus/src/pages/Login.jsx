import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { 
        username: username.trim(), 
        password: password 
    };

    try {
      const response = await fetch('/api/Api_Argus.php?action=login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error en la conexion:", err);
      setError('Error crítico: Sin conexión con el nodo central');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>ARGUS</h1>
        <p>Proactive Intelligence. Verified Exposure.</p>

        {error && <div className="error-banner" style={{ marginBottom: '1rem', color: '#dc2430', fontSize: '0.8rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ position: 'relative' }}>
            <input 
              className="argus-input"
              type="text" 
              placeholder="USUARIO" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ position: 'relative' }}>
            <input 
              className="argus-input"
              type={showPassword ? "text" : "password"} 
              placeholder="CONTRASEÑA" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="btn-toggle-pass"
              style={{
                position: 'absolute',
                right: '10px',
                top: '12px',
                background: 'none',
                border: 'none',
                color: '#7b4397',
                fontSize: '0.6rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "OCULTAR" : "VER"}
            </button>
          </div>

          <button type="submit" className="btn-login">
            AUTENTICAR SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
}