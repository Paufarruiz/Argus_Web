import React, { useState } from 'react';

export default function IAAssistant({ user }) {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [loading, setLoading] = useState(false);

  const consultarIA = async () => {
    if (!pregunta.trim()) return;
    setLoading(true);
    setRespuesta(""); 

    try {
      const res = await fetch('http://localhost/api/Api_Argus.php?action=askIA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          role: user.role, 
          pregunta: pregunta 
        })
      });
      
      const data = await res.json();
      
      if (data.choices && data.choices[0]) {
        setRespuesta(data.choices[0].message.content);
      } else if (data.error || data.error_ia) {
        const msgError = data.error || (data.raw ? JSON.stringify(data.raw) : "Error desconocido en el nodo");
        setRespuesta(`⚠️ ERROR DEL NODO: ${msgError}`);
      } else {
        setRespuesta("El Motor de Inteligencia no ha devuelto un formato válido.");
      }
    } catch (e) {
      console.error("IA Error:", e);
      setRespuesta("Error crítico: No se pudo establecer conexión con el nodo central.");
    }
    setLoading(false);
  };

  return (
    <>
      <header className="main-header">
        <h2>ASISTENTE DE INTELIGENCIA ARTIFICIAL (THE BRAIN)</h2>
        <div className="status-indicator">
          <span className="dot pulse"></span> NEURAL LINK ACTIVO
        </div>
      </header>
      
      <div className="ia-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* ÁREA DE RESPUESTA CON TEXTO REDUCIDO */}
        <section className="stat-box" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div className="chat-box" style={{ 
            flex: 1, 
            background: '#050505', 
            padding: '20px', 
            borderRadius: '4px', 
            border: '1px solid #1a1a1a',
            fontSize: '0.85rem', // Tamaño de fuente reducido
            lineHeight: '1.4',    // Interlineado más compacto
            color: '#ddd',       // Color ligeramente más suave para lectura larga
            overflowY: 'auto',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace" // Opcional: fuente mono para look hacker
          }}>
            {loading ? (
              <div className="status-indicator">
                <span className="dot pulse"></span> 
                <span style={{marginLeft: '10px', fontSize: '0.75rem', color: '#7b4397'}}>
                  PROCESANDO VECTORES DE AMENAZA...
                </span>
              </div>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {respuesta || "Esperando consulta táctica..."}
              </div>
            )}
          </div>
        </section>

        {/* ÁREA DE ENTRADA */}
        <section className="stat-box" style={{ padding: '1.2rem' }}>
          <div className="input-group-row" style={{ display: 'flex', gap: '15px' }}>
            <input 
              type="text" 
              className="argus-input" 
              style={{ marginBottom: 0, flex: 1, fontSize: '0.9rem' }}
              placeholder="Escriba su consulta para el motor de IA..."
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && consultarIA()}
            />
            <button 
              className="btn-login" 
              onClick={consultarIA} 
              style={{ 
                marginTop: '0', 
                width: '180px', 
                fontSize: '0.8rem',
                opacity: loading ? 0.6 : 1 
              }}
              disabled={loading}
            >
              {loading ? "ANALIZANDO..." : "CONSULTAR IA"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}