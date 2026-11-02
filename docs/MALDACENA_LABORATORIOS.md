# El diccionario del universo · especial Maldacena

## Recorrido disponible

La portada `/maldacena/` conecta cinco laboratorios y su pasaporte local de 20 descubrimientos. Cada capítulo tiene cuatro predicciones y una lista explícita de observaciones requeridas. La actividad previa de conteo está integrada en `/entropia/#information-bridge`: cuatro preguntas sobre variables clásicas, probabilidades y unidades. No añade una tarjeta vacía ni modifica el estado físico del horizonte.

1. `/entrelazados/`: estado puro `cosθ|00⟩+sinθ|11⟩`, mezcla clásica comparable, analizadores Z/X y muestras de Born de pares preparados de nuevo. Entropías de von Neumann del estado conjunto y de sus partes, separadas de la incertidumbre de los resultados de medición.
2. `/espacio-con-frontera/`: corte espacial de AdS₃ en coordenadas de Poincaré. Asas de extremos, centro y corte; comparación entre recta de coordenadas y geodésica espacial según la métrica.
3. `/dos-lenguajes/`: intervalo único del vacío de una CFT₂ en una línea infinita. Fórmula logarítmica de entropía frente a longitud regulada en AdS₃ dividida por `4G₃`; comparación del residuo y de diferencias de entropía al reducir el corte.
4. `/frontera-caliente/`: estados estacionarios térmicos y exterior de BTZ no giratorio con frontera no compacta. Termómetro e intervalo manipulables, límite frío, crecimiento extensivo y relación entre temperatura, radio areal y parámetro de masa.

5. `/curva-de-page/`: reparto de un estado puro aleatorio complejo de 4 a 8 qubits. Calcula matrices reducidas, entropía de von Neumann y media de Page. Cuatro retos comparan partes/conjunto, vuelta de la curva, emisión independiente ideal y correlaciones; el estado fijo no implementa evaporación física. Ver [modelo, fuentes y límites](PAGE_MODELO.md) y [QA independiente](QA_PAGE_2026-11-02.md).

Documentación de modelos y pruebas: [información y qubits](MALDACENA_INFORMACION.md), [geometría y correspondencia](MALDACENA_GEOMETRIA.md), [revisión independiente](QA_MALDACENA_2026-11-02.md) y [pruebas de conteo/cuántica](QA_MALDACENA_QUANTUM_2026-11-02.md).

## Física y alcance

La correspondencia original de Maldacena relaciona determinadas teorías cuánticas conformes con teorías de cuerdas/gravedad en espacios anti-de Sitter. No afirma que cualquier objeto de menor dimensión sea una descripción dual. Este especial ofrece modelos concretos y cálculos acotados; no reproduce toda una CFT o una teoría de cuerdas ni demuestra la conjetura completa.

La relación de Ryu–Takayanagi conecta una entropía con una superficie mínima en el régimen gravitatorio estático apropiado. En AdS₃ esa superficie es una curva. Los capítulos geométricos usan `L=1`, `cCFT=60` y `G₃=0,025`, vinculados por `cCFT=3L/(2G₃)`. El vacío y la comparación térmica mantienen el mismo diccionario. `cCFT` es una carga central; no es la velocidad de la luz.

En vacío, los extremos están físicamente regulados en `(xA,ε)` y `(xB,ε)`. La longitud exacta es `2L asinh(ℓ/(2ε))`. Se comprueba mediante una integral independiente. La fórmula CFT mostrada `(cCFT/3) ln(ℓ/ε)` es asintótica, con una constante aditiva fijada en la convención de comparación. El residuo a corte finito permanece visible; no se oculta ni se presenta como un fallo de AdS/CFT.

En BTZ, `zₕ=1/(2πT)`, en unidades naturales. Con extremos regulados, `z*²=zₕ²−(zₕ²−ε²)/cosh²(ℓ/(2zₕ))` y la longitud es `2L asinh[(zₕ/ε)sinh(ℓ/(2zₕ))]`. El código usa una identidad estable con `sinhc` para conservar el límite frío incluso a temperaturas extremadamente pequeñas. Integra por cuadratura adaptativa `ds/dx=L z*/z(x)²`. El resultado CFT térmico es `(cCFT/3)ln[(β/(πε))sinh(πℓ/β)]`; no se finge igualdad exacta con la longitud regulada a ε finito. El horizonte permanece fuera de la geodésica; variar T selecciona estados, no anima un colapso ni una evaporación.

La entropía térmica de la radiación de Hawking del capítulo anterior no es la entropía fina de entrelazamiento de la radiación. No se reutiliza como curva de Page. Estos modelos no prueban que nuestro universo tenga una frontera AdS, una pared de bits o un holograma óptico.

## Implementación y uso

Se conserva Vite/React y no se añaden dependencias. `src/maldacena/main.tsx` carga cada capítulo por separado. `LabFrame` reutiliza `SceneConsole`, con escena y controles contiguos en escritorio, escena fija durante el reto en móvil y visor amplio recuperable. Las gráficas SVG se calculan a partir del modelo; asas con captura de puntero y controles de teclado, botones nativos y barras equivalentes permiten explorar sin depender del ratón.

La información extensa queda fuera de la escena o en desplegables. Se distinguen resultados exactos, muestras aleatorias y ayudas gráficas. Cada cambio tiene una lectura HTML; la validación requiere observaciones y predicción adecuada, no solo abrir un capítulo. El progreso usa el esquema defensivo existente con la clave nueva `spum.maldacena.passport.v1`; almacenamiento bloqueado o corrupto no impide jugar ni borra los otros especiales.

Ejecutar con Node ≥22.18: `npm ci`, `npm run dev`; comprobar `npm test`, `npm run lint` y `npm run build`. Se compilan 23 entradas HTML: 19 laboratorios, portada y tres especiales. Para revisión local aislada: `npm run dev -- --port 1027 --strictPort`.

## Fuentes primarias

- [Maldacena · propuesta original](https://arxiv.org/abs/hep-th/9711200).
- [Ryu–Takayanagi · entropía holográfica](https://arxiv.org/abs/hep-th/0603001).
- [Calabrese–Cardy · intervalo único y temperatura](https://arxiv.org/abs/hep-th/0405152).
- [Preskill/Caltech · estados, mezclas y subsistemas](https://www.preskill.caltech.edu/ph229/notes/chap2.pdf).
- [Bañados–Teitelboim–Zanelli · agujero negro en 2+1](https://arxiv.org/abs/hep-th/9204099).

Safari y teléfonos físicos permanecen pendientes por la decisión previa del usuario; una ventana pequeña de Chromium no equivale a un teléfono real. Tampoco se midió aprendizaje con participantes nuevos. Las pruebas automáticas verifican modelos y estados; la revisión en navegador comprueba escenas, controles, retos y disposición.

## Verificación de la entrega

La ampliación con Page conserva la clave del pasaporte y los sellos de los cuatro capítulos anteriores. El informe [QA de Page](QA_PAGE_2026-11-02.md) registra las pruebas de esta ampliación; los resultados siguientes corresponden a entregas anteriores.

Una [segunda revisión de claridad y uso](QA_MALDACENA_SEGUIMIENTO_2026-11-02.md), realizada después de la primera publicación, añadió contexto para principiantes, lecturas locales correctas, comparación visible antes de responder y mejoras de gestos y precisión. Su cierre aprueba 355 pruebas y repite 96 estados móviles más 12 casos de ayudas abiertas. El bloque siguiente conserva la verificación de la construcción inicial.

Se aprobaron las **352 pruebas** del repositorio, ESLint, TypeScript y la compilación de producción. Los agentes completaron los 16 retos nuevos y las cuatro preguntas de conteo, probaron respuestas incorrectas, teclado, arrastres reales de ratón y persistencia 16/16 después de recargar. La revisión de disposición cubrió 160 estados en 390×844, 320×740, 667×375, 568×320 y 1280×900. Se repitieron 16 comprobaciones adicionales sobre el build de producción en 320×740 y 1280×900: escena y control/predicción accesibles, sin desbordamiento. El resumen está en [qa/maldacena-2026-11-02.json](qa/maldacena-2026-11-02.json).

Los hallazgos de tamaño, desplazamiento y límite frío se introdujeron durante esta construcción y se corrigieron antes de publicar. La cobertura no implica que se hayan vuelto a recorrer todos los retos de los catorce laboratorios previos en navegador; sí se ejecutó su suite automática completa. La verificación posterior del sitio público contrasta HTML, JS y CSS con la compilación local y abre de nuevo las escenas publicadas.
