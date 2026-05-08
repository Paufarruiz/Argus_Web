import React, { useState, useEffect } from 'react';

export default function Informes({ user }) {
  const [hallazgos, setHallazgos] = useState([]);
  const [clienteFiltro, setClienteFiltro] = useState('ALL');
  const [fuenteFiltro, setFuenteFiltro] = useState('ALL');
  const [estadoFiltro, setEstadoFiltro] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllHallazgos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/Api_Argus.php?action=getHallazgosParaInforme`);
        const data = await response.json();
        setHallazgos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar los datos de informes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHallazgos();
  }, []);

  const clientes = [...new Set(hallazgos.map(h => h.cliente_nombre).filter(Boolean))];
  const fuentes = [...new Set(hallazgos.map(h => h.fuente).filter(Boolean))];

  const hallazgosFiltrados = hallazgos.filter(h => {
    const matchCliente = clienteFiltro === 'ALL' || h.cliente_nombre === clienteFiltro;
    const matchFuente = fuenteFiltro === 'ALL' || h.fuente === fuenteFiltro;
    const matchEstado = estadoFiltro === 'ALL' || h.estado === estadoFiltro;
    return matchCliente && matchFuente && matchEstado;
  });

  // Generación de un PDF estructurado (simulado de alto nivel)
  const exportarPDF = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
      <head>
        <title>Informe de Incidencias - Argus Intelligence</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #ffffff;
            background-color: #0e0e12;
            padding: 30px;
            line-height: 1.4;
          }
          .header {
            border-bottom: 2px solid #7b4397;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          h1 {
            color: #7b4397;
            font-size: 22px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
          }
          .subtitle {
            color: #00ff88;
            font-size: 11px;
            text-transform: uppercase;
          }
          .meta-info {
            margin-top: 15px;
            font-size: 10px;
            color: #888;
          }
          .card {
            background-color: #151518;
            border: 1px solid #2a2a32;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 25px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
          }
          th {
            background-color: #1c1c24;
            color: #7b4397;
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #333;
            text-transform: uppercase;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #1c1c24;
            color: #ccc;
          }
          .badge {
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
          }
          .badge.credential_leak { background-color: #dc2430; color: #fff; }
          .badge.source_code_exposure { background-color: #ffaa00; color: #000; }
          .badge.general_mention { background-color: #7b4397; color: #fff; }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #222;
            padding-top: 15px;
            font-size: 9px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Informe Ejecutivo de Seguridad</h1>
          <div class="subtitle">ARGUS INTELLIGENCE — USO CONFID 3290</div>
          <div class="meta-info">
            Fecha: ${new Date().toLocaleDateString('es-ES')} | Usuario: Analista Nivel 3 | Estado: Confidencial
          </div>
        </div>

        <div class="card">
          <p><strong>Total de registros exportados:</strong> ${hallazgosFiltrados.length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>CLIENTE</th>
              <th>FUENTE</th>
              <th>AMENAZA</th>
              <th>SCORE</th>
              <th>ESTADO</th>
              <th>FECHA</th>
            </tr>
          </thead>
          <tbody>
            ${hallazgosFiltrados.map(h => `
              <tr>
                <td>#${h.id}</td>
                <td>${h.cliente_nombre}</td>
                <td>${h.fuente}</td>
                <td>${h.amenaza}</td>
                <td style="color: ${h.score > 80 ? '#dc2430' : '#00ff88'};">${h.score}%</td>
                <td>${h.estado}</td>
                <td>${new Date(h.fecha_registro).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Argus Intelligence &copy; 2026. Sistema de seguridad defensiva.
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.print(); // Abre el cuadro de diálogo PDF nativo del sistema
  };

  return (
    <>
      <header className="main-header">
        <h2>GENERADOR Y FILTRADO DE INFORMES</h2>
      </header>

      <div className="tickets-custom-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'start' }}>
        
        {/* PANEL DE FILTROS */}
        <section className="stat-box" style={{ flex: '1 1 280px', padding: '1.5rem', height: 'fit-content', backgroundColor: '#151518', border: '1px solid #333' }}>
          <div className="argus-form">
            <h3 style={{ color: '#7b4397', marginBottom: '15px', fontSize: '0.85rem' }}>PARÁMETROS DE FILTRADO</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="status-indicator" style={{ marginBottom: '4px', display: 'block', fontSize: '0.65rem' }}>Filtrar por Cliente</label>
                <select 
                  className="argus-select" 
                  style={{ width: '100%', padding: '8px', fontSize: '0.75rem', marginBottom: 0 }}
                  value={clienteFiltro}
                  onChange={(e) => setClienteFiltro(e.target.value)}
                >
                  <option value="ALL">TODOS LOS CLIENTES</option>
                  {clientes.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="status-indicator" style={{ marginBottom: '4px', display: 'block', fontSize: '0.65rem' }}>Filtrar por Fuente</label>
                <select 
                  className="argus-select" 
                  style={{ width: '100%', padding: '8px', fontSize: '0.75rem', marginBottom: 0 }}
                  value={fuenteFiltro}
                  onChange={(e) => setFuenteFiltro(e.target.value)}
                >
                  <option value="ALL">TODAS LAS FUENTES</option>
                  {fuentes.map((f, idx) => (
                    <option key={idx} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="status-indicator" style={{ marginBottom: '4px', display: 'block', fontSize: '0.65rem' }}>Filtrar por Estado</label>
                <select 
                  className="argus-select" 
                  style={{ width: '100%', padding: '8px', fontSize: '0.75rem', marginBottom: 0 }}
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                >
                  <option value="ALL">TODOS LOS ESTADOS</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Resuelto">Resueltos</option>
                </select>
              </div>

              <button 
                className="btn-login" 
                style={{ width: '100%', margin: 0, padding: '12px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                onClick={exportarPDF}
                disabled={hallazgosFiltrados.length === 0}
              >
                📄 GENERAR INFORME PDF ({hallazgosFiltrados.length})
              </button>
            </div>
          </div>
        </section>

        {/* VISTA PREVIA DE DATOS */}
        <section className="table-section" style={{ flex: '3 1 500px', minHeight: '380px' }}>
          <h3>VISTA PREVIA DE DATOS A EXPORTAR</h3>
          <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <table className="argus-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CLIENTE</th>
                  <th>FUENTE</th>
                  <th>AMENAZA</th>
                  <th>SCORE</th>
                  <th>ESTADO</th>
                  <th>FECHA</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', fontSize: '0.75rem' }}>Cargando información...</td></tr>
                ) : hallazgosFiltrados.length > 0 ? (
                  hallazgosFiltrados.slice(0, 50).map(h => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 'bold' }}>#{h.id}</td>
                      <td>{h.cliente_nombre}</td>
                      <td><span className={`badge ${h.fuente.toLowerCase()}`}>{h.fuente}</span></td>
                      <td style={{ fontSize: '0.70rem' }}>{h.amenaza}</td>
                      <td style={{ color: h.score > 80 ? '#dc2430' : '#00ff88', fontWeight: 'bold' }}>{h.score}%</td>
                      <td>
                        <span className={`status-tag ${h.estado === 'Resuelto' ? 'resuelto' : 'pendiente'}`} style={{ fontSize: '0.65rem' }}>
                          {h.estado}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.70rem' }}>{new Date(h.fecha_registro).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: '#888', fontSize: '0.75rem' }}>
                      No se encontraron resultados con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </>
  );
}