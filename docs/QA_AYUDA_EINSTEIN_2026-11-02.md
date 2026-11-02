# QA independiente: modo ayuda en el especial Einstein

Fecha: 2026-11-02. Agente: `qa_einstein_help`. Navegador: Chrome de escritorio en Windows, pestaña propia, con viewport emulado. No son pruebas en teléfono físico ni en Safari.

## Alcance y resultado

Se recorrieron los siete laboratorios públicos de `https://www.spumexp.lat/` a 390 × 844. En cada uno se consultó un control con modo ayuda, se comprobó que una flecha no cambiara su valor, se salió del modo y se comprobó que la flecha volviera a cambiarlo. Se completó explícitamente el primer reto de cada laboratorio, incluyendo las observaciones exigidas y la respuesta correcta.

La regresión local usa `http://127.0.0.1:1027/`. La corrección compartida protege los SVG, los controles de escena y ambas vistas en escritorio: la tarjeta queda fuera del experimento en los casos detallados abajo. También se encontró y corrigió un borde de contenido externo al workspace. No quedan fallos bloqueantes identificados dentro de la cobertura realizada.

Los otros tres retos de cada laboratorio aparecen en el selector, pero no se completaron exhaustivamente en esta revisión. No se afirma cobertura de los 28 retos.

## Matriz pública, 390 × 844

| Laboratorio | Consulta: valor conservado | Salir: cambio recuperado | Reto completado y aprendizaje comprobado |
| --- | --- | --- | --- |
| Reloj de luz | β = 0,6 | β = 0,601 | Con velocidad cero, el mismo tic tarda lo mismo en ambos sistemas. Se completó ida y vuelta y se eligió la explicación. |
| Tren de Einstein | v/c = 0,6 | 0,61 | A 0,6 c, emisiones simultáneas en el andén no tienen la misma fecha en el tren: B antes que A. Se observaron todas las llegadas. |
| Nos vemos a la vuelta | v/c = 0,8 | 0,81 | Reencuentro después de diez años en casa: seis años propios en la nave. Se comparan relojes reunidos, no imágenes retrasadas. |
| Ascensor de Einstein | fracción del ensayo = 0 | 0,01 | Se observaron los resultados de cabina sostenida y nave acelerada, con las mismas condiciones. Son equivalentes localmente en el modelo. |
| El tiempo tiene altura | altura = 0 | 1 en la regla del control | Se observó un día a 0 m y a 100 m. El reloj elevado acumula cerca de 0,94 ns adicionales por día. |
| La órbita que no se cierra | e = 0,206 mostrado | 0,207 | Mercurio, diez vueltas y giro ampliado: el perihelio relativista avanza; la elipse de dos cuerpos de Newton conserva dirección. |
| Efecto fotoeléctrico | f = 450 THz | 451 THz | Se midieron sodio al 100 % con rojo y azul. Solo el azul del ensayo supera el umbral y produce emisión. |

Todos dieron confirmación explícita de descubrimiento completo. La huella guardada previa no se tomó como evidencia de una ejecución nueva: se realizaron las observaciones y se volvió a comprobar cada explicación.

## Fallo público encontrado

**P2 — Una consulta de un elemento SVG podía cubrir parte de la escena.**

Reproducción: fotoeléctrico, completar primer reto; activar ayuda; enfocar el asa SVG «Cambiar frecuencia en la celda» y pulsar flecha. La frecuencia permanece en 650 THz, pero la tarjeta móvil genérica se coloca sobre el circuito.

- 390 × 844: SVG `(21;409,16;333;175)`, tarjeta `(12;558,06;351;203,94)`. Intersección vertical: 26,1 px.
- 320 × 740: SVG `(17;375,94;271;175)`, tarjeta `(12;428,88;281;229,13)`. Intersección vertical: 122,1 px.
- Evidencias: `einstein-publico-fotoelectrico-ayuda-tapa-svg-390.png` y `einstein-publico-fotoelectrico-ayuda-tapa-svg-320.png`.

La corrección local unifica la protección de escenas DOM/SVG con las de WebGL. Este fallo estaba presente en el sitio público antes de los cambios revisados.

## Regresión local de la corrección

Los otros seis laboratorios repitieron el ensayo de consulta/salida a 390 × 844 y conservaron el mismo comportamiento de la matriz. En todos, los SVG visibles quedaron fuera de la tarjeta consultada mediante el control físico del visor.

Fotoeléctrico, consulta de asa SVG:

| Viewport | SVG visible | Tarjeta | Resultado |
| --- | --- | --- | --- |
| 390 × 844 | y 427,97–602,97 | y 610,97–758 | Debajo, separación de 8 px |
| 320 × 740 | y 375,75–550,75 | y 12–262 | Arriba, sin intersección |
| 667 × 375 | x 21–289,39 | x 297,39–637,39 | A la derecha, separación de 8 px |
| 1280 × 900 | Dos vistas, y 199,83–429,83 | y 437,83–641,77 | Debajo de ambas |

Se consultó también el gráfico de energía de la segunda vista de escritorio: la protección incluyó ambos SVG, no solamente el seleccionado. En consulta no cambió 450 THz; al salir, la flecha del gráfico cambió a 460 THz.

Reloj de luz, consulta del pulso desde la estación:

- 320 × 740: SVG y 318,95–493,95, tarjeta y 501,95–654.
- 667 × 375: SVG x 21–289,39, tarjeta x 297,39–637,39.
- 1280 × 900: ambos SVG y 140,55–370,55; tarjeta y 378,55–582,48.
- Fracción del pulso conservada en 0 con ayuda; al salir, la flecha la lleva a 0,05.

La tarjeta puede tener desplazamiento interno en pantallas pequeñas. Cerrar explicación y salir del modo siguen disponibles. La salida por Escape elimina tarjeta y estado de ayuda. `Control+ArrowRight` en rapidez del reloj no modifica β durante la consulta.

### Flujo de reto y controles

En fotoeléctrico local estable se repitieron las dos mediciones y se eligió una explicación incorrecta: «Los dos: alcanza con iluminar fuerte». El sistema no la marcó completa; orientó a revisar energía por fotón, umbral y corriente. Después se eligió la explicación correcta y confirmó el descubrimiento.

Se consultó «Comprobar explicación»: ahora explica que contrasta predicción con observaciones y por qué puede estar deshabilitado. No actúa como una medición ni cambia las condiciones. Después de salir, predicción, comprobación, selector de reto y escena siguen utilizables. Tras responder, SVG y171–346, selector de reto y351–395, botón de comprobación y603–647: sin intersección de la barra con la escena.

En el asa de color del fotoeléctrico, el arrastre de puntero durante consulta conservó 650 THz. Al desactivar ayuda, el mismo tipo de arrastre sobre el asa cambió a 1370 THz. Es una prueba de puntero de escritorio con viewport móvil; no verifica gestos táctiles reales.

No hubo errores ni advertencias de consola en los flujos locales revisados de fotoeléctrico y reloj.

## Borde adicional encontrado y corregido

**P2 menor — Ayuda de un título de reto fuera del workspace.** Local 1027, reloj 320 × 740: activar ayuda y consultar el h2 «Primero, el mismo ritmo» en la tarjeta que antecede al visor. La consulta genérica no encuentra contexto visual. SVG visible y642,95–817,95; tarjeta y408–658. Intersección de 15,05 px con la parte superior visible del SVG. Evidencia: `einstein-local-reloj-ayuda-pregunta-tapa-svg-320.png`. Informado al agente de implementación para ampliar la protección al contenido próximo fuera del workspace.

Retest final: la nueva consulta protege también el renderer visible cuando el título está fuera del workspace. Tarjeta y12–262; SVG y642,95–817,95, sin intersección. Evidencia: `einstein-local-reloj-ayuda-pregunta-corregida-320.png`. La consulta preexistente se cerró y reabrió después del HMR para probar el nuevo contexto, sin contar un estado preservado por desarrollo como fallo público.

Regresión posterior en fotoeléctrico 390 × 844: SVG y427,16–602,16; tarjeta y610,16–758; frecuencia conservada en 450 THz y, después de salir, cambiada a 451 THz. Se mantiene la corrección del fallo público original.

## Revisión de código y claridad para principiantes

Se revisaron `src/education/HelpMode.tsx`, `helpPolicy.ts`, `helpMode.css`, las reglas Einstein de `helpContent.ts`, las ayudas explícitas de `SceneConsole.tsx` y las pruebas `tests/help-policy.test.mjs` y `tests/help-content.test.mjs`.

- La consulta captura eventos antes de las acciones del juego; la salida limpia listeners, marca visual y `aria-describedby` conservando la descripción previa. Los rangos nativos y las asas SVG recuperaron teclado en pruebas.
- La protección usa los renderers visibles del workspace y omite los paneles ocultos. Evita mover una tarjeta hacia una segunda vista por considerarla espacio vacío.
- Las ayudas diferencian eventos de emisión y recepción, coordenadas y tiempo propio, apoyo y gravedad, ampliación gráfica y cambio físico, brillo y energía por fotón. Esta distinción es adecuada para empezar sin conocimientos previos.
- Las acciones pedagógicas tienen ayudas explícitas y no reciben por accidente la explicación de un fenómeno por coincidencia textual.
- Oportunidad de claridad no bloqueante: algunos retos exigen valores de referencia exactos, como 0,6 c en el tren. Cambiar a 0,61 deja de satisfacer el paso aunque visualmente parezca casi igual. Los presets resuelven el ensayo; conviene mantener visibles las condiciones exactas y «Pasos del reto» cerca del botón deshabilitado.
- Oportunidad de ergonomía no bloqueante: la pregunta expandida y su explicación hacen largos los paneles. En ascensor la intensidad llegó a y1242 en 390 × 844. Cerrar la pregunta y usar los controles inmediatos permite seguir; puede mejorarse con una pregunta más compacta al jugar.

No se modificó implementación ni se crearon commits desde este agente. Las ejecuciones completas de tests, lint y build pertenecen al agente principal y deben consultarse en su informe, no se atribuyen a esta revisión independiente.

## Evidencia y límites

Capturas y datos JSON: `.work/qa-ayuda-total-2026-11-02/` en el repositorio exterior. Archivo de matriz: `einstein-help-results.json`.

Pendientes: Safari real, iOS/Android físicos, lectores de pantalla, cobertura exhaustiva de todos los gestos y los 28 retos, y verificación pública después del despliegue final. La emulación cubre dimensiones y entrada de puntero/teclado de Chrome, no sustituye estas pruebas.
