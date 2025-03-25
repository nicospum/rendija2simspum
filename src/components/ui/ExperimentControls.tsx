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
    isObserved,
    isPaused,
    isAutoMode,
    particlesPerEmission,
    emissionSpeed,
    dispersionFactor,
    setSlitWidth,
    setSlitSeparation,
    setSlitCount,
    setParticleType,
    setObserved,
    setDispersionFactor,
    setParticlesPerEmission,
    setEmissionSpeed,
    togglePause,
    toggleAutoMode,
    resetExperiment
  } = useStore(state => state);

  // Determinar si el observador debe estar deshabilitado (para 1 rendija)
  const isObserverDisabled = slitCount === 1;

  return (
    <div className="controls-panel">
      <h2 className="panel-title">Controles del Experimento</h2>
      
      {/* Controles de simulación */}
      <div className="control-group simulation-controls">
        <h3>Control de Simulación</h3>
        
        <div className="control-item">
          <button 
            className={`control-button ${isPaused ? 'paused' : 'playing'}`}
            onClick={togglePause}
          >
            {isPaused ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
        
        <div className="control-item">
          <button 
            className={`control-button ${isAutoMode ? 'auto-active' : ''}`}
            onClick={toggleAutoMode}
          >
            {isAutoMode ? 'AUTO' : 'AUTO'}
          </button>
        </div>
        
        <div className="control-item">
          <button 
            className="reset-button"
            onClick={resetExperiment}
          >
            Reiniciar Experimento
          </button>
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
            <label>
              <input
                type="radio"
                name="particle-type"
                value="neutrino"
                checked={particleType === 'neutrino'}
                onChange={() => setParticleType('neutrino')}
              />
              Neutrino
            </label>
          </div>
        </div>
        
        {/* Descripción del tipo de partícula seleccionada */}
        <div className="control-item">
          <div className="particle-description">
            {particleType === 'electron' && (
              <p>Electrón: Partícula con masa que colapsa completamente bajo observación.</p>
            )}
            {particleType === 'photon' && (
              <p>Fotón: Partícula sin masa que colapsa completamente bajo observación.</p>
            )}
            {particleType === 'neutrino' && (
              <p>Neutrino: Partícula que interactúa muy débilmente con la materia, casi inmune a la observación.</p>
            )}
          </div>
        </div>
        
        {/* Nuevos controles de emisión */}
        <div className="control-item">
          <label htmlFor="particles-per-emission">
            Partículas por Emisión: {particlesPerEmission}
          </label>
          <input
            id="particles-per-emission"
            type="range"
            min="1"
            max="10"
            step="1"
            value={particlesPerEmission}
            onChange={(e) => setParticlesPerEmission(parseInt(e.target.value))}
          />
        </div>
        
        <div className="control-item">
          <label htmlFor="emission-speed">
            Velocidad de Emisión: {emissionSpeed}
          </label>
          <input
            id="emission-speed"
            type="range"
            min="1"
            max="10"
            step="1"
            value={emissionSpeed}
            onChange={(e) => setEmissionSpeed(parseInt(e.target.value))}
          />
        </div>
        
        <div className="control-item">
          <label htmlFor="dispersion-factor">
            Dispersión Angular: {dispersionFactor.toFixed(1)}
          </label>
          <input
            id="dispersion-factor"
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={dispersionFactor}
            onChange={(e) => setDispersionFactor(parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      <div className="control-group">
        <h3>Observación</h3>
        
        <div className="control-item">
          <label className={`toggle-switch ${isObserverDisabled ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={isObserved && !isObserverDisabled}
              onChange={(e) => setObserved(e.target.checked)}
              disabled={isObserverDisabled}
            />
            <span className="toggle-slider"></span>
            {isObserved && !isObserverDisabled ? 'Con Observación' : 'Sin Observación'}
          </label>
          {isObserverDisabled && (
            <p className="observation-disabled-note">
              El observador está deshabilitado con 1 rendija (no tiene sentido físico)
            </p>
          )}
          {!isObserverDisabled && (
            <p className="observation-description">
              {isObserved 
                ? `Observando las partículas en las rendijas (${particleType === 'neutrino' ? 'interferencia parcial' : 'comportamiento corpuscular'})` 
                : 'Sin observar las partículas (interferencia cuántica)'}
            </p>
          )}
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
            onChange={(e) => {
              // Desactivar observador si cambiamos a 1 rendija
              if (e.target.value === "1" && isObserved) {
                setObserved(false);
              }
              setSlitCount(parseInt(e.target.value));
            }}
          />
        </div>
      </div>
    </div>
  );
} 