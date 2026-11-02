# Ayuda de objetos de escenas 3D · QA independiente

2 de noviembre de 2026. Revisión de código, clasificación de objetos e interacción de consulta en Hawking, lente gravitacional, acreción, prisma y doble rendija. Los resultados de navegador se registran al ejecutarse; los criterios siguientes no constituyen por sí mismos una aprobación.

## Criterios

- La selección procede de la geometría de la escena o de las coordenadas y datos del shader actual. No se colocan zonas fijas que finjan reconocer un objeto después de mover la cámara o cambiar variables.
- Se distinguen horizonte, sombra o dirección capturada; las imágenes brillantes de gas no se atribuyen a Hawking. Los marcadores esquemáticos no se presentan como fotones observados o partículas con trayectorias físicas calculadas.
- La lista accesible ofrece objetos presentes en el montaje. No anuncia luz apagada, absorción sin baño, impactos inexistentes o superficies ocultas como si se hubieran tocado.
- En modo ayuda se puede consultar por puntero y teclado sin mover la cámara, emitir, elegir otro rayo o alterar la preparación. Al salir, los gestos normales se recuperan.
- La tarjeta deja visible el punto u objeto seleccionado en escritorio, 390×844, 320×740 y 667×375. Las capturas complementan las comprobaciones de estado y de rectángulos.
- Se retiran proveedores al desmontar y listeners al desactivar; la ayuda no añade un bucle de render o trazado cuando está apagada.

## Revisión de código y cálculos

Leídos los shaders de Hawking, lente y acreción, las escenas R3F de óptica y el modo ayuda existente. Hawking dispone de un clasificador compartido de marcadores y una transformación de coordenadas coherente con el dibujo. Se señaló al implementador que el clasificador anterior permitía seleccionar emisión incluso si su intensidad era cero; el proveedor nuevo debe excluir objetos invisibles.

## Límites

Safari, teléfonos físicos y gestos táctiles reales permanecen pendientes por la decisión previa del usuario. La revisión en tamaños móviles de Chromium no equivale a esas pruebas ni a una evaluación de aprendizaje con participantes.


Se revisaron los proveedores y las transformaciones de coordenadas de los tres shaders contra sus fragmentos: posición de marcadores y reloj en Hawking; coordenada angular y tabla radial en lente; interpolación bilineal e intersecciones del plano del disco en acreción. Se conserva la prioridad del gas emisor sobre la máscara oscura que usa el shader. La selección no cambia las ecuaciones ni dispara los eventos de manipulación R3F.

Las anotaciones de óptica usan los índices reales del buffer (`LineSegments.index/2` o `faceIndex/2` del quad) para describir longitud de onda y medio. La lista reúne familias en vez de añadir 33 opciones. Las detecciones de doble rendija se distinguen de la banda teórica y de la guía de frentes de onda.

Pasaron diez pruebas de shader/exploración, repetidas al terminar la implementación, y siete comprobaciones independientes del raycaster con geometrías construidas en el arnés QA: centro proyectado, oclusor opaco sin anotación, objeto invisible, padre oculto, punto fuera del visor, cámara girada y material completamente transparente. El arnés está en `raycast-independent.mjs` y su resultado en `raycast-independent.json`, fuera de Git bajo `.work/qa-escenas3d-2026-11-02` del espacio exterior. Las pruebas del implementador añaden puntos, líneas, cámara ortográfica, tolerancia móvil y actualización de límites; no se atribuyen al arnés independiente.

## Prueba de navegador

Chrome/Chromium, pestaña independiente, previsualización local en el puerto 1027:

- **Hawking, 1280×900:** se pausó solo la animación visual para señalar interior, borde y un marcador dorado visible. Las tres explicaciones fueron distintas y la masa se conservó. Con el baño apagado no se ofreció absorción azul; al activarlo apareció y mostró la potencia actual, diferenciando emisión y balance neto. La tarjeta quedó fuera del canvas.
- **Lente, 1280×900:** el centro de la imagen se identificó como sombra/dirección de captura, no como horizonte material. La lista encontró la fuente dorada y el selector. La consulta conservó el ángulo de rayo de 14°; salir y tocar la imagen lo cambió a 27,63°, demostrando recuperación del selector. Se verificaron las dos vistas sin tarjeta sobre el diagrama tras corregir la disposición.
- **Acreción, 1280×900:** un clic sobre gas visible devolvió una intersección exterior, su razón de frecuencia y el límite de falso color. Las variables del montaje se conservaron. Al elegir «Sin gas», la lista retiró ambas familias de gas y conservó sombra y fondo.
- **Prisma, 1280×900:** un clic sobre el haz entrante dio luz blanca; sobre una componente saliente mostró 700 nm en aire. El texto explica Snell y distingue trazo de fotón individual. En perspectiva, un arrastre durante ayuda mantuvo las posiciones proyectadas; al salir, el mismo arrastre giró la cámara.
- **Doble rendija:** la lista inicial no inventó impactos. Emitir por la interfaz produjo 100 detecciones visibles en pantalla/histograma y permitió descubrir el problema de límites cacheados descrito abajo. Repetida la corrección en 390×844, pasar de cero a 20 añadió «Un punto: una detección» y limpiar la corrida lo retiró. Se comprobó su explicación por la lista accesible. La selección directa de un punto individual en navegador no se declara confirmada: las capturas de Chrome cambiaban de escala tras navegar con emulación y no se pudo separar una imprecisión del clic de un fallo del picker. Los ensayos numéricos del raycaster sí comprueban puntos exactos y distancias de tolerancia.
- **390×844:** los cinco laboratorios abrieron objetos y explicaciones específicas. Las tarjetas quedaron fuera del canvas visible; no hubo desbordamiento horizontal del documento.
- **320×740:** horizonte de Hawking y sombra de lente siguieron legibles, con sus puntos de consulta fuera de la tarjeta. Se verificó la reserva del gutter del scrollbar después del ajuste de anchura.
- **667×375:** la lente mantuvo imagen y marcador visibles, con explicación por encima o al lado según el espacio disponible. En el prisma se detectó el canvas previo de 390 px de alto; al activar ayuda ahora se limita a 225 px y el acceso «Objetos» lo revela. La repetición dejó lámpara, prisma, pantalla y haces visibles. La tarjeta compacta puede superponerse con una parte vacía del banco: no se afirma que nunca interseque el rectángulo completo del canvas en una ventana tan corta.
- No se observaron advertencias ni errores de consola en la pestaña al cerrar el pase.

La lista accesible y sus botones se probaron también con Enter. Las capturas representativas incluyen `hawking-desktop.png`, `lens-desktop-fixed.png`, `accretion-mobile.png`, `lens-landscape.png` y `prism-landscape.png`; `layout-matrix.json` registra nueve combinaciones móviles de ruta/tamaño. El navegador de QA necesitó restablecer la emulación después de algunas navegaciones para capturar a escala normal; esas capturas se repitieron antes de juzgar disposición.

## Hallazgos y correcciones repetidas

1. Al seleccionar desde una lista desplazada se conservaba el scroll de la tarjeta, escondiendo título y cierre. Se remonta por identidad del objeto; se repitió la selección y `scrollTop=0`.
2. En lente, colocar la tarjeta a la derecha del canvas tapaba el diagrama de rayos. Se protegió la unión de los renderers visibles; la repetición dejó las dos vistas despejadas.
3. Doble rendija podía conservar límites vacíos calculados antes de emitir y no ofrecer los puntos nuevos. Se invalidan esfera y caja al actualizar los buffers. La repetición cero→20→cero acreditó aparición y retirada correctas; hay regresiones numéricas de geometría vacía y guía movida.
4. Una consulta explícita podía cambiar por hover después del desplazamiento automático. Las consultas de la lista ahora se fijan y explican cómo cambiar o cerrar. La tarjeta conservó la elección durante la inspección posterior.
5. Se observó un pequeño borde sobre el gutter en 320 px; el cálculo reserva el ancho útil del documento.

Los primeros cuatro casos pertenecen a la ampliación de esta entrega. El encuadre alto del prisma horizontal era previo y recibió una adaptación específica del modo ayuda. El uso de diagramas esquemáticos sigue identificado; no es un defecto físico introducido por esta ampliación. La cobertura anterior es local; la publicación y el contraste de archivos son responsabilidad del cierre del agente principal.


## Cierre del pase independiente

No quedan fallos P1 abiertos en este pase local. Se repitieron la lista fijada, el reajuste de la tarjeta y el encuadre horizontal del prisma; la explicación seleccionada conservó título y cierre y los objetos importantes quedaron visibles. El agente de óptica añadió además cinco pruebas numéricas de puntos, con cámara del montaje, teoría activada/desactivada y oclusor opaco: 4320 consultas de puntos en posición exacta y tolerancias de ratón/tacto. Esa cobertura es numérica; no convierte la revisión en una prueba sobre teléfono físico.

La comprobación visual final de producción y de los archivos publicados queda a cargo del agente principal. Solo este informe fue modificado por el agente QA; las correcciones de implementación y sus pruebas pertenecen a sus responsables.

## Cierre técnico del agente principal

La suite completa aprobó 397 pruebas, ESLint y TypeScript; Vite compiló las 24 entradas HTML. No se añadieron dependencias. Sobre el build se abrió de nuevo la ayuda del gas de acreción en 390×844, con tarjeta fuera de la imagen y consola limpia. La ayuda de ejes de Page conservó su explicación y no mostró el botón 3D en una escena SVG. Las lecturas y anclas de la lista se vuelven a consultar al elegir un objeto, para no reutilizar coordenadas anteriores a una rotación o cambio del montaje. El [resumen estructurado](qa/escenas3d-2026-11-02.json) conserva la cobertura y límites; publicación y revisión visual pública se contrastan después.
