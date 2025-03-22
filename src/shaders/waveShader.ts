/**
 * Shader para visualizar y simular la función de onda en el experimento de la doble rendija.
 * 
 * Este shader implementa:
 * 1. Visualización de la propagación de ondas
 * 2. Efecto de interferencia cuando las ondas pasan por las rendijas
 * 3. Colorización basada en la amplitud y fase de la función de onda
 */
export const waveShader = {
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    precision highp float;
    
    uniform float time;
    uniform vec2 resolution;
    uniform sampler2D waveTexture;
    uniform float slitWidth;
    uniform float slitSeparation;
    uniform int slitCount;
    uniform float wavelength;
    
    varying vec2 vUv;
    
    // Constantes físicas
    const float PI = 3.14159265359;
    const float SPEED_OF_LIGHT = 1.0; // Normalizado a 1 para la simulación
    
    // Función para calcular la onda desde una fuente puntual
    vec2 pointWaveSource(vec2 pos, vec2 source, float wavelength, float time) {
      float dist = distance(pos, source);
      float amp = 1.0 / max(dist, 0.01); // Atenuación con la distancia
      float phase = -2.0 * PI * (dist / wavelength - time * SPEED_OF_LIGHT / wavelength);
      
      // Retorna la función compleja (r,i) -> (cos(phase), sin(phase)) * amp
      return vec2(cos(phase), sin(phase)) * amp;
    }
    
    // Función para convertir de la representación compleja a color HSV y luego RGB
    vec3 complexToColor(vec2 complex) {
      // Magnitud (amplitud) entre 0 y 1
      float magnitude = length(complex);
      magnitude = clamp(magnitude, 0.0, 1.0);
      
      // Fase entre -PI y PI, convertida a ángulo entre 0 y 360
      float phase = atan(complex.y, complex.x);
      float hue = (phase / (2.0 * PI) + 0.5) * 360.0;
      
      // HSV: Hue basado en la fase, saturación alta, valor basado en magnitud
      float h = hue;
      float s = 0.8;
      float v = magnitude;
      
      // Conversión HSV a RGB
      vec3 rgb;
      float c = v * s;
      float x = c * (1.0 - abs(mod(h / 60.0, 2.0) - 1.0));
      float m = v - c;
      
      if (h < 60.0) rgb = vec3(c, x, 0.0);
      else if (h < 120.0) rgb = vec3(x, c, 0.0);
      else if (h < 180.0) rgb = vec3(0.0, c, x);
      else if (h < 240.0) rgb = vec3(0.0, x, c);
      else if (h < 300.0) rgb = vec3(x, 0.0, c);
      else rgb = vec3(c, 0.0, x);
      
      return rgb + vec3(m);
    }
    
    // Función principal que implementa el patrón de interferencia de la doble rendija
    void main() {
      // Coordenadas normalizadas al rango [-1, 1]
      vec2 pos = vUv * 2.0 - 1.0;
      
      // Posición de la fuente (emisor)
      vec2 sourcePos = vec2(-0.8, 0.0);
      
      // Posición de la pantalla de detección
      float screenX = 0.8;
      
      // Posición de la barrera
      float barrierX = 0.0;
      
      // Calcular la función de onda final
      vec2 waveFunction = vec2(0.0, 0.0);
      
      // Si estamos a la izquierda de la barrera, onda directa desde la fuente
      if (pos.x < barrierX) {
        waveFunction = pointWaveSource(pos, sourcePos, wavelength, time);
      } 
      // Si estamos a la derecha de la barrera
      else {
        // Verificar si el punto está afectado por las rendijas
        float slitStart = -slitSeparation * 0.5 * float(slitCount-1);
        
        // Sumamos las contribuciones de todas las rendijas
        for (int i = 0; i < 3; i++) { // Máximo 3 rendijas
          if (i >= slitCount) break;
          
          // Posición de la rendija actual
          float slitY = slitStart + float(i) * slitSeparation;
          
          // Posición de los extremos de la rendija
          float slitTop = slitY + slitWidth * 0.5;
          float slitBottom = slitY - slitWidth * 0.5;
          
          // Sumamos puntos a lo largo de la rendija
          int points = 5; // Número de puntos por rendija
          for (int j = 0; j < 5; j++) {
            float t = float(j) / float(points-1);
            vec2 slitPoint = vec2(barrierX, mix(slitBottom, slitTop, t));
            
            // Calculamos la onda desde la rendija hasta el punto actual
            waveFunction += pointWaveSource(pos, slitPoint, wavelength, time) * 0.2;
          }
        }
      }
      
      // Visualizamos la función de onda como color
      vec3 color = complexToColor(waveFunction);
      
      // Atenuación en la barrera excepto en las rendijas
      if (abs(pos.x - barrierX) < 0.01) {
        bool insideSlit = false;
        float slitStart = -slitSeparation * 0.5 * float(slitCount-1);
        
        for (int i = 0; i < 3; i++) {
          if (i >= slitCount) break;
          
          float slitY = slitStart + float(i) * slitSeparation;
          float slitTop = slitY + slitWidth * 0.5;
          float slitBottom = slitY - slitWidth * 0.5;
          
          if (pos.y <= slitTop && pos.y >= slitBottom) {
            insideSlit = true;
            break;
          }
        }
        
        if (!insideSlit) {
          color = vec3(0.1, 0.1, 0.1);
        }
      }
      
      // Visualizamos la pantalla de detección
      if (abs(pos.x - screenX) < 0.01) {
        color = mix(color, vec3(0.8, 0.8, 0.8), 0.3);
      }
      
      // Emisor
      float emitterRadius = 0.03;
      if (distance(pos, sourcePos) < emitterRadius) {
        color = vec3(1.0, 0.5, 0.0);
      }
      
      gl_FragColor = vec4(color, 0.8);
    }
  `
}; 