# Seguimiento integral de SPUM · catálogo actual

Revisión interna documentada, 2 de noviembre de 2026. Proyecto confirmado: **SPUM · Experimentos para entender**, [www.spumexp.lat](https://www.spumexp.lat/), repositorio `nicospum/rendija2simspum`, rama `master`, base `effb811cee78e33d78234e12e63fd28232058e6a`. Copia de trabajo limpia al comenzar en `.work/rendija2simspum`, dentro del workspace del prisma. No se confundió ese repositorio integrado con `newtonprisma`.

## Veredicto y cobertura

**19 laboratorios y 89 retos/preguntas con doble QA vigente dentro del alcance documentado.** Son 84 retos principales y cinco auxiliares; Holografía reúne tres capítulos y doce retos. Se revisaron también dos exploraciones sin calificación. No se encontraron laboratorios activos ocultos ni borradores en las 26 entradas HTML: 19 laboratorios, tres alias de Holografía, portada y tres especiales. Los alias se probaron; no se excluyeron funciones por estar fuera de la portada.

Se corrigieron **tres problemas preexistentes en tres laboratorios**. No se encontraron errores centrales de fórmula que exigieran sustituir sus modelos. Se preservaron identidad, rutas, controles útiles y reglas de los retos; no se agregaron dependencias ni nuevas actividades durante la revisión.

Esta es una revisión de continuidad: la auditoría de 17 laboratorios/81 retos y las revisiones posteriores de Eratóstenes/Bell conservan su fecha y alcance. Se contrastaron fuentes, hashes y cambios; se reabrieron los componentes afectados y se hicieron nuevas pruebas de uso. **No se afirma que los 89 retos se ejecutaron otra vez exhaustivamente en todos los tamaños.** Cada ID conserva evidencia de correcto, incorrecto e incompleto cuando aplica, y el manifiesto distingue cada repetición nueva de las pruebas anteriores revalidadas.

Los dos agentes de producto registraron **95 y 117 estados actuales**, respectivamente: incluyen recorridos, preguntas, observaciones, casos negativos, reinicios y ayuda. No son 212 experimentos científicos ni 212 retos distintos. El nuevo pase alcanza las 19 rutas. La prueba de que una escena aparece en el DOM se complementó con capturas, acciones reales y lecturas visibles.

## Estado por laboratorio

En esta tabla **A** significa APROBADO en el alcance de los manifiestos; no certificación externa, ni demostración de aprendizaje con alumnos. La aceptación es independiente de quien implementó los arreglos. Todos corresponden a la misma base más SCI-01/UX-01/UX-02, identificados por hashes en los dictámenes; el commit de entrega se obtiene con `git rev-parse HEAD` y el recibo de publicación indicado abajo.

| Laboratorio / retos | Objetivo | Cambio o conclusión | Ciencia | Producto | Aceptación |
|---|---|---|:---:|:---:|:---:|
| Doble rendija · 4 | Relacionar detecciones e interferencia | Ocho casos ópticos nuevos junto con Prisma; referencias y cambios inválidos claros. | A | A | A |
| Prisma · 4 | Distinguir refracción, dispersión y brillo | Visor y comparación compacta funcionan; fuente apagada no produce falsa señal. | A | A | A |
| Hawking · 4 | Masa, temperatura y balance térmico | Retos y representación conservan el alcance semiclásico ideal. | A | A | A |
| Lente gravitacional · 4 | Conectar imagen con caminos de luz | Captura, escape y escalas conservan su explicación y controles. | A | A | A |
| Entropía · 4 | Área, entropía y balance exterior | Visor actual legible; no se reprodujo el achique antiguo. | A | A | A |
| Acreción · 4 | Inferir una masa invisible por sus alrededores | Gas luminoso, órbita testigo y ayudas funcionan. | A | A | A |
| Horizonte · 4 | Distinguir relojes y señales | Se conserva la diferencia entre emitir y recibir. | A | A | A |
| Reloj de luz · 4 | Relacionar eventos y tiempos | Acción, observación y condiciones de reto visibles. | A | A | A |
| Tren de Einstein · 4 | Simultaneidad, señales y longitud | Fechas de emisión y recepción siguen diferenciadas. | A | A | A |
| Gemelos · 4 | Comparar tiempo propio de recorridos | El giro no se confunde con el reencuentro. | A | A | A |
| Ascensor · 4 | Apoyo y equivalencia local | La comparación exige los dos escenarios. | A | A | A |
| Tiempo y altura · 4 | Deriva de relojes y GPS ideal | Unidades, acumulación y ajuste separados. | A | A | A |
| Mercurio · 4 | Precesión y ampliación visual | **UX-01:** etiqueta estable de lupa, acorde al dibujo y `aria-pressed`. | A | A | A |
| Fotoeléctrico · 4 | Separar frecuencia, intensidad y umbral | Frecuencia cambia energía; brillo no reemplaza al umbral. | A | A | A |
| Entrelazados · 4 | Estados del todo/partes y bases | **UX-02:** repetir un ajuste idéntico conserva los 200 pares medidos. | A | A | A |
| Holografía · 12 | Conectar geometría, entropía y temperatura | Tres secciones, ayudas, aliases y retos conectados. | A | A | A |
| Curva de Page · 4 | Entropía reducida y correlaciones | Modelo y promedio diferenciados; contraste numérico independiente repetido. | A | A | A |
| Eratóstenes · 4 | Inferir tamaño a partir de dos sombras | Controles, mediciones y límites del modelo esférico correctos. | A | A | A |
| Bell · 4 | Correlaciones y límite de modelos locales | **SCI-01:** ayuda distingue medias teóricas y muestras finitas. | A | A | A |

Auxiliares incluidos: **Contar lo que no vemos**, cuatro preguntas, y **ecuación de campo**, una. Energía en reposo y explorador de escalas se comprobaron como actividades no calificadas; no se suman como retos. No quedan retos fallidos o bloqueados en la cobertura acordada; los límites de dispositivo y participantes se conservan abajo.

## Correcciones y doble control

1. **Bell:** la ayuda abreviada podía hacer creer que ninguna muestra local supera 2. Ahora explica que la cota corresponde a medias y que una estimación necesita análisis de incertidumbre. Fuente y alcance: CHSH 1969, p. 881, y Hoeffding 1963; referencias y secciones en [ciencia](qa-ciencia.md). No cambia la predicción ni la evaluación.
2. **Mercurio:** «Giro real» aparecía como botón activo mientras la escena estaba amplificada. El toggle ahora conserva el nombre «Ampliar giro ×100.000», con estado presionado correcto. Se comprobaron ambos estados, lecturas, diez vueltas y reto 4; el valor físico no depende de la lupa.
3. **Entrelazados:** repetir «Ambos en Z» borraba una muestra sin cambiar el montaje. La igualdad estricta de sus cuatro variables evita esa pérdida. Los cambios reales siguen limpiando conteos activos, las referencias históricas se conservan y reiniciar sigue siendo explícito. Los cuatro retos se volvieron a recorrer tras el arreglo.
4. **Documentación:** se corrigió una línea con 25 entradas en lugar de 26 y se creó el seguimiento actual sin reescribir el histórico. QA detectó y corrigió antes de publicar una metadata nueva de Eratóstenes que mencionaba controles inexistentes; se registra como error introducido en este ciclo, separado de los defectos anteriores.

El [registro de hallazgos](hallazgos.md) incluye causa, impacto, plan revisado, responsable, evidencia y condición de aceptación. La implementación fue de `root`; el revisor científico y los agentes de producto no escribieron esos tres cambios. Si un documento de QA necesitó una corrección de redacción, se corrigió sin alterar el registro de acciones observado.

## Equipo y evidencia

- **Coordinación, implementación e integración:** `root`, inventario, rama/candidato, arranque, pruebas técnicas, correcciones y publicación. Aceptación adicional de Geometría, enlaces y aliases; su propia prueba de Mercurio no sustituye la independiente.
- **Ciencia, fuentes, modelos y evaluación:** `qa_ciencia_actual`, [informe](qa-ciencia.md), [dictamen por ID y hashes](ciencia.json). Revisó planes, implementación y resultados finales de producto.
- **Producto y aprendizaje — Einstein/agujeros negros:** `qa_producto_einstein_cosmos`, [informe](qa-producto-einstein-cosmos.md), [49 IDs](producto-einstein-cosmos.json). Código, uso, aceptación del arreglo y cierre cruzado.
- **Producto y aprendizaje — óptica/cuántica:** `qa_producto_optica_cuantica`, [informe](qa-producto-optica-cuantica.md), [40 IDs](producto-optica-cuantica.json). Código, uso, aceptación de Bell/Entrelazados y cierre cruzado.

Los roles de tester y QA de producto comparten agente, pero están separados del implementador. El dictamen de ciencia es independiente del de producto. No se presentan como especialistas humanos ni certificación externa.

El [inventario actual](inventario.json) enlaza modelo, disciplina, prerrequisitos, variables, resultados, fuentes y todos los retos. El [estado consolidado](estado.json) contiene los 89 IDs y sus dictámenes. Cada manifiesto conserva las referencias históricas aplicables y los nuevos estados observados; no se usan promedios de puntuación para compensar un fallo.

## Controles ejecutados

Entorno: Windows, PowerShell, Node **24.22.2**, npm **11.19.1**, React 19, TypeScript 5.7, Vite **6.4.5**, Chromium del navegador integrado. Gestor y scripts verificados en `package.json`/lockfile; despliegue estático con `vercel.json`, Git → Vercel.

- Base y candidato final: **449/449 pruebas**, sin fallos ni omisiones; `npm run lint` y `npm run build` aprobados. No se agregaron tests cosméticos de texto: los cambios de UI se verificaron con acciones y evidencia; la suite física y de estados existente se repitió.
- Page: nueva comparación independiente NumPy/SVD frente al solver de la app, **25 estados y 175 particiones**, error máximo de entropía ≈2,24×10⁻¹⁵ bits frente a tolerancia prefijada 10⁻¹⁰.
- `git diff --check`; coherencia de la auditoría histórica: 81 IDs/863 referencias. El verificador actual comprueba 89 IDs, hashes y punteros de evidencia. Este control verifica registros, no reemplaza al navegador.
- Navegador: pase actual de 19 rutas; tamaño principal 390×844, muestras 320, horizontal 667×375 y escritorio 1280. Se distinguen lectura de consigna, intento correcto/incorrecto/incompleto, ayuda, gesto, reinicio y referencia. La cobertura concreta por caso está en los dos manifiestos.
- Base pública: **26 páginas y 92 archivos JS/CSS** idénticos por SHA-256 al build de `effb811`; el público no se supuso idéntico al local. Después de publicar se vuelve a comparar el build final y se guarda el recibo.
- Seguridad de dependencias: **12 avisos moderados preexistentes de desarrollo**, ninguno alto/crítico; `npm audit --omit=dev`: **0**. No hay reparación compatible ofrecida para la cadena ESLint/minimatch; no se usó `--force`, downgrade ni override transversal.

Skills empleadas: `game-playtest`, `game-ui-frontend`, checklist `react-best-practices` y flujo de despliegue Vercel. Herramientas: Git/rg, tests Node, TypeScript/ESLint/Vite, CUA con acciones reales y lectura DOM, fuentes web primarias y NumPy para el contraste independiente. Se inspeccionó la skill TypeSafe; no se encontró un MCP/cliente Jev conectado. No se instaló un servicio de IA para clasificar hallazgos ni se envió el código a una API nueva. REA no era necesario porque fuente y comportamiento estaban disponibles.

## Reproducir y retomar

Desde el repositorio integrado:

```sh
npm ci
npm run dev
# Puerto normal declarado por Vite: http://127.0.0.1:1020/
npm test
npm run lint
npm run build
node docs/revision-integral/seguimiento/inventario.mjs
node docs/revision-integral/seguimiento/verificar.mjs
```

En esta revisión se usó `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 1027 --strictPort` para evitar interferir con otros servidores. El aislamiento de red del primer proceso impedía que el navegador lo alcanzara; se relanzó autorizado fuera de ese aislamiento, sin cambiar la aplicación.

`verificar.mjs --write-state` consolida dictámenes **ya emitidos** cuando cobertura, referencias y hashes coinciden; no ejecuta escenas ni crea una nueva aprobación científica. Si cambia un archivo revisado, falla y debe reabrirse la revisión afectada. Los artefactos brutos se guardan fuera de Git, junto al checkout en `.work/qa-integral-seguimiento-2026-11-02`; son necesarios para repetir la validación completa de evidencia. Un clone sin esos artefactos no debe aparentar esa validación.

La versión de publicación, estado Vercel, comparación de archivos y muestra de navegador público se registran en `release-verification.json` de esa carpeta externa. La entrega utiliza el remoto verificado, sin force-push ni cambios de proyecto/dominio. Los informes versionados identifican el candidato por base y hashes para evitar un hash circular del propio commit.

## Pendientes reales y opciones

1. **Safari y teléfonos físicos:** pendientes por falta de acceso y decisión explícita previa. Los tamaños emulados y eventos de ratón/teclado no sustituyen multitáctil real, teclado virtual ni peculiaridades de Safari.
2. **Aprendizaje con participantes:** hace falta una prueba con principiantes; los agentes detectan ambigüedad y verifican la actividad, pero no demuestran que resulte divertida o que una persona haya aprendido.
3. **Herramientas de desarrollo:** seguir la reparación compatible de los 12 avisos moderados; no son fallos nuevos de estos cambios ni una vulnerabilidad demostrada de la web estática.
4. **Límites de prueba:** no se certificaron todas las combinaciones, GPU, tecnologías de asistencia o WCAG completa. La navegación fue fluida en los recorridos observados; no se hizo un benchmark de rendimiento de todos los equipos ni se inventó una mejora porcentual.

Las [opciones futuras](opciones.md) están separadas: seis propuestas nuevas y cuatro mejoras opcionales. **Teletransporte cuántico ideal** es la continuación recomendada hacia Maldacena después de Entrelazados y Bell; **mareas** es la prioridad si se busca una entrada más visual a la gravedad. Ninguna se implementó durante esta auditoría.
