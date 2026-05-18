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

  // NUEVA FUNCIÓN DE EXPORTACIÓN ESTRUCTURADA
  const exportarPDF = () => {
    const win = window.open('', '_blank');
    const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    const scoreColor = (s) => s >= 90 ? '#C0392B' : s >= 60 ? '#D35400' : '#1E8449';
    const scoreBg    = (s) => s >= 90 ? '#FADBD8' : s >= 60 ? '#FDEBD0' : '#D5F5E3';
    const estadoBg   = (e) => e === 'Resuelto' ? '#D5F5E3' : '#FDEBD0';
    const estadoFg   = (e) => e === 'Resuelto' ? '#1E8449' : '#D35400';

    const total      = hallazgosFiltrados.length;
    const criticos   = hallazgosFiltrados.filter(h => h.score >= 90).length;
    const pendientes = hallazgosFiltrados.filter(h => h.estado === 'Pendiente').length;
    const resueltos  = hallazgosFiltrados.filter(h => h.estado === 'Resuelto').length;

    win.document.write(`
      <html><head>
      <title>Informe Argus Intelligence</title>
      <style>
        @page { margin: 20mm 18mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; color: #2c2c2c; background: #fff; font-size: 10px; }
        .cover { background: #1A2B4A; color: white; padding: 28px 32px 24px; margin-bottom: 28px; }
        .cover h1 { font-size: 22px; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px; }
        .cover .sub { color: #A8C4E0; font-size: 11px; margin-bottom: 16px; }
        .cover .meta { font-size: 9.5px; color: #ccc; }
        .cover .meta span { color: #FF9494; font-weight: bold; }
        .kpis { display: flex; gap: 12px; margin-bottom: 24px; }
        .kpi { flex: 1; border: 1px solid #D5D8DC; border-radius: 3px; padding: 12px; text-align: center; }
        .kpi .val { font-size: 24px; font-weight: 800; }
        .kpi .lbl { font-size: 8.5px; color: #5D6D7E; margin-top: 3px; text-transform: uppercase; letter-spacing: .5px; }
        h2 { color: #1A2B4A; font-size: 12px; border-bottom: 2.5px solid #2E75B6; padding-bottom: 5px; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: .5px; }
        p { font-size: 9.5px; line-height: 1.6; margin-bottom: 8px; color: #444; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9px; }
        th { background: #1A2B4A; color: white; padding: 7px 8px; text-align: center; font-size: 8.5px; letter-spacing: .4px; }
        td { padding: 6px 8px; border-bottom: 1px solid #E0E0E0; }
        tr:nth-child(even) td { background: #F2F5F8; }
        .id { font-weight: 700; color: #2C3E6B; text-align: center; }
        .score, .estado { text-align: center; font-weight: 700; border-radius: 3px; padding: 2px 5px; }
        .footer-note { border-top: 1px solid #ccc; padding-top: 8px; margin-top: 24px; font-size: 8px; color: #888; text-align: center; }
      </style></head><body>

      <div class="cover">
        <h1>INFORME EJECUTIVO DE SEGURIDAD</h1>
        <div class="sub">Argus Intelligence · Inteligencia de Amenazas y Seguridad Digital</div>
        <div class="meta">
          Fecha de emisión: ${fecha} &nbsp;|&nbsp;
          Clasificación: <span>CONFIDENCIAL</span> &nbsp;|&nbsp;
          Registros exportados: ${total}
        </div>
      </div>

      <div class="kpis">
        <div class="kpi" style="background:#D6E4F0">
          <div class="val" style="color:#1A2B4A">${total}</div>
          <div class="lbl">Total Incidencias</div>
        </div>
        <div class="kpi" style="background:#FADBD8">
          <div class="val" style="color:#C0392B">${criticos}</div>
          <div class="lbl">Críticos (≥90%)</div>
        </div>
        <div class="kpi" style="background:#FDEBD0">
          <div class="val" style="color:#D35400">${pendientes}</div>
          <div class="lbl">Pendientes</div>
        </div>
        <div class="kpi" style="background:#D5F5E3">
          <div class="val" style="color:#1E8449">${resueltos}</div>
          <div class="lbl">Resueltos</div>
        </div>
      </div>

      <h2>Detalle de Incidencias</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>CLIENTE</th><th>FUENTE</th><th>AMENAZA</th><th>SCORE</th><th>ESTADO</th><th>FECHA</th></tr>
        </thead>
        <tbody>
          ${hallazgosFiltrados.map(h => `
            <tr>
              <td class="id">#${h.id}</td>
              <td>${h.cliente_nombre}</td>
              <td style="text-align:center">${h.fuente}</td>
              <td>${h.amenaza.replace(/_/g,' ')}</td>
              <td class="score" style="background:${scoreBg(h.score)};color:${scoreColor(h.score)}">${h.score}%</td>
              <td class="estado" style="background:${estadoBg(h.estado)};color:${estadoFg(h.estado)}">${h.estado}</td>
              <td>${new Date(h.fecha_registro).toLocaleString('es-ES')}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <div class="footer-note">Argus Intelligence © 2026 · Sistema de seguridad defensiva · USO CONFID 3290</div>
      </body></html>
    `);
    win.document.close();
    win.print();
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