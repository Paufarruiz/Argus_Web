import React from 'react';

export default function Sidebar({ user, onNavigate, onLogout, currentScreen }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">ARGUS</div>
      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${currentScreen === 'DASHBOARD' ? 'active' : ''}`} 
          onClick={() => onNavigate('DASHBOARD')}
        >
          INCIDENTES
        </div>
        <div 
          className={`nav-item ${currentScreen === 'CLIENTES' ? 'active' : ''}`} 
          onClick={() => onNavigate('CLIENTES')}
        >
          GESTIÓN CLIENTES
        </div>
        {user?.role === 1 && (
          <div 
            className={`nav-item ${currentScreen === 'USUARIOS' ? 'active' : ''}`} 
            onClick={() => onNavigate('USUARIOS')}
          >
            GESTIÓN USUARIOS
          </div>
        )}
        <div 
          className={`nav-item ${currentScreen === 'IA' ? 'active' : ''}`} 
          onClick={() => onNavigate('IA')}
        >
          INTELIGENCIA (THE BRAIN)
        </div>
        <div 
          className={`nav-item ${currentScreen === 'TICKETS' ? 'active' : ''}`} 
          onClick={() => onNavigate('TICKETS')}
        >
          SOPORTE (TICKETS)
        </div>
      </nav>
      <div className="user-section">
        <p className="user-name">{user?.username}</p>
        <p className="user-role">{user?.role === 1 ? 'ADMINISTRADOR' : 'ANALISTA LVL 3'}</p>
        <button onClick={onLogout} className="btn-logout-sidebar">DESCONECTAR</button>
      </div>
    </aside>
  );
}