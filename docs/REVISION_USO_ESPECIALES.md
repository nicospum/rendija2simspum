# Revisión de uso: Einstein y agujeros negros

Fecha: 21 de octubre de 2026. Revisión heurística del recorrido de una primera visita, con interacción real en el navegador. No es una prueba con participantes ni una medición de aprendizaje.

## Confusiones encontradas y correcciones

1. **Perder el hilo entre pregunta, controles y explicación.** En celular estaban en tramos distintos de una página larga. Los doce laboratorios ahora muestran junto a los controles el reto activo, la idea elegida, la siguiente observación pendiente y enlaces directos a la imagen y a la pregunta. No hay que repetir observaciones que el modelo ya registró.
2. **Cambiar de tipo de movimiento sin advertirlo.** En horizonte, los atajos de posición activaban caída libre aunque se estuviera comparando un reloj sostenido. Hay dos atajos propios para sostener el reloj a 4 y 1,2 rₛ; los de caída están identificados como acciones que activan caída libre.
3. **“Falta comparar” no indicaba qué faltaba.** Acreción y horizonte muestran cada estado requerido, con Hecho/Pendiente, tanto junto a los controles como en el reto. La comprobación usa los mismos identificadores que la lista visible, incluida la recepción del pulso exterior del cuarto reto de horizonte.
4. **Pasar al siguiente antes de revisar la explicación.** Los atajos de siguiente reto en lente, Hawking y entropía se ofrecen después de una comparación válida y una respuesta correcta. También se comprobó que corregir la respuesta después de comparar funciona sin repetir la simulación.
5. **Unidades y cambios que reinician un ensayo.** La ayuda desplegable junto a los controles explica c, µs, ns, rₛ, M☉ o UA según el capítulo; diferencia cambiar condiciones de cambiar vistas. En fotoeléctrico aclara que mover la barra no registra la medición. En acreción indica cómo salir de la referencia que bloquea los controles, con el nombre real del botón: «Volver a mi prueba».
6. **No saber si es un examen ni si reiniciar borra el avance.** Ambas portadas incluyen una orientación opcional de tres pasos. Se explica que cambiar de respuesta es parte de aprender y que los ensayos pueden reiniciarse conservando las huellas. Las guías distinguen los pasos del ensayo actual de los logros de visitas anteriores.

Todos eran problemas de orientación presentes antes de esta revisión. Se conservaron fórmulas, condiciones físicas, claves de almacenamiento, logros previos, catálogo, ilustraciones y navegación entre capítulos. No se agregaron dependencias. La guía se comparte entre capítulos sin importar sus renderizadores ni sus fórmulas.

## Verificación

- `npm test`: **280 pruebas aprobadas**, incluidas siete nuevas para la secuencia de ayuda, estados pendientes, criterios de comparación y atajos de relojes sostenidos sin perder logros.
- `npm run lint`: sin errores.
- `npm run build`: las diecisiete entradas se compilan correctamente.
- Se completó el circuito del **primer reto de cada uno de los doce laboratorios** con sus controles y respuestas visibles. Se probaron respuesta incorrecta, falta de predicción y corrección después de comparar en los tres capítulos con avance automático.
- Se seleccionaron y revisaron las guías de los **48 retos** en pantalla de celular; índices, instrucciones y destinos internos válidos.
- **42 combinaciones de página y ancho**: las dos portadas y doce capítulos a 320, 390 y 1280 px, sin desbordamiento horizontal, imágenes rotas ni enlaces internos sin destino. Los controles nuevos tienen áreas de al menos 44 px de alto.
- **42 barras con identificador**, en ambos extremos: 84 acciones sin valores no finitos, texto indefinido ni desbordamiento. No incluye controles que solo aparecen al cambiar a otro modo.
- En los doce capítulos se abrió y cerró una ayuda contextual y el desplegable nuevo a 320 × 740 px. Las ayudas quedaron contenidas en la pantalla.
- Las marcas existentes del navegador de pruebas se conservaron; los pasos actuales se reinician al cambiar de reto, como antes.

## Límites y siguiente comprobación

La revisión usa anchos emulados en Chromium. No se probó un iPhone/Safari o Android físico, ni se entrevistó a una persona sin conocimientos previos. El siguiente paso útil es pedirle a alguien que complete un reto sin explicaciones externas y observar dónde duda. Esta revisión no demuestra por sí sola comprensión científica.

No se encontraron errores bloqueantes pendientes. Los cálculos y las pruebas de física existentes se mantienen; las correcciones de esta etapa afectan orientación, etiquetas y acceso a acciones existentes.

## Actualización: jugar, comparar y explicar sin perder la escena

22 de octubre de 2026. Esta revisión amplía la anterior a la interacción directa de los doce capítulos: siete de Einstein y cinco de agujeros negros.

### Problemas encontrados

1. **El reto seguía lejos del experimento.** Aunque había controles cerca del visor, elegir una predicción, comprobarla o avanzar obligaba a saltar a otra sección. Ahora «Mi reto» permite hacer todo el ciclo junto al dibujo vivo: elegir una idea, ver la observación pendiente, probar, comprobar y pasar al siguiente. Usa el mismo estado y los mismos criterios del reto original; no hay una segunda simulación ni logros concedidos por abrir el panel.
2. **Al buscar un control, la escena se iba de pantalla.** El visor se mantiene visible durante el ensayo. En celular vertical queda arriba y en pantallas horizontales cortas se coloca al lado de las acciones. El encabezado del reto permite volver a la pregunta. Cerrar el reto conserva los mandos y la escena juntos; «Ver visor amplio» permite recuperar el detalle sin reiniciar las condiciones.
3. **Cambios difíciles de interpretar.** El reloj de luz ahora muestra el tiempo transcurrido del pulso en ambos sistemas, además del tic completo. El tren muestra las diferencias de tiempo entre emisiones y llegadas: mover al pasajero modifica la llegada, sin fingir un cambio en las emisiones. Horizonte presenta los dos últimos envíos, sus demoras y sus frecuencias junto al mapa, y aclara cuándo terminó la caída dibujada pero la antena sigue escuchando.
4. **La división por cuatro de la entropía parecía un detalle diminuto.** El reto de la fórmula ofrece un ejemplo grande que se arrastra sobre la escena: área de ejemplo → grupos de cuatro → S/kB. El ejemplo algebraico se distingue explícitamente del área física, no modifica la masa del agujero negro y no presenta las celdas como bits observados.
5. **Las explicaciones de Hawking se recortaban al compactar el visor.** Las ventanas informativas se abren debajo del mapa en vertical y a su lado en horizontal, con cierre accesible y cuerpo desplazable. Se mantiene visible el horizonte que explican.

### Funcionamiento y mantenimiento

- `SceneConsole` comparte la presentación de pregunta, predicción, pasos y acciones. Cada capítulo le pasa su ensayo actual y sus callbacks; los reductores de aprendizaje, fórmulas, almacenamiento y logros existentes siguen siendo la fuente de verdad.
- `data-scene-workspace` y `.spum-live-stage` identifican el visor real de cada capítulo. `ResizeObserver` mide su altura visible para que el encabezado y los destinos de desplazamiento no lo tapen; se desconecta al salir de ese modo.
- Los enlaces «Retos», «Controles» y la entrada principal para jugar abren el ensayo junto al visor. Los fragmentos originales siguen siendo destinos válidos; los enlaces con modificadores conservan su comportamiento normal. Se verificó también la entrada directa con fragmentos.
- Las notas extensas y controles avanzados permanecen disponibles. Cambiar de vista conserva la pregunta, la predicción y las observaciones actuales.
- No se agregaron dependencias. La única función numérica nueva transforma la posición del gesto en el área del ejemplo algebraico de entropía; tiene prueba de extremos, redondeo y separación respecto de la masa física.

### Verificación de esta actualización

- **314 pruebas aprobadas**, lint sin errores, TypeScript y compilación de producción correctos. Las diecisiete entradas HTML se generan.
- **48 retos completados mediante la interfaz**, con sus observaciones reales; también se rechazó una explicación incorrecta en cada uno. Se incluyeron visitas con huellas ya guardadas para comprobar que no habilitan avanzar en un ensayo incompleto.
- **166 combinaciones de página, modo y tamaño sobre la compilación de producción**: pregunta y controles de los doce capítulos, vistas alternativas y el ejemplo de entropía. Tamaños: 320 × 740, 390 × 844, 768 × 1024, 1280 × 900, 667 × 375 y 568 × 320. Se comprobó visor visible, destino principal accesible y ausencia de desbordamiento horizontal. Una comprobación con `elementFromPoint` confirmó que el centro del control o predicción y el centro del visor no estén tapados. No se exige mostrar todos los controles a la vez: la escena permanece mientras se recorren.
- Interacción directa en los doce capítulos mediante teclado o activación accesible. Además, arrastres reales del pasajero, frecuencia fotoeléctrica, sonda y ejemplo de entropía, sin desplazar accidentalmente la página.
- Lectura y cierre de la ventana de Hawking en vertical y dos tamaños horizontales. Entrada por enlaces, cierre, reapertura y regreso al visor amplio conservando condiciones.
- Evidencia compacta en `research/interaccion/specials-usability-*.json`. Las medidas corresponden al navegador de pruebas local; la comprobación de publicación se documenta aparte.

La primera publicación de esta actualización dejó al descubierto una colisión introducida por el nuevo diseño: en acreción y horizonte, una regla anterior de la serie podía anular las dos columnas dependiendo del orden de carga del CSS compilado. Las comprobaciones iniciales de posición no bastaban para detectar un control tapado. Se corrigió la prioridad de la regla y se repitieron las 166 combinaciones sobre `vite preview`, incluyendo la comprobación de superposición. Ese problema se detectó y corrigió en esta revisión; no era un fallo previo de la física.

### Límites

Se usó Chromium con tamaños de pantalla emulados y acciones de puntero/teclado. No equivale a probar gestos en un teléfono físico, Safari, consumo de batería o aprendizaje con participantes. En una sesión del navegador automatizado apareció la alternativa sin WebGL de la lente: los controles, geodésicas y diagrama siguieron operativos; esa sesión no permite certificar la imagen WebGL en todos los dispositivos. No se modificó el renderizador de la lente para ocultar esa limitación.
