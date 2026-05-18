import React, { useState, useEffect } from 'react';

export default function Clientes({ user }) {
  const [clientes, setClientes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', dominios: [], temas_vigilancia: [] });
  const [inputDom, setInputDom] = useState('');
  const [inputTema, setInputTema] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      // Usamos los datos del usuario pasados por props desde App.jsx
      const res = await fetch(`/api/Api_Argus.php?action=getClientes&user_id=${user.id}&role=${user.role}`);
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("Error al sincronizar objetivos:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const action = editingId ? 'updateCliente' : 'addCliente';
    const payload = editingId ? { ...formData, id: editingId } : formData;

    await fetch(`/api/Api_Argus.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    resetForm();
    fetchClientes();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿CONFIRMAR ELIMINACIÓN TÁCTICA?")) {
      await fetch(`/api/Api_Argus.php?action=deleteCliente&id=${id}`);
      fetchClientes();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ nombre: '', dominios: [], temas_vigilancia: [] });
    setInputDom('');
    setInputTema('');
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      nombre: c.nombre,
      dominios: Array.isArray(c.dominios) ? c.dominios : [],
      temas_vigilancia: Array.isArray(c.temas_vigilancia) ? c.temas_vigilancia : []
    });
  };

  return (
    <>
      <header className="main-header">
        <h2>ADMINISTRACIÓN DE OBJETIVOS DE VIGILANCIA</h2>
        <div className="status-indicator">
          <span className="dot pulse"></span> BASE DE DATOS ACTIVA
        </div>
      </header>

      <div className="clientes-view">
        {/* FORMULARIO: Solo visible para Admins (Rol 1) */}
        {user.role === 1 && (
          <section className="stat-box" style={{ padding: '2rem', borderTop: '1px solid #7b4397' }}>
            <form onSubmit={handleSave} className="argus-form">
              <h3>{editingId ? 'MODIFICAR REGISTRO' : 'NUEVO OBJETIVO'}</h3>
              
              <div className="field-group">
                <label style={{ fontSize: '0.65rem', color: '#7b4397', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>ORGANIZACIÓN</label>
                <input 
                  type="text" 
                  placeholder="IDENTIFICADOR DEL CLIENTE" 
                  value={formData.nombre} 
                  className="argus-input"
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                  required 
                />
              </div>

              <div className="field-group">
                <label style={{ fontSize: '0.65rem', color: '#7b4397', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>INFRAESTRUCTURA (DOMINIOS)</label>
                <div className="input-group-row">
                  <input 
                    type="text" 
                    placeholder="AÑADIR URL O IP" 
                    value={inputDom} 
                    onChange={e => setInputDom(e.target.value)} 
                    className="argus-input"
                  />
                  <button type="button" className="btn-add" onClick={() => {
                    if(inputDom) setFormData({...formData, dominios: [...formData.dominios, inputDom]});
                    setInputDom('');
                  }}>+</button>
                </div>
                <div className="tags-container">
                  {formData.dominios.map((d, i) => (
                    <span key={i} className="badge github" onClick={() => setFormData({...formData, dominios: formData.dominios.filter((_, idx) => idx !== i)})}>
                      {d} ×
                    </span>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label style={{ fontSize: '0.65rem', color: '#7b4397', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>INTELIGENCIA (KEYWORDS)</label>
                <div className="input-group-row">
                  <input 
                    type="text" 
                    placeholder="TEMA DE VIGILANCIA" 
                    value={inputTema} 
                    onChange={e => setInputTema(e.target.value)} 
                    className="argus-input"
                  />
                  <button type="button" className="btn-add" onClick={() => {
                    if(inputTema) setFormData({...formData, temas_vigilancia: [...formData.temas_vigilancia, inputTema]});
                    setInputTema('');
                  }}>+</button>
                </div>
                <div className="tags-container">
                  {formData.temas_vigilancia.map((t, i) => (
                    <span key={i} className="badge darkweb" onClick={() => setFormData({...formData, temas_vigilancia: formData.temas_vigilancia.filter((_, idx) => idx !== i)})}>
                      {t} ×
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-login" style={{ width: '100%', marginTop: '10px' }}>
                {editingId ? 'ACTUALIZAR OBJETIVO' : 'DAR DE ALTA EN ARGUS'}
              </button>
              
              {editingId && (
                <button type="button" className="btn-logout-sidebar" style={{ width: '100%', marginTop: '10px' }} onClick={resetForm}>
                  CANCELAR EDICIÓN
                </button>
              )}
            </form>
          </section>
        )}

        {/* LISTADO: Si no es admin, la tabla ocupa todo el ancho */}
        <section className="table-section" style={{ gridColumn: user.role !== 1 ? '1 / span 2' : 'auto' }}>
          <h3>OBJETIVOS BAJO VIGILANCIA {user.role === 1 ? 'TOTAL' : 'ASIGNADA'}</h3>
          <div className="table-responsive">
            <table className="argus-table">
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>DOMINIOS</th>
                  <th>TEMAS</th>
                  {user.role === 1 && <th style={{ textAlign: 'right' }}>ACCIONES</th>}
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 'bold', color: '#eee' }}>{c.nombre}</td>
                    <td>{c.dominios?.length || 0}</td>
                    <td>{c.temas_vigilancia?.length || 0}</td>
                    {user.role === 1 && (
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action" onClick={() => handleEdit(c)}>EDITAR</button>
                        <button className="btn-action" style={{ color: '#dc2430', marginLeft: '10px' }} onClick={() => handleDelete(c.id)}>BORRAR</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}