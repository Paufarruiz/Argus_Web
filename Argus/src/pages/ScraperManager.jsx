import React, { useState, useEffect } from 'react';

export default function ScraperManager({ user }) {
  const [clientes, setClientes] = useState([]);
  const [running, setRunning] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [modo, setModo] = useState('basico');

  useEffect(() => {
    fetchData();
    // Refresco automático cada 5 segundos para monitorear el estado real del disco
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    // Validar que el objeto user esté disponible antes de peticionar
    if (!user || !user.id) return;

    try {
      // 1. Cargar lista de clientes autorizados para el selector
      const resC = await fetch(`/api/Api_Argus.php?action=getClientes&user_id=${user.id}&role=${user.role}`);
      const dataC = await resC.json();
      setClientes(Array.isArray(dataC) ? dataC : []);

      // 2. Cargar Nodos Activos (Scripts en C:\Scripts)
      const resS = await fetch(`/api/Api_Argus.php?action=getStatusScraper&user_id=${user.id}&role=${user.role}`);
      
      // Técnica de depuración: Leer como texto primero
      const text = await resS.text();
      try {
        // Intentar parsear el JSON manualmente
        const dataS = JSON.parse(text);
        setRunning(Array.isArray(dataS) ? dataS : []);
      } catch (parseError) {
        // Si el PHP lanza un Warning o Error HTML, lo capturamos aquí sin romper la App
        console.error("DEBUG ARGUS: La API no devolvió un JSON válido. Respuesta recibida:", text);
      }
      
    } catch (err) {
      console.error("Error de conexión con la infraestructura API:", err);
    }
  };

  const handleLaunch = async () => {
    if (!selectedCompany) return alert("⚠️ Selecciona una empresa objetivo antes de desplegar.");
    
    try {
      const res = await fetch('/api/Api_Argus.php?action=startScraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo: modo, companyName: selectedCompany })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`🚀 Motor ARGUS desplegado con éxito para: ${selectedCompany}`);
        fetchData(); // Actualizar inmediatamente la vista
      } else {
        alert("❌ Error en el despliegue: " + (data.message || "Fallo desconocido"));
      }
    } catch (err) { 
      alert("Error crítico de comunicación con el servidor de despliegue."); 
    }
  };

  const handleStop = async () => {
    if (!selectedCompany) return alert("⚠️ Selecciona una empresa para detener procesos.");
    
    if (!window.confirm(`¿Estás seguro de detener los hilos de ejecución y ELIMINAR los archivos de ${selectedCompany}?`)) return;

    try {
      const res = await fetch('/api/Api_Argus.php?action=stopScraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: selectedCompany })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`🛑 Sistema detenido: ${data.message}`);
        fetchData(); 
      } else {
        alert("❌ No se encontraron archivos activos para esta entidad.");
      }
    } catch (err) { 
      alert("Error al intentar comunicar la orden de parada."); 
    }
  };

  return (
    <div className="scraper-view">
      <header className="main-header" style={{ borderBottom: '1px solid #333', marginBottom: '20px', paddingBottom: '10px' }}>
        <h2>CENTRO DE LANZAMIENTO ARGUS</h2>
        <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '5px' }}>
          SESIÓN: <span style={{ color: '#7b4397', fontWeight: 'bold' }}>{user.username.toUpperCase()}</span> | 
          NIVEL: <span style={{ color: '#7b4397', fontWeight: 'bold' }}>{user.role === 1 ? 'ADMIN' : 'ANALISTA'}</span>
        </p>
      </header>

      <div className="scraper-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* PANEL DE CONFIGURACIÓN */}
        <div className="scraper-card" style={{ background: '#101014', border: '1px solid #333', padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ color: '#7b4397', marginBottom: '20px' }}>🎯 CONFIGURACIÓN DE TARGET</h3>
          
          <div className="form-group">
            <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Empresa Objetivo:</label>
            <select 
              className="argus-select" 
              style={{ width: '100%', background: '#1a1a20', color: '#fff', padding: '12px', border: '1px solid #444', borderRadius: '4px', marginTop: '8px' }}
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">-- SELECCIONAR EMPRESA --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '25px' }}>
            <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Intensidad del Motor:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                onClick={() => setModo('basico')}
                style={{ 
                    flex: 1, padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', 
                    background: modo === 'basico' ? '#7b4397' : '#222', color: '#fff', fontWeight: 'bold' 
                }}
              >
                BÁSICO (1x PY)
              </button>
              <button 
                onClick={() => setModo('intensivo')}
                style={{ 
                    flex: 1, padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', 
                    background: modo === 'intensivo' ? '#7b4397' : '#222', color: '#fff', fontWeight: 'bold' 
                }}
              >
                INTENSIVO (2x PY)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
            <button 
                onClick={handleLaunch} 
                style={{ padding: '15px', background: '#7b4397', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
            >
              DESPLEGAR Y LANZAR SCRAPERS
            </button>
            <button 
                onClick={handleStop} 
                style={{ 
                    padding: '15px', background: '#dc2430', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', 
                    opacity: selectedCompany ? 1 : 0.4 
                }}
            >
              DETENER Y BORRAR SISTEMA
            </button>
          </div>
        </div>

        {/* PANEL DE MONITOREO */}
        <div className="scraper-card" style={{ background: '#101014', border: '1px solid #333', padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ color: '#7b4397', marginBottom: '20px' }}>📡 NODOS ACTIVOS (SISTEMA DE ARCHIVOS)</h3>
          <div className="running-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {running.length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center', marginTop: '50px', fontStyle: 'italic' }}>
                No se detectan scripts activos en el directorio de ejecución.
              </p>
            ) : (
              running.map((script, idx) => (
                <div key={idx} style={{ padding: '12px', borderBottom: '1px solid #222', color: '#00ff88', fontFamily: 'monospace', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                      width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%', 
                      marginRight: '12px', boxShadow: '0 0 8px #00ff88' 
                  }}></span> 
                  {script}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}