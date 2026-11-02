# Maldacena: revisión independiente de uso después de publicar

2 de noviembre de 2026. Revisión nueva del especial en `https://www.spumexp.lat/maldacena/`, desde una pestaña propia de Chrome. No se usaron estados internos de React, inyección de eventos ni modificaciones del DOM para completar retos. Se combinaron lectura del código, acciones de navegador, capturas y comprobaciones de posición.

## Hallazgos de la versión pública inicial

1. **Vocabulario antes de su explicación.** El primer reto ya pide `|00⟩`, Z/Z y el siguiente estado de Bell, mientras la introducción habla de qubits y bases sin un ejemplo inicial decodificable. Las explicaciones más completas aparecen después del laboratorio. Es una barrera para quien llega sin conocer el tema, aunque los botones permiten cumplir los pasos. El agente de claridad asumió definiciones y ayudas cortas junto a los controles; el marco común agrega orientación antes de jugar.
2. **Información local con una lectura conjunta.** Al inspeccionar A/B, el visor publicado cambia la entropía del estado seleccionado, pero mantiene la lectura de coincidencia del par sin identificarla claramente como conjunta. No es un error matemático, pero invita a mezclar información local y correlaciones. La corrección cuántica usa probabilidades locales al mirar una parte.
3. **Condiciones geométricas poco visibles en celular.** A 320 px los ejes y símbolos del SVG son pequeños. Las lecturas HTML permiten leer distancias y profundidad, pero para volver a ver la longitud del intervalo y el corte hay que bajar a los controles. Se recomendó sustituir parte de la línea de referencia por las condiciones actuales `ℓ` y `ε`, sin sumar altura permanente.
4. **Segunda vista térmica de solo lectura.** En la versión pública de partida, el punto coral de la gráfica de entropía no ofrece una acción directa, a diferencia del termómetro de la vista del interior. Se añade un asa del intervalo en esa gráfica y una indicación breve. También se pidió mostrar radio areal y parámetro de masa en la lectura del cuarto reto, que pregunta precisamente por esas cantidades.

Son mejoras identificadas en el producto ya publicado, distintas de los problemas de altura y estabilidad corregidos durante su construcción. No se encontró un bloqueo del recorrido correcto de los 16 retos en esta pasada.

## Comprobación funcional del recorrido público

Se completaron **los 16 retos de los cuatro laboratorios en 390×844**. En geometría, correspondencia y BTZ se utilizaron las barras nativas con teclado, no solo los atajos de los presets. En el tercer reto cuántico se midieron las cuatro combinaciones de Bell/mezcla y Z/Z–X/X. La predicción incorrecta del primer reto cuántico fue rechazada después de medir y pudo corregirse sin reiniciar.

«Ampliar visor» y volver con «Mi reto» conservaron la predicción y las observaciones del ensayo cuántico. Los cuatro capítulos se pudieron recorrer por las rutas de SPUM y sus enlaces al mapa. Los registros de la pestaña pública no mostraron errores ni advertencias.

La inspección visual a 320×740 confirmó que la escena y la predicción caben en los retos representativos de geometría y BTZ. En el cuarto reto térmico, la segunda vista conservó el dibujo completo (358 px de alto) y el selector de predicción dentro del visor. El control principal se visita con «Probar en la escena»; no se afirma que toda la pregunta y todos los controles quepan simultáneamente. La escala del texto numérico del SVG es secundaria: las lecturas HTML son las que aportan legibilidad.

Evidencia de esta pasada: `.work/qa-maldacena-followup-2026-11-02/` bajo el espacio de trabajo exterior. `baseline-16-challenges.json` registra los 16 resultados; `baseline-btz-question-320.png` conserva un estado representativo. Esta es una revisión técnica y heurística, no una prueba de aprendizaje con participantes nuevos.

## Repetición después de las correcciones

Se cerró la repetición sobre el servidor local `1027`, después de las ayudas nuevas, las lecturas contextuales, los rótulos geométricos mayores y la interacción del gráfico térmico. **96/96 estados de disposición aprobados:** cuatro laboratorios × cuatro retos × dos acciones («↑ Pregunta» y «Probar en la escena») × tres tamaños (**390×844, 320×740 y 667×375**). En cada estado se eligió una predicción; en el cuarto reto cuántico también se inspeccionó A, y en el tercer reto térmico se activó la pendiente para cubrir las lecturas variables. Escena y destino de la acción quedaron dentro del visor, con su centro libre, sin desbordamiento horizontal.

Además se probaron **12 ayudas abiertas**, una por laboratorio y tamaño. Esta prueba encontró un problema nuevo introducido al añadir explicaciones: el foco del resumen no respetaba el espacio de la escena fija y la cabecera de la ayuda podía quedar detrás del dibujo. En 390×844 el resumen estaba aproximadamente en y=400–444, bajo una escena que terminaba entre y=460 y 536. La captura `help-summary-obscured-390.png` reproduce el fallo. El agente principal incluyó `summary` en la compensación de desplazamiento del especial; la repetición **12/12 pasó**, y `help-summary-accessible-390.png` muestra título y explicación accesibles con la escena completa. El contenido largo sigue siendo desplazable; no se afirma que toda la ayuda quepa de una vez.

La nueva lectura cuántica se comprobó expresamente: en Bell, «Solo A» mostró probabilidades locales 0→50 % y 1→50 %, en lugar de una coincidencia del par. El cuarto reto se completó y permaneció comprobado al volver a inspeccionar A. La captura `quantum-local-probabilities-390.png` muestra esa relación junto a la pregunta. Los otros agentes repitieron funcionalmente los cuatro retos cuánticos, las cuatro preguntas de conteo y los doce retos de geometría/correspondencia/BTZ después de sus cambios; este informe conserva por separado la cobertura del revisor móvil.

Los registros de la pestaña local final no mostraron errores ni advertencias. Chrome se devolvió a su tamaño normal y se cerraron únicamente las pestañas propias. El agente principal se encarga de la compilación y de contrastar la publicación final.

Evidencia final: `final-layout-390x844.json`, `final-layout-320x740.json`, `final-layout-667x375.json`, `final-open-help.json` y `final-layout-summary.json`. Los registros de disposición describen geometría y acceso, no demuestran por sí solos que cada rótulo del dibujo sea cómodo de leer ni que una persona nueva haya comprendido el concepto.

Safari, teléfonos físicos y rendimiento de GPU siguen pendientes por la decisión previa del usuario. Un tamaño de ventana emulado y un gesto de ratón no demuestran comportamiento táctil en un dispositivo real.
