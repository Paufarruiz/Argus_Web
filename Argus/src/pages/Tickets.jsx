import React, { useState, useEffect } from 'react';

export default function Tickets({ user }) {
  const [tickets, setTickets] = useState([]);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [hiloMensajes, setHiloMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [imagenBase64, setImagenBase64] = useState(null);
  
  const [asunto, setAsunto] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [clientesPermitidos, setClientesPermitidos] = useState([]);

  const asuntosValidos = [
    "Revisión de Alertas Falsas",
    "Reporte de Vulnerabilidad Crítica",
    "Soporte de Inteligencia",
    "Fallo en Scrapers",
    "Petición de Acceso a Clientes"
  ];

  // 1. Carga inicial
  useEffect(() => {
    fetchTickets();
    fetchClientesAsignados();
  }, []);

  // 2. Tiempo real para el chat (Polling)
  useEffect(() => {
    let intervalId = null;

    if (ticketSeleccionado) {
      fetchHiloMensajes(ticketSeleccionado.id);

      intervalId = setInterval(() => {
        fetchHiloMensajesSilencioso(ticketSeleccionado.id);
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ticketSeleccionado]);

  const fetchTickets = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`http://localhost/api/Api_Argus.php?action=getTickets&user_id=${user.id}&role=${user.role}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al obtener tickets:", e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const fetchClientesAsignados = async () => {
    try {
      const res = await fetch(`http://localhost/api/Api_Argus.php?action=getClientes&user_id=${user.id}&role=${user.role}`);
      const data = await res.json();
      setClientesPermitidos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al cargar clientes:", e);
    }
  };

  const fetchHiloMensajes = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost/api/Api_Argus.php?action=getHiloMensajes&ticket_id=${ticketId}`);
      const data = await res.json();
      setHiloMensajes(Array.isArray(data) ? data : []);
      localStorage.setItem(`ticket_visto_${ticketId}`, 'true'); // Marca como visto
    } catch (e) {
      console.error("Error al cargar mensajes:", e);
    }
  };

  const fetchHiloMensajesSilencioso = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost/api/Api_Argus.php?action=getHiloMensajes&ticket_id=${ticketId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHiloMensajes(data);
        // Si hay un nuevo mensaje de otra persona, quitamos el visto para que salte la alerta
        if (data.length > 0) {
          const ultimoMensaje = data[data.length - 1];
          if (String(ultimoMensaje.usuario_id) !== String(user.id)) {
            localStorage.removeItem(`ticket_visto_${ticketId}`);
          }
        }
      }
    } catch (e) {
      // Silenciar errores de fondo
    }
  };

  const handleCrearTicket = async (e) => {
    e.preventDefault();
    if (!asunto || !clienteNombre || !mensaje) {
      alert("Por favor, rellene todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost/api/Api_Argus.php?action=crearTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          cliente_nombre: clienteNombre,
          asunto,
          mensaje
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("Ticket creado correctamente.");
        setAsunto(''); // Asunto
        setClienteNombre('');
        setMensaje('');
        fetchTickets();
      } else {
        alert(data.message || "Error al crear el ticket.");
      }
    } catch (e) {
      console.error("Error al enviar el ticket:", e);
      alert("Error crítico de red.");
    }
    setLoading(false);
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch('http://localhost/api/Api_Argus.php?action=actualizarEstadoTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, estado: nuevoEstado })
      });
      const data = await response.json();
      if (data.success || response.ok) {
        fetchTickets();
      }
    } catch (e) {
      console.error("Error al actualizar el estado:", e);
    }
  };

  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnviarMensajeHilo = async () => {
    if (!nuevoMensaje.trim() && !imagenBase64) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost/api/Api_Argus.php?action=enviarMensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketSeleccionado.id,
          usuario_id: user.id,
          mensaje: nuevoMensaje,
          imagen: imagenBase64
        })
      });
      const data = await response.json();
      if (data.success) {
        setNuevoMensaje('');
        setImagenBase64(null);
        fetchHiloMensajes(ticketSeleccionado.id);
        fetchTickets();
      } else {
        alert("Error al enviar el mensaje: " + data.message);
      }
    } catch (e) {
      console.error("Error al enviar mensaje:", e);
    }
    setLoading(false);
  };

  const tieneMensajesNuevos = (t) => {
    if (t.estado !== 'En Proceso') return false;
    
    // Comprueba si el ticket fue visto (se borra al entrar al chat o al responder)
    const fueVisto = localStorage.getItem(`ticket_visto_${t.id}`);
    if (fueVisto) return false;

    if (hiloMensajes && hiloMensajes.length > 0) {
      const ultimoMensaje = hiloMensajes[hiloMensajes.length - 1];
      // Si el último mensaje fue escrito por el usuario actual, no debe aparecer
      if (String(ultimoMensaje.usuario_id) === String(user.id)) {
        return false;
      }
    }
    
    return true;
  };

  return (
    <>
      <header className="main-header">
        <h2>GESTIÓN Y SOPORTE DE INCIDENCIAS (TICKETS)</h2>
        <button 
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`} 
          onClick={fetchTickets}
          title="Refrescar tickets"
        >
          {refreshing ? '⌛' : '🔄'} REFRESCAR
        </button>
      </header>

      <div className="tickets-custom-wrapper">
        <section className="stat-box" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <div className="argus-form">
            <h3 style={{ color: '#7b4397', marginBottom: '15px', fontSize: '0.85rem' }}>NUEVO TICKET DE SOPORTE</h3>
            <form onSubmit={handleCrearTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="status-indicator" style={{ marginBottom: '4px', display: 'block', fontSize: '0.65rem' }}>Asunto</label>
                <select 
                  className="argus-select" 
                  style={{ width: '100%', marginBottom: 0, padding: '8px', fontSize: '0.75rem' }}
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar Asunto --</option>
                  {asuntosValidos.map((opcion, index) => (
                    <option key={index} value={opcion}>{opcion}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="status-indicator" style={{ marginBottom: '4px', display: 'block', fontSize: '0.65rem' }}>Empresa/Cliente Objetivo</label>
                <select 
                  className="argus-select" 
                  style={{ width: '100%', marginBottom: 0, padding: '8px', fontSize: '0.75rem' }}
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar Empresa --</option>
                  {clientesPermitidos.map((c) => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="status-indicator" style={{ marginBottom: '4px', display: 'block', fontSize: '0.65rem' }}>Detalle del Problema</label>
                <textarea 
                  className="argus-input" 
                  style={{ height: '70px', width: '100%', resize: 'none', marginBottom: 0, padding: '10px', fontSize: '0.75rem' }}
                  placeholder="Explique el comportamiento inesperado..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-login" 
                style={{ width: '100%', margin: 0, padding: '10px', fontSize: '0.75rem' }}
                disabled={loading}
              >
                {loading ? "ENVIANDO..." : "ABRIR TICKET"}
              </button>
            </form>
          </div>
        </section>

        <section className="table-section" style={{ minHeight: '380px' }}>
          <h3>HISTORIAL Y CONTROL DE TICKETS</h3>
          <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="argus-table">
              <thead>
                <tr>
                  <th>USUARIO</th>
                  <th>CLIENTE</th>
                  <th>ASUNTO</th>
                  <th>ESTADO</th>
                  <th style={{ textAlign: 'right' }}>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: '#7b4397', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {t.usuario_username}

                        {tieneMensajesNuevos(t) && (
                          <span style={{
                            marginLeft: '10px',
                            backgroundColor: '#ff0055',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.6rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            animation: 'parpadeo 1.5s infinite'
                          }} title="El ticket tiene mensajes pendientes">
                            ¡NUEVO MENSAJE!
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>{t.cliente_nombre}</td>
                      <td style={{ fontSize: '0.75rem' }}>{t.asunto}</td>
                      <td>
                        <span className={`status-tag ${t.estado.toLowerCase().replace(' ', '-')}`}>
                          {t.estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {user.role === 1 ? (
                          <select 
                            className="argus-select" 
                            style={{ padding: '3px 6px', fontSize: '0.65rem', width: 'auto', display: 'inline' }}
                            value={t.estado}
                            onChange={(e) => handleActualizarEstado(t.id, e.target.value)}
                          >
                            <option value="Abierto">Abierto</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Resuelto">Resuelto</option>
                          </select>
                        ) : null}
                        
                        <button 
                          className="btn-action" 
                          style={{ fontSize: '0.65rem', marginLeft: '6px' }}
                          onClick={() => setTicketSeleccionado(t)}
                        >
                          {user.role === 1 ? 'GESTIONAR' : 'VER DETALLES'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#555', fontSize: '0.75rem' }}>No se han registrado incidencias en la red.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL DE CONVERSACIÓN AMPLIADO Y MÁS ANCHO */}
      {ticketSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content legal-modal-box" style={{ maxWidth: '750px' }}>
            <header className="modal-header">
              <h3 style={{ fontSize: '1rem', color: '#7b4397', margin: 0 }}>
                TICKET #{ticketSeleccionado.id} - {ticketSeleccionado.asunto}
              </h3>
              <button className="btn-close" onClick={() => { setTicketSeleccionado(null); setImagenBase64(null); }}>×</button>
            </header>
            
            <div className="modal-body" style={{ fontSize: '0.85rem', color: '#bbb' }}>
              
              <div className="chat-historial-ampliado">
                <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '12px', marginBottom: '12px' }}>
                  <strong>{ticketSeleccionado.usuario_username} (Creador):</strong>
                  <p style={{ color: '#eee', marginTop: '6px' }}>{ticketSeleccionado.mensaje}</p>
                </div>

                {hiloMensajes.map((m, index) => (
                  <div key={index} style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '10px', marginBottom: '10px' }}>
                    <strong>{m.usuario_username}:</strong>
                    <p style={{ marginTop: '6px' }}>{m.mensaje}</p>
                    {m.imagen && (
                      <img src={m.imagen} alt="Adjunto" style={{ maxWidth: '65%', height: 'auto', display: 'block', marginTop: '12px', borderRadius: '4px', border: '1px solid #3c1459' }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '25px' }}>
                {ticketSeleccionado.estado === 'Resuelto' ? (
                  <div style={{ background: '#2a083a', border: '1px solid #7b4397', padding: '15px', borderRadius: '4px', textAlign: 'center', color: '#00ff88', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🔒 Este ticket se encuentra Resuelto y cerrado a nuevas respuestas.
                  </div>
                ) : (
                  <>
                    <textarea 
                      className="argus-input chat-textarea-ampliado" 
                      placeholder="Escribe una respuesta para la conversación..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                      <label style={{ fontSize: '0.7rem', color: '#7b4397', cursor: 'pointer', border: '1px solid #7b4397', padding: '8px 16px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        📎 ADJUNTAR IMAGEN
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleArchivoSeleccionado} />
                      </label>
                      {imagenBase64 && <span style={{ color: '#00ff88', fontSize: '0.7rem' }}>Imagen cargada lista para enviar.</span>}
                    </div>

                    <button 
                      className="btn-login" 
                      style={{ width: '100%', padding: '15px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                      onClick={handleEnviarMensajeHilo}
                      disabled={loading}
                    >
                      {loading ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}