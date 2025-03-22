import { useControls, folder, Leva } from 'leva';
import { useStore, ParticleType, ObservationMode } from '../../store/store';

/**
 * Panel de control que utiliza Leva para crear una interfaz de usuario interactiva
 * para ajustar los parámetros del experimento de la doble rendija.
 */
export function ControlPanel() {
  const store = useStore();
  
  // Configuramos los controles de Leva y los conectamos con nuestro store
  useControls({
    // Controles de observación
    Observación: folder({
      'Modo de Observación': {
        value: store.observationMode === 'observed' ? 'Con Observador' : 'Sin Observador',
        options: ['Sin Observador', 'Con Observador'],
        onChange: (value) => {
          store.setObservationMode(
            value === 'Con Observador' ? 'observed' : 'notObserved'
          );
        }
      }
    }),
    
    // Controles de rendijas
    Rendijas: folder({
      'Número de Rendijas': {
        value: store.slitCount,
        min: 1,
        max: 3,
        step: 1,
        onChange: (value) => store.setSlitCount(value)
      },
      'Ancho de Rendijas': {
        value: store.slitWidth,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        onChange: (value) => store.setSlitWidth(value)
      },
      'Separación entre Rendijas': {
        value: store.slitSeparation,
        min: 0.2,
        max: 1.0,
        step: 0.05,
        onChange: (value) => store.setSlitSeparation(value)
      }
    }),
    
    // Controles de partículas
    Partículas: folder({
      'Tipo de Partícula': {
        value: mapParticleTypeToLabel(store.particleType),
        options: ['Fotón', 'Electrón', 'Neutrón'],
        onChange: (value) => store.setParticleType(mapLabelToParticleType(value))
      },
      'Velocidad': {
        value: store.particleSpeed,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        onChange: (value) => store.setParticleSpeed(value)
      },
      'Longitud de Onda': {
        value: store.wavelength,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        onChange: (value) => store.setWavelength(value)
      }
    })
  });
  
  return (
    <div className="control-panel">
      <h2 className="text-primary text-xl font-bold mb-2">
        Experimento de la Doble Rendija
      </h2>
      <div className="text-sm text-text-light mb-4">
        Ajusta los parámetros para observar los diferentes comportamientos cuánticos
      </div>
      
      {/* Leva se renderiza automáticamente */}
      <Leva 
        fill 
        flat 
        titleBar={false}
        theme={{
          colors: {
            highlight1: '#00B8D4',
            highlight2: '#6A1B9A',
            accent1: '#222244',
            accent2: '#303050',
            accent3: '#404060',
            vivid1: '#00B8D4'
          }
        }}
      />
    </div>
  );
}

// Funciones auxiliares para mapear entre etiquetas y valores internos
function mapParticleTypeToLabel(type: ParticleType): string {
  switch (type) {
    case 'photon': return 'Fotón';
    case 'electron': return 'Electrón';
    case 'neutron': return 'Neutrón';
    default: return 'Fotón';
  }
}

function mapLabelToParticleType(label: string): ParticleType {
  switch (label) {
    case 'Fotón': return 'photon';
    case 'Electrón': return 'electron';
    case 'Neutrón': return 'neutron';
    default: return 'photon';
  }
} 