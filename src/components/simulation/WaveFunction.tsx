import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import * as THREE from 'three';

interface WaveFunctionProps {
  slitWidth: number;
  slitSeparation: number;
  slitCount: number;
  isObserved: boolean;
  particleType: string;
}

/**
 * Componente que representa la función de onda en el experimento de doble rendija
 * Utiliza shaders para visualizar la interferencia cuántica
 * Responde al estado de observación mostrando u ocultando los patrones de interferencia
 */
export const WaveFunction = forwardRef(function WaveFunction(
  { slitWidth, slitSeparation, slitCount, isObserved, particleType }: WaveFunctionProps,
  ref
) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useRef({
    time: { value: 0 },
    slitWidth: { value: slitWidth },
    slitSeparation: { value: slitSeparation },
    slitCount: { value: slitCount },
    resolution: { value: new THREE.Vector2(1024, 1024) },
    isObserved: { value: isObserved ? 1.0 : 0.0 },
    particleType: { value: getParticleTypeIndex(particleType) },
    waveOpacity: { value: 1.0 }
  });

  function getParticleTypeIndex(type: string): number {
    switch (type) {
      case 'electron': return 0.0;
      case 'photon': return 1.0;
      case 'neutrino': return 2.0;
      default: return 0.0;
    }
  }

  useImperativeHandle(ref, () => ({
    update: (time: number) => {
      if (uniforms.current) {
        uniforms.current.time.value = time;
      }
    }
  }));

  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms = uniforms.current;
    }
  }, []);

  useEffect(() => {
    if (uniforms.current) {
      uniforms.current.slitWidth.value = slitWidth;
      uniforms.current.slitSeparation.value = slitSeparation;
      uniforms.current.slitCount.value = slitCount;
      uniforms.current.isObserved.value = isObserved ? 1.0 : 0.0;
      uniforms.current.particleType.value = getParticleTypeIndex(particleType);
      
      if (isObserved) {
        if (particleType === 'neutrino') {
          uniforms.current.waveOpacity.value = 0.8;
        } else {
          uniforms.current.waveOpacity.value = 0.1;
        }
      } else {
        uniforms.current.waveOpacity.value = 1.0;
      }
    }
  }, [slitWidth, slitSeparation, slitCount, isObserved, particleType]);

  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform float slitWidth;
    uniform float slitSeparation;
    uniform float slitCount;
    uniform vec2 resolution;
    uniform float isObserved;
    uniform float particleType;
    uniform float waveOpacity;
    varying vec2 vUv;
    
    const float PI = 3.14159265359;
    
    float wavePhase(vec2 position, vec2 source, float time, float frequency) {
      float distance = length(position - source);
      return sin(distance * 10.0 - time * frequency);
    }
    
    void main() {
      vec2 position = vUv * 2.0 - 1.0;
      
      vec2 barrierCenter = vec2(0.0, 0.0);
      
      float totalWave = 0.0;
      float numSlits = slitCount;
      
      float startY = 0.0;
      if (mod(numSlits, 2.0) == 0.0) {
        startY = -slitSeparation * 0.5 + (numSlits * 0.5 - 0.5) * slitSeparation;
      } else {
        startY = (numSlits - 1.0) * 0.5 * slitSeparation;
      }
      
      float observationFactor = 1.0 - isObserved;
      
      if (particleType == 2.0) {
        observationFactor = max(0.8, observationFactor);
      }
      
      for (float i = 0.0; i < 10.0; i++) {
        if (i >= numSlits) break;
        
        float slitPos = 0.0;
        if (mod(numSlits, 2.0) == 0.0) {
          slitPos = (i - numSlits * 0.5 + 0.5) * slitSeparation;
        } else {
          slitPos = (i - floor(numSlits * 0.5)) * slitSeparation;
        }
        
        vec2 slitCenter = vec2(barrierCenter.x, slitPos);
        
        for (float j = -2.0; j <= 2.0; j++) {
          vec2 source = slitCenter + vec2(0.0, j * slitWidth * 0.2);
          
          totalWave += wavePhase(position, source, time, 3.0) * 0.2 * observationFactor;
        }
      }
      
      totalWave = totalWave / float(slitCount);
      
      vec3 particleColor;
      if (particleType == 0.0) {
        particleColor = vec3(0.2, 0.4, 1.0);
      } else if (particleType == 1.0) {
        particleColor = vec3(1.0, 0.9, 0.2);
      } else {
        particleColor = vec3(0.2, 0.8, 0.4);
      }
      
      float r = 0.5 + 0.5 * sin(totalWave * 1.0) * particleColor.r;
      float g = 0.5 + 0.5 * sin(totalWave * 1.2 + 0.5) * particleColor.g;
      float b = 0.5 + 0.5 * sin(totalWave * 1.4 + 1.0) * particleColor.b;
      
      float intensity = 1.0 - length(position) * 0.7;
      intensity = max(0.0, intensity);
      
      float opacity = waveOpacity * intensity * 0.7;
      
      gl_FragColor = vec4(r, g, b, opacity);
    }
  `;

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.45, 0]}
      visible={!(isObserved && (particleType === 'electron' || particleType === 'photon'))}
    >
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