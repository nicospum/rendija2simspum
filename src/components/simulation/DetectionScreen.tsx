import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/store';

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
  
  // Obtener estados de control de la simulación desde el store utilizando selectores individuales
  const isPaused = useStore(state => state.isPaused);
  const updateFrequency = useStore(state => state.updateFrequency);
  
  // Dimensiones de la textura
  const textureWidth = 128;
  const textureHeight = 128;
  
  // Inicializar la textura
  const [initialized, setInitialized] = useState(false);
  
  // Crear la textura al montar el componente (solo una vez)
  useEffect(() => {
    try {
      // Crear datos para la textura
      const size = textureWidth * textureHeight;
      const data = new Uint8Array(3 * size);
      
      // Inicializar con negro
      for (let i = 0; i < size * 3; i++) {
        data[i] = 0;
      }
      
      // Crear la textura
      const texture = new THREE.DataTexture(
        data,
        textureWidth,
        textureHeight,
        THREE.RGBFormat
      );
      
      texture.needsUpdate = true;
      textureRef.current = texture;
      setInitialized(true);
      
      // Actualizar parámetros de referencia
      paramRef.current.isObserved = isObserved;
      paramRef.current.lastPattern = isObserved;
      
      console.log('DetectionScreen: Textura inicializada correctamente');
      
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
  
  // Función para actualizar la textura con un patrón - memoizada con useCallback
  const updateTexture = useCallback(() => {
    if (!textureRef.current) return;
    
    try {
      const texture = textureRef.current;
      const data = texture.image.data as Uint8Array;
      const isObservedCurrent = paramRef.current.isObserved;
      
      // Si el estado de observación no ha cambiado, no necesitamos
      // regenerar completamente el patrón, solo actualizarlo gradualmente
      const needsFullReset = isObservedCurrent !== paramRef.current.lastPattern;
      paramRef.current.lastPattern = isObservedCurrent;
      
      // Límite de partículas nuevas por frame para mejorar el rendimiento
      const newParticlesPerFrame = isObservedCurrent ? 10 : 50;
      
      if (needsFullReset) {
        // Limpiar la textura si cambiamos entre observación/no observación
        for (let i = 0; i < data.length; i++) {
          data[i] = 0;
        }
      } else {
        // Agregar nuevas partículas
        for (let i = 0; i < newParticlesPerFrame; i++) {
          let x: number, y: number, pixelIndex: number;
          
          if (isObservedCurrent) {
            // Con observación: patrón de dos franjas
            x = Math.floor(Math.random() * textureWidth);
            
            // Determinar en qué región caerá la partícula
            const region = Math.floor(Math.random() * 2); // 0 o 1 (dos regiones)
            if (region === 0) {
              // Primera región (30% arriba del centro)
              y = Math.floor(textureHeight * 0.35 + Math.random() * textureHeight * 0.3);
            } else {
              // Segunda región (30% abajo del centro)
              y = Math.floor(textureHeight * 0.35 - Math.random() * textureHeight * 0.3);
            }
            
            pixelIndex = (y * textureWidth + x) * 3;
            
            // Colores más brillantes para las regiones de alta probabilidad
            data[pixelIndex] = Math.min(255, data[pixelIndex] + 5); // R
            data[pixelIndex + 1] = Math.min(255, data[pixelIndex + 1] + 2); // G
            data[pixelIndex + 2] = Math.min(255, data[pixelIndex + 2] + 2); // B
          } else {
            // Sin observación: patrón de interferencia
            let validPosition = false;
            let attempts = 0;
            
            // Intentar encontrar una posición válida para la partícula
            // basándose en el patrón de interferencia
            while (!validPosition && attempts < 20) {
              x = Math.floor(Math.random() * textureWidth);
              y = Math.floor(Math.random() * textureHeight);
              
              // Patrón de interferencia: más probable en las franjas de interferencia constructiva
              const normalizedY = (y / textureHeight) * 2 - 1; // Entre -1 y 1
              const interference = Math.cos(normalizedY * 20) ** 2; // Patrón de interferencia simple
              
              if (Math.random() < interference) {
                validPosition = true;
                pixelIndex = (y * textureWidth + x) * 3;
                
                // Colores para el patrón de interferencia (azul-cian)
                const intensity = Math.min(255, data[pixelIndex] + 3);
                data[pixelIndex] = Math.floor(intensity * 0.2); // R
                data[pixelIndex + 1] = Math.floor(intensity * 0.6); // G 
                data[pixelIndex + 2] = intensity; // B
              }
              
              attempts++;
            }
          }
        }
      }
      
      // Marcar la textura para actualización
      texture.needsUpdate = true;
    } catch (error) {
      console.error('Error al actualizar la textura:', error);
    }
  }, []);
  
  // Usar useFrame para actualizar la textura SOLO CADA CIERTOS FRAMES
  // y respetando el estado de pausa
  useFrame(() => {
    // No hacer nada si está pausado
    if (isPaused) return;
    
    try {
      // Incrementar contador de frames
      paramRef.current.frameCount = (paramRef.current.frameCount + 1) % Math.max(1, updateFrequency);
      
      // Actualizar solo cuando el contador llega a 0 (cada 'updateFrequency' frames)
      if (paramRef.current.frameCount === 0) {
        updateTexture();
      }
    } catch (error) {
      console.error('Error en useFrame de DetectionScreen:', error);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1, 1, 1, 1]} />
      {initialized && textureRef.current && (
        <meshBasicMaterial
          map={textureRef.current}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
} 