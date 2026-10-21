# SPUM · Experimentos para entender

Una colección de laboratorios interactivos para aprender ciencia haciendo preguntas, cambiando una variable y comparando resultados.

- `/`: portada y catálogo de experimentos.
- `/doble-rendija/`: detecciones individuales, interferencia, difracción e información del camino.
- `/prisma/`: refracción y dispersión de la luz blanca, con trazado óptico en tiempo real.
- `/hawking/`: masa, temperatura, entorno, evaporación y entropía de un agujero negro de Schwarzschild.
- `/lente-gravitacional/`: imagen del observador y trayectorias calculadas con geodésicas de Schwarzschild.
- `/entropia/`: fórmula de Bekenstein–Hawking, área, evaporación y contabilidad de entropía con cuatro retos.
- `/acrecion/`: cómo vemos lo invisible; disco de acreción, luz curvada, Doppler y órbita de una estrella testigo, con cuatro retos.
- `/horizonte/`: caída libre, relojes sostenidos, cruce del horizonte y señales de luz con cuatro retos.
- `/agujeros-negros/`: especial que conecta lente, acreción, horizonte, Hawking y entropía con un índice y navegación entre capítulos.
- `/reloj-de-luz/`: dos vistas del mismo pulso, dilatación temporal y cuatro retos de relatividad especial.
- `/tren-de-einstein/`: simultaneidad, señales de luz y mediciones de longitud desde el tren y el andén, con cuatro retos.
- `/nos-vemos-a-la-vuelta/`: gemelos, tiempo propio, giro y cuatro retos con viaje y espacio-tiempo.
- `/ascensor-de-einstein/`: caída libre, aceleración, balanza, luz y cuatro retos del principio de equivalencia.
- `/el-tiempo-tiene-altura/`: relojes a distintas alturas, tiempo propio, dilatación gravitatoria y balance del GPS con cuatro retos.
- `/orbita-que-no-se-cierra/`: Mercurio, precesión relativista, comparación de Newton y Einstein y cuatro retos.
- `/einstein/`: especial Einstein con tres laboratorios de relatividad especial y tres de relatividad general; el efecto fotoeléctrico se distingue como experiencia cuántica propuesta.

El repositorio se publica mediante Vercel en [spumexp.lat](https://www.spumexp.lat/). Las dieciséis páginas (trece laboratorios, portada y dos especiales) se compilan juntas y se sirven desde el mismo dominio; cada laboratorio tiene su entrada y estilos independientes. La portada, los especiales, entropía, horizonte y los seis laboratorios de Einstein no cargan Three.js.

## Ejecutar localmente

Requiere Node.js **22.18 o posterior** (recomendado Node 24 LTS) y npm.

```bash
npm ci
npm run dev
```

Abrir `http://127.0.0.1:1020/`. El puerto es estricto. Para revisar producción:

```bash
npm run build
npm run preview
```

## Verificar cambios

La [revisión conjunta de los cinco laboratorios](docs/REVISION_CINCO_LABS.md) documenta las comprobaciones móviles, ayudas contenidas en pantalla, navegación, preguntas junto al visor y acceso deliberado a las cámaras táctiles.

```bash
npm test
npm run lint
npm run build
npm audit
```

Las pruebas cubren las fórmulas con referencias analíticas y numéricas independientes, muestreo estadístico determinista, estado y límites de memoria, pausa, cámaras y recorridos educativos de los laboratorios. La inspección visual en navegador sigue siendo necesaria para comprobar WebGL, interacción y responsive.

## Cómo explorar la doble rendija

1. Emitir una partícula: cada detección es un punto localizado.
2. Activar emisión continua y observar cómo se acumulan máximos y mínimos. Las barras son frecuencias registradas; la curva teórica es opcional y está identificada por separado.
3. Guardar una corrida y activar el registro de camino, conservando los demás parámetros. Comparar frecuencias relativas, no cantidades absolutas de puntos.
4. Cambiar el ancho, la separación, λ o la distancia. Una rendija también difracta; conocer el camino elimina interferencia entre aberturas, no la difracción de cada una.

Cambiar una condición física limpia la corrida actual. La comparación guardada conserva sus parámetros y resultados. Pausar detiene el registro; la cámara y la interfaz siguen disponibles. La pantalla 3D conserva los últimos 2000 puntos, mientras el histograma y el contador incluyen todos los impactos de la corrida.

Los cuatro retos preparan una referencia y proponen cambiar una sola variable: acumular impactos, separar las rendijas, registrar el camino y modificar el ancho de una abertura. Los atajos generan detecciones nuevas con el muestreador físico; el feedback distingue predicciones del modelo y frecuencias registradas, sin declarar una validación estadística por alcanzar un número de puntos. La historia conecta la interferencia clásica con los experimentos cuánticos y explica por qué mirar la pantalla no equivale a registrar el camino. Ver [recorrido educativo](docs/DOBLE_RENDIJA_EDUCACION.md).

El modelo de doble rendija usa amplitudes de Fraunhofer en unidades normalizadas, con impactos muestreados según su probabilidad. No simula trayectorias ocultas ni resuelve una ecuación de Schrödinger temporal. El campo ilustrativo es cualitativo y se puede ocultar. Ver [modelo físico](docs/MODELO_DOBLE_RENDIJA.md).

## Organización y nuevos experimentos

El decimotercer laboratorio, [La órbita que no se cierra](https://www.spumexp.lat/orbita-que-no-se-cierra/), integra órbitas de Schwarzschild con anomalía de Darwin y las compara con una elipse newtoniana. La ampliación del giro está separada de los valores físicos. Cuatro retos conectan perihelio, excentricidad, tamaño y el aporte relativista de unos 43″ por siglo en Mercurio. Ver [modelo, fuentes y validación](docs/ORBITA_MERCURIO.md).

El duodécimo laboratorio, [El tiempo tiene altura](https://www.spumexp.lat/el-tiempo-tiene-altura/), compara relojes estáticos y orbitales con cálculos de Schwarzschild. Sus cuatro retos separan altura, acumulación, movimiento y ajuste de la señal GPS. Las diferencias pequeñas se preservan numéricamente y se distinguen de los tiempos totales. Ver [modelo, fuentes y validación](docs/ALTURA_LABORATORIO.md).

El undécimo laboratorio, [El ascensor de Einstein](https://www.spumexp.lat/ascensor-de-einstein/), abre la parte de relatividad general. Compara cabinas sostenidas y libres, naves aceleradas y a la deriva, fuerza de apoyo, masas y un rayo en coordenadas de Rindler con escala vertical explícita. Ver [ecuaciones, fuentes, límites y validación](docs/ASCENSOR_LABORATORIO.md).

El décimo laboratorio, [Nos vemos a la vuelta](https://www.spumexp.lat/nos-vemos-a-la-vuelta/), compara tiempo propio en los recorridos de dos gemelos. Permite cambiar rapideces, duración y espera; conecta viaje y espacio-tiempo, distingue señales recibidas de simultaneidad comóvil y propone cuatro retos. Ver [modelo, fuentes y validación](docs/GEMELOS_LABORATORIO.md).

El noveno laboratorio, [El tren de Einstein](https://www.spumexp.lat/tren-de-einstein/), continúa el especial con dos sistemas de coordenadas. Separa fechas de emisión de llegadas al receptor y permite registrar extremos con dos protocolos de simultaneidad. Los cuatro retos comparan fechas, retrasos de viaje, inversión del movimiento y contracción de longitudes. El índice conecta los seis capítulos disponibles; ver [modelo, fuentes, controles y pruebas](docs/TREN_DE_EINSTEIN.md).

El octavo laboratorio, [El reloj de luz](https://www.spumexp.lat/reloj-de-luz/), inaugura el [especial Einstein](https://www.spumexp.lat/einstein/). Relaciona el mismo evento de un pulso entre dos espejos mediante transformaciones de Lorentz. Sus cuatro retos comparan reposo, aumento del recorrido, reciprocidad y ritmo a la mitad; las vistas de nave y estación comparten los cálculos y se alternan en celular conservando el instante. Ver [ecuaciones, fuentes, controles y validación](docs/RELOJ_DE_LUZ.md).

El séptimo laboratorio, [Al borde del horizonte](https://www.spumexp.lat/horizonte/), calcula caída radial y rayos de luz en coordenadas regulares de Painlevé–Gullstrand. Distingue reloj propio, tiempo de coordenadas, predicción de llegada y mensajes efectivamente recibidos. Sus cuatro retos comparan relojes sostenidos, cruzan el horizonte, exploran retraso/corrimiento al rojo y diferencian señales exteriores e interiores. El [especial](https://www.spumexp.lat/agujeros-negros/) conecta ahora cinco laboratorios: lente, acreción, horizonte, Hawking y entropía. Ver [ecuaciones, fuentes, diseño y validación](docs/HORIZONTE_LABORATORIO.md).

El sexto laboratorio, [Cómo vemos lo invisible](https://www.spumexp.lat/acrecion/), reutiliza el integrador de Schwarzschild para calcular la imagen de un disco de acreción. Combina emisividad de disco delgado aproximada, transferencia relativista de intensidad y una órbita de referencia para inferir masa. Sus cuatro retos exigen comparar estados y explicar las pistas. El [especial de agujeros negros](https://www.spumexp.lat/agujeros-negros/) organiza los laboratorios relacionados, con índice y anterior/siguiente en cada uno. Ver [ecuaciones, supuestos, fuentes y pruebas](docs/ACRECION_LABORATORIO.md).

El quinto laboratorio, [entropía de Bekenstein–Hawking](https://www.spumexp.lat/entropia/), conecta un mapa geométrico del horizonte a escala fija con área, entropía, temperatura y un balance térmico de radiación ideal. La fórmula tiene símbolos explicados y una lupa algebraica separada. Sus cuatro retos comparan masa/área, el factor ¼, pérdida de masa y segunda ley generalizada. El SVG se calcula al interactuar, sin bucles de animación ni dependencias nuevas. Ver [modelo, alcance científico y pruebas](docs/ENTROPIA_LABORATORIO.md).

El cuarto laboratorio, [lente gravitacional](https://www.spumexp.lat/lente-gravitacional/), integra geodésicas nulas mediante RK4. La imagen WebGL reutiliza una tabla radial calculada en un worker; el diagrama integra la dirección seleccionada con la misma ecuación. Sus cuatro retos comparan con/sin lente, alinean una fuente, distinguen captura y escape y cambian masa manteniendo distancias físicas fijas. No agrega dependencias. Ver [derivación, arquitectura, límites y pruebas](docs/LENTE_GRAVITACIONAL.md).

El tercer laboratorio, [radiación de Hawking](https://www.spumexp.lat/hawking/), tiene cuatro retos: duplicar masa y comparar temperatura; activar el fondo cósmico y distinguir emisión de pérdida neta; adelantar la evaporación en vacío; relacionar área y entropía. La [base científica](docs/HAWKING_INVESTIGACION.md) distingue predicción semiclásica y evidencia de sistemas análogos. La potencia, el espectro y la vida usan un cuerpo negro ideal de fotones, con límites visibles. La trama y los puntos del visor WebGL son esquemáticos; los valores y gráficos se recalculan desde las ecuaciones. El brillo y movimiento responden a la potencia relativa amplificada, con comparaciones junto al visor, controles de masa ÷2/×2 y un explorador de la fórmula de Bekenstein–Hawking. Ver [arquitectura, recorrido y validación](docs/HAWKING_LABORATORIO.md) y [propuesta de serie de agujeros negros](docs/SERIE_AGUJEROS_NEGROS.md). `npm run research:hawking` conserva diez comprobaciones científicas independientes en CI; las pruebas de producción contrastan esos resultados.

El prisma también tiene cuatro preguntas guiadas: hacer atravesar el haz, variar brillo, alejar la pantalla y comparar materiales. Cada reto guarda una referencia y muestra qué cambió con una escala común. Las pistas visibles relacionan cada control con la observación. Una sección histórica explica el aporte de Newton, su importancia y las pruebas adicionales que este banco no incluye. Ver [el recorrido educativo](docs/PRISMA_EDUCACION.md).

```text
index.html                    Entrada de la colección
doble-rendija/index.html       Entrada del laboratorio cuántico
prisma/index.html              Entrada del laboratorio óptico
hawking/index.html             Entrada del laboratorio de agujeros negros
lente-gravitacional/index.html Entrada del laboratorio de lente gravitacional
entropia/index.html            Entrada del laboratorio de entropía
reloj-de-luz/index.html        Entrada del reloj de luz
einstein/index.html            Entrada del especial Einstein
tren-de-einstein/index.html    Entrada del tren de Einstein
src/portal/                   Catálogo, portada y diagramas SVG
src/App.tsx                   Laboratorio de doble rendija y emisión automática
src/physics/interference.ts   Modelo físico puro y muestreo
src/store/store.ts            Corridas, detecciones y comparación
src/components/simulation/    Escena WebGL, cámaras y tooltips
src/components/ui/            Controles, recorrido y gráfico
src/prisma/                   Aplicación del prisma integrada
src/hawking/                  Modelo SI, retos, reloj, visor WebGL y espectro
src/lente/                    Geodésicas, worker, imagen WebGL y diagrama de rayos
src/entropia/                 Área, fórmula, SVG geométrico, balance y retos
src/reloj/                    Lorentz, reloj de luz, dos vistas SVG y retos
src/tren/                     Eventos, señales, longitudes, dos vistas SVG y retos
src/einstein/                 Portada y navegación del especial Einstein
src/gemelos/                  Itinerario, tiempo propio, simultaneidad, señales y retos
src/ascensor/                 Equivalencia local, apoyo, pelotas, luz de Rindler y retos
src/altura/                   Relojes de Schwarzschild, órbita, ajustes y retos
src/orbita/                   Geodésicas temporales, precesión de Mercurio y retos
tests/                        Pruebas de los trece laboratorios
vite.config.ts                Dieciséis entradas y separación de bundles
vercel.json                   Compilación y publicación estáticas
```

Para agregar un laboratorio: crear su entrada HTML y módulo principal, incluirlo en `build.rollupOptions.input` y agregarlo al catálogo de `src/portal/catalog.ts`. Usar navegación nativa entre documentos conserva aislados los estilos y los estados de cada experimento. Las rutas desconocidas deben responder 404; no hay una reescritura general a la portada.

## Publicación

Vercel debe seguir conectado a `nicospum/rendija2simspum`, rama `master`, directorio raíz del repositorio. `vercel.json` declara `npm ci`, `npm run build`, `dist` y las URL con barra final. No requiere funciones, variables de entorno ni credenciales en el cliente. Subir a GitHub no confirma por sí solo un despliegue: verificar las seis URL públicas después de cada publicación.

El prisma se integró desde `nicospum/newtonprisma`, commit `67ec9033ce3ab00a0611c28d72172c138695b760`, conservando su modelo y sus pruebas. Es una copia autónoma dentro de este repositorio; futuras mejoras deben sincronizarse conscientemente, no se descargan desde Netlify durante la ejecución.

## Referencias y revisión

- [Feynman, comportamiento cuántico](https://www.feynmanlectures.caltech.edu/III_01.html).
- [Feynman, amplitudes de probabilidad](https://www.feynmanlectures.caltech.edu/III_03.html).
- [Tonomura y colaboradores, acumulación de electrones individuales](https://doi.org/10.1119/1.16104).
- [Modelo físico del prisma](docs/MODELO_PRISMA.md).
- [Revisión técnica, cambios y límites](docs/REVISION.md).
- La documentación antigua se conserva identificada como histórica en `docs/documentacion_completa.txt`.

El repositorio original no incluía un archivo de licencia; este cambio no declara una licencia nueva.
