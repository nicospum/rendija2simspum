# Información y entrelazamiento · implementación

2 de noviembre de 2026.

## Actividad dentro de entropía

`CountingBridge.tsx` no crea un laboratorio adicional ni cambia el modelo del horizonte. Enseña información parcial con dos o cuatro variables binarias clásicas independientes. Revelar una variable condiciona la distribución a su valor conocido; las ocultas conservan la probabilidad de uno elegida entre 0,1 y 0,9. Las configuraciones compatibles se enumeran y ponderan, no se dibujan todas con igual peso al cambiar la probabilidad.

Para `h` variables ocultas: `H = h × h₂(p)` bits, con `h₂(p) = −p log₂p − (1−p)log₂(1−p)`. La entropía en nats es `H ln 2`. Solo con probabilidades iguales vale `H = log₂Ω`. La función numérica admite también probabilidades 0 y 1 y devuelve soporte de una configuración e incertidumbre cero.

Las cuatro preguntas exigen una predicción y una interacción del montaje; la comparación desigual exige haber visto el caso equiprobable. Los registros son un recurso de información, no microestados identificados del agujero negro ni celdas físicas de Planck. No se modifica el progreso histórico de los cuatro retos de entropía.

## Entrelazados

`physics.ts` evalúa exactamente un sistema de dos qubits con amplitudes reales. Estado puro: `cos θ |00⟩ + sin θ |11⟩`, con `0 ≤ θ ≤ π/4`. La alternativa clásica es la mezcla diagonal `cos²θ |00⟩⟨00| + sin²θ |11⟩⟨11|`. Los analizadores Z y X usan sus proyectores explícitos; cada probabilidad conjunta se obtiene con Born. Las muestras aleatorias preparan un par nuevo por ensayo y no son secuencias prefabricadas.

En ambas preparaciones, los estados reducidos tienen autovalores `p = cos²θ`, `1−p`. La entropía local de von Neumann es `h₂(p)` bits; la total es cero para la familia pura y `h₂(p)` para la mezcla. **Entropía del estado no equivale a entropía de resultados de una base**: a θ = 0 en X, un producto puro tiene S = 0 aunque las medidas sean inciertas.

El reto 3 guarda cuatro referencias de coincidencia: Bell y mezcla en Z/Z y X/X, con predicción exacta y frecuencia de una muestra de 200 pares. En Z ambas coinciden; en X/X Bell coincide siempre y la mezcla solo con probabilidad ½. Las muestras finitas pueden fluctuar. No se describe esto como un ensayo de Bell.

La escena permite inspeccionar A/B, alternar cada analizador y arrastrar θ; todos tienen alternativas de teclado y barras DOM. Los objetivos de arrastre/analizadores se ampliaron sin cambiar sus dibujos. Las observaciones de los retos de medición solo se registran al pedir 200 pares, no al pulsar una vez. Presets y predicciones por sí solos no completan observaciones.

La función verifica que cambiar la base remota no altere el marginal local. No anima una señal instantánea entre sistemas. Para comparar las correlaciones hacen falta registros de ambas partes y comunicación ordinaria.

## Fuentes y límites

[Preskill, Caltech, capítulo 2: estados, conjuntos y sistemas compuestos](https://www.preskill.caltech.edu/ph229/notes/chap2.pdf). El laboratorio calcula un modelo exacto de dos qubits, no gravedad ni toda la correspondencia AdS/CFT. La conexión didáctica es distinguir la información de una parte de la del conjunto.

Nueve pruebas dirigidas verifican extremos de entropía, Born, normalización, invariancia del marginal al cambiar la base remota, diferencia puro/mezcla, muestreo con RNG controlado, conteo condicionado y observaciones inválidas. La revisión visual/uso del recorrido completo se registra en el informe de QA de Maldacena.
