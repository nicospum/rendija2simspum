# Bell · Seguimiento de uso independiente

Revisor: `bell_producto`. Fecha: 2 de noviembre de 2026. Base publicada examinada: `20d6262`, en `https://www.spumexp.lat/bell/`. Esta revisión nueva no reemplaza la auditoría inicial ni certifica comprensión con participantes.

## Estado

La base publicada permite completar los cuatro retos y distingue respuestas correctas, incorrectas y observaciones incompletas. Se encontraron obstáculos didácticos y una pérdida de datos por una acción sin cambio físico. Tras las correcciones y repeticiones descritas abajo, **APROBADO el candidato local de producto**, sobre `20d6262`, servido en `http://127.0.0.1:1027/bell/`. Sus nueve hashes se guardaron con la evidencia. La comprobación posterior del commit y del dominio corresponde a coordinación; esta aceptación no atribuye automáticamente al sitio público las correcciones locales.

Se aplicaron las skills `game-playtest` y `game-ui-frontend`. Se leyeron `AGENTS.md`, física, reducer, retos, escenas, App, CSS y el contrato compartido de `SceneConsole`. Todas las interacciones de navegador se hicieron con CUA; el DOM se consultó en modo de sólo lectura. No se manipularon reducers ni almacenamiento para completar observaciones.

## Hallazgos reproducibles en la publicación inicial

| Prioridad | Hallazgo y reproducción | Implicación / mejora solicitada |
|---|---|---|
| P2 | En 390 × 844, entrar al experimento deja la escena en y≈75…392. La colección medida está en y≈1191…1503. Tocar la fuente registra N=1 y A+=100 % en ese lote, pero el visor sigue mostrando solamente «E del modelo +1,000 · 100 % iguales». | El efecto medido de jugar queda lejos de la acción y puede confundirse con una predicción fija. Añadir junto a la escena N, frecuencia de iguales, E observado y A+, distinguidos del modelo; acercar los lotes y atajos necesarios. |
| P2 | Reto 2: guardar la tarjeta inicial +2, pulsar el prominente «Invertir todas las respuestas» y volver a guardar conserva S=+2. El paso sigue pidiendo −2. La devolución no explica la conservación de los productos ni cómo cambiar una sola casilla. | La inversión global es físicamente correcta, pero parece el camino natural hacia el signo negativo. Aclarar visiblemente «tocá UNA casilla» y que invertir las cuatro conserva S. |
| P2 | Después de un lote de 200 en A₀B₀, volver a pulsar A₀B₀ ya seleccionado deja N=0 y E «sin datos», sin variar los ángulos. En la reproducción se perdieron 112 ++ y 88 −−, E=+1 y A+=56 %. | Elegir la combinación actual debe ser una acción nula y conservar datos. Se añade a la revisión independiente del otro agente sobre la misma orientación. |
| P2 didáctico | Los cuatro errores reciben el mismo texto sobre listas, correlación y suma. En R1, elegir «Podés elegir si A dará + o −» después de medir ambos lotes no recibe una explicación sobre no controlar la salida local ni una referencia a A+. | Usar devoluciones por reto/idea, señalando la observación que contradice la predicción y qué revisar. |
| P3 | La entrada usa Φ⁺, +/−, A₀/A₁, correlación E y «4 ajustes · 50 por par» sin una definición básica visible junto al dibujo. Algunas definiciones están sólo en ayuda o notas posteriores. | Distinguir dos salidas, dos orientaciones guardadas y pares de fotones frente a combinaciones de ajustes con leyendas breves. La revisión científica independiente identificó también este problema. |
| P3 teclado | En R2 completo, pulsar Enter en «Siguiente reto →» cambia a R3 y deja `activeElement=BODY`. Tab siguiente lleva al botón «Experimento», no al selector/pregunta del nuevo reto. | Mantener una continuidad de foco visible al avanzar o reiniciar. Se comunicó al agente de integración; no bloquea los gestos táctiles. |

## Matriz funcional publicada

Pruebas principales en Chromium emulado a 390 × 844:

| Reto | Incompleto | Incorrecto | Correcto | Reinicio |
|---|---|---|---|---|
| 1 · Coincidencias | Una emisión, idea correcta sin lotes, sólo 0°, y 45° sin medir mantienen Comprobar deshabilitado. | Se rechaza controlar la salida A después de ambos lotes. | Se verifican dos lotes 0°/45° y cambio de coincidencias con marginales ideales 50 %. | Borra datos y predicción, sin aprobar por la huella histórica. |
| 2 · Tarjetas | Sólo +2, inversión global que conserva +2 y cambio de casilla sin guardar no completan −2. | Se rechaza alcanzar 4 tras guardar ambas tarjetas. | Guardar +2 y −2 y explicar la cancelación verifica. | Borra referencias y predicción. |
| 3 · Estadística | Idea sin lotes, sólo 50, y 1000 con A₀=0,5° no satisfacen el montaje de Bell. | Se rechaza que una estimación mayor que 2 pruebe por sí sola una ley natural. | Restaurar los ángulos y registrar 1000 además del ensayo de 50 verifica con la explicación correcta. | Limpia ensayos/predicción; conserva sólo historia de visita. |
| 4 · No señalización | Idea sin lotes, sólo B=0° y B=90° sin nuevo lote siguen incompletos. | Se rechaza leer el ajuste remoto a partir de un + local. | Dos lotes B=0°/90° con A=0° y explicación de listas locales verifica. | Borra ambas observaciones y predicción. |

Se revisaron las tres vistas en 320 × 667 y 667 × 375. No hubo desbordamiento horizontal. El centro del selector de predicción devolvió SELECT en las seis muestras. En 320 las alturas iniciales fueron aproximadamente 286 px en Experimento, 351 px en Tarjetas y 343,5 px en Suma. En horizontal se conservan escena y pregunta lado a lado. Estas muestras deberán repetirse al añadir las lecturas y acciones nuevas.

No se observaron errores de consola durante el recorrido público. Los intervalos cambian entre ensayos; no se calificó por una fluctuación favorable. La palabra «par» se evaluó como problema de claridad, no como error en los cálculos.

## Correcciones y aceptación del candidato

- La entrada explica una fuente, dos estaciones y dos resultados. Se definen las orientaciones guardadas, las salidas y las cuatro alternativas de la tabla; una pareja aporta una alternativa, no cuatro resultados simultáneos. «4 × 50 pares» y «4 × 1000 pares» se acompañan de sus totales.
- El visor mantiene separados E del modelo y los medidos: N, porcentaje de iguales, E observado y frecuencia local de A. Los atajos B y «Medir 200 pares» están junto al dibujo. Se comprobó fuente N=1, reemplazo por 200 y emisión posterior N=201. Girar de verdad un analizador sigue limpiando los datos activos.
- Pulsar la combinación ya seleccionada, tocar el tirador sin moverlo y repetir un preset idéntico conservan el montaje y N. Se repitieron esas tres acciones; el gesto real B=45°→0° cambia E del modelo de 0 a +1 y limpia N.
- Tarjetas indica tocar ±. El botón de inversión global dice explícitamente que S se conserva; cambiar una casilla y guardar sí permite contrastar +2/−2. La cancelación, los productos y el límite dorado permanecen a la vista.
- Se probaron **las ocho respuestas erróneas**, dos por reto. Cada una recibe una explicación propia: control de A frente a cuatro posibilidades; productos compartidos frente a media aleatoria; fluctuación frente a cambiar N; signo local frente a coincidencia entre dos listas. Ninguna verifica. Los cuatro aciertos necesitan sus observaciones y verifican. Los cuatro reinicios se repitieron; R2 se completó y reinició también en 320.
- Enter en «Siguiente reto» de R2 lleva a R3 con foco en el selector del nuevo reto, en lugar de BODY. Se conserva la continuidad del teclado.

### Protección de escena y controles

La primera versión corregida creció demasiado: en 320 la escena de Experimento medía 479 px y la predicción quedaba fuera de la pantalla; la primera Tarjetas extendida medía 415,5 px. Se rechazaron esas distribuciones y se compactaron repeticiones de texto, márgenes y datos. Los mandos HTML conservan un alto mínimo de 44 px y alternativas para fuente y diales; los blancos SVG escalan con el dibujo, por lo que esta revisión no acredita un mínimo físico de 44 px para cada objeto dibujado.

| Vista final | 390 × 844: altura de escena | 320 × 667 | 667 × 375 horizontal | 1280 × 900 |
|---|---:|---:|---:|---:|
| Experimento con datos | 399,7 px | 384,5 px | 308,3 px | 654,0 px |
| Tarjetas | 369,0 px | 369,0 px | 307,0 px | 458,4 px |
| Suma con ensayo | 365,5 px | 365,5 px | 308,5 px | 349,5 px |

Las tres escenas horizontales terminan antes de y=375; la más baja llega a y≈372,5. En escritorio la escena de Experimento termina en y≈728, dentro de 900. Las doce muestras finales (tres vistas en cuatro tamaños) conservaron el selector de respuesta y no desbordaron horizontalmente. Se capturaron R1 y R2 mientras se respondían con la escena visible.

### Ayuda: dos interceptaciones detectadas y corregidas

Se amplió la prueba del selector desde su centro hasta su **flecha derecha**, una zona de toque habitual. En 320, el botón flotante visible de ayuda cubría esa flecha: punto (265; 629) devolvía BUTTON y un toque nativo activaba ayuda. No era el hueco transparente del dock corregido en la auditoría previa. Se movió el botón sólo en Bell móvil a una zona superior con espacio reservado en navegación y cabecera. La misma flecha devuelve ahora SELECT; los toques nativos en 320 y 390 abrieron la respuesta, conservaron ayuda desactivada y dejaron foco en el selector.

Ese traslado dejó inicialmente Salir debajo del popup en horizontal: el punto (604; 28) daba SECTION y un toque no salía. Se corrigió el orden de capas y se reservó espacio en el encabezado del popup para X, sólo en la media query horizontal de Bell. Se repitieron los centros y cuatro bordes medios de X y Salir: todos corresponden a su botón, sin activarse mutuamente. Un toque nativo en X cierra sólo la explicación; un toque nativo en Salir desactiva el inspector. Las esquinas redondeadas fuera de la silueta no se confundieron con bordes medios útiles.

Con ayuda activa, tocar fuente, dial y Medir 200 mantuvo N=200 y explicó el elemento correcto. Al salir, emitir llevó a N=201. El popup horizontal ocupa la columna de preguntas y deja libre el dibujo. Se verificaron los cuatro enlaces de navegación en centro y bordes y se pulsó cada uno; cabecera SPUM/Maldacena conserva blancos separados de ayuda. No se cambiaron estilos compartidos de los demás laboratorios para este ajuste.

Dos primeras muestras del candidato se tomaron con inspector accidentalmente activo y están marcadas descartadas para evaluar interacción. El intento de Salir horizontal que falló queda marcado `expectedNotMet` y se conserva como reproducción del problema, seguido de las pruebas finales que lo resuelven. Los registros anteriores a una corrección no se presentan como resultados del candidato final.

La consola final no mostró errores. Esta aceptación es interna e independiente de implementación, sin bloqueantes de producto abiertos en el alcance probado. Las pruebas científicas y automatizadas tienen un dictamen separado.

### Apéndice dirigido: escritorio de poca altura

Después del pase anterior, coordinación detectó una altura no cubierta inicialmente: en 1280 × 600, el botón verde quedaba fuera de pantalla (bottom≈715). Se añadió sólo una cota de altura al SVG de Experimento para ancho ≥851: `max-height: max(90px, calc(100svh - 450px))`. No cambia los cálculos, el estado ni las reglas móviles; Tarjetas y Suma son HTML y tampoco reciben esa cota SVG.

Se realizó una nueva comprobación independiente y dirigida, sin repetir los cuatro retos:

| Tamaño | SVG | Escena: bottom | Medir 200: bottom | Blanco de fuente, píxeles CSS | Acción real |
|---|---:|---:|---:|---:|---|
| 1280 × 600 | 150 px | 582,31 | 569,31 | 51,11 × 51,11 | Toque nativo en Medir 200 registró N=200; toque nativo en la fuente llevó a N=201. |
| 1280 × 720 | 270 px | 701,78 | 688,78 | 92 × 92 | Preparar B=45° limpió N; toque nativo en Medir 200 registró 200, con 51 % iguales, E=0,020 y A+=53 % en esa muestra. |

En ambos tamaños, escena, lectura medida, botón y selector de predicción quedan visibles; los centros de botón y selector corresponden a BUTTON y SELECT. Sin desbordamiento horizontal ni errores de consola. **Aprobado el ajuste dirigido.** El manifiesto final actualiza únicamente el hash CSS de este cambio y conserva la correspondencia de los nueve archivos; las verificaciones móviles previas no se atribuyen a un navegador o dispositivo diferente.

## Evidencia

Artefactos fuera del Git del sitio, en `../qa-bell-followup-2026-11-02/` respecto de la raíz del checkout:

- [Preparación y seis hashes de la base](../../qa-bell-followup-2026-11-02/preparation.json).
- [37 registros de recorrido, geometría y foco](../../qa-bell-followup-2026-11-02/public-cases.json).
- [77 registros de candidato, hallazgos y repetición](../../qa-bell-followup-2026-11-02/candidate-cases.json).
- [Hashes del candidato aprobado](../../qa-bell-followup-2026-11-02/candidate-source-hashes.json).
- [Primera acción en 390](../../qa-bell-followup-2026-11-02/public-first-action-390.jpg).
- [Devolución errónea de R1](../../qa-bell-followup-2026-11-02/public-r1-wrong-390.jpg).
- [Inversión global de R2](../../qa-bell-followup-2026-11-02/public-r2-invert-all-390.jpg).
- [Experimento en 320](../../qa-bell-followup-2026-11-02/public-experiment-320.jpg), [Tarjetas en 320](../../qa-bell-followup-2026-11-02/public-cards-320.jpg), [Suma en 320](../../qa-bell-followup-2026-11-02/public-score-320.jpg).
- [Experimento horizontal](../../qa-bell-followup-2026-11-02/public-experiment-667.jpg), [Tarjetas horizontal](../../qa-bell-followup-2026-11-02/public-cards-667.jpg), [Suma horizontal](../../qa-bell-followup-2026-11-02/public-score-667.jpg).
- [R1 final mientras se responde, 390](../../qa-bell-followup-2026-11-02/final-experiment-390-answer.jpg), [R2 final mientras se responde, 390](../../qa-bell-followup-2026-11-02/final-cards-390-answer.jpg).
- [R2 con ayuda recolocada, 320](../../qa-bell-followup-2026-11-02/final-help-position-cards-320.jpg), [lecturas medidas de R1, 320](../../qa-bell-followup-2026-11-02/final-experiment-320-data.jpg).
- [Ayuda horizontal con X y Salir separados](../../qa-bell-followup-2026-11-02/final-help-exit-separation-667.jpg).
- [Experimento final de escritorio](../../qa-bell-followup-2026-11-02/final-experiment-1280.jpg), [Suma final de escritorio](../../qa-bell-followup-2026-11-02/final-score-1280.jpg).
- [Comprobación dirigida 600/720](../../qa-bell-followup-2026-11-02/desktop-short-targeted.json), [visor en 1280 × 600](../../qa-bell-followup-2026-11-02/desktop-short-600-final.jpg), [visor en 1280 × 720](../../qa-bell-followup-2026-11-02/desktop-short-720-final.jpg).

## Límites

Los tamaños de celular son emulados en Chromium. Safari y dispositivos físicos siguen pendientes por decisión previa del usuario. No se realizó una prueba con estudiantes ni una evaluación completa de lector de pantalla. Los resultados públicos de la base no acreditan automáticamente las correcciones locales o su posterior despliegue.
