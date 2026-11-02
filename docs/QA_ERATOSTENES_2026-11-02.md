# Eratóstenes · QA de producto independiente

Responsable: agente `eratostenes_producto`, independiente de implementación. Base: `2f812e4`. Revisión interna documentada del 2 de noviembre de 2026; no certificación externa ni prueba de aprendizaje con participantes.

## Dictamen y candidato

**APROBADO producto y aceptación independiente del candidato local**, servido en `http://127.0.0.1:1027/eratostenes/` por Vite 6.4.5. El candidato es la base `2f812e4` más el laboratorio y las correcciones de QA descritas aquí. No se deduce de este pase que una publicación posterior esté actualizada: el coordinador comprueba commit, build y dominio al publicar.

Se leyeron `AGENTS.md`, las skills `game-playtest` y `game-ui-frontend`, los contratos compartidos y el plan científico. Se revisó el código completo de App, Scene, learning, physics, formato, entrada y CSS, junto con los cambios de catálogo/ayuda. El agente científico emitió un dictamen separado. No se modificó código de producto desde este agente.

Las acciones se ejecutaron mediante CUA en una pestaña propia de Chrome, con entrada semántica y gestos nativos. Las consultas de DOM fueron de sólo lectura. No se invocaron reducers, evaluadores o almacenamiento desde el navegador para aprobar retos.

## Criterios de aceptación

- Primera acción visible y comprensible sin conocimiento previo: colocar lugares, leer sombras, registrar y comparar.
- Manipulación directa en la escena con alternativa de teclado, sin depender de gestos de varios dedos.
- Escena y consecuencia próxima al control; reto, predicción y pasos accesibles sin superponer texto largo al dibujo.
- Cada uno de los cuatro retos requiere sus observaciones; respuesta correcta sin registros no basta y respuesta incorrecta después de registrar recibe devolución útil.
- Reinicio borra el intento actual sin convertir una huella histórica en aprobación automática.
- La explicación distingue estimar circunferencia bajo supuestos de demostrar por primera vez la esfericidad terrestre.
- Signos/dirección de las sombras, arco de superficie, unidades, escalas ampliadas y supuestos de mediodía solar visibles o consultables.
- Modo ayuda consulta sin modificar; su salida devuelve manipulación y no deja el experimento bloqueado.
- Comprobar tamaño 390×844, muestras a 320×667 y 667×375, y escritorio; capturar estados estables y límites concretos. Son tamaños emulados en Chromium, no teléfonos físicos ni Safari.

## Cobertura ejecutada

Se registraron **39 estados/casos**, con los cuatro recorridos completos en 390×844 CSS px. Se probaron respuesta correcta antes de observar, una observación faltante, respuesta incorrecta después de registrar ambas, corrección de la predicción y reinicio con hallazgo previo. El botón de comprobación permanece deshabilitado cuando faltan predicción u observaciones. Una respuesta incorrecta no se transforma en éxito por existir una huella histórica.

| ID | Observaciones reales y contrastes | Resultado |
|---|---|---|
| `eratostenes/principal/reto-01` | Registrar sitios coincidentes y 800 km. En el primero no hay estimación finita; en el segundo Δθ=7,20° y C≈40.000 km. Elección «Sol mucho más cerca» recibe devolución de error; verticales locales distintas permite completar. | APROBADO |
| `eratostenes/principal/reto-02` | Registrar 800 y 1600 km: 7,20°→14,40°, mismo C. Un solo registro no basta. Elegir que la circunferencia se duplica falla; elegir conservación de la proporción permite completar. | APROBADO |
| `eratostenes/principal/reto-03` | Registrar 1 m y estirar el palo **con un gesto real sobre su punta**, obteniendo 2 m. Sombra B≈0,126→0,253 m, ángulo 7,20° constante. Respuesta que duplica ángulo falla; duplicación de longitudes conservando ángulo/C completa. | APROBADO |
| `eratostenes/principal/reto-04` | Registrar 400 y 800 km con margen ±0,2°. Intervalos mostrados: 37.895–42.353 y 38.919–41.143 km. Elegir 400 km como más preciso falla; elegir 800 km completa. Variar margen a ±0,25° produce exploración que no satisface los pasos. | APROBADO |

Se reiniciaron los cuatro después de completarlos: cuaderno vacío, predicción pendiente y comprobación deshabilitada; la misión identifica «Huella guardada». Los hallazgos duran la visita: una recarga devuelve 0/4, como indica el texto. Se comprobó que dos registros requeridos sobreviven a una medición extra y que esta última se identifica como exploración. «Volver al montaje del reto» restaura condiciones conservando registros.

### Interacción directa, ayuda e integración

- Gesto real sobre el aro B: latitud 30,64°→52,8°, distancia y ángulo actualizados. Teclado sobre aro A y sobre B también cambia valores; los controles tienen nombre, rango y valor accesibles.
- Inspector sobre el aro: explica vertical y arco sin mover el sitio. Salir recupera teclado inmediatamente. La explicación se situó fuera del dibujo principal, aunque durante consulta ocupa parte del área de controles; no se presenta el inspector como manipulación simultánea.
- Portada contiene tarjeta 18 y abre `/eratostenes/`. La portada no presenta botón de ayuda; el laboratorio sí. Desde Prisma, el enlace «18 Dos sombras, una Tierra» vuelve al nuevo laboratorio. No se modificaron pestañas del usuario.
- Fuente de datos única: el resultado guardado indica explícitamente que no es lectura en vivo. Mover después de registrar no cambia retrospectivamente esos datos. No se encontraron IDs duplicados ni desbordamiento horizontal en los tamaños probados. La consola no registró errores de aplicación en el pase final.
- Cambio de declinación solar 23,44°→0° con teclado: el símbolo se desplaza desde el vector correspondiente a 23,44° hasta `(575, 210)` en el viewBox; el ángulo B pasa 7,20°→30,64° y la sombra de 2 m pasa 0,253→1,185 m. La separación entre sitios sigue en 7,20°/800 km. El inspector explica que el símbolo representa dirección y su distancia está comprimida; se comprobó su entrada y salida.

### Tamaños y retest de correcciones

| Tamaño CSS | Comprobación | Resultado |
|---|---|---|
| 390×844 | Cuatro recorridos completos, aro/palo, ayuda, predicción y pasos; repetición de foco tras corrección. | APROBADO. |
| 320×667 | Lupa activa, altura 2 m, contraste, «↑ Pregunta» y `summary` de pasos. | APROBADO tras corregir margen. Centro del selector: `SELECT`; centro del resumen: `SUMMARY`. |
| 667×375 | Escena a la izquierda, pregunta a la derecha, alternar lupa A/B, caption HTML de 12 px y lecturas completas. | APROBADO tras ajuste. Stage y lecturas terminan en y≈374/373 dentro de 375 px; selector accesible. |
| 1280×900 | Dos lupas simultáneas, pregunta/control al lado, navegación y ausencia de IDs repetidos. | APROBADO tras margen específico de escritorio; ambas lupas caben y selector queda en y≈269–313. |

No son cuatro repeticiones completas de todos los casos en cada tamaño: la cobertura primaria es 390×844 y los otros tamaños son muestras focalizadas. Un retorno mediante el CTA de portada abre directamente el reto, por su contrato `data-scene-play`; no se espera encontrar «Mi reto» una vez abierto.

## Revisión previa de código y representación

Se leyeron `learning.ts` y `Scene.tsx` al aparecer el candidato inicial. Los tiradores tienen nombres, valor, rango y alternativa de teclado; las vistas declaran las escalas ampliadas y la convención de sombra norte/sur. Se revisarán sus posiciones y tamaño útil en el navegador antes de aceptarlos.

| Hallazgo durante implementación | Corrección y repetición independiente |
|---|---|
| Rayos iniciales usaban punta en origen y base en destino; no eran paralelos. | Trazado con el mismo vector solar para ambos; fuente y representación final revisadas. Detectado también por ciencia. |
| Medición exploratoria podía resultar confusa para completar pasos. | Devolución nombra condiciones fijas y acceso de recuperación; se probó margen incorrecto y conservación de registros válidos. |
| Sombra oscura casi invisible sobre fondo oscuro. | Pista clara y marcador de extremo, sin ampliar la sombra ni alterar ángulo; gesto 1→2 m y capturas finales conservan longitud calculada. |
| «↑ Pregunta» en 320/390 dejaba selector detrás del stage. Reproducido estable, `elementFromPoint` devolvía SVG. | Una regla nueva sobre todos los IDs pisaba el margen compartido. Se acotó a anclas concretas; repetición estable devuelve `SELECT`, y el resumen queda accesible. |
| Margen heredado de móvil en escritorio alejaba pregunta/escena; lupas apiladas. | Margen 120 px específico y lupas lado a lado. En captura final se ven ambas y la pregunta. No se cambió CSS compartido. |
| Dos lupas minúsculas en horizontal; al añadir texto legible, las lecturas quedaban por debajo del viewport. | Una lupa activa, alternancia A/B, caption HTML de 12 px y chrome compacto en poca altura. Repetición 667×375 comprueba escena/readouts dentro del área visible. |

Son hallazgos surgidos al construir este laboratorio, no fallos preexistentes de los 17 revisados anteriormente. No quedan bloqueantes reproducibles en la cobertura descrita.

## Evidencia conservada

Archivos fuera del checkout en `.work/qa-eratostenes-2026-11-02`; no forman parte del despliegue público:

- [39 casos de UI](../../qa-eratostenes-2026-11-02/product-cases.json).
- [Hashes del código revisado](../../qa-eratostenes-2026-11-02/product-source-hashes.json).
- [Predicción oculta antes del ajuste](../../qa-eratostenes-2026-11-02/qa-prediccion-oculta-320.jpg) y [predicción visible después](../../qa-eratostenes-2026-11-02/qa-prediccion-visible-320.jpg).
- [Altura y pregunta a 390 px](../../qa-eratostenes-2026-11-02/qa-altura-mobile-final-390.jpg).
- [Comparación final de escritorio](../../qa-eratostenes-2026-11-02/qa-desktop-comparacion-final.jpg).
- [Horizontal final, lectura y pregunta](../../qa-eratostenes-2026-11-02/qa-sombras-horizontal-final-667.jpg).
- [Sol en declinación cero y explicación](../../qa-eratostenes-2026-11-02/qa-sol-cero-ayuda-390.jpg).

## Límites persistentes

Safari y dispositivos físicos permanecen pendientes por decisión del usuario. El QA de agentes puede comprobar claridad de consignas y comportamiento; no acredita comprensión, diversión o transferencia de aprendizaje con estudiantes.
