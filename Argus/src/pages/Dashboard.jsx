import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }) {
  const [hallazgos, setHallazgos] = useState([]);
  const [filteredHallazgos, setFilteredHallazgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  
  const [filtroAmenaza, setFiltroAmenaza] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_registro', direction: 'desc' });

  const tiposValidos = [
    "CREDENTIAL_LEAK", "SOURCE_CODE_EXPOSURE", "THREAT_INTELLIGENCE_MENTION", "BRAND_IMPERSONATION", "GENERAL_MENTION"
  ];

  useEffect(() => {
    fetchHallazgos();
    const interval = setInterval(fetchHallazgos, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...hallazgos];
    if (filtroAmenaza !== 'ALL') result = result.filter(h => h.amenaza === filtroAmenaza);

    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'score') return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredHallazgos(result);
  }, [hallazgos, filtroAmenaza, sortConfig]);

  const fetchHallazgos = async () => {
    try {
      const response = await fetch(`http://localhost/api/Api_Argus.php?action=getHallazgos&user_id=${user.id}&role=${user.role}`);
      const data = await response.json();
      setHallazgos(data);
      processChartData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error en la visualización:", error);
      setLoading(false);
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

  const requestSort = (key) => {
    let direction = (sortConfig.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

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

      <section className="chart-section">
        <div className="chart-container">
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
                <th onClick={() => requestSort('cliente_nombre')} className="sortable">CLIENTE</th>
                <th onClick={() => requestSort('fuente')} className="sortable">FUENTE</th>
                <th onClick={() => requestSort('amenaza')} className="sortable">AMENAZA</th>
                <th onClick={() => requestSort('score')} className="sortable">SCORE</th>
                <th onClick={() => requestSort('fecha_registro')} className="sortable">FECHA</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign: 'center'}}>Cargando...</td></tr>
              ) : (
                filteredHallazgos.map((h) => (
                  <tr key={h.id} className={h.score > 80 ? 'row-critical' : ''}>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}