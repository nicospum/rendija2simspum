# Consultar objetos de los visores WebGL

Activá «Modo ayuda» y señalá o tocá el objeto. La consulta no mueve la cámara ni modifica el ensayo. La tarjeta explica qué representa y por qué importa, y un pequeño aro marca el **punto consultado**. En una escena animada ese aro no pretende seguir una partícula. Escape o desactivar la ayuda recupera la manipulación normal.

«Objetos de la escena» ofrece el mismo contenido por botones, accesibles con teclado o toque. Resulta útil para rayos finos o marcadores pequeños. La lista es un inventario del montaje, no una afirmación de que cada elemento corresponda al píxel bajo el cursor. Las listas de shader usan puntos representativos que pasan por su clasificador actual. No se anuncian emisión/absorción sin señal, luz apagada, gas ausente o impactos inexistentes.

## Qué se identifica

| Laboratorio | Objetos y significado |
| --- | --- |
| Hawking | Horizonte, interior, referencia, fondo y marcadores dorados/azules. Usa radio, zoom, desplazamiento y reloj del shader. Los marcadores simbolizan energía emitida o absorbida; brillo, color y movimiento están amplificados. No son fotones observados. |
| Lente | Sombra/direcciones capturadas, fondo, fuente e imagen de la dirección seleccionada. Consulta la transferencia de geodésicas vigente. La sombra no es una fotografía de la superficie del horizonte. El diagrama explica rayos y horizonte por separado. |
| Acreción | Gas, corrimiento de frecuencia, imágenes curvadas del disco, sombra y fondo. Usa los cruces del plano y la interpolación de la textura que usa el fragment. Se identifica el gas por delante de la máscara oscura cuando corresponde. La luz brillante es acreción, no Hawking. |
| Prisma | Fuente, vidrio, pantalla, espectro, normales y rayos. La selección de un segmento lee su longitud de onda y medio reales de la geometría. El haz blanco agrupa componentes; no representa una fila de fotones. |
| Doble rendija | Emisor, aberturas, registro del camino, pantalla, probabilidad teórica, guía ilustrativa e impactos. Un punto es una detección; no muestra una partícula viajando ni su trayectoria oculta. La altura de los impactos es decorativa en este modelo horizontal. |

## Implementación

El modo ayuda mantiene su raíz y estado separados de los motores físicos. `sceneHelp.ts` enlaza un elemento DOM con un proveedor de selección y lista. Los eventos de consulta se resuelven antes de bloquear la manipulación; fuera del modo no se ejecuta el trazado adicional de ayuda ni un bucle de inspección. Los mandos DOM sobre un canvas conservan su ayuda de control y no se confunden con el gas o los rayos de debajo.

En Three se usa la cámara actual, la geometría actual y una tolerancia en píxeles (algo mayor para toque). Las líneas y puntos se eligen por cercanía proyectada, antes del primer oclusor opaco. El vidrio transparente permite consultar un rayo visible dentro. Se excluyen padres ocultos y materiales invisibles; la lista filtra por frustum y elimina duplicados. Las geometrías que cambian sus atributos actualizan sus límites para evitar seleccionar una versión anterior.

Las tarjetas prefieren los márgenes de los renderers. En vistas dobles se protege su unión; no se pone una tarjeta sobre el diagrama por dejar libre solamente el canvas vecino. En pantallas sin espacio libre se usa una tarjeta breve, desplazable, en el extremo opuesto al punto consultado. El título y cierre se recuperan al cambiar de objeto. Esto no pausa automáticamente una reproducción en marcha.

Los modelos y fuentes originales no cambian: [Hawking](HAWKING_LABORATORIO.md), [lente](LENTE_GRAVITACIONAL.md), [acreción](ACRECION_LABORATORIO.md), [prisma](PRISMA_EDUCACION.md) y [doble rendija](MODELO_DOBLE_RENDIJA.md). Las estrellas de fondo ilustrativas no se individualizan como objetos astronómicos medidos; sí se explica el fondo. Si WebGL no está disponible, los controles, fórmulas y retos conservan sus alternativas.

La [revisión independiente](QA_AYUDA_ESCENAS_3D_2026-11-02.md) separa pruebas de código, imágenes y uso. Safari, dispositivos físicos y evaluación de aprendizaje con participantes permanecen pendientes.
