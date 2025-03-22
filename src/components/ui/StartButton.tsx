import { useState } from 'react';
import './StartButton.css';

interface StartButtonProps {
  onClick: () => void;
}

/**
 * Botón de inicio para el experimento de doble rendija
 * Muestra un botón minimalista con efecto de hover
 */
export function StartButton({ onClick }: StartButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button 
      className={`start-button ${isHovered ? 'hovered' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Iniciar Experimento"
    >
      <div className="button-content">
        <svg 
          className="button-svg" 
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          width="200" 
          height="200"
        >
          <circle 
            cx="512" 
            cy="512" 
            r="450" 
            className="button-background" 
          />
          <g className="button-glow" />
        </svg>
        <span className="button-text">Iniciar Experimento</span>
      </div>
    </button>
  );
} 