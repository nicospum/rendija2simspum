# Geometría e información: dos laboratorios del especial Maldacena

Implementación: `src/maldacena/geometry/`. Sin nuevas dependencias. El estado del montaje pertenece al componente React; `physics.ts` y `learning.ts` no dependen del navegador. La geometría SVG se calcula al cambiar variables; no se reproducen trayectorias grabadas.

## Un espacio con frontera

Se representa un corte espacial de tiempo constante de AdS₃, en coordenadas de Poincaré. La métrica es `ds²=L²(dx²+dz²)/z²`. La figura tiene dos coordenadas espaciales; AdS₃ tiene 2+1 dimensiones. No son trayectorias de luz ni una fotografía astronómica. Se usan unidades naturales con `L=1`.

Los extremos están en `(centro−ℓ/2, ε)` y `(centro+ℓ/2, ε)`. La geodésica es un segmento del círculo de radio `R=sqrt((ℓ/2)²+ε²)` centrado en `z=0`; su longitud regulada es `2L asinh(ℓ/(2ε))`. La recta horizontal entre esos extremos mide `Lℓ/ε`. El arco punteado mantiene una comparación de referencia.

Esto **no** es simplemente truncar a `z=ε` un arco cuyo diámetro ideal fuera ℓ: en ese otro problema los extremos regulados cambiarían su separación horizontal. Mantener claras las condiciones de contorno permite comparar correctamente la longitud exacta y el límite asintótico.

La cuadratura de Simpson integra `L/sin θ` sobre el arco. La lectura de comprobación muestra la integral, la expresión analítica y su residuo. El perfil de longitud acumulada usa el parámetro angular para el arco y el parámetro lineal para la recta; el eje horizontal se identifica como avance del parámetro de cada camino, **no tiempo**. Las bandas horizontales del mapa se separan por razones sucesivas `exp(0,5)` en z: a x constante, cada banda mide 0,5 L de distancia vertical, aunque no ocupa los mismos píxeles.

Cuatro retos: comparar recta y arco; separar extremos; bajar el regulador; comparar profundidad para regiones anchas. Cada uno exige pulsar «Medir los dos caminos» con las condiciones visibles. Cambiar una barra sin medir no concede una observación.

## Dos lenguajes, una misma respuesta

Se comparan dos cantidades para **un único intervalo en el vacío sobre una línea infinita**:

- La parte universal de la entropía CFT₂: `S=(cCFT/3) ln(ℓ/ε)+constante`.
- La longitud exacta con extremos regulados, dividida por `4G₃`.

Se fija la misma convención de constante aditiva (cero) y el diccionario semiclásico `cCFT=3L/(2G₃)`, con `cCFT=60`, `L=1`, `G₃=0,025`. cCFT es la carga central, no la velocidad de la luz; no se ofrecen barras independientes para parámetros relacionados. Las entropías usan nats.

La fórmula logarítmica es asintótica: a corte finito no se fuerza igualdad exacta. El residuo positivo se muestra explícitamente y disminuye con ε/ℓ. El cuarto reto compara `ΔS` entre ℓ=2 y ℓ=4 usando un mismo corte: la diferencia geométrica converge a `(cCFT/3) ln 2` mientras se cancela la divergencia común. Las barras de la vista de frontera conservan la escala de 0 a 110 nats, suficiente para todo el dominio permitido.

Cuatro retos: duplicar el intervalo; trasladarlo sin agrandarlo; registrar cortes grueso y fino; comparar incrementos en ambos cortes. Los dos últimos requieren las dos mediciones, guardadas en la lista de observaciones del ensayo. El historial conserva hasta ocho montajes recientes y muestra los valores calculados al registrarlos.

La experiencia ilustra una relación de Ryu–Takayanagi en el régimen apropiado. No resuelve una CFT microscópica, no demuestra toda AdS/CFT y no confirma que nuestro universo sea un holograma. La entropía de una región del vacío es distinta del balance térmico de radiación del laboratorio Hawking.

## Interacción y límites

- A/B cambian extremos, la manija ↔ traslada el intervalo y la manija rosa cambia ε con recorrido logarítmico para dar espacio al control fino.
- Los deslizadores de la escena aceptan Tab, flechas, Home/End y PageUp/PageDown; las barras HTML modifican las mismas variables.
- Solo las asas capturan el puntero; el resto de la página conserva el desplazamiento normal.
- El centro se acota a [−1,1], ℓ a [1,4;4] y ε a [0,02;0,4]. El fondo mantiene la escala al modificar el montaje. Las asas se amplían en móvil y las dos vistas se alternan para evitar miniaturas simultáneas.
- Predicción y pasos se validan en el `LabFrame` compartido. El pasaporte conserva logros; las medidas actuales no se presentan como datos experimentales reales.

## Verificación

`tests/maldacena-geometry.test.mjs`: ocho pruebas que cubren diccionario, coordenadas de extremos, radio, longitud y perfil; integración independiente en coordenadas angulares y aproximación cartesiana; límite logarítmico y convergencia de diferencias; traslaciones; entradas inválidas y límites; condiciones de observación de los ocho retos, incluidas comparaciones incompletas. El primer cálculo de Simpson con 4096 segmentos superó levemente la tolerancia en el extremo ℓ=4, ε=0,02; se aumentó a 8192 y se mantuvo el error visible. Ocho pruebas aprobadas; TypeScript y ESLint pertinentes correctos durante implementación.

La comprobación de experiencia en navegador corresponde al informe final coordinado. Estas pruebas numéricas no certifican legibilidad, gestos táctiles, Safari ni rendimiento de dispositivos físicos.

## Fuentes

- [Natsuume, AdS/CFT Duality User Guide](https://arxiv.org/abs/1409.3575).
- [Maldacena, propuesta original](https://arxiv.org/abs/hep-th/9711200).
- [Ryu y Takayanagi, Holographic Derivation of Entanglement Entropy from AdS/CFT](https://arxiv.org/abs/hep-th/0603001).
- [Calabrese y Cardy, Entanglement Entropy and Quantum Field Theory](https://arxiv.org/abs/hep-th/0405152). Se utiliza su resultado de intervalo único; no se generaliza a múltiples intervalos.
