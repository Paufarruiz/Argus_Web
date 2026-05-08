import React, { useState } from 'react';

export default function Sidebar({ user, onNavigate, onLogout, currentScreen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Cabecera del Sidebar: Contiene el logo y el botón de colapsar */}
      <div className="sidebar-header">
        {!isCollapsed && <div className="sidebar-logo">ARGUS</div>}
        <button className="menu-toggle-internal" onClick={toggleSidebar}>
          {isCollapsed ? '☰' : '✕'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${currentScreen === 'DASHBOARD' ? 'active' : ''}`} 
          onClick={() => onNavigate('DASHBOARD')}
          title="Incidentes"
        >
          <span className="nav-icon">📊</span>
          {!isCollapsed && <span className="nav-text">INCIDENTES</span>}
        </div>

        <div 
          className={`nav-item ${currentScreen === 'CLIENTES' ? 'active' : ''}`} 
          onClick={() => onNavigate('CLIENTES')}
          title="Gestión Clientes"
        >
          <span className="nav-icon">📁</span>
          {!isCollapsed && <span className="nav-text">GESTIÓN CLIENTES</span>}
        </div>

        {user?.role === 1 && (
          <div 
            className={`nav-item ${currentScreen === 'USUARIOS' ? 'active' : ''}`} 
            onClick={() => onNavigate('USUARIOS')}
            title="Gestión Usuarios"
          >
            <span className="nav-icon">👥</span>
            {!isCollapsed && <span className="nav-text">GESTIÓN USUARIOS</span>}
          </div>
        )}

        <div 
          className={`nav-item ${currentScreen === 'IA' ? 'active' : ''}`} 
          onClick={() => onNavigate('IA')}
          title="Inteligencia"
        >
          <span className="nav-icon">🧠</span>
          {!isCollapsed && <span className="nav-text">INTELIGENCIA</span>}
        </div>

        <div 
          className={`nav-item ${currentScreen === 'TICKETS' ? 'active' : ''}`} 
          onClick={() => onNavigate('TICKETS')}
          title="Soporte"
        >
          <span className="nav-icon">🎫</span>
          {!isCollapsed && <span className="nav-text">SOPORTE</span>}
        </div>

        <div 
          className={`nav-item ${currentScreen === 'INFORME' ? 'active' : ''}`} 
          onClick={() => onNavigate('INFORME')}
          title="Exportar Informes"
        >
          <span className="nav-icon">📉</span>
          {!isCollapsed && <span className="nav-text">EXPORTAR INFORMES</span>}
        </div>
      </nav>

      <div className="user-section">
        {!isCollapsed && <p className="user-name">{user?.username}</p>}
        {!isCollapsed && <p className="user-role">{user?.role === 1 ? 'ADMIN' : 'LVL 3'}</p>}
        <button onClick={onLogout} className="btn-logout-sidebar">
          {isCollapsed ? '⏻' : 'DESCONECTAR'}
        </button>
      </div>
    </aside>
  );
}