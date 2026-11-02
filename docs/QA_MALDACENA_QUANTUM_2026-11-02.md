# QA de información y entrelazamiento

2 de noviembre de 2026. Implementación y prueba de escritorio por el agente cuántico; revisión científica cruzada por los agentes de holografía y QA. La revisión móvil independiente corresponde al informe general.

## Comprobaciones realizadas

- Nueve pruebas numéricas dirigidas aprobadas: Born en bases Z/X, estados producto y Bell, mezcla clásica, normalización y no señalización a través de los marginales; entropía de estado separada de incertidumbre del resultado; muestreo RNG controlado; Shannon condicionado y criterios de observación.
- ESLint de `src/maldacena/quantum` sin errores ni advertencias.
- Navegador Chrome, escritorio natural de aproximadamente 1905×938 CSS px, servidor Vite 1027. Sin cambiar la configuración de viewport ni tocar pestañas del usuario.
- **Entrelazados: cuatro retos completados** usando acciones visibles. Predicción incorrecta rechazada antes de corregirla. En el tercer reto se guardaron los cuatro registros Bell/mezcla × Z/X, con coincidencias teóricas 100/100/100/50 % y frecuencias de 200 pares. Analizador A accionado con teclado sobre la escena; deslizador de preparación respondió a Home. Inspeccionar A mostró 1 bit y el conjunto puro AB mostró 0 bits.
- **Contar lo que no vemos: cuatro preguntas completadas**. Registro conocido: una configuración, 0 bits; dos variables ocultas equiprobables: cuatro configuraciones, 2 bits; probabilidad 90 %: las mismas cuatro configuraciones, aproximadamente 0,938 bits. Se comprobó la distinción con la ley de área.
- Se inspeccionaron capturas de la escena y de las posibilidades clásicas. Registros JSON en `.work/maldacena-playtest-2026-11-02/quantum-desktop.json` y `counting-desktop.json` del espacio exterior. La pestaña de prueba se cerró al terminar.

## Hallazgos corregidos

1. Las bases dibujadas en SVG tenían objetivos pequeños en celular. Se ampliaron los hitboxes transparentes de analizadores a 112×96 unidades y del deslizador a 96 de diámetro, sin agrandar artificialmente el fenómeno.
2. El tercer reto exigía comparar estados pero no retenía sus lecturas. Se añadió una tabla de las cuatro corridas con teoría y muestra claramente diferenciadas.
3. Una medición individual podía registrar una observación que el texto pedía comparar con 200 pares. Solo el lote de 200 acredita esos pasos.
4. La primera prueba móvil independiente detectó que el visor, las leyendas y la muestra eran demasiado altos y cortaban la predicción. Se compactaron las leyendas y el SVG en modo activo; el detalle de conteos deja de ocupar la escena móvil, mientras la lectura de coincidencias permanece. El informe general registra la repetición de esa comprobación.
5. Las preguntas del puente podían quedar lejos de las casillas en celular. Se incorporó un mini registro de interacción y lectura de posibilidades/entropía junto a las preguntas, con controles contextuales de la misma actividad. La versión de escritorio conserva el registro completo.

## Revisión cruzada BTZ

Se revisaron las expresiones y los límites de `thermal/physics.ts` y `ThermalLab.tsx`. El corte finito, el límite frío, las coordenadas del horizonte y la diferencia entre parámetro de masa y temperatura están explicados. Dos pruebas independientes adicionales aprobadas, en `maldacena-thermal-review.test.mjs`, comparan la derivada numérica de la entropía con la pendiente térmica analítica y verifican que la curva satisface la primera integral de la métrica espacial. Se informó al agente principal de los objetivos táctiles pequeños del extremo y el termómetro para ampliarlos.

No se afirma una prueba de comprensión con participantes, eventos táctiles físicos, Safari o toda la conjetura. El ensayo de dos bases no se llama prueba experimental de Bell. La entropía de Shannon del puente, la entropía de von Neumann del laboratorio cuántico y los balances térmicos previos se mantienen diferenciados.

6. En θ=0, la preparación diagonal llamada mezcla se reduce al mismo estado producto puro |00⟩. Se eliminó una condición de observación que rechazaba ese caso físicamente equivalente y se agregó una regresión.
