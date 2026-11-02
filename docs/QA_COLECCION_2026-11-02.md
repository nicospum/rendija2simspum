# Revisión coordinada de SPUM · 2 de noviembre de 2026

## Problema prioritario y corrección

Se reprodujo en la página pública el visor demasiado pequeño de entropía de Bekenstein–Hawking. El SVG medía aproximadamente 712 × 250 px en escritorio, pero su proporción interna reducía aún más el dibujo útil. La causa eran límites de altura añadidos al modo compacto y otros límites del modo amplio: una regresión de presentación anterior a esta revisión, no un cambio de las fórmulas ni un repositorio corrupto.

Se retiraron esos límites para entropía. En escritorio, escena y controles quedan en columnas; en pantallas estrechas se elige entre **Horizonte** y **Área y entropía**, conservando masa, emisión y referencia física. Los rótulos importantes tienen una lectura HTML junto al dibujo. El ejemplo algebraico usa cuatro columnas en móvil y sigue siendo una actividad separada de la masa física. A masa doble, el radio dibujado sigue siendo doble y el área cuádruple: no se reencuadra automáticamente al cambiar la masa.

Los doce laboratorios modernos tienen ahora **Ampliar visor** visible junto al selector del reto, sin reiniciar la comparación. Al verificar esta solución apareció un defecto nuevo en escritorio: el desplazamiento hacia los controles podía sacar unos píxeles de la escena alta. Se corrigió antes de publicar y se repitió la matriz de escritorio completa.

## Otras correcciones aplicadas

- **Ascensor:** los pasos explican masa, intensidad e instante final requeridos. «Usar condiciones del reto» recupera el montaje sin borrar predicción, observaciones ni logros; la lectura incluye la masa.
- **Acreción:** los retos de luz curvada y movimiento relativista requieren gas visible. Antes podían registrar comparaciones con el disco vacío.
- **Hawking:** el reto de evaporación exige al menos el 25 % de la vida ideal para acreditar un cambio perceptible. Antes un avance arbitrariamente pequeño contaba como observado aunque los cocientes redondeados parecieran iguales.
- Documentación de entropía y reloj de luz actualizada al catálogo y al almacenamiento de progreso actuales.

No se añadieron dependencias ni se cambiaron ecuaciones, constantes o claves de progreso.

## Cobertura real

Tres revisores auxiliares se repartieron Einstein, agujeros negros/clásicos y el recorrido científico hacia Maldacena. Sus informes detallan hallazgos, pruebas e inferencias:

- [Einstein](QA_EINSTEIN_2026-11-02.md).
- [Agujeros negros y clásicos](QA_AGUJEROS_Y_CLASICOS_2026-11-02.md).
- [Lote público de escritorio](QA_VISUAL_COLECCION_2026-11-02.md).
- [Propuesta Maldacena y fuentes primarias](RUTA_MALDACENA_2026-11-02.md).

En navegador se completó el **primer reto de los doce laboratorios modernos** en la versión pública de partida, incluyendo barra, predicción, acciones y respuesta de éxito. La corrección local se comprobó en esos doce a **390×844, 320×740, 768×1024, 1280×900, 667×375 y 568×320**: dos estados por laboratorio («Probar en la escena» y «↑ Pregunta»), **144 comprobaciones de disposición**. El control o la predicción correspondiente quedan libres y no hay desbordamiento horizontal. En 390×844 también se verificó que la barra principal de cada laboratorio cambia su valor. Esto verifica geometría y acceso; no demuestra que cada rótulo de cada gráfico sea cómodo de leer.

En entropía se completaron **los cuatro retos** en 390×844; se rechazó una predicción incorrecta, se alternaron ambas vistas, se usaron los controles de la escena con teclado, se arrastró el horizonte con ratón y se recuperó el visor amplio conservando el ensayo. Los controles de la vista oculta dejan de ser interactivos. Se comprobó visualmente el horizonte ampliado y las relaciones radio/área. También se completó en móvil el primer reto del ascensor tras alterar la masa y usar el nuevo atajo de recuperación.

En prisma y doble rendija se probaron el primer reto y sus resultados en 390×844 y 1280×900: dispersión numérica y acumulación real de 1600 detecciones, respectivamente. Sin desbordamiento horizontal. Durante la carga local se observó el fallback WebGL; por eso esa prueba local certifica controles, gráficas y resultados numéricos. Ambos laboratorios públicos sí cargaron su canvas y se inspeccionaron visualmente en tamaño móvil: prisma, lámpara y pantalla; emisor, aberturas y detecciones. No se midió su rendimiento de GPU.

**Validación automática:** 325 pruebas aprobadas; ESLint sin errores; TypeScript y compilación de producción correctos; comprobaciones independientes de Hawking aprobadas por el revisor. La matriz y registros de navegador se conservan en `.work/qa-review-2026-11-02/` del espacio de trabajo exterior, fuera de Git. El resumen de disposición se adjunta en `qa/coleccion-2026-11-02.json`.

## Pendientes, por importancia

1. **Lente:** hacer más visible la ampliación cercana del diagrama. El resumen global deja muy pequeña la región próxima al horizonte; el visor amplio permite recuperarla, pero conviene darle una acción principal propia. Es una recomendación geométrica del revisor, no una medición con visitantes.
2. **Aprendizaje:** probar con una persona nueva y añadir una pregunta final de transferencia con condiciones distintas. Completar una receta no demuestra comprensión.
3. **Entropía → Maldacena:** una actividad corta de conteo e información parcial antes de entrelazamiento y AdS. El balance térmico actual no es una curva de Page.
4. Safari y teléfonos físicos siguen pendientes por decisión del usuario, sin equipos disponibles. Los tamaños de navegador y el arrastre con ratón no certifican gestos táctiles, teclado virtual o rendimiento de GPU real. No se afirma haber recorrido las 56 combinaciones de retos de los catorce laboratorios ni todas sus variantes.

La entrega online se contrasta con la compilación local mediante hashes de HTML, JS y CSS, y una nueva inspección del visor público. Esa evidencia posterior al commit queda en el mismo directorio de trabajo, sin modificar informes históricos.
