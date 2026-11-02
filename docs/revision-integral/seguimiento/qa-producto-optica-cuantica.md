# QA independiente de producto · Óptica y cuántica

Fecha: 2026-11-02. Revisor: `qa_producto_optica_cuantica`, separado de la implementación y del dictamen científico. Base `effb811cee78e33d78234e12e63fd28232058e6a`. Público `https://www.spumexp.lat/`; correcciones aceptadas en `http://127.0.0.1:1027/`. Se aplicaron `game-playtest` y `game-ui-frontend`; acciones mediante CUA, DOM de sólo lectura, sin ejecutar funciones privadas ni modificar estado React.

**APROBADO producto** en el alcance declarado: siete laboratorios, 36 retos principales y las cuatro preguntas auxiliares de Contar información. No equivale a certificación científica ni a probar aprendizaje con estudiantes. La aceptación independiente del coordinador y la comprobación posterior de publicación se registran aparte.

## Cómo se conserva y amplía la evidencia

El inventario actual tiene 19 laboratorios y 89 retos/actividades evaluables. Este lote cubre 40 IDs; no cambia la revisión histórica de 17 laboratorios y 81 IDs. Los cuatro de Contar información siguen siendo actividad auxiliar, no otro laboratorio. Sus IDs estables conservan el segmento `principal` del inventario histórico.

- 117 snapshots actuales de navegador contienen acciones, resultados, lecturas de consignas y estados de ayuda. No son 117 pruebas científicas independientes. Las lecturas `current-consigna-candidate` sólo acreditan preguntas, opciones y estados iniciales, no repetir el camino correcto/incorrecto.
- Prisma y Doble rendija: nueva ejecución de los ocho retos, incluyendo comparación válida, condición incompleta, cambio extra inválido y reinicio. Son comparaciones abiertas: no existe ni falta un selector de respuesta correcta.
- Entrelazados: recorrido público del reto 3; después del hallazgo UX-02, repetición local de los cuatro retos y de los mandos afectados. R2/R3/R4 incluyen predicción incorrecta, correcta, falta de observación y reinicio. R1 repite el resultado correcto y seis configuraciones repetidas se prueban entre R1/R3. El umbral histórico de 200 se conserva; la muestra de un par se probó como insuficiente en el recorrido público R3.
- Holografía: los tres capítulos se recorrieron y sus 12 consignas se volvieron a leer. Se repitieron C/I/incompleto en Geometría R1, Diccionario R3 y Temperatura R4. Los otros nueve conservan las pruebas completas del informe anterior, por código equivalente.
- Page: se repitió R2 con falta de observación, mitad/final, media de Page y predicción incorrecta/correcta; se volvieron a leer las cuatro consignas. Se conserva la cobertura completa previa para los demás casos.
- Contar información: R1 actual con correcto/incorrecto/incompleto. R2–R4 y sus umbrales/reinicios se mantienen acreditados por los registros previos y código idéntico. El raw de R1 usa `contar-informacion/auxiliar/reto-01`; el JSON lo mapea explícitamente a `contar-informacion/principal/reto-01` sin modificar el historial.
- Eratóstenes: entrada actual, R1 C/I/incompleto, R3/lupa, selección y ayuda en 390/320. Conserva los 39 registros anteriores de los cuatro retos: siete hashes SHA-256 iguales.
- Bell: entrada actual, N200 y repetición de configuración de R1; ayuda CHSH corregida en 390/320. **No se repitieron las respuestas C/I de Bell en este pase**: conserva los 77 registros anteriores, incluyendo cuatro retos, ocho distractores y reinicios, por nueve hashes idénticos. La única nueva modificación pertinente es texto de ayuda, aceptado aparte.

La comparación propia de 85 archivos contra `2f812e4` encontró 80 equivalentes byte a byte después de normalizar CRLF/LF. Las diferencias reales son `helpContent.ts`, `helpMode.css`, `helpPolicy.ts`, `Series.tsx` y el guard de `EntanglementLab.tsx`. Se revisaron las adiciones Bell/Eratóstenes, la salida del inspector, el enlace opcional a Bell y UX-02. El archivo de evidencia conserva tanto hashes brutos como normalizados: no disfraza finales de línea como cambios funcionales.

## Hallazgo corregido UX-02 · La misma configuración borraba la muestra

**Preexistente y reproducido en producción.** En Entrelazados R1, con estado producto y Z/Z, medir 200 pares daba coincidencia 100 %. Pulsar de nuevo «Ambos en Z» cambiaba la lectura a «todavía sin medir», pese a no haber cambiado el montaje. El código `tune` limpiaba siempre los conteos. Esto podía hacer pensar que tocar un botón ya activo era una nueva preparación física.

Plan remitido y aprobado antes de implementación: comparar los cuatro campos `theta`, `preparation`, `basisA`, `basisB`; retornar si todos son iguales, y conservar el borrado de conteos cuando sí cambian. No modificar fórmulas, muestreo, evaluadores, marcas ni referencias.

**Arreglo del coordinador aceptado independientemente en 1027:**

- Repetir Ambos en Z, Ambos en X, Estado puro, Mezcla clásica, Sin entrelazar o Máximo entrelazamiento conserva N200.
- Cambiar realmente preparación, θ o cualquiera de los dos analizadores limpia la muestra activa. Se usaron también los analizadores y θ directamente en la escena.
- R3 conserva las referencias de Bell Z/Z, mezcla Z/Z, Bell X/X y mezcla X/X al cambiar montaje; la muestra de mezcla X/X dio 51 % frente al 50 % previsto, fluctuación esperable. Completar las cuatro comparaciones acepta la explicación correcta y rechaza la incorrecta.
- Reiniciar R3 borra las cuatro referencias y marcas; los pasos vuelven a pendientes. Reinicios R2/R4 también retiran observaciones. La predicción se conserva conforme al contrato existente, sin producir una aprobación falsa.
- R4 exige mirar una parte y el conjunto; una sola inspección deja pendiente la otra. El modelo muestra un bit local y cero del conjunto puro.

## Hallazgo científico SCI-01 · Ayuda CHSH

El agente científico detectó que la ayuda genérica sobre CHSH no separaba el límite de las correlaciones medias de las fluctuaciones de una estimación finita. Su plan fue aprobado por ciencia; esta revisión aceptó el contenido y la presentación del texto implementado.

En el candidato se activó Modo ayuda y se tocó «Suma CHSH». Apareció la explicación de suma de medias, límite 2, posible fluctuación de una muestra pequeña y necesidad de analizar incertidumbre. En 390×844 y 320×700 la explicación es desplazable y mantiene visible la escena. **La X cierra únicamente la tarjeta; el botón global «Modo ayuda · salir» desactiva el inspector.** Después de salir, «Medir 200 pares» registra N200. No altera el montaje al inspeccionar el botón.

Corrección documental de cierre: la primera redacción confundió ambas acciones al resumir una secuencia. Se revisó el handler de la X y se repitió sólo esta transición en una pestaña propia de Chrome a390×844: abrir tarjeta → X deja ayuda activa → salir global la desactiva → medir produce N200. Los cuatro estados se guardaron aparte en [bell-help-close-recheck.json](../../../../qa-integral-seguimiento-2026-11-02/bell-help-close-recheck.json); los117 registros y su hash permanecen intactos. No fue un defecto de la aplicación ni exige otra modificación del inspector.

## Lectura como principiante y uso móvil

| Laboratorio | Gesto → observación → idea verificados | Dictamen |
|---|---|---|
| Prisma | Dirección, brillo, pantalla y material tienen comparación compacta junto al control. Apagar fuente retira señal; cambiar más de una variable explica cómo recuperar comparación. El mini es esquema de posiciones, no otra simulación de brillo. | Claro y utilizable; los ocho casos ópticos muestran efectos cuantificados. |
| Doble rendija | Un impacto frente a 1601; cambiar separación/detector/ancho y comparar frecuencias. Línea teórica separada de barras observadas; cambiar otra variable pierde referencia expresamente. | No confunde azar muestral con teoría ni detector con conciencia. |
| Eratóstenes | Dos palos coincidentes y luego separados 800 km; 7,2° produce 40 000 km. Registro no se aprueba antes de comparar. La lupa de sombra aclara qué se mide. | Selector accesible también a 320; contenido y escena se pueden consultar juntos. |
| Entrelazados | Tocar A/B y girar Z/X; preparar producto/Bell/mezcla y medir. La comparación en X distingue estado puro y mezcla sin prometer comunicación remota. | UX-02 corregido; escena, resultados y retos visibles tanto en 390 como 1280. |
| Holografía | Arrastrar extremos/corte, medir, comparar la diferencia regulada y cambiar T. La introducción diferencia AdS de dS, y caminos espaciales de trayectorias de luz. | Tres capítulos conectados, mismo lenguaje de mandos, 12 preguntas; escena y reto en horizontal 667×375. |
| Page | Repartir qubits, dibujar curva, comparar mitad/final y activar promedio. Ayuda explica que el punto es reparto/entropía, no una partícula viajando. | El modelo puro y la hipótesis independiente se identifican como cuentas distintas. |
| Bell | Fuente y analizadores, muestras con conteos, correlación y CHSH; ayuda distingue incertidumbre. | Continuidad del arreglo anterior, sin regresión observada en smoke/ayuda. |

Los paneles compactos y botones de volver a la pregunta reducen desplazamientos. En los tamaños probados no se observó bloqueo permanente de selector, acciones o salida del inspector. El botón flotante de ayuda puede superponerse momentáneamente con una línea inferior al desplazar; desplazarse o cerrarlo lo resuelve, y no se atribuye por ello ausencia absoluta de solapes en cualquier posición. En 320, una explicación larga requiere scroll interno; no se oculta esa limitación.

Oportunidades no bloqueantes: en Holografía y Page hay más notación que en Óptica; una futura prueba con principiantes debería comprobar si distinguen registro actual de referencias guardadas, si entienden nats frente a bits y si descubren el scroll del inspector. No se propone agregar una animación ornamental ni rehacer modelos sin evidencia de un problema. Los mandos actuales sí producen cambios calculados y observables.

## Evidencia, cierre y límites

- Matriz vigente: [producto-optica-cuantica.json](producto-optica-cuantica.json), 40 IDs con punteros exactos a evidencia anterior y estados actuales.
- Registros: [117 snapshots de navegador](../../../../qa-integral-seguimiento-2026-11-02/optica-cuantica-browser-cases.json).
- [Comparación SHA-256 y continuidad](../../../../qa-integral-seguimiento-2026-11-02/product-source-continuity.json).
- Capturas representativas: [Prisma 390](../../../../qa-integral-seguimiento-2026-11-02/prisma-control-390.jpg), [Doble rendija 390](../../../../qa-integral-seguimiento-2026-11-02/doble-control-390.jpg), [Eratóstenes 390](../../../../qa-integral-seguimiento-2026-11-02/eratostenes-reto-390.jpg), [Holografía horizontal](../../../../qa-integral-seguimiento-2026-11-02/holografia-temperatura-667.jpg), [Page 390](../../../../qa-integral-seguimiento-2026-11-02/page-curva-390.jpg), [Bell ayuda 320](../../../../qa-integral-seguimiento-2026-11-02/bell-help-320.jpg), [Entrelazados escritorio](../../../../qa-integral-seguimiento-2026-11-02/entrelazados-desktop-1280.jpg).

El coordinador informó 449 tests, lint y build correctos después del arreglo; este agente no los presenta como ejecución propia. La revisión de ciencia está separada en `ciencia.json`. No se realizaron cambios de aplicación ni commit/push desde este agente.

Safari y dispositivos físicos siguen pendientes por falta de acceso, conforme a la decisión del usuario. Esto es emulación de dimensiones en Chromium/IAB, no prueba táctil física. No participaron estudiantes reales. Los fallos iniciales para abrir el candidato eran aislamiento del servidor y una pestaña de herramienta con error; se resolvieron relanzando el servidor y retomando una pestaña propia. No se registraron como defectos de SPUM.

## Cierre cruzado del candidato

Leí `ciencia.json` con89 IDs aprobados, el manifiesto Einstein/Cosmos con49 IDs y su `finalReview`, `root-acceptance.json` y los logs finales del candidato. **Confirmo el cierre de mis siete laboratorios y40 IDs.** Los40 tienen dictamen científico; la unión de ambos bloques da89 IDs únicos sin solapamientos. La corrección DOC-02 del inventario de Eratóstenes se limita a metadatos explicativos y no cambia los evaluadores acreditados.

La muestra del coordinador en Holografía confirma R1 incompleto/incorrecto/correcto, la conexión de los tres capítulos y sus tres alias. No sustituye los otros casos documentados. El coordinador implementó UX-02: la aceptación independiente de ese arreglo sigue siendo el navegador de este agente. Leí también la revisión React del otro agente, que revisó los cuatro campos, los eventos síncronos y los reinicios explícitos; no objeta los diffs y no la presento como una skill ejecutada por mí.

Verifiqué los logs, además del resumen recibido:449 pruebas aprobadas,0 fallos/omisiones, ESLint sin incidencias y build completado. Son ejecuciones del coordinador. Revisé `verificar.mjs`: contrasta IDs, punteros y hashes; no ejecuta experimentos ni genera un dictamen de aprendizaje. El script no reemplaza las decisiones de los revisores.

El `finalReview` del JSON registra estas lecturas, el arreglo documental X/salir y los hashes de los archivos pertinentes. Cierra la aceptación del candidato; no acredita un despliegue público nuevo. La verificación final de publicación corresponde al coordinador. Safari, teléfonos físicos y participantes reales siguen pendientes.
