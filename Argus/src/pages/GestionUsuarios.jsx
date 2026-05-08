import React, { useState, useEffect } from 'react';

export default function GestionUsuarios({ user }) {
  const [analistas, setAnalistas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const resU = await fetch('/api/Api_Argus.php?action=getUsuariosAnalistas');
      const resC = await fetch('/api/Api_Argus.php?action=getClientes&role=1');
      const resA = await fetch('/api/Api_Argus.php?action=getAsignaciones');
      
      setAnalistas(await resU.json());
      setClientes(await resC.json());
      setAsignaciones(await resA.json());
    } catch (error) {
      console.error("Error en la orquestación de privilegios:", error);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleAsignar = async () => {
    if (!selectedUser || !selectedCliente) return alert("Seleccione ambos campos");

    const response = await fetch('/api/Api_Argus.php?action=asignarCliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: selectedUser, cliente_id: selectedCliente })
    });
    
    const data = await response.json();
    if (data.success) {
      fetchData(); 
    } else {
      alert(data.message || "Error al asignar");
    }
  };

  const handleEliminar = async (uId, cId) => {
    if (window.confirm("¿Revocar acceso de este analista a la empresa?")) {
      await fetch(`/api/Api_Argus.php?action=eliminarAsignacion&user_id=${uId}&cliente_id=${cId}`);
      fetchData();
    }
  };

  return (
    <>
      <header className="main-header">
        <h2>CONTROL DE ACCESO BASADO EN ROLES (RBAC)</h2>
        <button 
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`} 
          onClick={fetchData}
          title="Refrescar datos"
        >
          {refreshing ? '⌛' : '🔄'} REFRESCAR
        </button>
      </header>

      <div className="clientes-view">
        <section className="stat-box" style={{ padding: '2rem' }}>
          <div className="argus-form">
            <h3>VINCULAR NUEVO ACCESO</h3>
            
            <div className="field-group" style={{marginTop: '15px'}}>
              <label className="status-indicator">ANALISTA LVL 3</label>
              <select className="argus-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">-- Seleccionar Analista --</option>
                {analistas.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>

            <div className="field-group" style={{marginTop: '15px'}}>
              <label className="status-indicator">EMPRESA OBJETIVO</label>
              <select className="argus-select" value={selectedCliente} onChange={e => setSelectedCliente(e.target.value)}>
                <option value="">-- Seleccionar Empresa --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <button className="btn-login" style={{width: '100%', marginTop: '20px'}} onClick={handleAsignar}>
              AUTORIZAR PRIVILEGIOS
            </button>
          </div>
        </section>

        <section className="table-section">
          <h3>MAPA DE ACCESOS ACTIVOS</h3>
          <div className="table-responsive">
            <table className="argus-table">
              <thead>
                <tr>
                  <th>ANALISTA</th>
                  <th>CLIENTE ASIGNADO</th>
                  <th style={{ textAlign: 'right' }}>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.length > 0 ? (
                  asignaciones.map((asig, index) => (
                    <tr key={index}>
                      <td style={{ color: '#7b4397', fontWeight: 'bold' }}>{asig.username}</td>
                      <td>{asig.cliente_nombre}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-action" 
                          style={{ color: '#dc2430' }}
                          onClick={() => handleEliminar(asig.usuario_id, asig.cliente_id)}
                        >
                          REVOCAR
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" style={{textAlign: 'center'}}>No hay accesos configurados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}