# QA de agujeros negros y laboratorios iniciales

2 de noviembre de 2026. Revisión independiente de código, ecuaciones, criterios de retos, pruebas y documentación de siete laboratorios. La revisión visual y del sitio publicado corresponde al agente principal; este informe no atribuye pruebas de navegador ni de teléfonos físicos a la auditoría de código.

## Hallazgos por importancia

### 1. Entropía: tamaño útil y legibilidad del visor

**Evidencia de código, pendiente de contrastar con la captura visual del arreglo.** El mapa físico usa `viewBox="0 0 700 425"` y contiene títulos, una esfera, una comparación de áreas y mandos. Las reglas de `SceneChallenge.css` limitaban el SVG a 250 px de alto en escritorio, 190 px en celular y 200 px en horizontal. `series/interaction.css` también limitaba el visor amplio a 320/250 px. Mantener el SVG dentro de la pantalla no demuestra que sus objetos y textos se lean: hay que comprobar la escala efectiva del dibujo, no solo su caja.

El arreglo visual se centralizó en el agente principal para no superponer cambios de CSS. Debe contrastarse antes/después en los cuatro retos y en las vistas amplia, de exploración y con pregunta. La lupa algebraica es una escena distinta y debe conservar su tamaño útil al cambiar de reto.

### 2. Acreción: se podían aprobar comparaciones de un disco apagado

**Reproducido y corregido en la lógica de aprendizaje.** En los retos 2 y 3, `observe()` registraba inclinación, luz curvada y efecto relativista sin exigir que hubiera gas. Con `gas = 0` se podían obtener las dos marcas y aprobar una explicación sobre una emisión que no se estaba viendo.

Reproducción anterior: reto 2, gas 0, inclinación 70°, alternar luz curvada/recta; o reto 3, gas 0, activar Doppler y comparar 70° con 0°. En ambos casos `checkAnswer()` devolvía `complete` con la respuesta correcta.

Ahora esas marcas requieren `gas > 0`. Los pasos e instrucciones mencionan el disco con gas. No se exige un brillo arbitrario ni un nuevo porcentaje: basta cualquier alimentación positiva válida. Las observaciones de estados oscuros no se convierten retroactivamente en observaciones luminosas al volver a encenderlo. Se agregó una regresión para ambas secuencias.

### 3. Hawking: se premiaba una evolución imperceptible

**Reproducido y corregido en el criterio educativo.** El tercer reto consideraba observado cualquier tiempo mayor que cero. Con `age = 10⁻⁶` y una respuesta correcta se guardaba el descubrimiento, aunque radio, temperatura y potencia se presentaban como `×1` con la precisión visible de la interfaz.

Ahora se exige avanzar al menos al 25 % de la vida ideal inicial, indicado en la ayuda. Los avances menores siguen calculando la física: solo esperan a producir una comparación legible antes de marcar el reto. El atajo al 75 % sigue funcionando. La regresión cubre el umbral, cambios pequeños sin premio, razones visibles distintas de `×1` y la necesidad de la explicación correcta.

### 4. Lente: la ampliación cercana debe seguir a mano

**Riesgo de legibilidad calculable a partir del código; no se afirma una prueba visual.** El resumen de las trayectorias tiene un `viewBox` de 640 × 640 y el horizonte mide `3,15 × masa` unidades de radio. A masa de referencia y 180/150 px de alto, su radio efectivo es aproximadamente 0,89/0,74 px. El resumen es útil para localizar fuente y cámara, pero no para distinguir la curvatura cerca del agujero negro. La ampliación cercana existe dentro de un `details`, y las reglas compactas ocultaban los desplegables interiores del artículo.

Mejora recomendada: mantener una ampliación cercana accesible desde la vista de recorridos, con coordenadas y escala explícitas; conservar también el resumen global. No agrandar el horizonte artificialmente sin explicar el cambio de escala. Si se comparan masas, el encuadre de comparación debe permanecer fijo.

### 5. Documentación histórica de entropía desactualizada

`docs/ENTROPIA_LABORATORIO.md` todavía dice que el progreso no tiene almacenamiento y describe seis entradas HTML. El código actual restaura y guarda huellas mediante `readCompleted()`/`useBlackHoleProgress()` y el catálogo contiene catorce laboratorios. Conviene actualizar ese documento de arquitectura sin alterar las claves existentes ni tratar el progreso como seguimiento de personas.

## Cobertura por laboratorio

| Laboratorio | Comprobación de código y modelos | Mejora o límite principal |
| --- | --- | --- |
| Entropía de Bekenstein–Hawking | Ley de área, conversiones, estados de evaporación y balance térmico con referencias independientes | Priorizar legibilidad; distinguir siempre entropía térmica de información recuperada |
| Radiación de Hawking | Temperatura, potencia, vida ideal, espectro y signo del balance con el fondo cósmico | Criterio de tiempo legible corregido; la emisión no es una detección astrofísica |
| Lente gravitacional | Geodésicas, umbral de captura y relación con esfera de fotones; masa/distancias físicas diferenciadas | No perder la ampliación cercana en la vista compacta |
| Acreción | Disco, corrimiento relativista, órbita testigo y periodo con masa | Corregido el premio sin disco; distinguir visualmente gas luminoso, sombra y horizonte |
| Horizonte | Tiempo propio, cruce, señales y recepción exterior, con criterios que exigen recibir el envío | Conservar juntos radio de emisión, frecuencia y demora; mapa causal y fotografía no son equivalentes |
| Prisma | Dispersión, reflexión interna, estados congelados y comparaciones con luz realmente visible | Mantener el banco como referencia de interacción directa; no afirmar que un prisma reproduce todas las pruebas históricas de Newton |
| Doble rendija | Distribuciones, difracción, detector y comparación de corridas con conteos válidos | Mantener separación entre curva prevista y muestra; 800 puntos invitan a comparar, no prueban convergencia ni significación estadística |

El prisma ya distingue entre una solución geométrica y luz visible antes de validar un reto. La doble rendija valida que la configuración, el histograma y el total de detecciones pertenezcan a una misma corrida. Esas precauciones son modelos útiles para el resto de la colección.

## Verificación ejecutada

- Subconjunto inicial de **151 pruebas** de los siete capítulos, cámaras, aprendizaje, interferencia, óptica y pasaporte: aprobado antes de las correcciones.
- Subconjunto dirigido de **61 pruebas**, incluidas las dos regresiones nuevas: aprobado después de corregir acreción y Hawking.
- Repetición del subconjunto completo de los siete capítulos con las regresiones nuevas: **153 pruebas aprobadas**.
- `research/hawking/check-physics.mjs`: **10 comprobaciones independientes aprobadas**, incluidas normalización espectral, primera ley, escalas de masa y balance con el baño térmico. No es una validación observacional.
- Catálogo: catorce identificadores y rutas únicas, y cada ruta tiene su `index.html` local. El orden del especial de agujeros negros es lente → acreción → horizonte → Hawking → entropía.
- `git diff --check`: sin errores en estos cambios.

Archivos de lógica y pruebas modificados por esta auditoría: `src/acrecion/learning.ts`, `src/hawking/learning.ts`, `tests/acrecion.test.mjs` y `tests/hawking.test.mjs`. No se cambiaron ecuaciones, constantes, renderizadores, claves de progreso ni dependencias. No se hizo commit desde este agente.

## Contexto para Maldacena

La colección ya introduce luz, medición, relatividad, horizonte, temperatura y ley de área. Eso permite comenzar una introducción conceptual a holografía. Sin embargo, los balances actuales de entropía son térmicos y aproximados: no calculan entropía de entrelazamiento, una curva de Page ni la dualidad AdS/CFT. No deben presentarse como una demostración de esa dualidad. Un puente sobre correlaciones, estados globales frente a información de un subsistema y el significado de dos descripciones equivalentes ayudaría más que agregar otro agujero negro puramente decorativo.

## Límites

Esta auditoría no abrió el navegador, no midió rendimiento gráfico ni probó Safari o dispositivos físicos. Esas pruebas siguen pendientes según la decisión previa del usuario. Tampoco se usaron participantes para medir comprensión. Los hallazgos visuales de este informe son inferencias de geometría/CSS expresamente marcadas; la validación del arreglo publicado debe basarse en las capturas y las acciones del agente principal.
