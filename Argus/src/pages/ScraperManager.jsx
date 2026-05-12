import React, { useState, useEffect } from 'react';

export default function ScraperManager({ user }) {
  const [clientes, setClientes] = useState([]);
  const [running, setRunning] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [modo, setModo] = useState('basico');

  useEffect(() => {
    fetchData();
    // Intervalo de actualización cada 5 segundos para monitorear cambios en tiempo real
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // 1. Cargamos los clientes autorizados para el usuario actual
      const resC = await fetch(`http://localhost/api/Api_Argus.php?action=getClientes&user_id=${user.id}&role=${user.role}`);
      const dataC = await resC.json();
      setClientes(Array.isArray(dataC) ? dataC : []);

      // 2. Cargamos los nodos activos filtrados (solo los que pertenecen a empresas del usuario)
      // Se añaden los parámetros user_id y role para que la API aplique el filtro de visibilidad
      const resS = await fetch(`http://localhost/api/Api_Argus.php?action=getStatusScraper&user_id=${user.id}&role=${user.role}`);
      const dataS = await resS.json();
      setRunning(Array.isArray(dataS) ? dataS : []);
      
    } catch (err) {
      console.error("Error cargando datos del ScraperManager:", err);
    }
  };

  const handleLaunch = async () => {
    if (!selectedCompany) return alert("⚠️ Selecciona una empresa objetivo");
    
    try {
      const res = await fetch('http://localhost/api/Api_Argus.php?action=startScraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo: modo, companyName: selectedCompany })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`🚀 Despliegue completado y ejecución iniciada para ${selectedCompany}`);
        fetchData(); // Refrescar lista inmediatamente
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) { 
      alert("Fallo de conexión con el servidor"); 
    }
  };

  const handleStop = async () => {
    if (!selectedCompany) return alert("⚠️ Selecciona la empresa que deseas detener");
    
    if (!window.confirm(`¿Estás seguro de que deseas detener los procesos y borrar los archivos de ${selectedCompany}?`)) return;

    try {
      const res = await fetch('http://localhost/api/Api_Argus.php?action=stopScraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: selectedCompany })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`🛑 ${data.message}`);
        fetchData(); // Refrescar lista inmediatamente
      } else {
        alert("❌ No se encontraron procesos activos para esta empresa.");
      }
    } catch (err) { 
      alert("Fallo de conexión con el servidor"); 
    }
  };

  return (
    <div className="scraper-view">
      <header className="main-header">
        <h2>CENTRO DE LANZAMIENTO ARGUS</h2>
        <p style={{ color: '#888', fontSize: '0.8rem' }}>
          SESIÓN: {user.username.toUpperCase()} | NIVEL: {user.role === 1 ? 'ADMIN' : 'ANALISTA'}
        </p>
      </header>

      <div className="scraper-grid">
        {/* PANEL DE CONTROL */}
        <div className="scraper-card" style={{ background: '#101014', border: '1px solid #333', padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ color: '#7b4397', marginBottom: '20px' }}>🎯 CONFIGURACIÓN DE TARGET</h3>
          
          <div className="form-group">
            <label>Empresa Objetivo:</label>
            <select 
              className="argus-select" 
              style={{ width: '100%', background: '#1a1a20', color: '#fff', padding: '10px' }}
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">-- SELECCIONAR EMPRESA --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Modo de Ejecución:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                className={`mode-btn ${modo === 'basico' ? 'active' : ''}`}
                onClick={() => setModo('basico')}
                style={{ 
                  flex: 1, padding: '10px', cursor: 'pointer', border: 'none', borderRadius: '4px',
                  background: modo === 'basico' ? '#7b4397' : '#222', color: '#fff' 
                }}
              >
                BÁSICO (1x PY)
              </button>
              <button 
                className={`mode-btn ${modo === 'intensivo' ? 'active' : ''}`}
                onClick={() => setModo('intensivo')}
                style={{ 
                  flex: 1, padding: '10px', cursor: 'pointer', border: 'none', borderRadius: '4px',
                  background: modo === 'intensivo' ? '#7b4397' : '#222', color: '#fff' 
                }}
              >
                INTENSIVO (2x PY)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '25px' }}>
            <button className="btn-launch" onClick={handleLaunch} style={{ padding: '15px', background: '#7b4397', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
              DESPLEGAR Y LANZAR SCRAPERS
            </button>
            
            <button className="btn-stop" onClick={handleStop} style={{ padding: '15px', background: '#dc2430', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', opacity: selectedCompany ? 1 : 0.5 }}>
              DETENER Y BORRAR SISTEMA
            </button>
          </div>
        </div>

        {/* PANEL DE MONITOREO FILTRADO */}
        <div className="scraper-card" style={{ background: '#101014', border: '1px solid #333', padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ color: '#7b4397', marginBottom: '20px' }}>📡 NODOS ACTIVOS (VISTA PERSONALIZADA)</h3>
          <div className="running-list">
            {running.length === 0 ? (
              <p style={{ color: '#555', fontSize: '0.9rem' }}>No hay procesos activos para tus empresas asignadas.</p>
            ) : (
              running.map((script, idx) => (
                <div key={idx} style={{ 
                  padding: '10px', borderBottom: '1px solid #222', color: '#00ff88', 
                  fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', alignItems: 'center' 
                }}>
                  <span style={{ marginRight: '10px', fontSize: '10px' }}>●</span> {script}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}