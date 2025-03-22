import { useState } from 'react';
import './HelpButton.css';

/**
 * Componente que muestra un botón de ayuda con un tooltip de información
 * sobre el experimento de la doble rendija.
 */
export function HelpButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="help-button-container">
      <button 
        className="help-button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Información sobre el experimento"
      >
        ?
      </button>
      
      {showTooltip && (
        <div className="help-tooltip">
          <h3>Sobre el Experimento</h3>
          <p>
            El experimento de la doble rendija demuestra la dualidad onda-partícula 
            de la mecánica cuántica. Sin observación, las partículas se comportan como 
            ondas creando un patrón de interferencia. Al observar, se comportan como 
            partículas con trayectorias definidas.
          </p>
        </div>
      )}
    </div>
  );
} 