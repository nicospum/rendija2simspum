# SPUM · Experimentos para entender

Una colección de laboratorios interactivos para aprender ciencia haciendo preguntas, cambiando una variable y comparando resultados.

- `/`: portada y catálogo de experimentos.
- `/doble-rendija/`: detecciones individuales, interferencia, difracción e información del camino.
- `/prisma/`: refracción y dispersión de la luz blanca, con trazado óptico en tiempo real.

El repositorio se publica mediante Vercel en [spumexp.lat](https://www.spumexp.lat/). Las tres páginas se compilan juntas y se sirven desde el mismo dominio; cada laboratorio tiene su entrada y estilos independientes. La portada no carga Three.js.

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

```bash
npm test
npm run lint
npm run build
npm audit
```

Las pruebas cubren las fórmulas con referencias analíticas, muestreo estadístico determinista, estado y límites de memoria, pausa y cámaras de ambas simulaciones. La inspección visual en navegador sigue siendo necesaria para comprobar WebGL, interacción y responsive.

## Cómo explorar la doble rendija

1. Emitir una partícula: cada detección es un punto localizado.
2. Activar emisión continua y observar cómo se acumulan máximos y mínimos. Las barras son frecuencias registradas; la curva teórica es opcional y está identificada por separado.
3. Guardar una corrida y activar el registro de camino, conservando los demás parámetros. Comparar frecuencias relativas, no cantidades absolutas de puntos.
4. Cambiar el ancho, la separación, λ o la distancia. Una rendija también difracta; conocer el camino elimina interferencia entre aberturas, no la difracción de cada una.

Cambiar una condición física limpia la corrida actual. La comparación guardada conserva sus parámetros y resultados. Pausar detiene el registro; la cámara y la interfaz siguen disponibles. La pantalla 3D conserva los últimos 2000 puntos, mientras el histograma y el contador incluyen todos los impactos de la corrida.

El modelo de doble rendija usa amplitudes de Fraunhofer en unidades normalizadas, con impactos muestreados según su probabilidad. No simula trayectorias ocultas ni resuelve una ecuación de Schrödinger temporal. El campo ilustrativo es cualitativo y se puede ocultar. Ver [modelo físico](docs/MODELO_DOBLE_RENDIJA.md).

## Organización y nuevos experimentos

```text
index.html                    Entrada de la colección
doble-rendija/index.html       Entrada del laboratorio cuántico
prisma/index.html              Entrada del laboratorio óptico
src/portal/                   Catálogo, portada y diagramas SVG
src/App.tsx                   Laboratorio de doble rendija y emisión automática
src/physics/interference.ts   Modelo físico puro y muestreo
src/store/store.ts            Corridas, detecciones y comparación
src/components/simulation/    Escena WebGL, cámaras y tooltips
src/components/ui/            Controles, recorrido y gráfico
src/prisma/                   Aplicación del prisma integrada
tests/                        Pruebas de ambos experimentos
vite.config.ts                Tres entradas y separación de bundles
vercel.json                   Compilación y publicación estáticas
```

Para agregar un laboratorio: crear su entrada HTML y módulo principal, incluirlo en `build.rollupOptions.input` y agregarlo al catálogo de `src/portal/catalog.ts`. Usar navegación nativa entre documentos conserva aislados los estilos y los estados de cada experimento. Las rutas desconocidas deben responder 404; no hay una reescritura general a la portada.

## Publicación

Vercel debe seguir conectado a `nicospum/rendija2simspum`, rama `master`, directorio raíz del repositorio. `vercel.json` declara `npm ci`, `npm run build`, `dist` y las URL con barra final. No requiere funciones, variables de entorno ni credenciales en el cliente. Subir a GitHub no confirma por sí solo un despliegue: verificar las tres URL públicas después de cada publicación.

El prisma se integró desde `nicospum/newtonprisma`, commit `67ec9033ce3ab00a0611c28d72172c138695b760`, conservando su modelo y sus pruebas. Es una copia autónoma dentro de este repositorio; futuras mejoras deben sincronizarse conscientemente, no se descargan desde Netlify durante la ejecución.

## Referencias y revisión

- [Feynman, comportamiento cuántico](https://www.feynmanlectures.caltech.edu/III_01.html).
- [Feynman, amplitudes de probabilidad](https://www.feynmanlectures.caltech.edu/III_03.html).
- [Tonomura y colaboradores, acumulación de electrones individuales](https://doi.org/10.1119/1.16104).
- [Modelo físico del prisma](docs/MODELO_PRISMA.md).
- [Revisión técnica, cambios y límites](docs/REVISION.md).
- La documentación antigua se conserva identificada como histórica en `docs/documentacion_completa.txt`.

El repositorio original no incluía un archivo de licencia; este cambio no declara una licencia nueva.
