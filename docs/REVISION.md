# Revisión técnica — 19 de octubre de 2026

## Base comprobada

La carpeta local `experimento-doble-rendija` y la rama remota `master` coincidían en `4eda7929ae9a578faef2ce95f5ebd04ebd6f9dd8`. El sitio de Vercel mostraba la interfaz de esa generación; no exponía un SHA verificable de su compilación. Se trabajó desde la versión local, sin sobrescribir cambios ajenos. La carpeta original se actualiza solo después de verificar que conserva ese estado.

Antes de los cambios, TypeScript pasaba y ESLint informaba dos advertencias de dependencias de hooks. No había pruebas automatizadas. La página pública conservaba el título, idioma y favicon del template de Vite.

## Problemas previos, por importancia

1. La barrera separaba aperturas sobre Z, pero las colisiones usaban Y; geometría y cálculo no concordaban.
2. Las velocidades recibían desviaciones artificiales según la intensidad; los impactos no muestreaban la probabilidad calculada. Después se modulaba el brillo del punto con el patrón, alterando la evidencia mostrada.
3. La fórmula de múltiples rendijas elevaba un coseno a una potencia arbitraria, ignoraba el ancho real y usaba una distancia distinta de la geometría.
4. La explicación atribuía el efecto a “observación” e inventaba una inmunidad de neutrinos. El README afirmaba resolver Schrödinger sin hacerlo.
5. La pausa no detenía el movimiento; algunas detecciones podían procesarse repetidamente. Las partículas inactivas quedaban almacenadas sin límite.
6. Cada partícula generaba actualizaciones del store y recorridos completos de arrays por cuadro, con coste creciente. Existían controles, shader y componentes alternativos sin uso.
7. Se mezclaban impactos de configuraciones físicas distintas. El campo de onda ni recibía λ ni avanzaba mediante el mecanismo temporal previsto.
8. El bundle principal público anterior rondaba 1.2 MB sin comprimir, con dependencias de controles y estilos que ya no son necesarias.

## Cambios justificados

- Modelo físico puro de amplitudes y CDF, compartido por muestreo y predicción; eje Z unificado. Se conserva difracción con y sin detector de camino.
- Corridas separadas, comparación rotulada, detecciones únicas y muestreo según la probabilidad. Pantalla con puntos localizados también sin registro de camino.
- Historial de puntos acotado, histograma completo, actualizaciones automáticas por lotes cada 100 ms y sin emisiones atrasadas de pestañas ocultas. La escena renderiza bajo demanda.
- Interfaz nueva centrada en cuatro preguntas, predicciones, evidencia y explicación; controles descritos, teclado, tooltips y vistas adaptadas.
- Portada con catálogo ampliable y dos entradas independientes. Prisma integrado desde `newtonprisma@67ec903`, conservando sus 24 pruebas.
- Eliminados Leva, gl-matrix, Tailwind y alternativas sin uso. Lock reproducible, `npm ci`, Node mínimo declarado, favicon, idioma y títulos propios.
- Vite multipágina y configuración estática de Vercel. No hay nuevos servicios, router, backend ni variables secretas en cliente.

## Verificación y límites

Ejecutar `npm test`, `npm run lint`, `npm run build` y `npm audit`. Al integrar las dos aplicaciones, **48 pruebas** cubren física, store y cámaras. La auditoría de dependencias no informó vulnerabilidades. Las rutas locales `/`, `/doble-rendija/` y `/prisma/` respondieron 200; una ruta inexistente respondió 404.

La revisión visual comprende las tres páginas, emisión individual, automática, pausa, limpieza, comparación, detector, extremos de parámetros, ambas cámaras y anchos de celular. Los tamaños de celular se comprueban en navegador; no equivalen a una prueba sobre todos los dispositivos físicos.

El modelo de doble rendija continúa siendo una aproximación ideal de Fraunhofer/paraxial. Las escalas son normalizadas, el campo ilustrativo es cualitativo y las emisiones no representan tiempos de vuelo. El prisma conserva las aproximaciones documentadas en su modelo original. El dominio público debe verificarse después de la publicación; un push por sí solo no demuestra despliegue.

## Extensiones aconsejables

El cierre del 20 de octubre mantiene las 68 pruebas de los dos laboratorios, lint y compilación correctos. La investigación del tercero agrega documentación de Hawking, cálculos SI reproducibles y diez comprobaciones separadas integradas en CI. No modifica los modelos físicos ni las páginas de los experimentos existentes. Ver [HAWKING_INVESTIGACION.md](HAWKING_INVESTIGACION.md).

La actualización educativa del prisma agrega cuatro retos con referencia, comparaciones a escala común, pistas visibles en cada control e historia con fuentes. Incluye diez pruebas adicionales de las conclusiones y sus salvaguardas: **58 pruebas en total**. No cambia el trazado físico ni las cámaras. Ver [PRISMA_EDUCACION.md](PRISMA_EDUCACION.md).

La actualización educativa de doble rendija transforma el recorrido básico en cuatro retos con referencia inmutable, variable señalada y feedback calculado. Las barras de muestras y la curva teórica están diferenciadas; los ejes del gráfico mantienen legibilidad en celular. El contexto histórico y las preguntas frecuentes distinguen detector de camino, pantalla y lectura humana. Agrega diez pruebas de física y guardas educativas: **68 pruebas en total**, conservando modelo, store y cámaras. Ver [DOBLE_RENDIJA_EDUCACION.md](DOBLE_RENDIJA_EDUCACION.md).

La revisión móvil posterior detectó controles ya existentes con objetivos de toque de solo 16–26 px y textos de cámara de 7–9 px. Se amplían a 44 px los controles principales, deslizadores y acciones de los retos hasta 800 px de ancho; se mejoran etiquetas de mediciones y selectores. Son cambios de CSS: no modifican fórmulas ni estados. La comprobación comprende los ocho retos, ajustes manuales, pausa, apagado y vistas, con anchos de 320 y 390 px en navegador, sin sustituir una prueba en teléfonos físicos.

1. Validar con docentes si las preguntas ayudan a distinguir datos, teoría e información del camino.
2. Si se desea comparabilidad experimental, introducir una escala SI y un modelo de fuente/detector antes de presentar valores calibrados.
3. Mantener sincronizado el prisma integrado y su repositorio de origen. Un workspace compartido sería útil si aumenta la frecuencia de cambios, pero no es necesario para estos dos laboratorios.
4. Añadir un solver de campo cercano solo si existe un objetivo didáctico y pruebas de convergencia que justifiquen su coste.

## Tercer laboratorio: primera versión de Hawking, 20/10/2026

Se implementa `/hawking/` y se incorpora al catálogo junto a prisma y doble rendija. Modelo SI puro, cuatro retos con predicción y referencias, espectro calculado, reloj acelerado y visor WebGL procedural. La temperatura semiclásica se distingue de la aproximación de potencia/vida de fotones ideales; el dibujo identifica explícitamente sus elementos cualitativos. El baño térmico bloquea la solución de evolución aislada y el recorrido termina antes de la evaporación final desconocida.

Se agregan 13 pruebas: **81 en total**, más las diez comprobaciones científicas independientes. Pruebas, lint y compilación pasan. Se revisaron escritorio, 390 y 320 px, los cuatro retos, extremos de masa, pausa, límite temporal y tooltips; no se probaron teléfonos físicos. No cambian los modelos ni las páginas de los dos laboratorios existentes y no se agregan dependencias. La portada pasa a tres tarjetas y cuatro entradas estáticas. Ver [arquitectura y límites](HAWKING_LABORATORIO.md).
