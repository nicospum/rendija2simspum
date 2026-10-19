# Aprender con la doble rendija

El recorrido invita a **predecir, cambiar una variable y comparar**. Distingue las frecuencias de impactos simulados de la distribución teórica que los genera. El propósito es comprender el modelo y la evidencia que lo motivó; una simulación que incorpora sus reglas no constituye una comprobación independiente de la mecánica cuántica.

## Cuatro retos

| Reto | Comparación | Idea que permite explorar |
| --- | --- | --- |
| De un punto a un patrón | Un impacto y muchas detecciones, sin cambiar el montaje | Cada evento es localizado y aleatorio; las frecuencias de muchos eventos permiten contrastar una distribución. Un punto no identifica un camino. |
| Separar las rendijas | Solo d: 0,30 → 0,45 u | La separación predicha de franjas pasa de 0,583 a 0,389 u por Δz = λL/d. La envolvente conserva su ancho. |
| Registrar el camino | Solo detector: 0 → 100 % | Se pasa de sumar amplitudes indistinguibles a sumar probabilidades de caminos registrados. Desaparecen los términos de interferencia entre aberturas; la difracción permanece. |
| Una rendija también difracta | Una abertura; solo a: 0,065 → 0,100 u | El ancho central predicho entre los primeros mínimos pasa de 5,385 a 3,500 u por 2λL/a. Una abertura más ancha produce una distribución más estrecha. |

Los valores son predicciones de la aproximación paraxial del modelo, en unidades normalizadas. No son estimaciones extraídas del histograma ni medidas de un aparato real.

## Referencias, muestreo y guardas

- Al iniciar los retos de comparación se generan **1600 detecciones nuevas al azar** como referencia. El primer reto comienza con una sola. Los botones de acumulación usan el mismo muestreador que la emisión manual, sin cargar datos grabados ni imágenes de franjas.
- Cambiar un parámetro físico abre otra corrida; la referencia conserva copia de su configuración y conteos. El gráfico usa frecuencias relativas y la misma coordenada transversal para ambas corridas.
- **800 detecciones** solo es un umbral didáctico para invitar a comparar. No es una prueba de convergencia, significación ni coincidencia con la teoría. El feedback nunca deduce acuerdo estadístico a partir del conteo.
- Se comprueban configuración válida, conteos enteros no negativos y suma del histograma. Una referencia incompatible, un cambio en otra variable o una emisión pausada producen instrucciones específicas, sin presentar un resultado como logrado.
- Una curva teórica puede cambiar antes de obtener nuevas detecciones. La interfaz identifica sus métricas como predicciones y pide contrastarlas con las frecuencias acumuladas.

La lógica pura está en `src/education/doubleSlitLearning.ts`; la interacción se integra en `src/App.tsx`. Las ayudas de los controles relacionan λ, a, d y L con el patrón, y distinguen esos cambios de la tasa de adquisición y la cámara. El [modelo físico](MODELO_DOBLE_RENDIJA.md) documenta fórmulas, normalización y límites.

## Historia e interpretación

La sección visible distingue dos pasos: Young y la interferencia clásica de la luz; luego las detecciones individuales y las amplitudes cuánticas. Tonomura y colaboradores registraron en 1989 la acumulación con electrones y un **biprisma electrónico**, no con la placa literal de dos aberturas dibujada aquí. Los cuatro retos combinan ideas de distintos experimentos; no son una reconstrucción de un único montaje histórico.

El detector representa una fracción ideal del conjunto con un registro distinguible del camino. No es una medida universal de distinguibilidad ni un modelo microscópico del instrumento. Su efecto proviene de una interacción física que deja información disponible, aunque nadie lea el registro. Mirar los impactos en la pantalla no activa una medición de camino. Cambiar la configuración o limpiar datos en la aplicación tampoco modifica retroactivamente impactos ya registrados. El modelo no atribuye una trayectoria oculta ni decide entre interpretaciones de la teoría.

Fuentes primarias consultadas:

- [Young, *On the theory of light and colours* (publicado en 1802)](https://doi.org/10.1098/rstl.1802.0004). El [archivo de la Royal Society](https://makingscience.royalsociety.org/items/l-and-p_11_172/paper-on-the-theory-of-light-and-colours-bakerian-lecture-by-thomas-young) registra su lectura el 12 de noviembre de 1801. Estas fechas se refieren al trabajo, sin adjudicarle el montaje exacto de la simulación.
- [Tonomura et al., *Demonstration of single-electron buildup of an interference pattern* (1989)](https://doi.org/10.1119/1.16104) y [explicación y registro del equipo de Hitachi](https://www.hitachi.com/rd/research/materials/quantum/doubleslit/index.html).
- [Feynman, volumen III, capítulo 1](https://www.feynmanlectures.caltech.edu/III_01.html): detecciones individuales e interferencia; [capítulo 3, sección 2](https://www.feynmanlectures.caltech.edu/III_03.html#Ch3-S2): amplitudes y registros de camino, independientes de que una persona lea los datos.

Las pruebas automatizadas comprueban estados y mensajes del recorrido, métricas calculadas, referencias y guardas. No se ha evaluado todavía el aprendizaje con estudiantes ni la respuesta de un detector físico real.
