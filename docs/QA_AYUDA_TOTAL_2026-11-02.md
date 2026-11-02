# QA transversal del modo ayuda · 2 de noviembre de 2026

## Alcance

Se revisaron los 17 laboratorios canónicos publicados en `https://www.spumexp.lat/`, las tres secciones de Holografía y sus tres enlaces históricos. Tres agentes distribuyeron revisión de código/contenidos, los siete laboratorios Einstein y los diez restantes. El agente principal reprodujo Page y comprobó las correcciones compartidas. Los informes independientes conservan pasos y tamaños concretos:

- [Código y contenido](QA_AYUDA_CODIGO_2026-11-02.md).
- [Einstein](QA_AYUDA_EINSTEIN_2026-11-02.md).
- [Óptica, agujeros negros y Maldacena](QA_AYUDA_RESTO_2026-11-02.md).

El pase móvil principal usó Chromium a 390×844. Se añadieron tamaños estrechos de 320 px, horizontal 667×375 y escritorio en casos representativos. Estas son ventanas emuladas: no teléfonos físicos ni Safari. Tampoco constituyen un estudio de aprendizaje con participantes.

## Problemas previos y correcciones

1. **Tarjetas sobre la escena.** La protección del visor sólo se aplicaba a selecciones de objetos 3D. Las asas SVG y controles DOM utilizaban una tarjeta móvil fija; se confirmó superposición en entropía, entrelazados, horizonte, fotoeléctrico y controles de cámara de los dos laboratorios ópticos. Ahora también se protege la unión de diagramas visibles al consultar esos elementos. Las preguntas externas al contenedor y los mandos ópticos aprovechan la escena visible de la página como contexto. La alternativa de objetos 3D sigue reservada a sus proveedores reales; no aparece en SVG por usar el mismo diseño.
2. **Consultar podía cambiar un valor con teclado.** Ctrl+ArrowRight cambió públicamente el reparto de Page de 0 a 1 con ayuda activa. Las flechas y activaciones de controles se bloquean también con Ctrl/Meta/Alt. Las pruebas incluyen Enter/Espacio de botones SVG, Tab, desplazamiento y atajos habituales. Escape retira la ayuda; la misma acción vuelve a manipular el experimento al salir.
3. **Ayudas genéricas o equivocadas.** Elegir un reto, predecir o ampliar el visor podía recibir una explicación de física por contener «escena» o «visor». Esas acciones tienen textos explícitos que distinguen interfaz y magnitudes físicas. Se reconoce «Comprobar explicación» con y sin «mi». Emitir/devolver un qubit explica B→R, S(R), conservación del estado conjunto y el carácter abstracto del modelo. cCFT ya no coincide por accidente con la palabra CFT.
4. **Resultado poco visible al mirar controles.** En Page, la escena sticky podía quedar por encima del bloque de devolución cuando se terminaba una comparación usando presets. El acceso persistente «↑ Pregunta» ahora muestra «✓ Resultado» al comprobar el reto y lleva a la devolución. No se desplaza automáticamente la escena al cambiar una variable ni se reinicia la prueba.

No se cambiaron fórmulas, condiciones de éxito de retos, avances guardados ni dependencias. No se identificaron fallos nuevos pendientes atribuibles a estos cambios al cierre de la revisión independiente; la verificación final de publicación se registra por separado.

## Comprobación funcional del agente principal

En Page a 390×844 se reprodujo el bypass público y se repitió localmente: el reparto quedó en 0 al consultar con Ctrl+ArrowRight y Ctrl+Enter sobre B. Al salir con Escape, Ctrl+Enter pasó un qubit a R. Consultar «Emitir un qubit» mostró la explicación específica sin emitir; consultar la predicción no cambió la respuesta. Se completó la primera comparación con una idea incorrecta, se leyó la devolución, se corrigió la idea y apareció «Descubrimiento comprobado» y el acceso «✓ Resultado».

La portada y los tres mapas del sitio se comprobaron sin raíz de ayuda. La ayuda sigue siendo exclusiva de laboratorios.

Se repitió además el asa de sonda de Horizonte a 390×844: el radio conservó 4 rₛ durante la consulta; el SVG terminó en y=549,11 y la tarjeta empezó en y=557,11, con 8 px de separación.

## Límites

- Se probaron consultas, salida y recuperación de controles en todos los laboratorios; no cada control en todas sus combinaciones ni los cuatro retos completos de cada uno en este pase.
- Los siete capítulos Einstein completaron al menos su primer reto en el pase independiente. Page incluyó respuesta incorrecta y correcta; la matriz de los demás se detalla en sus informes.
- En ventanas muy cortas puede faltar espacio para una tarjeta y la totalidad del canvas: se usa la tarjeta compacta y se protege el punto consultado. No se promete ausencia absoluta de intersección con todo píxel del canvas para cualquier scroll.
- La ayuda no pausa una simulación ya en reproducción. Desactiva la manipulación durante la consulta y la recupera al salir.
- Un trazo de lente muy fino requiere precisión. No se confirmó un fallo de prioridad de su ayuda: el elemento conserva su anotación explícita y un clic en el centro de su rectángulo puede caer fuera del trazo. No se alteró el cálculo ni el selector basándose en una prueba de coordenadas inconclusa.
- Safari y dispositivos físicos continúan pendientes por falta de acceso, conforme a la indicación previa del usuario.

## Validación técnica y publicación

La suite completa aprobó **401/401 pruebas**; ESLint, TypeScript y la compilación de producción de 24 entradas HTML finalizaron correctamente. La revisión independiente final de código no dejó bloqueantes. La comparación de los 24 HTML y sus assets JS/CSS con producción se realiza después del despliegue; las capturas y el resultado del contraste se conservan en la carpeta de artefactos de esta sesión, fuera del código publicado.
