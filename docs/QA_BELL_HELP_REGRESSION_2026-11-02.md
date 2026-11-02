# Regresión de la ayuda compartida

Revisión independiente por `bell_integracion`, 2 de noviembre de 2026. Candidato: base `2007560` más Bell y la corrección del dock en `src/education/HelpMode.css`. La implementación de esa corrección fue del coordinador; este revisor no modificó código de producto.

**APROBADO en las dos rutas anteriores probadas**, Prisma y Eratóstenes, con viewport 320×667 CSS px en Chrome mediante CUA. Es emulación de tamaño, no un teléfono físico. La prueba complementa el QA principal de Bell; no repite los 81 retos históricos ni certifica todas las combinaciones de la ayuda.

## Defecto y corrección revisada

El contenedor fijo `.lab-help-dock` ocupa una franja mayor que su botón visible en 320 px. La zona transparente interceptaba clics sobre controles de la página. La corrección usa `pointer-events: none` en el dock y `pointer-events: auto` en sus botones: permite atravesar la superficie vacía conservando la acción de los botones reales.

Se posicionaron controles deliberadamente dentro de esa franja mediante desplazamiento normal de la página. `elementFromPoint` y las lecturas DOM se usaron sólo para observar el elemento que recibía el clic; los cambios se hicieron con clics nativos y teclado, sin invocar setters, reducers ni almacenamiento.

| Ruta | Franja y clic real | Resultado visible | Ayuda activada y salida |
|---|---|---|---|
| `/prisma/` | El rango Intensidad estaba en y=633,39…677,39. El dock ocupaba y=611…655 y su botón empezaba en x=170,64. En (152,644), dentro del dock pero fuera del botón visible, `elementFromPoint` devolvió `INPUT#intensity`. CSS observado: dock `none`, botón `auto`. | El clic nativo cambió intensidad de 0,81 a 0,50; el texto mostró **50 %**. | El botón real activó ayuda. ArrowRight sobre Intensidad mostró «Cambiar cuánta luz llega» sin alterar 0,50. Salir y repetir ArrowRight produjo 0,51. |
| `/eratostenes/` | «Medir y guardar» estaba en y=617,48…661,48. En (152,640), la zona transparente devolvió `BUTTON` con ese texto. El dock tenía `pointer-events: none`. | Antes no había registros. El clic nativo guardó uno: **800 km / 7,20° → 40.000 km**, con el resultado rotulado como medición guardada. | Ayuda activada más ArrowRight sobre Altura mostró «La varilla convierte un ángulo en una sombra», conservando 1 m. Tras salir, ArrowRight cambió la altura a 1,05 m. |

Los botones de ayuda siguieron recibiendo clics y la salida recuperó la manipulación. El modo activo conserva su contrato de inspector: explica y evita modificar el control durante la consulta. La nueva regla no convierte esa inspección en una acción física simultánea.

## Evidencia

Los artefactos se guardan fuera del checkout, en `.work/qa-bell-2026-11-02`, junto a las demás pruebas de Bell:

- [Resultados estructurados](../../qa-bell-2026-11-02/help-regression-results.json): puntos, elementos receptores, valores y estados antes/después.
- [Prisma después de la interacción](../../qa-bell-2026-11-02/help-regression-prisma320.jpg).
- [Eratóstenes después de la interacción](../../qa-bell-2026-11-02/help-regression-eratostenes320.jpg).

Las capturas finales complementan las mediciones DOM hechas en el punto del clic; no se afirma que conserven la posición exacta de cada fase, ya que el foco de teclado puede desplazar la página. La pestaña de pruebas era propia, se cerró al terminar y se restauró el viewport. No se tocaron pestañas del usuario ni de los otros agentes.

Safari, teléfonos físicos, gestos en hardware real y estudios de aprendizaje siguen pendientes conforme al acuerdo existente.
