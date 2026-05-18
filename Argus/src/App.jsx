import React, { useState, useEffect } from 'react';
import LoginScreen from './pages/Login';
import DashboardScreen from './pages/Dashboard';
import ClientesScreen from './pages/Clientes';
import UsuariosScreen from './pages/GestionUsuarios';
import IAAssistantScreen from './pages/IAAssistant';
import Sidebar from './components/Sidebar';
import ModalLegal from './components/ModalLegal'; 
import TicketsScreen from './pages/Tickets';
import Informe from './pages/Informes';
import ScraperManager from './pages/ScraperManager';
import './App.css';

export default function App() {
  // 1. Inicialización inteligente: revisa si hay datos guardados antes del primer renderizado
  const [userData, setUserData] = useState(() => {
    const sessionUser = localStorage.getItem('argus_user_data');
    return sessionUser ? JSON.parse(sessionUser) : null;
  });

  const [currentScreen, setCurrentScreen] = useState(() => {
    const sessionScreen = localStorage.getItem('argus_current_screen');
    // Si hay usuario guardado pero la pantalla se quedó en LOGIN por error, forzamos DASHBOARD
    if (sessionScreen === 'LOGIN' && localStorage.getItem('argus_user_data')) {
      return 'DASHBOARD';
    }
    return sessionScreen || 'LOGIN';
  });

  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // 2. Efecto para recordar la pantalla actual si el usuario navega dentro de la app
  useEffect(() => {
    if (userData) {
      localStorage.setItem('argus_current_screen', currentScreen);
    }
  }, [currentScreen, userData]);

  // Al iniciar sesión con éxito, guardamos todo en el almacenamiento del navegador
  const handleLoginSuccess = (user) => {
    setUserData(user);
    setCurrentScreen('DASHBOARD');
    localStorage.setItem('argus_user_data', JSON.stringify(user));
    localStorage.setItem('argus_current_screen', 'DASHBOARD');
  };

  // Al cerrar sesión, limpiamos el almacenamiento por completo
  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('LOGIN');
    localStorage.removeItem('argus_user_data');
    localStorage.removeItem('argus_current_screen');
  };

  return (
    <div className="app-container">
      {currentScreen === 'LOGIN' ? (
        /* PANTALLA DE LOGIN */
        <LoginScreen onLogin={handleLoginSuccess} />
      ) : (
        /* ENTORNO PRINCIPAL ARGUS */
        <div className="dashboard-wrapper">
          <Sidebar 
            user={userData} 
            onNavigate={setCurrentScreen} 
            onLogout={handleLogout} 
            currentScreen={currentScreen} 
          />
          
          <main className="main-content">
            {/* Área de Contenido Dinámico */}
            <div className="page-content">
              {currentScreen === 'DASHBOARD' && <DashboardScreen user={userData} />}
              {currentScreen === 'CLIENTES' && <ClientesScreen user={userData} />}
              {currentScreen === 'USUARIOS' && <UsuariosScreen user={userData} />}
              {currentScreen === 'IA' && <IAAssistantScreen user={userData} />}
              {currentScreen === 'TICKETS' && <TicketsScreen user={userData} />}
              {currentScreen === 'INFORME' && <Informe user={userData} />}
              {currentScreen === 'ScraperManager' && <ScraperManager user={userData} />}
            </div>

            {/* --- PIE DE PÁGINA TÁCTICO (FOOTER) --- */}
            <footer className="argus-footer">
              <div className="footer-line"></div>
              <div className="footer-content">
                <div className="footer-left">
                  <span className="status-dot green"></span>
                  SISTEMA ARGUS v3.0.26 | NIVEL DE ACCESO: {userData?.role === 1 ? 'ADMIN' : 'ANALYST'}
                </div>
                <div className="footer-center">
                  PROPIEDAD DE ARGUS INTELLIGENCE — USO ESTRICTAMENTE DEFENSIVO
                </div>
                <div className="footer-right">
                  <span className="legal-link" onClick={() => setIsLegalOpen(true)}>AVISO LEGAL</span>
                  <span className="legal-link">PRIVACIDAD</span>
                </div>
              </div>
            </footer>
          </main>

          {/* COMPONENTE MODAL */}
          <ModalLegal 
            isOpen={isLegalOpen} 
            onClose={() => setIsLegalOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}