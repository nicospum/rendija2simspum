# Atlas de lo invisible y ecuación de la locomotora

## Experiencia

El especial de agujeros negros reúne cinco laboratorios en orden: lente gravitacional, acreción, horizonte, Hawking y entropía. La nueva portada es un atlas de expedición con ilustración propia, cinco puertas visuales, una bitácora de veinte retos, un explorador de escalas y una cronología que distingue teoría, predicción y observación.

Cada capítulo incorpora un cierre con tres objetos y dos fichas de historia y evidencia. Una pregunta y un enlace explícito conducen a la siguiente pista; el índice nativo también permite ir a cualquiera de las cinco y volver a la bitácora.

La imagen grande es una ilustración artística del entorno, indicada como tal. Las representaciones de cada laboratorio conservan sus modelos físicos: no se reemplazaron geodésicas ni números por una imagen generada.

## La foto del tren

El archivo `public/einstein/tren-ecuaciones-referencia-v1.png` es la foto original de 448 × 336 compartida por el usuario. Se copió sin alterar sus píxeles y se presenta en una tarjeta. No se inventó autor, fecha, viaje de Einstein ni procedencia precisa.

La pintada muestra la ecuación de campo sin constante cosmológica:

**Rμν − ½Rgμν = (8πG/c⁴) Tμν**

La portada Einstein permite tocar tres grupos: geometría, acoplamiento y energía-momento. Aclara que E₀ = mc² relaciona masa con energía en reposo y que Tμν también incluye flujos y presiones. Una pregunta explica por qué Tμν = 0 local no obliga a que el espacio-tiempo sea plano. El término +Λgμν se explica aparte. Los modelos locales publicados toman Λ = 0.

La foto no se atribuye al experimento mental del tren de la simultaneidad: ese laboratorio estudia relatividad especial. Hay enlaces tanto al tren como al ascensor de relatividad general.

Fuentes:

- [MIT, Einstein’s Field Equations](https://ocw.mit.edu/courses/8-033-relativity-fall-2006/02415213222b845bbec6e734c64d1718_fieldeqs.pdf).
- [Einstein Papers Project, Caltech: ecuaciones del 25 de noviembre de 1915](https://www.einstein.caltech.edu/news/one-hundred-years-of-einsteins-field-equations-and-of-the-explanation-of-mercurys-perihelion).
- [Einstein Online, de la fuerza al campo](https://www.einstein-online.info/en/spotlight/From-force-to-field/).
- [CERN, masa y energía en reposo](https://cds.cern.ch/record/2905272/files/4_Passport_E-mc2.pdf).

## Escalas que responden juntas

`src/series/scales.ts` reutiliza `blackHole` y la masa solar nominal del modelo de Hawking. La portada compara agujeros negros de Schwarzschild de 5 a 20 M☉, sin carga ni rotación:

- rₛ = 2GM/c².
- T = ℏc³/(8πGMkB), temperatura de Hawking para un observador lejano.
- S/kB = A c³/(4ℏG), con A = 4πrₛ².

El círculo representa una sección del horizonte, no una superficie emisora. Su radio usa **escala lineal fija**, 6 unidades SVG por masa solar, y mantiene una referencia de 10 M☉. Por eso el radio y el área dibujados conservan las proporciones físicas. No hay encuadre automático que oculte el cambio de masa.

Al pasar de 10 a 20 M☉, el radio se duplica, la temperatura se reduce a la mitad y la entropía se cuadruplica. A 10 M☉, rₛ ≈ 29,53 km y T ≈ 6,17 nK. El rango acotado hace visibles las relaciones sin mezclar decenas de órdenes de magnitud en una sola barra. No simula la evolución temporal ni una evaporación observable.

## Retos, bitácora y compatibilidad

Se corrigió una diferencia anterior de criterio: lente y Hawking registraban una exploración sin exigir explicación, y entropía aceptaba cualquier predicción. Ahora los tres requieren la comparación prevista y la respuesta correcta. Acreción y horizonte ya exigían ambas condiciones. Se puede corregir una predicción después de mirar el resultado; no se exige repetir una comparación válida ni se bloquea la exploración.

Los cinco capítulos restauran los logros al montar y escriben cuando cambia el arreglo de marcas, no en cada fotograma. Los tres modelos con identificadores de reto se convierten a índices 0–3 con su catálogo estable; los dos modelos numéricos conservan sus índices.

El motor común `src/shared/passport.ts` valida tamaño, versión, capítulos e índices, une marcas y evita tocar otras claves. `src/shared/usePassportStore.ts` gestiona los eventos y suscripciones:

- Einstein conserva `spum.einstein.passport.v1`, su esquema y sus 28 logros anteriores.
- Agujeros negros usa `spum.black-holes.passport.v1`, con cinco capítulos y veinte logros.
- Los datos quedan en el navegador; no se envían a un servidor ni identifican al visitante.
- Reiniciar un reto conserva los sellos. Borrar el almacenamiento del sitio borra la bitácora.
- Almacenamiento bloqueado, lleno o corrupto no impide usar la aplicación. La sincronización entre pestañas es local; no reemplaza un sistema de cuentas ni garantiza escrituras simultáneas.

No se agregaron dependencias. `ScienceArtifact.tsx` comparte los pequeños dibujos entre los especiales; la API anterior de Einstein se conserva con una reexportación. La navegación de agujeros negros tiene módulo propio y el arte grande, el atlas y el explorador se cargan desde su portada. Los otros laboratorios no importan la portada. Los estilos del atlas se limitan a sus clases y a las seis entradas de agujeros negros.

## Historia y límites de evidencia

Las fichas y la cronología incluyen enlaces a fuentes primarias o institucionales:

- [NASA, anatomía](https://science.nasa.gov/universe/black-holes/anatomy/): disco, horizonte y sombra.
- [Nobel 2020](https://www.nobelprize.org/prizes/physics/2020/summary/) y [comunicado](https://www.nobelprize.org/prizes/physics/2020/press-release/): Penrose, Genzel y Ghez; se separan resultado teórico y órbitas observadas.
- [Bekenstein, 1973](https://doi.org/10.1103/PhysRevD.7.2333): entropía de área.
- [Hawking, 1975](https://doi.org/10.1007/BF02345020): temperatura y normalización de entropía.
- [EHT/ESO, M87* en 2019](https://www.eso.org/public/images/eso1907a/).
- [EHT, Sagitario A* en 2022](https://eventhorizontelescope.org/publications/first-sagittarius-event-horizon-telescope-results-i-shadow-supermassive-black-hole).

La emisión del gas, las imágenes de sombras y los sistemas análogos no se presentan como detección astrofísica de radiación de Hawking. La lupa de Planck no muestra microestados observados. Una sonda dibujada dentro del horizonte no transmite evidencia desde el interior. Los supuestos y ecuaciones detallados de los cinco modelos siguen en sus documentos específicos.

## Arte y rendimiento

Generación mediante la herramienta integrada de imágenes. El PNG original permanece en la carpeta de imágenes generadas de Codex. Los tres WebP conservan el contenido y se derivaron con Pillow para tamaño y compresión:

- `public/agujeros-negros/atlas-portada-v1.webp`: 1536 × 1024, 209.918 bytes.
- `public/agujeros-negros/atlas-portada-movil-v1.webp`: 640 × 427, 35.358 bytes.
- `public/agujeros-negros/atlas-emblema-v1.webp`: 160 × 107, 3.282 bytes.

`srcset` y `sizes` permiten pedir la versión móvil cuando corresponde; en pantallas de alta densidad el navegador puede elegir la mayor. Los índices solo usan el emblema. Los cierres usan SVG. No se añadió reproducción automática a la portada; se respeta la preferencia de movimiento reducido.

### Prompt final de la ilustración

Use case: illustration-story. Asset type: a wide hero illustration for SPUM, an educational interactive black-hole special titled Atlas de lo invisible. Primary request: an astonishing, elegant black hole with a luminous tilted accretion disk, illustrated as a beautiful invitation to a scientific expedition. Subject: a dark central silhouette, a thin golden-orange glowing disk crossing the foreground, with the disk's far side visibly bent into a graceful arc above the silhouette, set within a sparse deep-space star field and subtle teal and violet nebular dust. The gas glows outside the dark region. Style: sophisticated painterly scientific editorial illustration, luminous ink and fine gouache on dark astronomical atlas paper, rich textured brush detail, cinematic depth, precise and restrained, neither cartoonish nor a photorealistic observation. Composition: wide 3:2 landscape, the entire disk and silhouette comfortably contained with room at every edge, striking large central object, broad dark indigo negative space at the edges for integration into a dark website, no hard frame. Palette: midnight navy, luminous amber and pale gold, cyan glints and muted amethyst. The image is an artistic illustration, not a ray-traced physical simulation; actual physics will run in separate code. Constraints: no light emerging from inside the silhouette, no Hawking particle-pair depiction, no jets, no astronauts or spacecraft, no faces, no diagrams, no grids, no equations, no letters, no text, no watermark, no logos, no borders. Opaque dark background.

## Validación

Se completaron los veinte retos con acciones y respuestas visibles en el navegador, en una vista de 390 px, pasando de un capítulo al siguiente con los enlaces reales. Al regresar a la portada se mostraron cinco sellos y 20/20, conservados después de recargar. El pasaporte Einstein mantuvo sus 28 marcas anteriores en el mismo origen de pruebas.

También se probaron una predicción incorrecta, su corrección tras observar, las tres partes de la ecuación y su pregunta, las cinco piezas del atlas, los presets de masa y las barras en sus extremos. Se revisan 320, 390, 768 y 1280 px. Esta revisión emula tamaños de pantalla y no sustituye la prueba en teléfonos físicos.

`tests/black-hole-expedition.test.mjs` verifica aislamiento y compatibilidad de pasaportes, adaptadores de los cinco capítulos, restauración sin revivir ensayos, valores SI independientes, escalas gráficas y criterio correcto de logro. Las pruebas físicas anteriores se mantienen. Validar con `npm test`, `npm run lint`, `npm run build` y `npm run research:hawking`; después de publicar, comparar las diecisiete páginas y sus recursos con `dist`.

Resultado local: 273 pruebas aprobadas, lint sin errores, compilación correcta y diez controles físicos adicionales de Hawking aprobados. La matriz visual incluye 32 combinaciones de página y anchura, las 17 barras de los cinco laboratorios, las dos bitácoras independientes y una comprobación adicional de los siete capítulos Einstein. La portada de ambos especiales, entropía, horizonte y los siete capítulos Einstein conservan sus grafos de carga sin Three.js.

Durante esta implementación se detectaron y corrigieron dos detalles nuevos: la transición global de botones podía reducir brevemente el contraste de la fórmula al cambiar de selección, y el nuevo criterio de logro necesitaba admitir la corrección de respuesta después de comparar. Se eliminó esa transición en los botones de la fórmula y se añadieron pruebas de ambas secuencias de aprendizaje. Ninguno cambia las ecuaciones físicas de las simulaciones.
