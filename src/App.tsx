import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { DoubleSlitExperiment } from './components/simulation/DoubleSlitExperiment';
import { ExperimentControls } from './components/ui/ExperimentControls';
import { CanvasErrorBoundary } from './components/simulation/CanvasErrorBoundary';
import { StartButton } from './components/ui/StartButton';
import { HelpButton } from './components/ui/HelpButton';
import { InfoPanel } from './components/ui/InfoPanel';
import { useStore } from './store/store';

/**
 * Componente principal de la aplicación
 * Contiene el canvas 3D y los controles de la interfaz
 */
export default function App() {
  const isObserved = useStore(state => state.isObserved);
  const [canvasReady, setCanvasReady] = useState(false);
  const [experimentStarted, setExperimentStarted] = useState(false);
  
  // Asegurar que el componente se monte correctamente antes de renderizar el Canvas
  useEffect(() => {
    if (experimentStarted) {
      // Pequeño retraso para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        setCanvasReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [experimentStarted]);
  
  return (
    <div className="app">
      {!experimentStarted ? (
        <div className="start-screen">
          <h1 className="experiment-title">Experimento de Doble Rendija</h1>
          <p className="experiment-description">
            Una demostración interactiva del famoso experimento que reveló la naturaleza dual onda-partícula de la materia.
          </p>
          <StartButton onClick={() => setExperimentStarted(true)} />
        </div>
      ) : (
        <>
          <div className="simulation-container">
            {/* Panel de información */}
            <InfoPanel />
            
            {/* Botón de ayuda */}
            <HelpButton />
            
            <CanvasErrorBoundary>
              {canvasReady && (
                <Canvas
                  camera={{ position: [0, 2, 5], fov: 50 }}
                  shadows
                  style={{ background: '#050A20' }}
                  gl={{ 
                    antialias: true,
                    alpha: false,
                    stencil: false,
                    depth: true,
                    powerPreference: 'high-performance'
                  }}
                >
                  <ambientLight intensity={0.4} />
                  <directionalLight 
                    position={[5, 5, 5]} 
                    intensity={0.8} 
                    castShadow 
                    shadow-mapSize-width={1024} 
                    shadow-mapSize-height={1024}
                  />
                  
                  {/* Experimento de doble rendija */}
                  <DoubleSlitExperiment isObserved={isObserved} />
                  
                  {/* Controles de cámara */}
                  <OrbitControls 
                    enablePan={true}
                    enableRotate={true}
                    enableZoom={true}
                    minDistance={2}
                    maxDistance={10}
                    makeDefault
                  />
                </Canvas>
              )}
            </CanvasErrorBoundary>
          </div>
          
          {/* Panel de controles del experimento */}
          <div className="controls-container">
            <ExperimentControls />
          </div>
        </>
      )}
    </div>
  );
}
