import { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import './InfoPanel.css';

/**
 * Panel informativo que muestra estadísticas del experimento
 */
export function InfoPanel() {
  const stats = useStore(state => state.stats);
  const isObserved = useStore(state => state.isObserved);
  const slitCount = useStore(state => state.slitCount);
  
  // Estado para el tiempo transcurrido
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  
  // Actualizar el tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - stats.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setElapsedTime(`${minutes}:${seconds}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [stats.startTime]);
  
  // Calcular la eficiencia de detección
  const detectionEfficiency = stats.particlesFired > 0 
    ? Math.round((stats.particlesDetected / stats.particlesFired) * 100) 
    : 0;
  
  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <h3>Estadísticas del Experimento</h3>
        <div className="info-panel-time">Tiempo: {elapsedTime}</div>
      </div>
      
      <div className="info-section">
        <h4>Datos de Partículas</h4>
        <div className="info-row">
          <span>Partículas disparadas:</span>
          <span>{stats.particlesFired}</span>
        </div>
        <div className="info-row">
          <span>Partículas detectadas:</span>
          <span>{stats.particlesDetected}</span>
        </div>
        <div className="info-row">
          <span>Eficiencia de detección:</span>
          <span>{detectionEfficiency}%</span>
        </div>
      </div>
      
      <div className="info-section">
        <h4>Datos de las Rendijas</h4>
        <div className="info-row">
          <span>Colisiones con barrera:</span>
          <span>{stats.barrierCollisions}</span>
        </div>
        
        {isObserved && (
          <div className="slit-distribution">
            <div className="info-row">
              <span>Distribución por rendijas:</span>
            </div>
            {Array.from({ length: slitCount }).map((_, index) => (
              <div className="info-row slit-row" key={`slit-${index}`}>
                <span>
                  Rendija <span className="slit-number">#{index + 1}</span>:
                </span>
                <span>{stats.slitPassCount[index]}</span>
              </div>
            ))}
          </div>
        )}
        
        {!isObserved && (
          <div className="info-row observation-note">
            <span>La distribución por rendijas solo es visible cuando el observador está activo</span>
          </div>
        )}
      </div>
    </div>
  );
} 