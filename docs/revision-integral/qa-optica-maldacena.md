# QA de producto · Óptica y Maldacena

Responsable: coordinación (`root`). Revisión interna documentada del 2 de noviembre de 2026; base `e2e07a7`. Pruebas mediante la interfaz, CUA, en la compilación de producción local `1028`, con viewport 390×844 CSS px. No se invocaron evaluadores desde el navegador ni se alteró almacenamiento para aprobar retos.

## Cobertura primaria: 24 de 24

| Laboratorio / sección | Casos realizados en cada reto | Resultado |
|---|---|---|
| Prisma, 4 | Referencia sin modificar, cambio propuesto, fuente apagada, cambio de otra variable, reinicio. Se probaron además cambios pequeños y lectura congelada. | Los cuatro distinguen comparación válida, falta de luz y configuración incompatible. Son predicciones abiertas: no califican una respuesta elegida. |
| Doble rendija, 4 | Referencia, modificación válida, cambio adicional de λ, ausencia de datos, acumulación y reinicio. | No mezcla corridas de distinto montaje. Predicción sin datos no se presenta como evidencia; acumular no certifica convergencia estadística. |
| Entrelazados, 4 | Respuesta incorrecta, observación incompleta, completar la observación, respuesta correcta y reinicio. | Los cuatro exigen los registros correspondientes; una pareja no sustituye las 200 solicitadas, ni inspeccionar sólo A equivale a inspeccionar AB. |
| Holografía / Geometría, 4 | Elección incorrecta, parámetros sin registrar, registros requeridos, elección correcta y reinicio. | No basta mover un control sin medir. Se conserva la distinción entre arco espacial y luz. |
| Holografía / Diccionario, 4 | Elección incorrecta, comparación incompleta, ambos cortes/intervalos registrados, elección correcta y reinicio. | Mover el centro conserva la entropía del estado homogéneo; regulador finito y residuo no se confunden con igualdad exacta. |
| Holografía / Temperatura, 4 | Elección incorrecta, un registro faltante, dos registros solicitados, elección correcta y reinicio. | Se distinguen límite frío, régimen de intervalo largo y dependencia térmica; las observaciones faltantes impiden finalizar. |

IDs exactos y consignas: [inventario](inventario.json). Resultados por ID y revisión separada: [estado](estado.json).

## Observaciones numéricas y casos negativos

- Prisma: blanco→espectro produce Δz≈0,114 u; intensidad 35→90 % mantiene desviación≈38,70° y separación. Pantalla 3,2→4,2 u cambia Δz≈0,114→0,154 u. Vidrio→cuarzo cambia Δz≈0,114→0,080 u. Apagar la fuente elimina la lectura actual, conservando la referencia. Cambiar dos variables avisa que ya no se aísla el efecto.
- Rendija: separación 0,30→0,45 u cambia λL/d≈0,583→0,389 u; detector al 100 % elimina interferencia conservando difracción; ancho 0,065→0,100 u cambia el ancho central≈5,385→3,500 u. Modificar λ pierde la referencia; al reiniciar se recupera. El caso de acumulación distingue un impacto de 1600 sin declarar probada una ley por el contador.
- Entrelazados: se contrastaron producto, Bell y mezcla en Z y X. En el reto 3, registrar producto/Bell en Z y Bell en X no sustituye la mezcla en X. En el reto 4, ver A sin ver AB no completa el contraste. Una configuración próxima (θ=44° en lugar de 45°) tampoco sustituye un registro requerido de Bell.
- Holografía: se probaron intervalos, centros y cortes de las consignas; registros a ε=0,2/0,04, ε=0,3/0,03 y ε=0,1/0,02 según actividad. En temperatura se compararon T=0/0,16, intervalos 0,5/6 y 4/6 y el cambio T=0,08→0,16. Reiniciar borra observaciones aunque una predicción pueda permanecer seleccionada: no produce aprobación sin volver a observar.

## Corrección y aceptación del contexto móvil

La aceptación independiente detectó que, al bajar a los controles ópticos, no quedaba a la vista la comparación con la referencia. Se implementó una comparación compacta junto al único control activo del reto, reutilizando los mismos datos y gráfico. No se añadieron estado físico, evaluador ni respuesta automática.

La coordinación revisó el diff de los nueve archivos ópticos. Repitió en producción local intensidad 35→36 % y separación 0,30→0,31 u: referencia y lectura actual visibles, cero datos antes de emitir, 1600 después, sin IDs duplicados ni desbordamiento a 390 px. El agente independiente volvió a probar los ocho controles activos y estados inválidos, con muestras adicionales a 320 y 667 px: [aceptación óptica](aceptacion-optica.md). La escena 3D sigue siendo accesible por «Visor»; no se afirma que permanezca fija al recorrer toda la página.

Para Entrelazados y las tres secciones de Holografía, otro agente contrastó todos los registros primarios y ejecutó un reto completo por bloque, incluyendo acierto, error, observación incompleta y reinicio: [aceptación Maldacena](aceptacion-maldacena.md). Esto es aceptación independiente por bloque y revisión de los demás registros; no una segunda ejecución exhaustiva de las 16 combinaciones.

## Evidencia y límites

Artefactos locales fuera del checkout, conservados en `../qa-integral-retos-2026-11-02/` respecto de su raíz:

- `prisma-product-results.json`, `doble-product-results.json`.
- `entrelazados-product-results.json`.
- `geometria-product-results.json`, `diccionario-product-results.json`, `temperatura-product-results.json` y `holografia-vistas.json`.
- Capturas `prisma-retos-390.jpg`, `doble-retos-390.jpg`, `entrelazados-retos-390.jpg`, más las capturas de aceptación referenciadas en sus informes.

Se probaron también las vistas alternativas de Holografía y el desplazamiento del intervalo mediante teclado. El inspector de ayuda explica y evita la acción mientras está activo; salir recupera el control. Las comprobaciones de los retos se hicieron con el inspector desactivado. No se probaron Safari, teléfonos físicos, todos los lectores de pantalla ni eficacia de aprendizaje con participantes. Una captura inmediata a una acción puede preceder al siguiente render; las capturas finales se obtuvieron después de observar el estado estable.
