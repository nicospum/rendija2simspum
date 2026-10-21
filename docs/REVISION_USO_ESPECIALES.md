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
