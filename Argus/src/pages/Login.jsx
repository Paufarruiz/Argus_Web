import React, { useState } from 'react';

export default function Login({ onLogin }) {
  // Estado para controlar el flujo de autenticación
  // Step 1: Usuario/Contraseña | Step 2: Código Google Authenticator
  const [step, setStep] = useState(1); 
  
  // Estados de los campos
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Token temporal para identificar la sesión durante el paso de MFA
  const [tempToken, setTempToken] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  // --- FASE 1: VALIDACIÓN DE CREDENCIALES ---
  const handleCredentialSubmit = async (e) => {
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
      } else if (data.setupMfa) {
        // EL USUARIO NO TIENE 2FA: Le mostramos el QR nuevo (Paso 1.5)
        setTempToken(data.tempToken);
        setQrUrl(data.qr_url);
        setStep(1.5);
      } else if (data.requireMfa) {
        // EL USUARIO YA TIENE 2FA: Le pedimos el código directo (Paso 2)
        setTempToken(data.tempToken);
        setStep(2);
      } else {
        setError(data.message || 'Credenciales no autorizadas');
      }
    } catch (err) {
      console.error("Error en la conexion:", err);
      setError('Error crítico: Nodo central inaccesible');
    }
  };

  // --- FASE 2: VERIFICACIÓN GOOGLE AUTHENTICATOR ---
  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { 
        tempToken: tempToken,
        mfaCode: mfaCode.trim() 
    };

    try {
      const response = await fetch('/api/Api_Argus.php?action=verify_mfa', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        // Acceso total concedido
        onLogin(data.user);
      } else {
        // Código incorrecto o expirado
        setError(data.message || 'Código de seguridad inválido');
      }
    } catch (err) {
      console.error("Error en la conexion:", err);
      setError('Error crítico: Fallo en la validación TOTP');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>ARGUS</h1>
        <p>Proactive Intelligence. Verified Exposure.</p>

        {error && (
          <div className="error-banner" style={{ 
            marginBottom: '1rem', 
            color: '#dc2430', 
            fontSize: '0.8rem', 
            fontWeight: 'bold',
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}

        {step === 1 && (
          /* ================= FASE 1: CREDENCIALES ================= */
          <form onSubmit={handleCredentialSubmit}>
            <div className="input-group">
              <input 
                className="argus-input"
                type="text" 
                placeholder="USUARIO" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group" style={{ position: 'relative', marginTop: '10px' }}>
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

            <button type="submit" className="btn-login" style={{ marginTop: '20px' }}>
              AUTENTICAR SISTEMA
            </button>
          </form>
        )}

        {(step === 1.5 || step === 2) && (
          /* ================= FASE 2: MFA (GOOGLE AUTHENTICATOR) ================= */
          <form onSubmit={handleMfaSubmit}>
            
            {/* Si es el paso 1.5, mostramos el código QR */}
            {step === 1.5 && (
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#4CAF50', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ¡CONFIGURACIÓN INICIAL DE SEGURIDAD!
                </p>
                <img 
                  src={qrUrl} 
                  alt="QR" 
                  style={{ width: '150px', border: '4px solid white', margin: '10px 0' }} 
                />
                <p style={{ color: '#aaa', fontSize: '0.7rem' }}>
                  Escanea este código con tu app de Google Authenticator antes de continuar.
                </p>
              </div>
            )}

            {step === 2 && (
              <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '20px', lineHeight: '1.4' }}>
                VERIFICACIÓN MULTIFACTOR REQUERIDA.<br/>
                Introduce el código de 6 dígitos de tu aplicación.
              </p>
            )}

            <div className="input-group">
              <input 
                className="argus-input"
                type="text" 
                placeholder="000000" 
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength="6"
                pattern="\d*" 
                required
                style={{ 
                  textAlign: 'center', 
                  letterSpacing: '8px', 
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  marginTop: step === 1.5 ? '10px' : '0' 
                }}
                autoFocus
              />
            </div>

            <button type="submit" className="btn-login" style={{ marginTop: '20px' }}>
              VERIFICAR IDENTIDAD
            </button>
            
            <button 
                type="button" 
                onClick={() => { setStep(1); setError(''); setMfaCode(''); }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#666', 
                  marginTop: '15px', 
                  cursor: 'pointer', 
                  fontSize: '0.7rem',
                  textDecoration: 'underline',
                  width: '100%'
                }}
            >
              Regresar al inicio
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
