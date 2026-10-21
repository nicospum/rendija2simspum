# El cuaderno de Einstein: recorrido y revisión

## Qué cambia

El especial reúne siete laboratorios, 28 retos y tres familias: movimiento y tiempo, gravedad, y luz y cuantos. La portada permite elegir por pregunta, filtrar por tema y ver el progreso. La simulación conserva su instrumento oscuro; introducción, índice y cuaderno usan papel cálido, coral, verde y tinta azul.

Cada capítulo termina con tres objetos ilustrados y dos fichas con fuentes: una idea o experimento mental y una medición u observación. Se distingue lo que muestra el modelo de lo que se midió históricamente. El tren sobre el espejo de sal es una escena imaginaria inspirada en Uyuni, no un viaje histórico de Einstein.

La fórmula E₀ = mc² tiene una exploración breve en la portada; no es un octavo laboratorio. Usa c = 299.792.458 m/s y una barra logarítmica entre 0,1 mg y 1 g. Presenta energía en reposo equivalente, sin sugerir que toda sea aprovechable. Almacenar 1 kWh aumenta la masa de un sistema en reposo en unos 40,06 ng.

## Problemas previos corregidos

- El índice completo ocupaba unos 529 px de alto en una pantalla de 390 px. Ahora empieza cerrado, ocupa aproximadamente 182 px y deja anterior/siguiente visibles. Los siete capítulos siguen disponibles mediante un `details` nativo.
- Las marcas de los retos vivían en el estado React de cada documento y se perdían al cambiar de capítulo. Ahora se recuperan al entrar y se muestran en el pasaporte.
- El cierre de los capítulos no reunía los objetos observados ni relacionaba sistemáticamente modelos, ideas y evidencia. El cuaderno añade esas conexiones con fuentes.
- La identidad del especial era similar a los otros laboratorios. Tiene portada y entorno propios, ilustraciones originales y navegación temática.

Durante esta implementación se detectó y corrigió un corte de palabras en el título móvil del tren causado por ocultar los saltos de línea con CSS. El ajuste de cabecera evita que la marca se parta en pantallas estrechas.

## Implementación y mantenimiento

- `src/einstein/catalog.ts`: catálogo único de los siete capítulos.
- `progress.ts`: lectura, validación y unión de índices completados; `usePassport.ts`: suscripción y persistencia.
- `EinsteinNavigation.tsx`: índice compacto, anterior/siguiente y cuaderno al pie.
- `chapterNotes.ts`, `ChapterNotebook.tsx` y `Artifact.tsx`: contenido histórico y diagramas SVG accesibles por sus textos adyacentes.
- `EinsteinSeries.tsx`, `Passport.tsx` y `EnergyNotebook.tsx`: portada, recorrido, pasaporte y energía en reposo.
- `world.css` se importa exclusivamente desde las ocho entradas Einstein (portada y siete laboratorios). `special.css` solo desde la portada. No cambia la apariencia de prisma, doble rendija ni agujeros negros.
- Los inicializadores de los siete reducers son diferidos: el almacenamiento se lee al montar, no en cada fotograma. La escritura depende del arreglo de logros, no del avance de la reproducción.
- No se agregaron dependencias. La portada y los siete laboratorios siguen sin cargar Three.js.

### Pasaporte local

Se guarda solo la clave `spum.einstein.passport.v1`, versión y siete arreglos de índices 0–3. No incluye respuestas incorrectas, parámetros, tiempos de uso ni identidad; no se envía a un servidor. Se limita la entrada a 4096 caracteres y cuatro índices válidos por capítulo. Las nuevas marcas se unen con las anteriores y con otros capítulos. Datos corruptos, almacenamiento bloqueado o sin espacio no impiden usar un laboratorio.

Reiniciar un reto conserva los descubrimientos. Para borrar el pasaporte se puede eliminar el almacenamiento del sitio desde el navegador. Otros dispositivos, perfiles o modos privados no comparten automáticamente esas marcas. Dos pestañas se actualizan mediante el evento de almacenamiento, aunque una escritura exactamente simultánea puede competir: no es un sistema de cuentas sincronizadas.

### El otro especial

La portada de agujeros negros incorpora un atlas de cinco piezas con su propio color y lenguaje visual. Distingue sombra/luz curvada, gas caliente, horizonte causal, temperatura de Hawking y entropía de área. Cada pieza enlaza a su laboratorio y a una fuente. El atlas se importa desde su entrada, sin añadirlo al bundle de los demás laboratorios.

## Fuentes y precisiones

- [Einstein, Relativity: The Special and General Theory](https://www.gutenberg.org/files/5001/5001-h/5001-h.htm): tren, simultaneidad y equivalencia. El libro es una explicación de ideas, no el informe de un tren real.
- [NIST, relojes atómicos de 2010](https://www.nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal-scale): movimiento y diferencia de altura de 33 cm.
- [JILA/NIST, 2022](https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale): diferencia gravitatoria dentro de una nube atómica de escala milimétrica.
- [Langevin, 1911](https://fr.wikisource.org/wiki/L%E2%80%99%C3%89volution_de_l%E2%80%99espace_et_du_temps): viajero como experimento mental.
- [Hafele y Keating, publicación de 1972](https://doi.org/10.1126/science.177.4044.168): vuelos de 1971; incluyen efectos cinemáticos y gravitatorios, no el giro instantáneo del modelo.
- [CNES, MICROSCOPE](https://cnes.fr/projets/microscope): prueba de universalidad de la caída libre, resultados finales en 2022. No se presenta como prueba de toda la relatividad general.
- [NASA, MESSENGER](https://pgda.gsfc.nasa.gov/products/66): datos orbitales. Los 43 segundos de arco por siglo corresponden al aporte relativista de Mercurio, no a toda su precesión.
- [Nobel de Física de 1921](https://www.nobelprize.org/prizes/physics/1921/summary/) y [Millikan, 1916](https://doi.org/10.1103/PhysRev.7.355): ley fotoeléctrica y medición.
- [CERN, E=mc²](https://cds.cern.ch/record/2905272/files/4_Passport_E-mc2.pdf): masa y energía en reposo.
- Atlas de agujeros negros: [EHT/ESO, M87* en 2019](https://www.eso.org/public/images/eso1907a/), [Nobel 2020](https://www.nobelprize.org/prizes/physics/2020/summary/), [NASA, anatomía](https://science.nasa.gov/universe/black-holes/anatomy/), [Hawking, 1975](https://doi.org/10.1007/BF02345020), [Bekenstein, 1973](https://doi.org/10.1103/PhysRevD.7.2333).

Los modelos y límites físicos de cada laboratorio se documentan en sus archivos específicos. Las ampliaciones visuales de efectos pequeños siguen identificadas. No se atribuye el Nobel a la relatividad; no se representa la luz del disco de acreción como Hawking.

## Ilustraciones y prompts

Generadas con la herramienta integrada de imágenes, no con CLI. Son interpretaciones ilustradas contemporáneas; no fotografías ni diagramas utilizados para calcular la física. El contenido científico se dibuja en SVG/canvas desde los modelos existentes.

Archivos finales:

- `public/einstein/einstein-cuaderno-v1.webp`: 1254 × 1254, transparencia, aproximadamente 500 KiB.
- `public/einstein/einstein-avatar-v1.webp`: derivado de 160 × 160 para índice y cierres, aproximadamente 11 KiB.
- `public/einstein/tren-espejo-de-sal-v1.webp`: 1774 × 887, aproximadamente 318 KiB.

Los PNG originales permanecen en la carpeta de imágenes generadas de Codex. Se exportaron a WebP y se creó una miniatura con Pillow, conservando el arte. La portada pide el retrato con prioridad alta; el panorama y las imágenes de cierre se cargan de forma diferida. La navegación no descarga el retrato grande.

### Prompt final del retrato

Use case: illustration-story. Asset type: original illustration for the Einstein special of SPUM, an interactive Spanish-language science website. Primary request: a beautiful, expressive, welcoming illustrated Albert Einstein, replacing a stiff geometric portrait with a lively editorial illustration. Subject: recognizable elderly Albert Einstein, wild white hair, warm curious eyes, white moustache, gentle amused smile, wearing a warm charcoal cardigan over a cream shirt, seated at a small desk and sketching an idea with a pencil. Style: sophisticated hand-painted gouache and colored-pencil editorial illustration, warm paper grain, rich but restrained colors, beautiful expressive face, charming and thoughtful, suitable for both teens and adults, not a caricature gag. Composition: square image, generous clear silhouette, Einstein from mid-torso upwards with a small edge of desk and an open notebook, all hair, hands, pencil and notebook fully inside the image, room around the silhouette, designed to place over a warm pale cream website panel. Palette: ivory hair, warm skin, deep ink blue, accents of coral, amber and teal. Background: fully transparent with actual alpha; do not draw a background, backdrop, scenery, border or drop shadow. Constraints: only Einstein and his small notebook/desk, no other figures, no text, no writing, no formulas, no letters or logos, no watermark. It is a contemporary illustrative interpretation, not a historical photograph. All formulas and explanations will be overlaid as real HTML separately.

### Prompt final del tren

Use case: illustration-story. Asset type: panoramic editorial illustration for the Einstein special of a Spanish interactive science website. Primary request: an inviting imaginative train journey across a vast mirror-like salt flat inspired by the Salar de Uyuni, with a friendly illustrated elderly Albert Einstein looking thoughtfully out of one window. It illustrates a fictional thought experiment, not a historical journey or photograph. Style: beautiful sophisticated gouache and colored-pencil editorial art, tactile brush strokes, warm and whimsical but not childish, rich ink-blue outlines, cream highlights, coral-red train carriages, soft turquoise water reflections, gentle apricot sunrise sky. Composition: wide panoramic 2:1 landscape, a single elegant vintage passenger train traveling horizontally across the middle, the train's reflection clearly mirrored in the shallow still water below, distant low mountains and open sky, generous sky negative space, Einstein small but recognizable in a central window with wild white hair and moustache, all train carriages inside frame. A quiet wonderful scene that makes the visitor want to enter the experiment. Do not draw light rays, lightning, clocks, equations, writing, text, letters, logos, UI, titles, borders or watermarks; scientific markers and labels will be real HTML or SVG. Finished artwork, restrained realistic perspective, no photorealism.

## Validación

La revisión manual usa el navegador integrado y vistas de 320, 390, 768 y 1280 píxeles; no sustituye probar equipos físicos iOS/Android. Se completaron los 28 retos mediante controles y respuestas visibles en la vista de 390 px, navegando con los enlaces anterior/siguiente. Al volver a la portada se mostraron los siete sellos y 28/28; una recarga los conservó.

Se probaron filtros 7/3/3/1, límites de barras, alternancia de las dos vistas en los siete capítulos, apertura del índice y las cinco piezas del atlas. Las nueve páginas revisadas (siete laboratorios y dos especiales) no presentan desborde horizontal ni controles visibles de menos de 44 px en las cuatro anchuras.

Las pruebas de `tests/einstein-passport.test.mjs` cubren validación de datos, arreglos independientes, unión de logros, bloqueo/cuota de almacenamiento, inicialización de los siete capítulos, energía SI y mapeo logarítmico. Se ejecutan junto con las pruebas físicas existentes mediante `npm test`; completar con `npm run lint`, `npm run build` y `npm run research:hawking`.

Resultado local de la revisión del 21 de octubre de 2026: 263 pruebas aprobadas, lint sin errores, compilación de las diecisiete entradas correcta y diez controles físicos adicionales de Hawking aprobados. Se ejercitaron las barras visibles de los siete laboratorios en sus extremos y se alternaron ambas vistas sin resultados no finitos.

La comprobación pública posterior al despliegue debe comparar las diecisiete páginas y los hashes de JS, CSS e imágenes con `dist`, y repetir una revisión móvil de los siete capítulos.
