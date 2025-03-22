import { useControls, folder, Leva } from 'leva';
import { useStore, ParticleType } from '../../store/store';

/**
 * Panel de control que utiliza Leva para crear una interfaz de usuario interactiva
 * para ajustar los parámetros del experimento de la doble rendija.
 */
export function ControlPanel() {
  const store = useStore();
  
  // Configuramos los controles de Leva y los conectamos con nuestro store
  useControls({
    'Control de Simulación': folder({
      'Velocidad de Actualización': {
        value: store.updateFrequency === 1 ? 'Máxima' : `1/${store.updateFrequency}`,
        options: ['Máxima', '1/2', '1/3', '1/4', '1/5'],
        onChange: (value) => {
          const freq = value === 'Máxima' ? 1 : parseInt(value.split('/')[1]);
          store.setUpdateFrequency(freq);
        },
        hint: 'Controla la velocidad de actualización de la simulación'
      }
    }, { 
      color: '#00B8D4',
      order: -2 
    }),
    
    'Configuración de las Rendijas': folder({
      'Número de Rendijas': {
        value: store.slitCount,
        min: 1,
        max: 3,
        step: 1,
        onChange: (value) => store.setSlitCount(value),
        hint: 'Cantidad de rendijas en la barrera'
      },
      'Ancho de Rendijas': {
        value: store.slitWidth,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        suffix: ' mm',
        onChange: (value) => store.setSlitWidth(value),
        hint: 'Ancho de cada rendija en milímetros'
      },
      'Separación entre Rendijas': {
        value: store.slitSeparation,
        min: 0.2,
        max: 1.0,
        step: 0.05,
        suffix: ' mm',
        onChange: (value) => store.setSlitSeparation(value),
        hint: 'Distancia entre los centros de las rendijas'
      }
    }, { 
      color: '#7B1FA2',
      order: -1 
    }),
    
    'Partículas': folder({
      'Tipo de Partícula': {
        value: mapParticleTypeToLabel(store.particleType),
        options: ['Fotón', 'Electrón'],
        onChange: (value) => store.setParticleType(mapLabelToParticleType(value)),
        hint: 'Selecciona el tipo de partícula a emitir'
      },
      'Velocidad': {
        value: store.particleSpeed,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        suffix: 'x',
        onChange: (value) => store.setParticleSpeed(value),
        hint: 'Velocidad relativa de las partículas emitidas'
      },
      'Longitud de Onda': {
        value: store.wavelength,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        suffix: ' nm',
        onChange: (value) => store.setWavelength(value),
        hint: 'Longitud de onda de las partículas en nanómetros'
      }
    }, {
      color: '#FFD600'
    }),
    
    'Observación': folder({
      'Modo de Observación': {
        value: store.isObserved ? 'Con Observador' : 'Sin Observador',
        options: ['Sin Observador', 'Con Observador'],
        onChange: (value) => {
          store.setObserved(value === 'Con Observador');
        },
        hint: 'Activa o desactiva la observación en las rendijas'
      }
    }, {
      color: '#00C853'
    })
  });
  
  return (
    <div className="control-panel">
      <h2 className="text-primary text-xl font-bold mb-4">
        Controles del Experimento
      </h2>
      <div className="text-sm text-text-light mb-4">
        Ajusta los parámetros para observar diferentes comportamientos cuánticos
      </div>
      
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
          },
          sizes: {
            rootWidth: '280px',
            controlWidth: '170px',
            scrubberWidth: '8px',
            scrubberHeight: '16px'
          },
          radii: {
            xs: '2px',
            sm: '3px',
            lg: '4px'
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
    default: return 'Fotón';
  }
}

function mapLabelToParticleType(label: string): ParticleType {
  switch (label) {
    case 'Fotón': return 'photon';
    case 'Electrón': return 'electron';
    default: return 'photon';
  }
} 