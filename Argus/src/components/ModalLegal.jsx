import React from 'react';

export default function ModalLegal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content legal-modal-box">
        <header className="modal-header">
          <div className="legal-title-container">
            <h3 className="legal-main-title">AVISO LEGAL Y PROTOCOLO DE USO ÉTICO</h3>
            <span className="legal-id">ID_DOCUMENTO: ARG-LEGAL-2026-V3</span>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </header>

        <div className="modal-body legal-text-body">
          <p className="legal-warning">
            LEA ATENTAMENTE LAS SIGUIENTES CONDICIONES ANTES DE OPERAR EN EL SISTEMA.
          </p>
          
          <div className="legal-section">
            <h4>1. CLASIFICACIÓN DE LA INFORMACIÓN</h4>
            <p>Toda la inteligencia visualizada en ARGUS está clasificada como CONFIDENCIAL. El acceso está restringido a personal autorizado. La fuga de estos datos puede acarrear responsabilidades civiles y penales.</p>
          </div>
          
          <div className="legal-section">
            <h4>2. ORIGEN Y VERACIDAD</h4>
            <p>Los hallazgos provienen de monitorización automatizada en redes abiertas y profundas. ARGUS no garantiza la integridad de los datos en origen, actuando únicamente como visor analítico de riesgos detectados.</p>
          </div>
          
          <div className="legal-section">
            <h4>3. PROTOCOLO DE USO TÁCTICO</h4>
            <p>Esta plataforma tiene fines exclusivamente defensivos. Se prohíbe el uso de la información para realizar ataques de ingeniería social, extorsión o intrusiones no autorizadas.</p>
          </div>

          <div className="legal-section">
            <h4>4. PRIVACIDAD Y RGPD</h4>
            <p>El tratamiento de datos se ajusta al interés legítimo de seguridad. El analista se compromete a no almacenar localmente datos personales fuera de los reportes oficiales.</p>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="btn-login legal-accept-btn" onClick={onClose}>
            CONFIRMO LECTURA Y ACEPTACIÓN
          </button>
        </footer>
      </div>
    </div>
  );
}