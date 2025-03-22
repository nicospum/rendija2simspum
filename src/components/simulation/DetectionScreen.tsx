import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ParticleType } from '../../store/store';

interface DetectionScreenProps {
  position: [number, number, number];
  isObserved: boolean;
}

/**
 * Componente que representa la pantalla de detección en el experimento de doble rendija
 * Muestra diferentes patrones según si hay observación o no
 */
export function DetectionScreen({ position, isObserved }: DetectionScreenProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.DataTexture | null>(null);
  const paramRef = useRef({
    isObserved: isObserved,
    lastPattern: false, // Para rastrear si necesitamos regenerar el patrón
    frameCount: 0 // Contador de frames para limitar la frecuencia de actualización
  });
  
  // Obtener estados y acciones desde el store
  const isPaused = useStore(state => state.isPaused);
  const updateFrequency = useStore(state => state.updateFrequency);
  const particles = useStore(state => state.particles);
  const deactivateParticle = useStore(state => state.deactivateParticle);
  
  // Dimensiones de la textura
  const textureWidth = 256; // Mayor resolución
  const textureHeight = 256; // Mayor resolución
  
  // Inicializar la textura
  const [initialized, setInitialized] = useState(false);
  
  // Definir colores para los diferentes tipos de partículas (mismos que en ParticleEmitter)
  const particleColors = {
    electron: { r: 100, g: 181, b: 246 }, // #64B5F6 en RGB
    photon: { r: 255, g: 238, b: 88 }     // #FFEE58 en RGB
  };
  
  // Crear la textura al montar el componente (solo una vez)
  useEffect(() => {
    try {
      // Crear datos para la textura
      const size = textureWidth * textureHeight;
      // Usar RGBA para mayor compatibilidad con Three.js moderno
      const data = new Uint8Array(4 * size); 
      
      // Inicializar con negro transparente
      for (let i = 0; i < size; i++) {
        const baseIdx = i * 4;
        data[baseIdx] = 0;     // R
        data[baseIdx + 1] = 0; // G
        data[baseIdx + 2] = 0; // B
        data[baseIdx + 3] = 0; // A - Inicialmente transparente
      }
      
      // Crear la textura con formato moderno
      const texture = new THREE.DataTexture(
        data,
        textureWidth,
        textureHeight,
        THREE.RGBAFormat, // Formato moderno con canal alfa
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.LinearFilter,
        THREE.LinearFilter
      );
      
      texture.needsUpdate = true;
      textureRef.current = texture;
      setInitialized(true);
      
      // Actualizar parámetros de referencia
      paramRef.current.isObserved = isObserved;
      paramRef.current.lastPattern = isObserved;
      
      console.log('DetectionScreen: Textura inicializada correctamente', texture);
      
      return () => {
        // Limpiar la textura al desmontar
        if (textureRef.current) {
          textureRef.current.dispose();
          textureRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error al inicializar la textura:', error);
      return () => {}; // Retornar una función de limpieza vacía
    }
  }, []);
  
  // Actualizar la referencia a los parámetros cuando cambian
  useEffect(() => {
    paramRef.current.isObserved = isObserved;
  }, [isObserved]);
  
  // Función para registrar el impacto de una partícula en la pantalla
  const registerImpact = useCallback((particleY: number, particleZ: number, particleType: ParticleType) => {
    if (!textureRef.current) return;
    
    try {
      // Log para depuración - entrada a registerImpact
      console.log(`DetectionScreen: Registrando impacto en y=${particleY.toFixed(2)}, z=${particleZ.toFixed(2)}, tipo=${particleType}`);
      
      const texture = textureRef.current;
      const data = texture.image.data as Uint8Array;
      
      // Convertir la posición 3D a coordenadas de textura 2D
      // Mapear desde el rango de la pantalla al rango de la textura
      const screenHeight = 1.5; // Altura de la pantalla en unidades de THREE
      
      // Convertir Y a coordenada de textura (normalizado de -screenHeight/2 a screenHeight/2)
      const normalizedY = ((particleY + screenHeight/2) / screenHeight);
      const textureY = Math.floor(normalizedY * textureHeight);
      
      // Convertir Z a coordenada X en la textura si es necesario
      const normalizedZ = ((particleZ + screenHeight/2) / screenHeight);
      const textureX = Math.floor(normalizedZ * textureWidth);
      
      // Log para depuración - coordenadas de textura
      console.log(`DetectionScreen: Convertido a coordenadas de textura x=${textureX}, y=${textureY}`);
      
      // Asegurarse de que las coordenadas estén dentro de los límites
      if (textureX >= 0 && textureX < textureWidth && textureY >= 0 && textureY < textureHeight) {
        // Usar el color según el tipo de partícula
        const color = particleColors[particleType];
        
        // Aplicar impacto principal con máxima intensidad
        // Nota: Ahora con formato RGBA, cada píxel ocupa 4 bytes
        const pixelIndex = (textureY * textureWidth + textureX) * 4;
        data[pixelIndex] = color.r;     // R
        data[pixelIndex + 1] = color.g; // G
        data[pixelIndex + 2] = color.b; // B
        data[pixelIndex + 3] = 255;     // Alpha (totalmente opaco)
        
        // Afectar píxeles cercanos para efecto de dispersión con mayor intensidad
        const radius = 4; // Aumentar radio para mayor visibilidad
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue; // Saltamos el pixel central
            
            const nx = textureX + dx;
            const ny = textureY + dy;
            
            if (nx >= 0 && nx < textureWidth && ny >= 0 && ny < textureHeight) {
              const idx = (ny * textureWidth + nx) * 4; // Formato RGBA (4 bytes por píxel)
              const distance = Math.sqrt(dx*dx + dy*dy);
              // Intensidad inversamente proporcional a la distancia
              const intensity = Math.max(0, 1.0 - (distance / radius));
              const alpha = Math.floor(255 * intensity); // Alpha basado en intensidad
              
              // Mezclar colores con los existentes
              data[idx] = Math.min(255, data[idx] + Math.floor(color.r * intensity));
              data[idx + 1] = Math.min(255, data[idx + 1] + Math.floor(color.g * intensity));
              data[idx + 2] = Math.min(255, data[idx + 2] + Math.floor(color.b * intensity));
              data[idx + 3] = Math.max(data[idx + 3], alpha); // Mayor valor de alpha
            }
          }
        }
        
        // Marcar la textura para actualización
        texture.needsUpdate = true;
        console.log(`DetectionScreen: Textura actualizada con color ${particleType}`);
      } else {
        console.log(`DetectionScreen: Coordenadas fuera de límites: x=${textureX}, y=${textureY}`);
      }
    } catch (error) {
      console.error('Error al registrar impacto:', error);
    }
  }, []);
  
  // Escuchar eventos de impacto de partículas
  useEffect(() => {
    const handleParticleImpact = (event: CustomEvent) => {
      console.log('DetectionScreen: Evento de impacto recibido', event.detail);
      
      if (!event.detail || !event.detail.position || !event.detail.type) {
        console.error('DetectionScreen: Evento de impacto recibido con datos incompletos', event.detail);
        return;
      }
      
      const { position, type } = event.detail;
      console.log(`DetectionScreen: Procesando impacto tipo ${type} en posición (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
      
      registerImpact(position.y, position.z, type);
    };
    
    // Función para manejar el reinicio de la pantalla
    const handleResetScreen = () => {
      console.log('DetectionScreen: Reiniciando pantalla de detección');
      
      if (!textureRef.current) return;
      
      try {
        // Obtener la textura y sus datos
        const texture = textureRef.current;
        const data = texture.image.data as Uint8Array;
        const size = textureWidth * textureHeight;
        
        // Resetear todos los píxeles a negro transparente
        for (let i = 0; i < size; i++) {
          const baseIdx = i * 4;
          data[baseIdx] = 0;     // R
          data[baseIdx + 1] = 0; // G
          data[baseIdx + 2] = 0; // B
          data[baseIdx + 3] = 0; // A - Transparente
        }
        
        // Marcar la textura para actualización
        texture.needsUpdate = true;
        console.log('DetectionScreen: Textura reiniciada correctamente');
      } catch (error) {
        console.error('Error al reiniciar la textura:', error);
      }
    };
    
    // Añadir escuchador de evento de impacto
    window.addEventListener('particleImpact', handleParticleImpact as EventListener);
    console.log('DetectionScreen: Escuchador de eventos de impacto añadido');
    
    // Añadir escuchador para evento de reinicio
    window.addEventListener('resetDetectionScreen', handleResetScreen as EventListener);
    console.log('DetectionScreen: Escuchador de eventos de reinicio añadido');
    
    // Limpiar escuchadores al desmontar
    return () => {
      window.removeEventListener('particleImpact', handleParticleImpact as EventListener);
      window.removeEventListener('resetDetectionScreen', handleResetScreen as EventListener);
      console.log('DetectionScreen: Escuchadores de eventos removidos');
    };
  }, [registerImpact]);
  
  // Comprobar impactos de partículas
  useFrame(() => {
    // No hacer nada si está pausado
    if (isPaused) return;
    
    try {
      // Incrementar contador de frames
      paramRef.current.frameCount = (paramRef.current.frameCount + 1) % Math.max(1, updateFrequency);
      
      // Buscar partículas que hayan impactado en la pantalla
      // (aquellas que están inactivas y su última posición está cerca de la pantalla)
      const screenX = position[0];
      
      // Log para depuración - conteo de partículas
      const inactiveNearScreen = particles.filter(particle => 
        !particle.isActive && Math.abs(particle.position.x - screenX) < 0.1
      );
      if (inactiveNearScreen.length > 0) {
        console.log(`DetectionScreen: Encontradas ${inactiveNearScreen.length} partículas inactivas cerca de la pantalla`);
      }
      
      particles.forEach(particle => {
        if (!particle.isActive && 
            Math.abs(particle.position.x - screenX) < 0.1) {
          
          // Log para depuración - procesando partícula
          console.log(`DetectionScreen: Procesando partícula ${particle.id} en posición x=${particle.position.x.toFixed(2)}`);
          
          // Registrar impacto en la pantalla
          registerImpact(particle.position.y, particle.position.z, particle.type);
          
          // Eliminar la partícula del sistema después de procesarla
          // para evitar procesarla múltiples veces
          deactivateParticle(particle.id);
        }
      });
    } catch (error) {
      console.error('Error en useFrame de DetectionScreen:', error);
    }
  });
  
  // Dimensiones de la pantalla
  const screenWidth = 3.0;  // Pantalla más grande
  const screenHeight = 1.5; // Reducir altura para que no traspase el piso
  
  return (
    <group position={position} rotation={[0, -Math.PI/2, 0]}>
      {/* Pantalla base (fondo oscuro para que los impactos se vean mejor) */}
      <mesh ref={meshRef} position={[0, 0.15, 0]}> {/* Elevamos ligeramente la pantalla */}
        <planeGeometry args={[screenWidth, screenHeight]} />
        <meshStandardMaterial
          color="#121212"
          emissive="#202020"
          emissiveIntensity={0.1}
          transparent={true}
          opacity={0.95}
        />
      </mesh>
      
      {/* Capa de textura para mostrar los impactos */}
      {initialized && textureRef.current && (
        <mesh position={[0, 0.15, 0.01]}> {/* Ajustamos también la posición de la capa de textura */}
          <planeGeometry args={[screenWidth * 0.9, screenHeight * 0.9]} />
          <meshBasicMaterial
            map={textureRef.current}
            transparent={true}
            blending={THREE.AdditiveBlending} // Usar blending aditivo para mejor visualización
            side={THREE.DoubleSide}
            depthWrite={false} // Evitar problemas de z-fighting
          />
        </mesh>
      )}
    </group>
  );
} 