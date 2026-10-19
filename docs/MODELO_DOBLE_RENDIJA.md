# Modelo de la doble rendija

## Pregunta y alcance

El objetivo es relacionar detecciones localizadas con probabilidades que dependen de la disponibilidad de información del camino. La interferencia de ondas también existe en física clásica; la acumulación de eventos individuales permite explorar la versión cuántica. El modelo compara distribuciones, sin adjudicar una trayectoria definida a una partícula no medida.

Se usa el patrón analítico ideal de Fraunhofer para aberturas rectangulares iguales, iluminadas uniformemente y con fase coherente. La coordenada transversal es **z** en física, geometría y pantalla; la propagación esquemática sigue X. La relación de fase es paraxial o de un plano de Fourier. No se modela la transición de Fresnel ni la evolución temporal de la función de onda.

Todas las longitudes usan una misma unidad normalizada **u**. La cámara y el montaje representan el experimento de manera esquemática; esos valores no deben interpretarse como un aparato calibrado en metros, milímetros o nanómetros.

## Amplitudes y detector

Para N rendijas con centros `z_j = (j − (N−1)/2)d`, ancho a, longitud de onda λ y distancia L:

```text
β = π a z / (λ L)
A_j(z) = sinc(β) exp(i 2π z_j z / (λ L))
sinc(0) = 1

I_coherente(z) = sinc²(β) |Σ_j exp(iφ_j)|² / N
I_camino(z)    = sinc²(β)
I(z)          = (1 − s) I_coherente(z) + s I_camino(z)
```

El parámetro s es la fracción ideal de eventos con un registro distinguible del camino. Al 100 % se suman probabilidades de las aberturas, sin términos cruzados; al 0 % se suman amplitudes. No es la distinguibilidad D de una relación de dualidad ni un modelo microscópico de un detector real. El factor 1/N mantiene la convención de flujo transmitido del conjunto. Las distribuciones finales se normalizan en la pantalla visible.

La envolvente de difracción depende del ancho real a. El detector no la convierte en dos trazos de proyectiles clásicos. Para una sola abertura, el parámetro s no cambia la distribución. Las especies electrón, fotón y neutrón tienen igual distribución ideal a igual λ; no se asignan masas ficticias ni inmunidades a la medición.

Para dos rendijas coherentes, la separación paraxial entre máximos es `Δz = λL/d`. Con los valores iniciales resulta aproximadamente **0.583 u**. Para múltiples rendijas se suman las N amplitudes, sin elevar artificialmente un coseno a una potencia.

## Detecciones y datos

`buildDistribution` integra la intensidad en 4096 intervalos de z∈[−3,3] y construye una CDF normalizada. La integración se adapta al ancho de los máximos para evitar aliasing. `sampleImpact` invierte esa CDF mediante búsqueda binaria y produce una posición dentro del intervalo elegido. Cada emisión se vuelve a muestrear; no hay una lista grabada de impactos ni una textura que determine los datos.

El histograma acumula 256 intervalos; la curva de teoría suma probabilidades de la distribución fina sobre esos mismos intervalos. Las alturas de barras y curvas se expresan por frecuencia relativa para permitir comparaciones entre corridas de distinto tamaño. La coordenada vertical y y el brillo de cada punto son decorativos, sin modificar la probabilidad transversal.

Se registran detecciones condicionadas a llegar al área visible de la pantalla: no se infieren partículas absorbidas, eficiencia de detección ni flujo absoluto de una fuente. Las detecciones se incorporan al emitir, sin un tiempo de vuelo simulado. La tasa controla la velocidad de adquisición visual, no λ ni una velocidad física.

El estado conserva todos los conteos, pero solo los últimos 2000 puntos individuales para la GPU. Por eso el histograma es el registro completo de una corrida larga. Cambiar parámetros físicos comienza otra corrida; guardar una comparación copia tanto los datos como la configuración. Pausa impide nuevas detecciones manuales y automáticas. Las pestañas ocultas no acumulan un atraso de emisiones.

## Validación

Las pruebas comprueban ceros y máximos analíticos, simetría, factor N-rendijas exacto, envolvente de ancho real, escala λL/d, eliminación de términos cruzados, mezcla parcial y equivalencia de especies a igual λ. En la configuración más estrecha, se compara con una integración independiente de 262144 muestras, con error L1 inferior al 1 %.

El muestreo se contrasta con cuantiles y estadísticas reproducibles. Se prueba conservación de conteos, límites, saneamiento de entradas, pausa, limpieza y comparación. Las cámaras se contrastan con proyecciones independientes de Three.js en escritorio y celular.

Estas verificaciones no convierten la visualización en un solver de Schrödinger ni validan un montaje material específico. Para relacionarlo con un experimento real habría que definir escalas SI, coherencia de la fuente, geometría de iluminación y respuesta del detector.

## Fuentes

- [Feynman, vol. III capítulo 1](https://www.feynmanlectures.caltech.edu/III_01.html): experimento de interferencia y detección individual.
- [Feynman, vol. III capítulo 3](https://www.feynmanlectures.caltech.edu/III_03.html): reglas de composición de amplitudes.
- [Tonomura et al., AJP 57, 117 (1989)](https://doi.org/10.1119/1.16104): acumulación experimental de electrones individuales.
