# QA de producto: Einstein y agujeros negros

Dictamen: **APROBADO dentro del alcance documentado**. Encontré una ambigüedad en Mercurio, UX-01, corregida por el coordinador y aceptada aquí mediante revisión del código y uso del candidato. No encontré otro bloqueo reproducible en este bloque. Esta aprobación es de producto; la evaluación científica es independiente.

Revisor: `qa_producto_einstein_cosmos`, independiente de quien implementó la corrección. Fecha: 2026-11-02. Base actual: `effb811cee78e33d78234e12e63fd28232058e6a`. Candidato: base más UX-01; las correcciones simultáneas de Bell y Entrelazados no modifican los doce laboratorios de este bloque. Navegador integrado Chromium, producción `https://www.spumexp.lat` y candidato `http://127.0.0.1:1027`.

## Hallazgo corregido

**UX-01 · Mercurio · prioridad P2.** En producción, la escena indicaba `GIRO ×100.000`, pero el botón destacado, con `aria-pressed=true`, decía «Giro real». Era una etiqueta de la acción siguiente presentada visualmente como el estado activo. Alguien que recién llega podía confundir la exageración gráfica con la precesión física.

Reproducción: entrar a Mercurio, jugar junto a la escena y comparar la leyenda de la vista con el botón de escala. El coordinador dejó una etiqueta estable, «Ampliar giro ×100.000», conservando `aria-pressed={s.setup.expanded}`. Revisé que el diff no cambiara cálculos, validación, vueltas ni reproducción.

Aprobación del candidato:

- Con 10 vueltas, alternar real/ampliado conserva las vueltas y las lecturas físicas: 0,1035″ por órbita y 42,98″ por siglo. Cambian la leyenda gráfica y el estado pulsado.
- Reto 4: sin la comparación requerida no se acredita; una respuesta incorrecta se rechaza; la correcta se acepta después de observar ambas escalas. Reiniciar elimina la predicción y la observación actual; una huella previa no aprueba el intento nuevo.
- A 320×667, 667×375 y 1280×900 pude usar reto y controles junto a la escena. A 390×844 verifiqué interacción sobre Mercurio por teclado y arrastre: desde cero el teclado avanzó a 0,10 vueltas, y el arrastre posterior a 0,25.
- Un primer arrastre no acertó al asa. Se conserva como diagnóstico; después de localizar el objetivo con geometría DOM y captura fresca, la entrada directa funcionó. No se contabiliza el intento fallido como un defecto del producto.

Evidencias: `orbita-before-toggle-390.jpg`, `orbita-lupa-toggle-current.json`, `orbita-lupa-corrected-320.jpg`, `orbita-lupa-corrected-desktop.jpg` y registros `orbita-local…` en el directorio externo declarado abajo. El coordinador realizó además su propia aceptación; este informe no la sustituye.

## Cobertura y continuidad

El manifiesto [producto-einstein-cosmos.json](producto-einstein-cosmos.json) conserva **49 IDs**: cuatro retos en cada uno de los doce laboratorios y una pregunta auxiliar de la ecuación de campo. Los dos exploradores sin calificación se registran aparte. Cada ID tiene dictamen, referencias históricas verificables y evidencia actual.

No presento 49 ejecuciones exhaustivas nuevas. Se combina la cobertura previa de respuestas correctas, incorrectas, incompletas, umbrales y reinicios con una nueva pasada de regresión. Comparé los archivos con el commit de aprobación histórica `2f812e4`: de 171 archivos pertinentes, 167 conservan el mismo objeto Git. Revisé los cuatro distintos: Mercurio tiene UX-01; ayuda y políticas amplían Bell y Eratóstenes; el CSS compartido del dock deja pasar eventos por su contenedor y los mantiene en sus botones. Este último cambio se contrasta con las muestras actuales de ayuda en Reloj y Acreción, además de las del otro agente. El registro externo incluye los objetos Git y SHA-256 actuales. El verificador histórico confirmó 81 IDs y 863 referencias coherentes; esto valida trazabilidad, no reemplaza el uso del navegador.

Trabajo actual:

- Navegación real desde los mapas de especiales, enlaces entre capítulos y vuelta al índice. Acceso directo al candidato de Mercurio.
- Selección y lectura de las **48 consignas principales** a 390×844, comprobando escena, controles pertinentes, predicción e indicación de qué observar.
- Respuesta incorrecta y correcta nuevas en el primer reto de los **12 laboratorios**, más el cuarto de Mercurio. En los casos que requieren comparación se probó también el estado sin observación suficiente; las condiciones exhaustivas de los demás retos se conservan por identidad y evidencia previa.
- Pregunta auxiliar de la ecuación de campo: respuesta incorrecta y correcta repetidas; ausencia de selección y recarga conservadas por evidencia previa.
- Explorador de energía en reposo: extremos de masa y lectura de escala logarítmica. Atlas de agujeros negros: 5, 10 y 20 masas solares, con cambios de radio, temperatura y entropía. No se inventan respuestas incorrectas ni calificación para estas exploraciones abiertas.
- Ayuda activada y cerrada en Reloj y Acreción; retorno a los controles. Muestras de 320×667 en Fotoeléctrico y Mercurio, 667×375 y 1280×900 en Mercurio. El pase previo conserva muestras adicionales de escritorio y formatos estrechos.

Se guardaron **95 registros actuales de escena/DOM**, además de capturas, widgets y estado del toggle. Incluyen diagnósticos; no representan 95 pruebas independientes. El último registro de consola del candidato no contiene errores ni avisos.

## Qué tiene que resultar comprensible

La siguiente tabla recoge las señales visibles contrastadas en la nueva muestra R1. Describe la intención didáctica y lo observado; no afirma que una persona externa ya lo haya comprendido.

| Laboratorio | Acción y señal observada | Idea que sostiene la devolución |
|---|---|---|
| Reloj de luz | Con rapidez cero, completar el tic muestra 1,001 µs en ambos sistemas. | La diferencia de tiempos exige movimiento relativo. |
| Tren de Einstein | Con +0,6 c, completar las señales distingue el orden de llegada en el tren. | Simultaneidad y llegada de señales son preguntas distintas. |
| Nos vemos a la vuelta | El giro solo no completa el viaje; al reencontrarse aparecen Tierra 10 años y nave 6. | Comparar relojes requiere reunirlos en el mismo evento. |
| Ascensor | Un caso solo no basta; comparar ascensor sostenido y cohete muestra 19,62 N para 2 kg. | Una medición local de peso no identifica por sí sola el origen. |
| El tiempo tiene altura | Comparar 0/100 m durante un día muestra aproximadamente +0,942 ns. | El efecto real es pequeño; altura, duración y lectura están vinculadas. |
| Mercurio | Una vuelta no basta; completar diez evidencia el giro y sus unidades. | La ampliación gráfica permite ver una precesión física diminuta. |
| Fotoeléctrico | En sodio, 450 THz no emite aunque haya brillo; 650 THz sí produce corriente. | Brillo y frecuencia cumplen papeles diferentes. |
| Lente | Alternar con/sin lente manteniendo la geometría muestra posición y forma diferentes. | La gravedad cambia los recorridos que traen la luz. |
| Acreción | Comparar gas 0/60 hace aparecer el disco emisor exterior. | La luz observada procede del gas; no del interior del horizonte. |
| Horizonte | Comparar un reloj sostenido a 4 y 1,2 radios del horizonte cambia su ritmo relativo. | Se especifica el tipo de reloj y el observador de referencia. |
| Hawking | Duplicar la masa reduce temperatura a la mitad y potencia a un cuarto. | Un agujero negro mayor es más frío en este modelo. |
| Entropía | Pasar de 10 a 20 masas solares duplica radio y cuadruplica área/entropía. | El crecimiento relevante sigue el área, no el volumen. |

Las predicciones incorrectas de esta muestra no otorgaron la aprobación; las correctas con observación suficiente sí mostraron «Descubrimiento comprobado». Revisé las consignas de R2–R4 actuales y su evidencia histórica detallada. No fue necesario agregar nuevos textos a esos retos: sus próximos pasos y condiciones estaban expresados, y la corrección concreta fue la etiqueta de escala de Mercurio.

## Escena, controles y límites

En la pasada actual a 390×844, la escena quedó disponible al recorrer preguntas y controles. Los registros no muestran desbordamiento horizontal. A 320 px, Fotoeléctrico y Mercurio conservaron controles utilizables y lectura de resultados. La escena de Mercurio siguió visible en la muestra horizontal y sus dos vistas estuvieron presentes en escritorio. Las capturas son necesarias para este juicio: la existencia de un canvas o un SVG en el DOM, por sí sola, no lo probaría.

El modo ayuda fue revisado como contrato compartido con muestras actuales en Reloj y Acreción. Su panel inferior puede compartir el área de lectura con contenido largo; cerrar o desplazar la página permitió continuar. No observé un bloqueo persistente de la escena o de las acciones en esas muestras. Esto no equivale a repetir todas las ayudas de cada elemento en los doce laboratorios.

Evidencia externa, fuera del checkout: `../../../../qa-integral-seguimiento-2026-11-02/` relativa a este documento. El manifiesto enlaza archivos y posiciones exactas; las capturas `<laboratorio>-current-390.jpg` muestran estados representativos. La evidencia histórica queda en `../../../../qa-integral-retos-2026-11-02/` y los informes de la revisión anterior se conservan sin reescribirlos.

Pendientes explícitos: Safari, teléfonos físicos y tecnologías de asistencia reales; el usuario dejó las dos primeras pruebas pendientes por falta de acceso. No hubo prueba de aprendizaje con participantes. La aprobación no implica cobertura de todas las combinaciones posibles ni todos los tamaños en cada reto. La publicación y comprobación final del commit en `spumexp.lat` corresponden al coordinador; esta aceptación del arreglo se realizó sobre el candidato local.

## Cierre cruzado del candidato

Leí los dictámenes finales de ciencia y Óptica/Cuántica, `root-acceptance.json` y los logs finales de pruebas, lint y compilación. **Confirmo el cierre de estos doce laboratorios y 49 retos sobre el candidato**. Los 49 IDs tienen aprobación científica correspondiente; al unirlos con los 40 del otro bloque se obtienen 89 IDs sin duplicados. Óptica/Cuántica conserva 117 registros finales: 101 era una versión anterior, no otra colección para sumar.

Los logs del coordinador muestran 449/449 pruebas aprobadas, ESLint sin incidencias y compilación completada. Los leí; no atribuyo su ejecución a este agente. La comprobación adicional de Mercurio por el coordinador conserva vueltas y lecturas, pero él implementó el arreglo: la aceptación independiente sigue siendo la de este informe. Su muestra de Holografía sí es independiente de aquella implementación.

Apliqué el checklist de `react-best-practices` a los tres diffs de aplicación. La etiqueta de Mercurio conserva su estado y semántica accesible. El guard de Entrelazados compara los cuatro campos primitivos de `QuantumState`: no llama setters para un ajuste idéntico y mantiene el borrado para un cambio real; `restore` y `choose` permanecen como reinicios explícitos. Revisé sus llamadas y los hooks de puntero: son eventos síncronos con un ajuste por acción, sin callbacks persistidos ni trabajo asíncrono que vuelva obsoleto el estado del render. No agrega hooks, efectos, dependencias, mutaciones ni memoización. La ayuda de Bell es texto estático y coincide con el hash aprobado por ciencia. **No hay objeciones de revisión de código a los tres cambios**.

La sección `finalReview` del manifiesto registra estos resultados y los hashes de los tres archivos. Esto cierra la aceptación del candidato; no añade pruebas de navegador ni afirma que el nuevo despliegue público ya haya sido comprobado.
