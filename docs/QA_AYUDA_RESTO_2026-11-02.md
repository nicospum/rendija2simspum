# QA independiente del modo ayuda — resto de laboratorios

Fecha: 2026-11-02. Agente: `qa_other_help`.

## Alcance y método

Revisión en navegador Chrome mediante CUA sobre el sitio público `https://www.spumexp.lat/`. Controles e inspección del DOM renderizado; capturas de pantalla y comparación de valores antes/después. No se modificó el estado interno de la aplicación mediante scripts. Se usaron interacciones de UI para activar ayuda, consultar, salir y volver a operar.

Dispositivos emulados: 390 × 844 como base; muestras en 320 × 667, 667 × 375 y escritorio 1920 × 889. Retest de correcciones en `http://127.0.0.1:1027/`. La revisión de Einstein corresponde a otro agente.

Esto es una revisión heurística y funcional, no una prueba con participantes principiantes. Safari y teléfonos físicos siguen pendientes por indicación del usuario: este entorno no dispone de esos equipos.

## Cobertura pública

| Laboratorio | Consulta y control comprobado | Resultado |
|---|---|---|
| Prisma | Catálogo 3D; prisma, lámpara; interruptor de fuente | Texto específico; tarjeta bajo el visor; la consulta mantiene fuente encendida y salir permite apagarla |
| Doble rendija | Catálogo 3D; frentes de onda; emitir partícula | Explica escala ilustrativa y diferencia con trayectorias; consultar conserva 0 detecciones, salir y emitir produce 1 |
| Hawking | Horizonte, radiación dorada, partículas azules al activar fondo cósmico | El catálogo se actualiza al cambiar entorno. Distingue absorción, emisión, balance y evaporación. Consultar el entorno no lo activa; salir sí permite activarlo |
| Lente gravitacional | Imagen/sombra y vista de recorridos; selector de rayo con flechas | Ayuda de sombra distingue sombra y horizonte. Consultar conserva 14°; salir permite cambiar dirección. Véase nota sobre trazos finos |
| Acreción | Gas, frecuencia mayor, sombra; control del gas y estrella testigo | Consulta mantiene 55%; salir y usar flecha pasa a 60%. Texto distingue acreción de Hawking. La estrella explica inferencia orbital |
| Entropía | Asas de masa y emisión; ambas vistas móviles | Distingue asa de control y partícula. La consulta conserva emisión 0; salir permite cambiar a 0,025. Se detectó solapamiento visual |
| Horizonte | Sonda, control del mapa y vista de futuros de luz | Distingue caída libre y sostenerse. Consulta mantiene radio 4; salir y flecha izquierda cambia a 3,95. Se detectó solapamiento visual menor |
| Entrelazados | Sistema A y analizador A | Explica bases Z/X y ausencia de señal instantánea. Consulta conserva Z; salir permite cambiar a X. Se detectó solapamiento visual en escritorio |
| Holografía / Geometría | Extremo B y corte regulador | Explicaciones específicas; ayuda mantiene ℓ=2 y ε=0,2. Escape permite volver a modificar el extremo |
| Holografía / Diccionario | Corte regulador | Explica regulador y límite asintótico; consulta no cambia ε=0,1 |
| Holografía / Temperatura | Termómetro de frontera | Explica unidades naturales, estados estacionarios y coordenada del horizonte. Ayuda conserva T=0,16 |
| Curva de Page | Marca horizontal 6, emisión, reto 1 | El 6 se explica como qubits en R, no tiempo o masa. Consulta de emisión conserva 0, salir permite pasar a 1. Reto 1 completado con comparación Inicio/Primer qubit |

Los alias públicos `/espacio-con-frontera/`, `/dos-lenguajes/` y `/frontera-caliente/` cargaron la sección correcta de Holografía y mostraron el botón de ayuda. No se repitieron en ellos todos los casos de sus rutas canónicas.

## Hallazgos reproducibles

### P2 — Las explicaciones DOM/SVG cubrían el dibujo

Entropía, escritorio 1920 × 889: entrar sobre la escena, activar ayuda y consultar el asa dorada. La tarjeta estaba completamente dentro del SVG y ocultaba gran parte del cuadrado comparativo de áreas. SVG `(221,5;214,7;877,2;534,6)`; tarjeta `(636,25;473,86;340;216)`.

Entropía, móvil 390 × 844: la tarjeta del asa dorada empezaba en y=546 y el SVG terminaba en y=602, ocultando los últimos 56 px. Horizonte presentaba el mismo problema en los últimos 24 px. Entrelazados, escritorio, la tarjeta de A quedaba en el centro de la representación de probabilidades.

Estado: **corregido y retestado localmente en entropía y entrelazados**. La nueva tarjeta usa el espacio exterior al visor. Entropía: separación de 8 px en 390 × 844; tarjeta sobre el área libre en 320 × 667 y a la derecha del visor en 667 × 375. Entrelazados: 8 px de separación en móvil 390 y escritorio 1280 × 900 (SVG termina en x=780,5 y la tarjeta comienza en x=788,5). No hubo desbordamiento horizontal. El cierre conserva 44 px de ancho. En 390 puede hacer falta desplazar el contenido de la tarjeta para leer el final; el visor queda descubierto.

### P2 — Ayuda de cámara cubría el canvas de Prisma y Doble rendija

Reproducción local 1027 a 390 × 844: `Visor` → activar ayuda → consultar `Vista superior`.

- Prisma: tarjeta y=558–762 sobre `.scene-viewport` y=490–800.
- Doble rendija: tarjeta y=558–762 sobre `.quantum-viewport` y=491–901.

El cambio de vista permanecía bloqueado correctamente. La tarjeta usaba el posicionamiento genérico en lugar de proteger el canvas visible.

Estado: **corregido y retestado localmente en ambos laboratorios**. Con los mismos pasos, la tarjeta usa `lab-help-scene-card`, se coloca en y=12–216 y el canvas conserva y=490/491 sin superposición. La vista superior sigue sin activarse durante la consulta.

### P2 — Page explicaba emisión con el concepto de pureza

Público, 390 × 844: activar ayuda y tocar `Emitir un qubit →` mostraba `Pureza del conjunto`, sin explicar el reparto B→R de esa acción. El número de qubits se mantenía correctamente en 0.

Estado: **corregido y retestado localmente por este agente**. La nueva explicación se titula `Incluir un qubit más en la radiación R`, explica B→R, conservación del estado puro y el carácter abstracto del reparto, diferenciándolo de una emisión física calculada de Hawking.

### P2 — El resultado del reto de Page quedaba detrás de la escena fija

Público, 390 × 844: elegir la predicción correcta del reto 1 y usar `Inicio: 0` y `Primer qubit: 1`. El reto se completaba, pero el bloque de devolución y el botón `Siguiente reto →` quedaban físicamente detrás de la escena fijada al desplazar los controles. `elementFromPoint` en el centro del siguiente reto devolvía un `rect` del gráfico en lugar del botón.

Estado: **corregido y retestado localmente por este agente**. El acceso visible `✓ Resultado` de la cabecera revela la devolución sin desplazar automáticamente el experimento al completar la comparación. Después de tocarlo, `Siguiente reto →` queda en y=713,9–757,9 y `elementFromPoint` en su centro devuelve el botón, no el SVG. Se pudo pulsar y avanzar a `2/4 · Dibujar la vuelta`. El gráfico permanece visible en y=138,6–356.

## Notas de interpretación y límites

- Una consulta inicial de la curva de lente produjo una explicación del selector del rayo. **No se considera un defecto semántico confirmado**: el clic por el centro del rectángulo de un polyline puede caer fuera del trazo. El elemento pintado contiene `data-help-title="Rayo de luz elegido"` y una explicación científica correcta. Una lectura `elementFromPoint` en una coordenada del trazo sí identificó ese polyline, pero no se pudo confirmar con fiabilidad la misma coordenada mediante el clic nativo bajo emulación. No se pidió cambiar el resolver por este caso.
- El botón flotante del modo ayuda puede cubrir texto próximo al borde inferior. En esta revisión no se confirmó una acción central inaccesible por ese botón; no se afirmó un fallo a partir de un solapamiento hipotético.
- Se probaron muestras de retos y controles relacionadas con la ayuda, no todos los retos completos ni todas las combinaciones físicas.
- No se ejecutaron pruebas unitarias, lint o build desde este agente. Esas comprobaciones y la publicación corresponden al agente principal. Este documento distingue observación pública previa y retest local; no acredita por sí solo el despliegue final.

## Evidencias

Capturas en `.work/qa-ayuda-total-2026-11-02/` del repositorio contenedor (fuera del checkout publicable). Entre las principales:

- `entropia-desktop-ayuda-borde.png`, `entropia-390-ayuda-borde.png`.
- `entrelazados-desktop-ayuda-A.png`, `entrelazados-390-ayuda-base.png`.
- `entropia-local-390-corregido.png`, `entropia-local-320-corregido.png`, `entropia-local-667-corregido.png`.
- `entrelazados-local-390-corregido.png`.
- `prisma-local-390-ayuda-vista.png`, `doble-local-390-ayuda-vista.png` (reproducciones antes de la corrección de esos controles).
- `prisma-local-390-vista-corregido.png`, `doble-local-390-vista-corregido.png`, `entrelazados-local-1280-corregido.png` (verificación final de la corrección).
- `page-390-consulta-emision.png`, `page-390-reto-completado.png`.
- `page-local-390-resultado-corregido.png`.
- `prisma-390-ayuda-objeto.png`, `doble-390-ayuda-ondas.png`, `hawking-390-ayuda-horizonte.png`, `lente-390-ayuda-sombra.png`, `acrecion-390-ayuda-gas.png`, `horizonte-390-ayuda-sonda.png`.
