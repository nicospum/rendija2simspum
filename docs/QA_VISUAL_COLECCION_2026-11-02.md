# Control público de la colección: lote de escritorio

2 de noviembre de 2026. Revisión mediante CUA sobre `https://www.spumexp.lat/`, en una pestaña Chrome exclusiva. No se tocaron las pestañas del usuario ni la pestaña de entropía del agente principal.

## Cobertura exacta de este lote

Se revisaron **12 laboratorios en escritorio de 1280 × 900 CSS px**: los siete de Einstein y los cinco de agujeros negros. En cada uno se entró por el enlace principal de jugar, se eligió una predicción, se modificó una barra nativa con el teclado y se completó el primer reto con sus acciones visibles. Se comprobó la respuesta de éxito del ensayo actual.

Las barras se devolvieron a la referencia antes de completar el reto. En Mercurio hubo que usar **«Mercurio real»**, porque el valor físico inicial de excentricidad 0,2056 no coincide con el paso nativo 0,001 de la barra; subir y bajar una vez no recupera exactamente ese número. Es una precaución del procedimiento de prueba, no una prueba de error del cálculo orbital.

Se midieron por separado los estados **«Probar en la escena»** y **«↑ Pregunta»**. En los doce casos, el control principal o la predicción correspondiente quedaron libres en su estado; los doce ensayos terminaron con respuesta de descubrimiento completo y sin desbordamiento horizontal.

| Laboratorio | Entrada / barra / predicción | Primer reto | Alcance visual |
| --- | --- | --- | --- |
| Reloj de luz | Correctos | Completado | Dos vistas y pulso visibles en el modo compacto |
| Tren de Einstein | Correctos | Completado | Dos vistas, fechas y receptor visibles |
| Nos vemos a la vuelta | Correctos | Completado | Ruta y diagrama visibles; la captura no demuestra por sí sola lectura cómoda de todos los rótulos |
| Ascensor de Einstein | Correctos | Completado | Interior/exterior y mandos accesibles |
| El tiempo tiene altura | Correctos | Completado | Torre y gráfico accesibles |
| La órbita que no se cierra | Correctos | Completado | Ambas órbitas accesibles; se restauró el preset físico antes de comprobar |
| Efecto fotoeléctrico | Correctos | Completado | Celda y reparto de energía accesibles |
| Radiación de Hawking | Correctos | Completado | La captura rápida no certifica el estado final WebGL |
| Lente gravitacional | Correctos | Completado | La captura rápida no certifica el estado final WebGL |
| Cómo vemos lo invisible | Correctos | Completado | La captura rápida no certifica el disco final WebGL |
| Al borde del horizonte | Correctos | Completado | Mapa, relojes y estados de la sonda accesibles |
| Entropía de Bekenstein–Hawking | Correctos | Completado | Se confirmó la altura compacta insuficiente descrita abajo; el agente principal verifica su corrección |
| Prisma | **No incluido en este lote** | Pendiente aquí | Se devolvió el navegador al agente principal antes de esta página |
| Doble rendija | **No incluida en este lote** | Pendiente aquí | Se devolvió el navegador al agente principal antes de esta página |

Los catorce laboratorios y la pantalla móvil eran el alcance solicitado de la revisión coordinada. **Este informe no afirma haber completado esos catorce ni la revisión móvil**: se entregó el navegador al agente principal al terminar el lote de doce para que pudiera verificar la corrección urgente de entropía y completar lo restante.

## Problemas y mejoras identificadas

1. **Entropía: área de dibujo demasiado reducida.** En la versión publicada, la etapa SVG del modo de jugar midió aproximadamente **712 × 250 px** en escritorio. El dibujo conserva su proporción interna, por lo que sus elementos ocupan menos que el rectángulo exterior. Se informó al agente principal, que desarrolla la corrección. Una comprobación de «no está tapado» no detecta este defecto de tamaño útil.
2. **Recuperar tamaño era difícil de descubrir.** El modo de jugar hace el visor compacto automáticamente. El acceso anterior a «Ver visor amplio» estaba al final de «Cómo jugar y qué cambia». Se informó esta oportunidad al agente principal para el ajuste compartido; este agente no modificó CSS ni componentes compartidos.
3. **Ascensor: condiciones de observación ocultas al explorar.** La ruta de referencia permite completar el primer reto, pero variar masa/intensidad puede alejar al usuario de las condiciones que cuentan. Este defecto se reprodujo y corrigió en la revisión de código del ascensor; ver `QA_EINSTEIN_2026-11-02.md`. Esa corrección aún no estaba publicada cuando se ejecutó este lote.

No se encontró un bloqueo del primer reto en la ruta de referencia de los doce laboratorios. Eso no equivale a haber probado todos los caminos, los 48 retos de esos especiales o cada gesto del dispositivo.

## Evidencia y límites

Evidencia local fuera de Git: `.work/qa-review-2026-11-02/agent-public-desktop.json`, doce archivos `*-desktop.png` y `agent-desktop-contactsheet.png`, bajo el espacio de trabajo exterior del proyecto de prisma.

La captura de Chrome durante los saltos rápidos de sección puede mostrar un fotograma anterior al estado del DOM: varias imágenes de Hawking, lente y entropía todavía muestran la introducción, y algunas de Einstein muestran una predicción anterior aunque la consulta de estado ya confirma el reto completado. **Estas imágenes no se deben presentar como prueba del resultado final de esos ensayos ni de funcionamiento del WebGL.** Los registros de DOM/feedback demuestran la interacción y los criterios de éxito; la aceptación visual final necesita una captura estable después del cálculo y del desplazamiento.

No se usaron eventos táctiles físicos, Safari ni BrowserStack. El tamaño de escritorio se aplicó con la capacidad `viewport`; se ejecutó `reset()` y se cerró exclusivamente la pestaña temporal al devolver el control al agente principal.
