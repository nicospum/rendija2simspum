# Revisión de los cinco laboratorios · 21/10/2026

## Base publicada

Antes de editar, la portada y los cinco laboratorios de `https://www.spumexp.lat/` respondían 200. Sus seis HTML y 24 archivos JS/CSS (incluido el worker de lente) coincidían por SHA256 con la compilación local de `0d9189f`. Se recorrieron los veinte retos en la web pública, en tamaño de celular; los modelos y sus comparaciones respondieron correctamente. La copia de trabajo estaba limpia.

## Problemas previos y correcciones

1. **Ayudas de Hawking y lente:** algunas explicaciones dependían de contenedores demasiado angostos o quedaban fuera del viewport de 320 px. Se reemplazan tres implementaciones de ayuda por `InfoPopover`, reutilizado también en entropía. El panel vive en un portal, calcula su posición en escritorio y usa un panel contenido en la pantalla hasta 850 px. Incluye cierre, Escape, clic exterior, atributos accesibles y limpieza de timers/listeners. El ratón permite pasar del disparador al panel sin cerrarlo al cruzar el pequeño espacio entre ambos.
2. **Objetivos táctiles:** el botón de cámara del prisma medía unos 33 px de ancho; los seis símbolos del explorador de entropía incorporado en Hawking quedaban en unos 34 px a 320 px. Se garantiza un mínimo de 44 px y se distribuyen los símbolos en dos filas en celular. El interruptor de luz del prisma recibe una etiqueta estable de estado y un título de acción coherente con encendido/apagado.
3. **Gestos sobre los bancos 3D:** los canvases de prisma y doble rendija reservaban los gestos completos para la cámara. En anchos de celular/tableta se agrega una capa `pan-y` para desplazarse por la página. “Girar cámara” permite habilitar deliberadamente órbita/zoom; “Dejar de girar” vuelve al desplazamiento. Las etiquetas DOM siguen sobre la capa y conservan interacción. La cámara de escritorio conserva su manejo; no cambian ecuaciones ni encuadre.

## Refuerzo del recorrido educativo

La distancia entre visor, controles, retos y explicación era una oportunidad de mejora, no un fallo de las fórmulas. Se agrega una navegación móvil de cuatro accesos en los cinco laboratorios y una tarjeta de pregunta activa junto al visor:

- ofrece una primera pregunta cuando se está explorando libremente;
- recuerda qué única variable propone cambiar el reto;
- muestra un resultado calculado o el estado de la evidencia junto al experimento;
- lleva a la comparación y explicación completas;
- permite avanzar al siguiente reto cuando se alcanza la comparación prevista, y volver al primero después del cuarto.

Los resultados usan las lecturas y guardas educativas existentes. En doble rendija se conserva la distinción entre frecuencias muestreadas y predicciones; alcanzar un número de impactos no se presenta como validación estadística. En lente se espera que termine el cálculo del worker antes de ofrecer el avance. En entropía se conserva el requisito de elegir predicción. No se agregan puntos, premios o afirmaciones de haber comprobado experimentalmente una ley.

Al pie de cada laboratorio se enlazan los otros cuatro desde el catálogo único. Esto reemplaza la dependencia de antiguos enlaces entre solo prisma y doble rendija, sin borrar sus accesos existentes. La portada sigue ofreciendo las cinco entradas. No se agregan dependencias, almacenamiento, servicios ni recursos gráficos descargados.

## Verificación reproducible

`npm test`, `npm run research:hawking`, `npm run lint` y `npm run build`. Se conservan las 115 pruebas y las diez comprobaciones científicas independientes. No se cambian los núcleos físicos ni los reductores de los retos; las modificaciones de las cámaras son de acceso táctil, no de su cálculo.

La revisión en navegador cubre:

| Laboratorio   | Recorrido y controles                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Doble rendija | Cuatro retos, referencias, 1600 impactos, avance y reinicio, emisión individual, pausa/reanudación, activación de cámara móvil.                    |
| Prisma        | Cuatro retos, avance y reinicio, encendido/apagado, congelación de lectura mientras se cambia dirección, reanudación y activación de cámara móvil. |
| Hawking       | Cuatro retos, avance y reinicio, límite del reloj en 95 %, bloqueo de evolución aislada con fondo cósmico, retorno al vacío y ayudas.              |
| Lente         | Cuatro retos, avance y reinicio, masa máxima, captura del rayo radial, cálculo pendiente y ayudas.                                                 |
| Entropía      | Cuatro retos, avance y reinicio, masas/emisión en sus extremos, conversión a bits, lupa hasta 64 áreas de ejemplo y balance de radiación.          |

Se comprueban anchos de 320, 390, 768 y 1440 px, ausencia de desbordes, tamaño de botones/sliders/selectores, destinos de la navegación, apertura/cierre de ayudas y ausencia de errores de consola. Después de publicar se vuelven a contrastar los seis documentos y sus assets con la compilación local y se recorren los veinte retos de la versión pública.

Los tamaños de viewport no sustituyen dispositivos físicos: quedan pendientes gestos multitáctiles reales, VoiceOver/TalkBack y mediciones de FPS/autonomía en iOS/Android. El bloqueo de gestos se comprueba por su capa DOM, estado, tamaño y `touch-action`, sin afirmar una prueba táctil en hardware. La claridad pedagógica se refuerza con estos recorridos, pero su eficacia con estudiantes todavía requiere evaluación con personas.
