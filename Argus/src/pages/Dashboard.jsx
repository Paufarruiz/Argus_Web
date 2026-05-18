import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard({ user }) {
  const [hallazgos, setHallazgos] = useState([]);
  const [filteredHallazgos, setFilteredHallazgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  
  const [filtroAmenaza, setFiltroAmenaza] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_registro', direction: 'desc' });
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  
  const [hallazgoSeleccionado, setHallazgoSeleccionado] = useState(null);

  const tiposValidos = [
    "CREDENTIAL_LEAK", "SOURCE_CODE_EXPOSURE", "THREAT_INTELLIGENCE_MENTION", "BRAND_IMPERSONATION", "GENERAL_MENTION"
  ];

  // Colores para los nuevos gráficos que combinan con tu tema Cyberpunk / Argus
  const COLORS_ESTADO = {
    Pendiente: '#ffaa00',
    Resuelto: '#00ff88'
  };

  const COLORS_AMENAZAS = ['#7b4397', '#dc2430', '#00ff88', '#ffaa00', '#2E75B6'];

  // Procesamiento de datos para los nuevos gráficos
  const datosAmenazas = tiposValidos.map((tipo, index) => ({
    name: tipo.replace(/_/g, ' '),
    cantidad: filteredHallazgos.filter(h => h.amenaza === tipo).length,
    color: COLORS_AMENAZAS[index % COLORS_AMENAZAS.length]
  })).filter(item => item.cantidad > 0);

  const datosEstados = [
    { name: 'Pendiente', value: filteredHallazgos.filter(h => h.estado !== 'Resuelto').length },
    { name: 'Resuelto', value: filteredHallazgos.filter(h => h.estado === 'Resuelto').length }
  ].filter(item => item.value > 0);

  // 1. Carga en tiempo real cada 3 segundos
  useEffect(() => {
    fetchHallazgos();
    const interval = setInterval(fetchHallazgos, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Filtros y ordenamiento
  useEffect(() => {
    let result = Array.isArray(hallazgos) ? [...hallazgos] : [];
    if (filtroAmenaza !== 'ALL') {
      result = result.filter(h => h.amenaza === filtroAmenaza);
    }

    result.sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';
      
      if (sortConfig.key === 'score') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredHallazgos(result);
  }, [hallazgos, filtroAmenaza, sortConfig]);

  const fetchHallazgos = async () => {
    try {
      const response = await fetch(`/api/Api_Argus.php?action=getHallazgos&user_id=${user.id}&role=${user.role}`);
      const data = await response.json();
      
      setHallazgos(Array.isArray(data) ? data : []);
      processChartData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error en la visualización en tiempo real:", error);
    } finally {
      loading && setLoading(false);
    }
  };

  const processChartData = (data) => {
    const grouped = data.reduce((acc, curr) => {
      const date = curr.fecha_registro.split(' ')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    const formatted = sortedDates.map(date => ({
      name: new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      cantidad: grouped[date]
    }));
    setChartData(formatted);
  };

  const requestSortConfig = (key) => {
    let direction = (sortConfig.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // 3. Auditorías
  const registrarAuditoriaEnLog = async (hallazgoId) => {
    try {
      await fetch('/api/Api_Argus.php?action=registrarAuditoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          hallazgo_id: hallazgoCheck(hallazgoId),
          accion: 'ABRIR_INCIDENCIA'
        })
      });
    } catch (e) {
      console.error("No se pudo registrar la auditoría", e);
    }
  };

  const hallazgoCheck = (h_id) => {
    return h_id || 0;
  };

  const abrirDetalleHallazgo = (hallazgo) => {
    setHallazgoSeleccionado(hallazgo);
    setMostrarAlertas(false);
    registrarAuditoriaEnLog(hallazgo.id); // Llamada corregida
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Resuelto' ? 'Pendiente' : 'Resuelto';
    try {
      const response = await fetch('/api/Api_Argus.php?action=actualizarEstadoHallazgo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, estado: nuevoEstado })
      });
      const data = await response.json();
      if (data.success) {
        fetchHallazgos();
        setHallazgoSeleccionado(null);
      } else {
        alert("Error del servidor al actualizar estado.");
      }
    } catch (e) {
      console.error("Error al actualizar el estado de la incidencia", e);
    }
  };

  const hallazgosSinTratar = Array.isArray(hallazgos) ? hallazgos.filter(h => h.estado !== 'Resuelto') : [];

  return (
    <>
      <header className="main-header">
        <h2>FLUJO DE INFORMACIÓN {user.role === 1 ? 'TOTAL' : 'ASIGNADA'}</h2>
        <div className="filter-controls">
          <label>FILTRAR AMENAZA: </label>
          <select className="argus-select" value={filtroAmenaza} onChange={(e) => setFiltroAmenaza(e.target.value)}>
            <option value="ALL">TODAS LAS AMENAZAS</option>
            {tiposValidos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>
      </header>

      {/* SECCIÓN DE GRÁFICOS EXTENDIDA */}
      <section className="chart-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
        
        {/* 1. Histórico Temporal */}
        <div className="chart-container" style={{ width: '100%' }}>
          <h5 style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase' }}>Historial de Incidencias</h5>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b4397" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#7b4397" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#151518', border: '1px solid #333', borderRadius: '4px' }} />
              <Area type="monotone" dataKey="cantidad" stroke="#7b4397" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sub-contenedor para los gráficos inferiores colocados debajo */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
          
          {/* 2. Distribución por Tipo de Amenaza (Letras en blanco y caja agrandada) */}
          <div className="chart-container" style={{ flex: '1 1 350px', minHeight: '310px', backgroundColor: '#151518', padding: '15px', borderRadius: '4px', border: '1px solid #222' }}>
            <h5 style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase' }}>Tipos de Amenazas Activas</h5>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datosAmenazas} layout="vertical" margin={{ left: -5, right: 15, top: 5, bottom: 5 }}>
                <CartesianGrid stroke="#222" horizontal={false} strokeDasharray="3 3"/>
                <XAxis type="number" stroke="#ffffff" fontSize={10} tickLine={false} tick={{ fill: '#ffffff' }} />
                <YAxis dataKey="name" type="category" stroke="#ffffff" fontSize={9} width={95} tickLine={false} tick={{ fill: '#ffffff' }} />
                <Tooltip contentStyle={{ backgroundColor: '#101014', border: '1px solid #333', fontSize: '10px', color: '#ffffff' }} />
                <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                  {datosAmenazas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3. Distribución por Estado (Caja agrandada) */}
          <div className="chart-container" style={{ flex: '1 1 280px', minHeight: '310px', backgroundColor: '#151518', padding: '15px', borderRadius: '4px', border: '1px solid #222' }}>
            <h5 style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase' }}>Resolución (Estados)</h5>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={datosEstados}
                  cx="50%"
                  cy="42%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosEstados.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS_ESTADO[entry.name] || '#7b4397'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#101014', border: '1px solid #333', fontSize: '10px' }} />
                <Legend verticalAlign="bottom" iconSize={9} wrapperStyle={{ fontSize: '10px', color: '#ffffff', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>

      <section className="stats-container">
        <div className="stat-box">
          <h4>HALLAZGOS</h4>
          <p>{filteredHallazgos.length}</p>
        </div>
        <div className="stat-box warning">
          <h4>RIESGO CRÍTICO (&gt;80)</h4>
          <p>{filteredHallazgos.filter(h => h.score > 80).length}</p>
        </div>
        <div className="stat-box info">
          <h4>SCORE PROMEDIO</h4>
          <p>{filteredHallazgos.length > 0 ? Math.round(filteredHallazgos.reduce((acc, h) => acc + parseInt(h.score), 0) / filteredHallazgos.length) : 0}%</p>
        </div>
      </section>

      <section className="table-section">
        <div className="table-responsive">
          <table className="argus-table">
            <thead>
              <tr>
                <th onClick={() => requestSortConfig('cliente_nombre')} className="sortable">CLIENTE</th>
                <th onClick={() => requestSortConfig('fuente')} className="sortable">FUENTE</th>
                <th onClick={() => requestSortConfig('amenaza')} className="sortable">AMENAZA</th>
                <th onClick={() => requestSortConfig('score')} className="sortable">SCORE</th>
                <th onClick={() => requestSortConfig('fecha_registro')} className="sortable">FECHA</th>
                <th onClick={() => requestSortConfig('estado')} className="sortable">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Cargando...</td></tr>
              ) : (
                filteredHallazgos.map((h) => (
                  <tr key={h.id} onClick={() => abrirDetalleHallazgo(h)} style={{ cursor: 'pointer' }}>
                    <td>{h.cliente_nombre}</td>
                    <td><span className={`badge ${h.fuente.toLowerCase()}`}>{h.fuente}</span></td>
                    <td>{h.amenaza}</td>
                    <td className="score-cell">
                      <div className="score-bar-bg">
                        <div className="score-bar-fill" style={{ width: `${h.score}%`, backgroundColor: h.score > 80 ? '#dc2430' : '#7b4397' }}></div>
                      </div>
                      {h.score}%
                    </td>
                    <td>{new Date(h.fecha_registro).toLocaleString()}</td>
                    <td>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleEstado(h.id, h.estado); }} 
                        className={`status-tag ${h.estado === 'Resuelto' ? 'resuelto' : 'pendiente'}`}
                        style={{
                          backgroundColor: h.estado === 'Resuelto' ? '#00ff88' : '#ffaa00',
                          color: '#000',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        {h.estado || 'Pendiente'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PANEL DE ALERTAS EN LA ESQUINA INFERIOR DERECHA */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <button 
          onClick={() => setMostrarAlertas(!mostrarAlertas)} 
          className="btn-login" 
          style={{
            background: hallazgosSinTratar.length > 0 ? '#ff0055' : '#7b4397',
            padding: '12px 20px',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.4)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontWeight: 'bold'
          }}
        >
          🚨 ALERTAS SIN TRATAR ({hallazgosSinTratar.length})
        </button>

        {mostrarAlertas && (
          <div style={{
            position: 'absolute',
            bottom: '60px',
            right: '0',
            width: '320px',
            background: '#101014',
            border: '1px solid #7b4397',
            borderRadius: '6px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            maxHeight: '260px',
            overflowY: 'auto'
          }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: '10px' }}>
              {hallazgosSinTratar.length > 0 ? (
                hallazgosSinTratar.map(h => (
                  <li 
                    key={h.id} 
                    onClick={() => { abrirDetalleHallazgo(h); setMostrarAlertas(false); }}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #222',
                      fontSize: '0.75rem',
                      color: '#bbb',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                  >
                    <strong style={{ color: '#00ff88' }}>{h.cliente_nombre}</strong>
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>{h.amenaza} - Score: {h.score}%</span>
                  </li>
                ))
              ) : (
                <li style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
                  ¡No hay alertas sin tratar!
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* VENTANA MODAL DE DETALLE */}
      {hallazgoSeleccionado && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 10000
        }} onClick={() => setHallazgoSeleccionado(null)}>
          <div className="modal-content legal-modal-box" style={{
            width: '80%', maxWidth: '750px', background: '#0a0a0c',
            border: '2px solid #7b4397', borderRadius: '8px', padding: '35px',
            boxShadow: '0 0 25px rgba(123, 67, 151, 0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <header className="modal-header" style={{
              borderBottom: '1px solid #3c1459', paddingBottom: '15px',
              marginBottom: '20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '1.2rem', color: '#7b4397', margin: 0 }}>
                INCIDENCIA #{hallazgoSeleccionado.id}
              </h3>
              <button 
                onClick={() => setHallazgoSeleccionado(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </header>
            
            <div className="modal-body" style={{ fontSize: '0.95rem', color: '#ddd', lineHeight: '1.6' }}>
              <p><strong>Cliente:</strong> {hallazgoSeleccionado.cliente_nombre}</p>
              <p><strong>Fuente:</strong> <span className={`badge ${hallazgoSeleccionado.fuente.toLowerCase()}`}>{hallazgoSeleccionado.fuente}</span></p>
              <p><strong>Amenaza:</strong> {hallazgoSeleccionado.amenaza}</p>
              <p><strong>Score de Riesgo:</strong> {hallazgoSeleccionado.score}%</p>
              <p><strong>Fecha:</strong> {new Date(hallazgoSeleccionado.fecha_registro).toLocaleString()}</p>
              
              {hallazgoSeleccionado.url && (
                <p><strong>URL asociada:</strong> <a href={hallazgoSeleccionado.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88' }}>Visitar enlace</a></p>
              )}
              
              <p><strong>Estado:</strong> {hallazgoSeleccionado.estado || 'Pendiente'}</p>
              
              <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleToggleEstado(hallazgoSeleccionado.id, hallazgoSeleccionado.estado)}
                  className="btn-login"
                  style={{
                    width: '100%', padding: '12px', fontSize: '0.8rem', textTransform: 'uppercase',
                    cursor: 'pointer', background: hallazgoSeleccionado.estado === 'Resuelto' ? '#00ff88' : '#7b4397', color: '#000'
                  }}
                >
                  {hallazgoSeleccionado.estado === 'Resuelto' ? 'Marcar como Pendiente' : 'Marcar como Resuelto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}