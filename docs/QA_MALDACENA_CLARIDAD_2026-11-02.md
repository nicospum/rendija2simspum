# Segunda revisión de Maldacena · claridad para empezar

Revisor independiente de la construcción inicial. Se revisaron los cuatro conjuntos de lecciones y sus condiciones, además de la actividad de conteo. Esta evaluación heurística no es un estudio de comprensión con personas nuevas. La prueba en navegador se documenta abajo cuando se completa; leer el código no sustituye observar la escena.

## Hallazgos y correcciones

### 1. Mirar una parte seguía mostrando una estadística del conjunto

En «Entrelazados», seleccionar A o B cambiaba el encabezado a «Solo A/B», pero la segunda lectura seguía siendo la coincidencia de los dos registros. Cambiar el analizador remoto podía modificar ese número visible, aunque el estado local permaneciera igual. Para alguien sin contexto, el panel podía sugerir una señal que cambia una medición local a distancia.

Se cambió esa segunda lectura: al inspeccionar A/B se muestran sus probabilidades locales de 0 y 1 en la base elegida; al volver al conjunto AB se recupera la coincidencia prevista y su muestra. No se cambiaron las leyes del modelo. El comportamiento de no señalización ya tiene una prueba independiente en `maldacena-quantum.test.mjs`; la presentación se comprobó en navegador.

Durante la repetición local apareció un defecto nuevo de presentación numérica: un marginal podía sumar `1,0000000000000002` por redondeo y su complemento se mostraba como «−0 %». Se acotaron los marginales a su intervalo físico [0,1] y se añadió una regresión estricta para los resultados ciertos en Z/X y X/Z. Al repetir la interacción, la lectura local queda exactamente igual antes y después de cambiar el analizador remoto.

### 2. El primer reto usaba notación antes de explicar qué se manipulaba

El comienzo pedía preparar `|00⟩` y medir en Z sin definir primero las partes, los resultados ni la base. La explicación de Z/X estaba al final y empezaba por sus vectores matemáticos. La masa de conocimientos presupuesta era mayor que la del prisma o la doble rendija.

Se describieron A y B como sistemas de dos resultados posibles en la introducción. El primer reto explica qué significa 00, su guía nombra los botones exactos, y una ayuda desplegable junto a los controles define qubit, base, Bell, mezcla y pares recién preparados. El tercer reto nombra las cuatro acciones y la tabla que conserva sus comparaciones. Se conserva la explicación rigurosa posterior. Las ayudas largas no se añadieron al área fija de la escena.

Se corrigió también una afirmación contextual: «a 45° es Bell» solo es cierta con «Estado puro»; la mezcla a ese ángulo no es un estado de Bell. La aclaración ahora acompaña a la barra.

### 3. «Comparar con el horizonte» no mostraba la comparación

En el cuarto ejercicio de conteo el botón solo habilitaba una bandera interna y la conclusión aparecía después de elegir la respuesta. No ofrecía evidencia visible antes de responder.

Ahora abre una comparación explícita: el registro clásico muestra las posibilidades y la incertidumbre actuales; el horizonte usa la ley de área. El texto explica qué conexión se está explorando y por qué esas casillas no son piezas físicas del horizonte. No se inventan microestados ni se vincula el registro de juguete a la masa del agujero negro.

## Otros capítulos y criterios

Las condiciones de los dieciséis retos coinciden con sus objetivos: medición explícita en geometría/dualidad, comparaciones a parámetros fijos y observación del conjunto y de una parte en cuántica. No se detectó una nueva condición imposible ni una vía de acreditación sin la acción requerida. Los márgenes pequeños de las barras y el uso de atajos se consideran en el pase de disposición del agente móvil.

Se informó al agente principal de vocabulario todavía exigente al entrar: AdS, CFT, BTZ, corte ε y nats. También se sugirió conectar la expresión `(cCFT/3) ln 2` con el incremento numérico de la teoría fijada. El agente principal coordina la orientación compartida; este revisor no modificó el marco, la geometría ni BTZ.

## Verificación

- Diez pruebas cuánticas y de conteo aprobadas, incluida independencia de la estadística local respecto de la base remota, contraste Bell/mezcla, estados producto, condiciones de observación y marginales acotados sin complementos negativos.
- ESLint de `src/maldacena/quantum` sin errores.
- TypeScript del proyecto aprobado después de los cambios de texto y lecturas.
- En Chrome de escritorio, 1280×900: cuatro retos cuánticos y cuatro preguntas de conteo completados con controles nativos; una predicción incorrecta rechazada; las cuatro comparaciones Bell/mezcla registradas; comparación de registro/horizonte visible antes de elegir una respuesta.
- Prueba específica de la lectura local: con θ=0, A medido en Z y B pasando de Z a X, «Solo A» conserva 0→100 %, 1→0 %. Al volver a AB la coincidencia cambia de 100 % a 50 %. La distinción ya no depende de ir a leer la explicación del pie.
- Se contrastaron los dos defectos principales en la web pública de partida: «Solo A» sí cambiaba su coincidencia visible al cambiar B, y «Comparar con el horizonte» no añadía ninguna comparación visible antes de responder.
- Evidencia en `.work/qa-maldacena-claridad-2026-11-02/` del espacio de trabajo exterior: `clarity-desktop-tests.json`, `public-baseline-findings.json`, `local-probabilities-desktop.png` y `counting-horizon-comparison.png`. Chrome se devolvió con su viewport restaurado y la pestaña propia cerrada. La matriz móvil final queda a cargo del agente de disposición.

La falta de contexto, la estadística conjunta en el panel local y la comparación muda estaban presentes en la versión de partida `08d6b07`. El «−0 %» se detectó al exponer los marginales en la lectura nueva y se corrigió antes de publicar. Los cambios conservan ecuaciones, predicciones, muestreo y claves de progreso. Safari, teléfonos físicos y pruebas con participantes siguen pendientes según la decisión del usuario.
