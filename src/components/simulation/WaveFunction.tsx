import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import * as THREE from 'three';

interface WaveFunctionProps {
  slitWidth: number;
  slitSeparation: number;
  slitCount: number;
}

/**
 * Componente que representa la función de onda en el experimento de doble rendija
 * Utiliza shaders para visualizar la interferencia cuántica
 */
export const WaveFunction = forwardRef(function WaveFunction(
  { slitWidth, slitSeparation, slitCount }: WaveFunctionProps,
  ref
) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useRef({
    time: { value: 0 },
    slitWidth: { value: slitWidth },
    slitSeparation: { value: slitSeparation },
    slitCount: { value: slitCount },
    resolution: { value: new THREE.Vector2(1024, 1024) }
  });

  // Exponemos el método update a través de la referencia
  useImperativeHandle(ref, () => ({
    update: (time: number) => {
      if (uniforms.current) {
        uniforms.current.time.value = time;
      }
    }
  }));

  // Inicializar los uniforms del shader
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms = uniforms.current;
    }
  }, []);

  // Actualizar los uniforms cuando cambien los parámetros
  useEffect(() => {
    if (uniforms.current) {
      uniforms.current.slitWidth.value = slitWidth;
      uniforms.current.slitSeparation.value = slitSeparation;
      uniforms.current.slitCount.value = slitCount;
    }
  }, [slitWidth, slitSeparation, slitCount]);

  // Vertex shader básico
  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader temporal simplificado para la visualización de la función de onda
  const fragmentShader = `
    uniform float time;
    uniform float slitWidth;
    uniform float slitSeparation;
    uniform float slitCount;
    uniform vec2 resolution;
    varying vec2 vUv;
    
    // Función simple para calcular la fase de la onda desde una fuente
    float wavePhase(vec2 position, vec2 source, float time, float frequency) {
      float distance = length(position - source);
      return sin(distance * 10.0 - time * frequency);
    }
    
    void main() {
      // Coordenadas normalizadas
      vec2 position = vUv * 2.0 - 1.0;
      
      // Centro de la barrera
      vec2 barrierCenter = vec2(0.0, 0.0);
      
      // Calculamos la contribución de cada rendija
      float totalWave = 0.0;
      float numSlits = slitCount;
      
      // Posición vertical inicial para las rendijas
      float startY = 0.0;
      if (mod(numSlits, 2.0) == 0.0) {
        // Par
        startY = -slitSeparation * 0.5 + (numSlits * 0.5 - 0.5) * slitSeparation;
      } else {
        // Impar
        startY = (numSlits - 1.0) * 0.5 * slitSeparation;
      }
      
      // Sumamos la contribución de cada rendija
      for (float i = 0.0; i < 10.0; i++) {
        if (i >= numSlits) break;
        
        // Posición de la rendija
        float slitPos = 0.0;
        if (mod(numSlits, 2.0) == 0.0) {
          slitPos = (i - numSlits * 0.5 + 0.5) * slitSeparation;
        } else {
          slitPos = (i - floor(numSlits * 0.5)) * slitSeparation;
        }
        
        vec2 slitCenter = vec2(barrierCenter.x, slitPos);
        
        // Simulamos múltiples fuentes a lo largo de la rendija
        for (float j = -2.0; j <= 2.0; j++) {
          vec2 source = slitCenter + vec2(0.0, j * slitWidth * 0.2);
          totalWave += wavePhase(position, source, time, 3.0) * 0.2;
        }
      }
      
      // Normalizar entre -1 y 1
      totalWave = totalWave / float(slitCount);
      
      // Colores basados en la fase
      float r = 0.5 + 0.5 * sin(totalWave * 1.0);
      float g = 0.5 + 0.5 * sin(totalWave * 1.2 + 0.5);
      float b = 0.5 + 0.5 * sin(totalWave * 1.4 + 1.0);
      
      // Intensidad basada en la posición (se desvanece en los bordes)
      float intensity = 1.0 - length(position) * 0.7;
      intensity = max(0.0, intensity);
      
      // Color final
      gl_FragColor = vec4(r * 0.5, g * 0.7, b, intensity * 0.7);
    }
  `;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
      <planeGeometry args={[4, 2, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}); 