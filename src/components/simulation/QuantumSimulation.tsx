import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { DoubleSlitExperiment } from './DoubleSlitExperiment';
import { useStore } from '../../store/store';

/**
 * Componente principal para la visualización 3D del experimento de la doble rendija.
 * Utiliza React-Three-Fiber para renderizar la escena 3D y OrbitControls para la navegación.
 */
export function QuantumSimulation() {
  const observationMode = useStore(state => state.observationMode);
  
  return (
    <div className="quantum-container bg-bg-dark">
      {/* Capa de referencia de cuadrícula para dar sensación de escala */}
      <div className="grid-reference" />
      
      {/* Canvas 3D con React-Three-Fiber */}
      <Canvas 
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ antialias: true }}
        shadows
      >
        {/* Iluminación de la escena */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
        />
        
        {/* Controles de órbita para navegar la escena */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        
        {/* Componente del experimento de la doble rendija */}
        <DoubleSlitExperiment isObserved={observationMode === 'observed'} />
      </Canvas>
    </div>
  );
} 