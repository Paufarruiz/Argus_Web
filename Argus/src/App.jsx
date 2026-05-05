import React, { useState } from 'react';
import LoginScreen from './pages/Login';
import DashboardScreen from './pages/Dashboard';
import ClientesScreen from './pages/Clientes';
import UsuariosScreen from './pages/GestionUsuarios';
import IAAssistantScreen from './pages/IAAssistant';
import Sidebar from './components/Sidebar';
import ModalLegal from './components/ModalLegal'; 
import TicketsScreen from './pages/Tickets';
import Informe from './pages/Informes';
import './App.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  const [userData, setUserData] = useState(null);
  const [isLegalOpen, setIsLegalOpen] = useState(false); // Estado para el Modal

  const handleLoginSuccess = (user) => {
    setUserData(user);
    setCurrentScreen('DASHBOARD');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('LOGIN');
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
                  {/* Al hacer clic, activamos el Modal */}
                  <span className="legal-link" onClick={() => setIsLegalOpen(true)}>AVISO LEGAL</span>
                  <span className="legal-link">PRIVACIDAD</span>
                </div>
              </div>
            </footer>
          </main>

          {/* COMPONENTE MODAL (Solo se ve cuando isLegalOpen es true) */}
          <ModalLegal 
            isOpen={isLegalOpen} 
            onClose={() => setIsLegalOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}