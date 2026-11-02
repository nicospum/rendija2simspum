# QA producto y aprendizaje · Agujeros negros

Fecha: 2026-11-02. Responsable: agente independiente `retos_agujeros`. Base inicial: e2e07a7, público `https://www.spumexp.lat/`. Navegador Chrome, CUA, 390×844; ninguna inyección de estado ni ejecución de funciones privadas.

## Estado de cobertura

| Laboratorio                            | Retos con correcto/incorrecto/incompleto probados | Estado                                                                 |
| -------------------------------------- | ------------------------------------------------: | ---------------------------------------------------------------------- |
| Lente gravitacional                    |                                               4/4 | APROBADO producto y aceptación del candidato local                     |
| Acreción                               |                                               4/4 | APROBADO producto y aceptación del candidato local                     |
| Horizonte                              |                                               4/4 | APROBADO producto y aceptación del candidato local                     |
| Hawking                                |                                               4/4 | APROBADO producto; motor sin cambios y regresión compartida comprobada |
| Entropía                               |                                               4/4 | APROBADO tras corregir y repetir el acceso a pasos                     |
| Curva de Page, ampliación asignada     |                                               4/4 | APROBADO producto y aceptación local1027                               |
| Contar información, actividad auxiliar |                                               4/4 | APROBADO producto y aceptación local1027                               |

QA científico corresponde a una revisión independiente separada. No se atribuye a este pase una certificación científica ni eficacia educativa con estudiantes.

Total de este agente: **28/28 retos** con caso correcto, incorrecto e incompleto real de navegador. Los cinco laboratorios de agujeros negros se probaron inicialmente en producción e2e07a7; Page y las cuatro preguntas de CountingBridge en el candidato1027. Se repitieron en1027 las correcciones de texto, scroll y semántica de huella histórica, sin modificar modelos ni evaluadores. La versión final de publicación se vincula desde el cierre del coordinador.

IDs estables: `${ruta}/principal/reto-01` a `reto-04` para las seis rutas canónicas y `contar-informacion/principal/reto-01…04` para el puente. La matriz externa `qa-agujeros-coverage.json` enlaza cada ID con los labels concretos de sus observaciones en `qa-agujeros-cases.json`.

## Lente gravitacional

IDs: `bend`, `ring`, `capture`, `mass` de `src/lente/learning.ts`. En cada reto se abrió el selector junto a la escena, se observó la instrucción sin predicción, se eligió una respuesta incorrecta y se realizó la condición; después se corrigió la predicción y se leyó «Descubrimiento comprobado».

- `bend`: quitar lente con fuente/cámara intactas produce devolución de revisión para «Solo brillo» y éxito para posición/forma. Reactivar lente retira el éxito vigente y vuelve a pedir la comparación; la huella histórica se conserva como tal.
- `ring`: alinear fuente0° produce revisión de «desaparece» y éxito de anillo. Desalineación0,1° sigue dentro de tolerancia;0,2° ya vuelve a pedir la observación. No se confundió un píxel del marcador con una fuente física.
- `capture`: rayo3° alcanza horizonte; incorrecta «siempre atraviesa» recibe revisión. Volver al rayo14° retira el éxito vigente y muestra el escape calculado.
- `mass`: masa1→2, distancias fijas. Se esperó la desaparición de «Actualizando el modelo» antes de evaluar: la UI conserva el cálculo anterior mientras integra. Incorrecta «nada» recibe revisión; correcta crecimiento de horizonte/sombra recibe éxito.1,99× no satisface el objetivo de duplicar, conforme al umbral implementado.

Fricción observada: el paso faltante del reto `mass` repite que las distancias se conservan, sin nombrar el objetivo de masa4→8millones. Con7,96millones el mensaje no dice qué ajustar. Propuesta remitida al coordinador: nombrar masa de referencia y objetivo, además de conservar las otras variables. Condición de aceptación: alguien puede identificar la acción pendiente leyendo la línea «Probá» sin ir a buscar la consigna superior.

**Corregido y aceptado en1027:** el paso indica «Llevá la masa de 4 a 8 millones M☉» y conserva la condición de distancias fijas. Con2× se completa; con1,99× vuelve a pedir el objetivo explícito de8millones. En667×375 se mantuvo el diagrama visible y sin desbordamiento horizontal.

El árbol de accesibilidad incluye el texto alternativo «WebGL no disponible» dentro del `<canvas>`; su rectángulo es0×0. No se tomó como fallo visible: las capturas muestran el render. En la evidencia se llama `canvasAlternativeTextPresent`; indica presencia de texto alternativo, no un fallo de WebGL.

Evidencias externas: `../qa-integral-retos-2026-11-02/qa-agujeros-cases.json`, `lente-390-mass-correcta.jpg`, `lente-390-ring-limite.jpg`.

## Límites

Safari y teléfonos físicos pendientes por falta de acceso, conforme a la instrucción del usuario. Una ventana móvil de Chromium no prueba gestos táctiles físicos. La cobertura y el estado se actualizan por lote; no se aprueban los retos aún pendientes por leer sus tests.

## Hawking

IDs del código `mass`, `bath`, `time`, `entropy`; IDs de inventario `hawking/principal/reto-01…04`. Los cuatro recibieron respuesta incorrecta y cambio exigido, devolución de revisión, corrección de predicción y éxito. El intento sin predicción conserva instrucción inicial. Se probaron masa1→2, vacío→fondo a masa solar fija, edad0→75% y área conmasa doble.

El umbral temporal se contrastó con el deslizador real desde0:24,5% mantiene paso pendiente y25% lo completa. Volver a la referencia retira éxito vigente. Se reiniciaron los cuatro retos desde sus pasos: predicción vacía y condiciones de referencia restauradas, con la huella histórica preservada. No se confundió la absorción entrante del fondo con la emisión.

## Entropía

IDs `area`, `quarter`, `evaporate`, `total`; inventario `entropia/principal/reto-01…04`. Los cuatro pasaron respuesta incorrecta→observación→revisión→correcta→éxito. Las respuestas incorrectas elegidas cubrieron volumen asociado, bits frente a S/kB, entropía lineal al perder masa y suma sólo del horizonte. La escena y las lecturas concuerdan con el tipo de comparación; la lupa se identifica como ejemplo aparte.

Límites:19,9M☉ no completa duplicación;20 sí.12ℓP² no completa la lupa;16 sí.22,5% de masa emitida no completa el objetivo;25 sí. Retirar la radiación incluida retira el éxito vigente del reto total. Los cuatro reinicios restauraron el estado y la predicción, conservando historia.

**P2 de producto remitido:** al hacer clic sobre «Pasos del reto y referencia» desde controles, el autoscroll centró el summary en y439–483, detrás del readout del visor sticky. `elementFromPoint` en su centro devolvió `.en-map-readout`, y el clic no abrió el details. «↑Pregunta» permite volver a verlo en y724–768, y Enter sobre el summary sí lo abre; no es bloqueo total. El coordinador incorporó summary y enlaces al contrato de scroll-margin y solicitó retest1027. Evidencia previa: `entropia-390-summary-detras-visor.jpg`.

**Corregido y aceptado en1027:** repetidos «Jugar»→control de masa→clic en summary, el desplegable se abrió por puntero. Quedó en y661–705, con scroll-margin445px y `elementFromPoint` devolviendo el summary real. «Reiniciar este reto» quedó accesible y restauró masa10 y predicción vacía. Evidencia: `entropia-local-390-summary-corregido.jpg`.

## Acreción

IDs de inventario `acrecion/principal/reto-01…04`, índices0…3 de `src/acrecion/learning.ts`. Los cuatro pasaron correcta, incorrecta e incompleta, con comprobación explícita desde la consola junto al visor:

1. Sin gas→60%: discrimina luz del gas exterior frente a brillo del interior. Un solo estado no habilita comprobar.59% no completa el paso y60% sí.
2. Inclinar70° con gas, comparar luz curvada y recta: registrar sólo una condición deja el otro paso pendiente. «Cúpula material» recibe revisión; luz curvada recibe éxito.
3. Movimiento relativista a70° y de frente0°: falta una vista hasta compararlas ambas. «Ambos por igual» recibe revisión y «se acerca» éxito.
4. Estrella a radio fijo100UA, masa4→8millones: respuesta período duplicado recibe revisión y1/√2 éxito. Reinicio retira predicción/observaciones. En intento nuevo7,8 no satisface el umbral;7,9 sí, según la tolerancia implementada. Volver a7,8 después de haber observado8 conserva esa observación histórica del mismo ensayo, no una medición nueva; no se llamó fallo del evaluador.

Claridad no bloqueante remitida: Mission superior puede decir «Reto completado» por huella histórica aunque el intento actual esté vacío; la guía inferior dice «HUELLA GUARDADA». Conviene distinguir claramente «ya lo exploraste antes» de un resultado del intento actual. No se atribuyó una falsa aprobación al evaluador a partir de este rótulo.

**Corregido y aceptado en1027:** completar el reto1, recargar y abrir otro intento muestra «Huella guardada. Podés repetir este reto para contrastar una nueva predicción». Repetir la comparación con una predicción incorrecta conserva la devolución de revisión y retira cualquier mensaje de éxito vigente. Los cuatro reinicios se comprobaron también en el candidato; restauran predicción y marcas del ensayo, no borran el pasaporte.

## Horizonte

IDs de inventario `horizonte/principal/reto-01…04`. Los cuatro se recorrieron a390×844 con comprobación explícita:

1. Reloj sostenido: 4 rₛ → 1,2 rₛ. «Se rompe» recibe revisión; «más lento respecto de la antena» recibe éxito. El estado inicial sólo acredita la observación lejana, no toda la comparación.
2. Caída libre: visitar el horizonte deja pendiente «Un poco adentro» y no habilita comprobar. A 0,8 rₛ, la respuesta de tiempo propio infinito se rechaza; tiempo finito se acepta. El reloj del cruce mostró 183,9 s con la masa elegida.
3. Envío a 3 rₛ y a 1,05 rₛ. El primer envío no completa el reto. «Más juntos y azules» recibe revisión; «más separados y menor frecuencia» recibe éxito. Se pausó después de cada envío para poder leer las tarjetas; la emisión se registra en la posición del envío aunque el mapa continúe después.
4. Enviar desde 1,2 rₛ y desde 0,8 rₛ deja pendiente la recepción exterior. «Comprobar» seguía deshabilitado hasta usar «Recibir el pulso exterior». Entonces la respuesta «basta con que sea brillante» recibió revisión y la imposibilidad causal recibió éxito. La tarjeta interior indica «Sin recepción posible»; la exterior tiene demora y frecuencia, no salida instantánea.

Los cuatro reinicios se repitieron en1027 a320×740: se borraron envíos/predicción y se restauró la posición inicial. En1280×900, el acceso «↑Pregunta» con layout estable deja la pregunta debajo del stage, sin intersección. Se observó un borde al pasar inmediatamente de320 a1280 con pasos abiertos: una primera alineación podía conservar scroll anterior, recuperable con una nueva pulsación de «↑Pregunta». No se tomó como evidencia suficiente para rehacer la grilla ni como bloqueo permanente de escritorio. Las capturas permiten identificar el estado transitorio; Safari/físicos siguen pendientes.

## Curva de Page

IDs `curva-de-page/principal/reto-01…04`, candidato1027,390×844. En cada uno se observó el estado sin predicción, un intento incompleto, una predicción incorrecta con todas las observaciones, y su corrección hasta «Descubrimiento comprobado».

1. Inicio 0 / primer qubit 1: una parte puede ser mixta aunque BR siga puro. Visitar sólo 0 deja pendiente el qubit 1.
2. Mitad 3 / final 6: falta la media de Page hasta activarla. La respuesta de crecimiento indefinido recibe revisión y la vuelta a cero recibe éxito.
3. Final 6 con referencia independiente apagada/encendida: una sola cuenta no completa el contraste. Se rechaza que las dos cuentas coincidan y se distingue hipótesis independiente de estado puro calculado.
4. Final 6 como conjunto/por separado: falta una inspección hasta compararlas. «Mirar con más atención» se rechaza; correlaciones entre partes se acepta.

«Otra preparación pura» retira el éxito y borra observaciones previas. Cambiar N de 6 a 5 vuelve pendiente el requisito «Usar un montaje de 6 qubits». Reiniciar vuelve a 6 qubits y 0 en R, sin restaurar observaciones antiguas; conserva la predicción conforme al contrato de esta actividad. No se confundió esa predicción preservada con un resultado vigente.

## Contar información / CountingBridge

IDs `contar-informacion/principal/reto-01…04`, actividad auxiliar activa en `/entropia/#information-bridge`, candidato1027,390×844. No se cuenta como un laboratorio nuevo ni como un logro persistente del pasaporte de entropía.

1. Conocer todo: revelar 4 casillas muestra 1 configuración y H=0. «Dieciséis» se rechaza; incertidumbre cero se acepta. Volver a 3 reveladas retira el éxito y vuelve a pedir la cuarta.
2. Dos variables ocultas equiprobables: 4 configuraciones, H=2 bits. «Cuatro bits» se rechaza; log₂4=2 se acepta. Cambiar probabilidad a 90 % retira el éxito del caso equiprobable y explica qué condición falta.
3. De 50 % a 90 %, manteniendo 2 variables ocultas: siguen 4 posibilidades y H pasa de 2 a 0,938 bits. «Solo importa contar» recibe revisión; menor incertidumbre recibe éxito. El estado sólo uniforme no satisface el objetivo de 90 %.
4. Comparación con horizonte: antes del botón de comparar se pide esa acción. La afirmación de foto de bits del horizonte se rechaza; modelo de información no observado se acepta. Cambiar a otra pregunta y volver reinicia predicción/comparación; no se recicla el «ya comparado» anterior.

Las cuatro tienen mini registro/lectura y acciones de comparación junto a la pregunta. El selector reinicia cada pregunta; no se ofrece un botón de reset separado que se haya omitido de la prueba.

## Atlas auxiliar y cierre

Se probaron los presets 5, 10 y 20 M☉ de `/agujeros-negros/` a 390×844. Respecto de 10 M☉, se observaron radios ×0,5/1/2, temperaturas ×2/1/0,5 y entropías ×0,25/1/4. Las cinco piezas del atlas cambian su explicación y enlazan a los cinco laboratorios correctos y fuentes específicas. Evidencia: `qa-atlas-agujeros.json`.

No quedan bloqueantes de producto abiertos dentro de esta cobertura. La matriz no sustituye QA científico ni pruebas en dispositivos físicos. El coordinador debe vincular estos resultados al commit integrado y su publicación, y reabrir los casos afectados si cambia la implementación después de este pase.
