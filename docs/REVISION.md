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

1. Validar con docentes si las preguntas ayudan a distinguir datos, teoría e información del camino.
2. Si se desea comparabilidad experimental, introducir una escala SI y un modelo de fuente/detector antes de presentar valores calibrados.
3. Mantener sincronizado el prisma integrado y su repositorio de origen. Un workspace compartido sería útil si aumenta la frecuencia de cambios, pero no es necesario para estos dos laboratorios.
4. Añadir un solver de campo cercano solo si existe un objetivo didáctico y pruebas de convergencia que justifiquen su coste.
