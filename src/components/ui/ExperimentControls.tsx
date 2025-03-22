import { useStore } from '../../store/store';

/**
 * Componente que muestra los controles para manipular el experimento
 */
export function ExperimentControls() {
  const { 
    slitWidth, 
    slitSeparation, 
    slitCount, 
    particleType, 
    particleSpeed,
    wavelength,
    isObserved,
    isPaused,
    updateFrequency,
    setSlitWidth,
    setSlitSeparation,
    setSlitCount,
    setParticleType,
    setParticleSpeed,
    setWavelength,
    setObserved,
    setIsPaused,
    setUpdateFrequency
  } = useStore(state => state);

  return (
    <div className="controls-panel">
      <h2 className="panel-title">Controles del Experimento</h2>
      
      {/* Nuevos controles de simulación */}
      <div className="control-group simulation-controls">
        <h3>Control de Simulación</h3>
        
        <div className="control-item">
          <button 
            className={`control-button ${isPaused ? 'paused' : 'playing'}`}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
        
        <div className="control-item">
          <label htmlFor="update-frequency">
            Velocidad de Actualización: {updateFrequency === 1 ? 'Máxima' : `1/${updateFrequency}`}
          </label>
          <input
            id="update-frequency"
            type="range"
            min="1"
            max="20"
            step="1"
            value={updateFrequency}
            onChange={(e) => setUpdateFrequency(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="control-group">
        <h3>Configuración de las Rendijas</h3>
        
        <div className="control-item">
          <label htmlFor="slit-width">Ancho de Rendija: {slitWidth.toFixed(2)}</label>
          <input
            id="slit-width"
            type="range"
            min="0.05"
            max="0.3"
            step="0.01"
            value={slitWidth}
            onChange={(e) => setSlitWidth(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="control-item">
          <label htmlFor="slit-separation">Separación: {slitSeparation.toFixed(2)}</label>
          <input
            id="slit-separation"
            type="range"
            min="0.1"
            max="0.5"
            step="0.01"
            value={slitSeparation}
            onChange={(e) => setSlitSeparation(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="control-item">
          <label htmlFor="slit-count">Número de Rendijas: {slitCount}</label>
          <input
            id="slit-count"
            type="range"
            min="1"
            max="5"
            step="1"
            value={slitCount}
            onChange={(e) => setSlitCount(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="control-group">
        <h3>Partículas</h3>
        
        <div className="control-item">
          <label>Tipo de Partícula:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="particle-type"
                value="electron"
                checked={particleType === 'electron'}
                onChange={() => setParticleType('electron')}
              />
              Electrón
            </label>
            <label>
              <input
                type="radio"
                name="particle-type"
                value="photon"
                checked={particleType === 'photon'}
                onChange={() => setParticleType('photon')}
              />
              Fotón
            </label>
          </div>
        </div>
        
        <div className="control-item">
          <label htmlFor="particle-speed">Velocidad: {particleSpeed.toFixed(1)}x</label>
          <input
            id="particle-speed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={particleSpeed}
            onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="control-item">
          <label htmlFor="wavelength">Longitud de Onda: {wavelength.toFixed(2)}</label>
          <input
            id="wavelength"
            type="range"
            min="0.02"
            max="0.1"
            step="0.01"
            value={wavelength}
            onChange={(e) => setWavelength(parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      <div className="control-group">
        <h3>Observación</h3>
        
        <div className="control-item">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isObserved}
              onChange={(e) => setObserved(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            {isObserved ? 'Con Observación' : 'Sin Observación'}
          </label>
          <p className="observation-description">
            {isObserved 
              ? 'Observando las partículas en las rendijas (comportamiento corpuscular)' 
              : 'Sin observar las partículas (interferencia cuántica)'}
          </p>
        </div>
      </div>
      
      <div className="explanation">
        <h3>Sobre el Experimento</h3>
        <p>
          El experimento de la doble rendija demuestra la dualidad onda-partícula 
          de la mecánica cuántica. Sin observación, las partículas se comportan como 
          ondas creando un patrón de interferencia. Al observar, se comportan como 
          partículas con trayectorias definidas.
        </p>
      </div>
    </div>
  );
} 