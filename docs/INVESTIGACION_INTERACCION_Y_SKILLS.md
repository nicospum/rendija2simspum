# Skills e interacción para los laboratorios de SPUM

Investigación y primera aplicación: 21–22 de octubre de 2026.

El cambio prioritario es convertir el visor en el lugar donde se experimenta. Las explicaciones y los retos ya existen, pero en buena parte de la colección el usuario modifica condiciones lejos del dibujo y pierde la relación entre acción y resultado. Las skills seleccionadas ayudan a diseñar y comprobar esa relación; no sustituyen las fuentes científicas ni las pruebas de las fórmulas.

## Qué confirma la revisión de SPUM

En los siete capítulos Einstein, los componentes `Scene.tsx` de la versión anterior reciben parámetros y dibujan, sin acciones del usuario sobre los objetos. Hawking sí permite mover e inspeccionar el mapa; esas acciones cambian la vista o abren información, pero no modifican sus variables físicas. La lente ya permite elegir un rayo en la imagen. La rotación o inspección de una escena es valiosa, aunque por sí sola no constituye una prueba de una hipótesis física.

Medición en Chromium a 390 × 844 px sobre la versión pública previa, commit `a838b0c`: distancia vertical entre el final del primer visor y la primera barra del panel principal. No es una medida de aprendizaje ni de rendimiento.

| Laboratorio | Separación aproximada |
| --- | ---: |
| Reloj de luz | 1.100 px |
| Tren | 1.012 px |
| Gemelos | 1.048 px |
| Ascensor | 1.520 px |
| Tiempo y altura | 1.133 px |
| Mercurio | 1.852 px |
| Fotoeléctrico | 1.434 px |
| Acreción | 663 px |
| Horizonte | 896 px |
| Hawking | 1.736 px |
| Entropía | 1.079 px |

La comparación usa el primer visor y no un encuadre elegido después de desplazarse. No se obtuvo una medida equivalente para el visor de lente con ese selector, por lo que no se asigna un valor. La guía de retos de la revisión anterior hizo más claras las instrucciones, pero añadió altura antes de los controles sin resolver esta separación.

Los valores originales se conservan en [baseline-mobile.json](../research/interaccion/baseline-mobile.json).

## Qué aporta la investigación educativa

PhET desarrolla sus simulaciones mediante investigación de diseño y entrevistas con estudiantes. El trabajo de Podolefsky, Moore y Perkins sobre *implicit scaffolding* propone orientar la exploración mediante posibilidades de acción reconocibles, restricciones, señales y respuesta del sistema. Para SPUM, esto sugiere que una sonda movible o una lámpara accionable pueden enseñar mejor la relación entre variables que otra tarjeta de instrucciones. Es una aplicación de esos principios al proyecto, no una validación empírica de nuestros laboratorios. [Investigación de PhET](https://phet.colorado.edu/en/research), [artículo original](https://arxiv.org/abs/1306.6544).

La guía de interfaz de Game Studio propone preservar el espacio de juego, mantener pocos controles persistentes y guardar los textos largos en superficies desplegables. Se adopta ese criterio conservando la identidad visual de cada especial. [Fuente original de Game UI Frontend](https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-ui-frontend/SKILL.md).

La interacción táctil requiere distinguir arrastrar un objeto de desplazar la página. `touch-action` se restringe a la zona manipulable, y se conservan botones, barras y teclado como alternativas al arrastre. Esto sigue el criterio de alternativas de interacción de W3C; no se afirma conformidad integral con WCAG. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action), [W3C, movimientos de arrastre](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).

## Skills comparadas y decisión

Se consultó el catálogo oficial disponible y los repositorios originales de los autores. Los directorios de terceros sirvieron para descubrir candidatos; la selección se contrastó con los archivos originales. La búsqueda de plugins disponibles no ofreció una integración de Game Studio directamente instalable desde ese catálogo, por lo que se instalaron sus skills de texto mediante el instalador oficial.

| Candidata | Aporte a SPUM | Decisión y límites |
| --- | --- | --- |
| **game-ui-frontend**, OpenAI | Controles junto a la escena, jerarquía de acciones, espacio de juego y ayudas secundarias | **Instalada y aplicada** a los tres pilotos. No obliga a convertir todos los diagramas en WebGL. |
| **game-playtest**, OpenAI | Probar acciones, observar cambios visuales, revisar superposiciones y cambios de tamaño | **Instalada y aplicada**. Se usa el navegador disponible, sin agregar un segundo sistema de automatización. |
| **web-game-foundations**, OpenAI | Separar estado físico, dibujo y entrada del usuario | **Instalada y aplicada**. Se conservan React, SVG, reducers y fórmulas existentes. No se migra a un motor de juegos. |
| **sympy**, K-Dense | Álgebra exacta, supuestos explícitos y comprobaciones independientes | **Instalada**. Se verificaron seis identidades básicas con SymPy local 1.13.2; la skill documenta 1.14.0. No se actualizó Python ni se añadió SymPy al navegador. |
| **threejs-interaction**, CloudAI-X | Selección de objetos, raycasting, arrastre y coordinación con cámara | Buena candidata para futuras mejoras 3D. La versión revisada apunta a r186; SPUM usa r174. **No instalada**, para evitar aplicar ejemplos incompatibles sin adaptación. [Repositorio](https://github.com/CloudAI-X/threejs-skills). |
| **threejs-performance / animation**, CloudAI-X | Coste gráfico, recursos, animación y control de escena | Reservadas para trabajos concretos del prisma y otros visores 3D. Las últimas experiencias necesitan primero acciones más claras; no una actualización general de Three.js. |
| **frontend-design**, Anthropic | Composición e identidad visual | Instrucciones revisadas; **no instalada** en esta etapa. El problema principal medido es de interacción y distribución, no de colores o tipografía. [Fuente](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design). |
| **scientific-critical-thinking**, K-Dense | Distinguir afirmaciones, evidencia y límites | Revisada, no instalada. Su foco incluye evaluación de estudios y estadística; no aporta un motor relativista. Para cálculos concretos se seleccionó SymPy. [Fuente](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/scientific-critical-thinking). |
| **Astropy / Jupyter** | Unidades, datos astronómicos y cuadernos reproducibles | Catálogos consultados; reservar para laboratorios que necesiten datos observacionales o análisis nuevo. No se necesitan para acercar controles existentes. [Astropy](https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/astropy), [Jupyter](https://github.com/openai/skills/tree/main/skills/.curated/jupyter-notebook). |
| **manimce-best-practices / Manim** | Explicaciones matemáticas animadas y secuencias narradas | Útil para una introducción opcional futura. No se instaló: un video renderizado no resuelve la manipulación en tiempo real de SPUM. [Skills del autor](https://github.com/adithya-s-k/manim_skill), [salidas documentadas de Manim](https://docs.manim.community/en/stable/tutorials/output_and_config.html). |
| **Three.js Game Skills**, Majid Manzarpour | Producción de juegos y recursos, interfaz y QA | Repositorio evaluado como paquete. No se instaló: su alcance es mucho mayor que esta corrección y parte de sus rutas añade generación de recursos o infraestructura innecesaria. [Repositorio original](https://github.com/majidmanzarpour/threejs-game-skills). |

También se consideraron herramientas ya disponibles para imágenes, investigación y navegación. No se conectaron cuentas nuevas ni se contrataron APIs. No se necesita un MCP adicional para implementar estas interacciones con el código existente. El antiguo nombre `develop-web-game` aparece en índices y copias; no estaba en el catálogo oficial consultado. Se eligieron las rutas vigentes verificadas en `openai/plugins`, sin instalar espejos.

### Instalación reproducible

- Skills de OpenAI: repositorio `openai/plugins`, versión `0722921d5542fc593105c27bd52630babd8b8c2a`, carpetas `plugins/game-studio/skills/game-ui-frontend`, `game-playtest` y `web-game-foundations`.
- Matemáticas: `K-Dense-AI/scientific-agent-skills`, versión `593377bb048752abb0152deab9fbb1083a6087df`, carpeta `skills/sympy`.
- Instalación personal en `~/.codex/skills`, con el script de `skill-installer`. Disponibles para descubrimiento automático en el siguiente turno.
- Las referencias compartidas de Game Studio se incluyeron dentro de cada skill y se ajustaron únicamente sus rutas relativas. `INSTALLATION.md` registra procedencia y hash del archivo original. Se conservaron licencias. Los enlaces de los cuatro `SKILL.md` se comprobaron sin referencias faltantes.
- No se ejecutaron scripts de terceros, generadores de imágenes de pago ni instaladores de motores. Las skills seleccionadas son instrucciones, referencias y metadatos.

Referencia del componente científico: Kassis, Timothy; Agarwal, Vinayak; He, Yuhuan; Patel, Darshil; Brueckner, Aubrey M. (2026). *Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents*. [Registro original y DOI](https://doi.org/10.48550/arXiv.2609.00065).

## Primera versión implementada

### Reloj de luz

Se puede tocar el camino y arrastrar el pulso. El gesto se proyecta sobre los dos tramos que ya calcula la transformación de Lorentz; no dibuja una trayectoria arbitraria. En reposo los tramos se superponen, por lo que se mantiene el sentido actual y se ofrecen accesos a Espejo y Regreso. Un pequeño ajuste a los extremos permite completar un tic sin precisión de un píxel.

Rapidez, reproducción y tiempos de un tic se modifican junto al dibujo. En celular se compactan los títulos redundantes y las lecturas repetidas del panel; la comparación detallada continúa inmediatamente debajo. El arrastre pausa la reproducción y usa la misma acción del reducer que la barra original.

### Al borde del horizonte

Se puede mover la sonda horizontalmente sobre el mapa. En modo sostenida se cambia el radio del ensayo sin activar caída libre ni permitir posiciones estáticas dentro del horizonte. En caída libre se selecciona el instante de la geodésica existente: arrastrar no acelera ni frena físicamente la sonda.

La consola junto al mapa permite elegir modo, comparar alturas, cruzar el horizonte, enviar luz y observarla o pausar. El radio se obtiene invirtiendo la escala comprimida que ya se usaba para dibujar. El reloj propio y la recepción siguen calculándose con las fórmulas anteriores.

### Hawking

Masa, entorno y comparación temporal están junto al agujero negro, con factores de temperatura y potencia visibles. La prueba de una masa solar en el fondo selecciona ese ensayo y muestra el balance entrante. El 75 % de vida ideal puede compararse con el tiempo inicial desde el mismo botón.

Navegación, inspección y etiquetas del mapa siguen disponibles en un desplegable. Así no desplazan los controles físicos. Se mantiene la distinción entre acercar la cámara y cambiar la masa, y entre marcadores de energía e imágenes de fotones reales. El visor es esquemático y no se convierte en una simulación cuántica microscópica.

Los accesos rápidos a los cinco visores de agujeros negros van al visor correspondiente; antes algunos detenían al usuario en la tarjeta de misión anterior.

## Cómo extenderlo al resto de la colección

Esta tabla prioriza trabajos posteriores; no describe funciones ya publicadas salvo los tres pilotos.

| Orden | Laboratorio | Acción sobre la escena propuesta | Qué debe descubrir el usuario |
| --- | --- | --- | --- |
| 1 | Hawking | Consola inmediata implementada; siguiente paso, comparación visual guiada de dos estados | Más masa baja T; emitir no siempre significa perder energía neta. |
| 2 | Horizonte | Sonda y consola implementadas; siguiente paso, seleccionar un pulso y seguir su recepción | El cruce del reloj propio y la llegada de un mensaje son fenómenos diferentes. |
| 3 | Reloj de luz | Pulso y consola implementados; siguiente paso, guardar dos tics para superponerlos | El camino cambia y c se conserva. |
| 4 | Tren | Mover al pasajero y accionar los destellos en la escena; instrumento de longitud visible | Cambiar una llegada no cambia por sí solo la fecha de emisión. |
| 5 | Gemelos | Cursor sobre el recorrido y selección del giro; mostrar edades que se acumulan | El tiempo propio depende del recorrido completo, no de la imagen recibida. |
| 6 | Ascensor | Tocar la pelota para soltarla, elegir masa sobre el objeto y cambiar cabina junto al visor | La balanza mide apoyo; caída libre no significa ausencia de campo. |
| 7 | Tiempo y altura | Mover un reloj en una escala explícita y comparar deriva junto a ambos relojes | Altura y movimiento alteran ritmos; la duración acumula la diferencia. |
| 8 | Fotoeléctrico | Fuente con frecuencia y brillo inmediatos, metal seleccionable y medición junto al detector | Más brillo no sustituye la frecuencia umbral. |
| 9 | Entropía | Manipular un tamaño acotado y una emisión separada; libro de área junto al horizonte | Cambiar M y emitir parte de M son ensayos distintos; S sigue al área. |
| 10 | Mercurio | Elegir perihelio y marcas de vueltas en las órbitas; lupa y excentricidad inmediatas | La lupa cambia la representación, no la precesión calculada. |
| 11 | Acreción | Control de inclinación sobre el disco y gas junto a la escena; salto directo a la estrella | El arco no levanta el gas fuera del plano; luz y órbita dan pistas distintas. |
| 12 | Lente | Conservar elección de píxel; añadir fuente arrastrable y enlace visual entre dirección y trayectoria | Imágenes distintas pueden corresponder a una sola fuente. |
| 13 | Prisma | Conservar la experiencia; mejorar solo la precisión de gestos e indicación de objetos seleccionables | Refracción y dispersión responden a condiciones ópticas. |
| 14 | Doble rendija | Conservar la experiencia; revisar conflictos entre cámara, selección y desplazamiento táctil | Los impactos acumulados y la información del camino tienen roles diferentes. |

Los retos deberían proponer acciones verificables: encontrar una condición, comparar dos estados o explicar una sorpresa. El premio debe estar unido a lo descubierto. Agregar puntos, confeti o partículas sin relación con la variable no resolvería el problema medido.

## Criterios de aceptación y verificación

Para extender los pilotos: escena y variable principal visibles simultáneamente después del acceso al visor; respuesta dibujada y numérica; acciones táctiles amplias; desplazamiento normal fuera del objeto; alternativa al arrastre; pausa; compatibilidad con movimiento reducido; condiciones físicas válidas y logros anteriores conservados.

Se probaron el arrastre del pulso y de la sonda con el puntero del navegador, alternativas de teclado y acciones de las consolas. Las pruebas automáticas comprueban proyección sobre trayectorias relativistas, ambigüedad de ida/vuelta, ajustes de extremos, límites y escala radial inversa. Se conservaron los reducers, condiciones educativas y pruebas físicas anteriores.

Se completaron las comparaciones y explicaciones de los cuatro retos de cada piloto usando las nuevas consolas para cambiar sus variables: doce recorridos. Se midieron doce combinaciones de los tres visores con 320 × 740, 390 × 844, 768 × 1024 y 1280 × 900 px. En todas, el visor y su barra principal quedaron simultáneamente dentro de la pantalla después del enlace de entrada, sin desbordamiento horizontal. [Recorridos](../research/interaccion/pilot-challenges.json), [mediciones finales](../research/interaccion/pilot-layout.json).

Las seis verificaciones simbólicas independientes recuperan γ(0,8c) = 5/3, ritmo 3/5, velocidad de luz local invariante y factores de masa doble: T ×1/2, P ×1/4, A ×4. Se usó la instalación local de SymPy 1.13.2 con operaciones básicas; no se declara verificación del resto de las recetas de la skill, que apunta a 1.14.0.

La comprobación es reproducible con `python research/interaccion/check-symbolic.py` si SymPy está disponible. Es una herramienta opcional de investigación; no participa en la compilación ni exige instalar Python para usar SPUM.

`npm test`: **287 pruebas aprobadas**. `npm run lint` sin errores y `npm run build` correcto, con diecisiete entradas. La corrección no agrega dependencias ni carga Three.js en reloj u horizonte.

La emulación de ancho en Chromium y los gestos con puntero no sustituyen una prueba táctil en Safari/iPhone y Android reales. Tampoco prueban que alguien haya aprendido: quedan pendientes entrevistas con principiantes y medidas de rendimiento en teléfonos físicos. Los restantes nueve laboratorios posteriores al prisma y la doble rendija conservan su interacción anterior, salvo los accesos al visor corregidos.
