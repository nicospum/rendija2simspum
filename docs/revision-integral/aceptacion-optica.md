# Aceptación independiente de los dos laboratorios ópticos

Responsable: `ciencia_integral`, en un pase de producto separado del dictamen científico. Fecha: 2026-11-02. Entorno: Chrome mediante CUA, pestaña propia del candidato local `http://127.0.0.1:1027/`, viewport **390×844 CSS px**. Es emulación de tamaño: no Safari ni teléfono físico. Se aplicó la skill `game-playtest`; las interacciones se hicieron mediante UI y las lecturas de DOM fueron de sólo lectura.

## Estado del ciclo

**APROBADO producto y aceptación independiente para Prisma y Doble rendija**, sobre `e2e07a7` más el lote UX-05 y la flecha contextual final del enlace de acumulación, servido por Vite 6.4.5 en `1027`. Se repitieron los ocho controles activos a 390×844 y muestras a 320×667 y 667×375. El defecto de contexto encontrado en la primera pasada se resolvió colocando la comparación calculada junto al control activo.

La escena 3D se ve y es accesible por «Visor», pero no permanece visible al desplazar controles o leer la comparación completa. La mejora aprobada mantiene **control, referencia y consecuencia visibles juntos**, mediante un esquema o gráfico compacto. No corresponde describir este diseño como «escena 3D siempre visible».

Plan revisado y aprobado antes de implementación: reutilizar la referencia y lectura actual, con comparación compacta junto al control del reto. Sin nuevo modelo, estado de referencia, evaluador ni cambio de condiciones físicas. Conserva comparación completa, visor y acceso libre. Se inspeccionaron los nueve archivos de representación del lote y se repitieron los cuatro controles activos por laboratorio después de implementarlo.

La ayuda tiene contrato de **inspector**: con el modo activo, tocar un control muestra su explicación y no modifica el experimento. Su salida es visible y recupera inmediatamente la manipulación. Este comportamiento deliberado no se considera fallo, pero no se presenta como manipulación simultánea con la ayuda activa.

## Cobertura y evidencia anterior al ajuste de contexto

Los registros de root se leyeron completos antes de la aceptación: [Prisma, cuatro retos](../../../qa-integral-retos-2026-11-02/prisma-product-results.json) y [Doble rendija, cuatro retos](../../../qa-integral-retos-2026-11-02/doble-product-results.json), obtenidos en el build local `1028`, viewport 390×844. Incluyen casos válidos, inválidos, incompletos y estados sin señal. Este pase independiente complementa esos ocho recorridos; no afirma haber repetido todas sus combinaciones exhaustivamente.

**Distinción necesaria:** los ocho retos ópticos son predicciones abiertas y comparaciones de montajes; no tienen selector de respuestas. «Válido» significa que se conserva la referencia y cambia la condición indicada; «inválido» significa referencia perdida, otra variable alterada o falta de señal. No se inventó un quiz ni un resultado de aprobación de una predicción escrita. En Doble rendija, acumular eventos habilita comparar frecuencias: el contador no certifica concordancia estadística con la teoría.

| Laboratorio | Recorrido independiente ejecutado | Resultado observado |
|---|---|---|
| Prisma | Catálogo → entrada Prisma → iniciar primer reto → «Probar este cambio» → reiniciar. Después elegir Brillo, cambiar intensidad, apagar fuente, volver a comparación y reiniciar. | Dirección 16°→0° produce espectro y Δz=0,114 u. En Brillo, la comparación 35→90 % conserva Δz y desviación 38,70°. Fuente apagada presenta «Primero necesitás luz», lectura actual ausente y referencia conservada. Reiniciar restaura intensidad 35 % y fuente encendida. |
| Doble rendija | Catálogo → entrada Doble rendija → primer reto → acumular 1600 → gráfico. Elegir Separación, cambiar λ como intento inválido → leer feedback → reiniciar → «Probar este cambio» → reiniciar. | Un punto se distingue de la distribución de 1600. Cambiar λ 0,050→0,055 u pierde referencia e indica cómo corregir. Tras reinicio, cambiar sólo d 0,30→0,45 u conserva λ y compara Δz 0,583→0,389 u con dos corridas de 1600. Reiniciar devuelve d=0,30 u. Gráfico y leyendas son legibles. |

En Prisma se activó el inspector de ayuda sobre Intensidad, Fuente y enlace de comparación. Las explicaciones aparecieron; el valor no cambió durante la inspección. Tras «Modo ayuda · salir», ArrowRight cambió intensidad 35→36 % y el switch apagó la fuente. En Doble rendija, ayuda sobre «Reiniciar» explicó el montaje sin modificar d=0,45; salir y pulsar de nuevo lo restauró a 0,30. No hubo un bloqueo persistente ni pérdida de acceso al botón de salida.

Capturas independientes anteriores al ajuste, guardadas fuera del checkout:

- [Prisma: referencia y resultado](../../../qa-integral-retos-2026-11-02/aceptacion-prisma-comparacion-390.jpg).
- [Prisma: fuente apagada](../../../qa-integral-retos-2026-11-02/aceptacion-prisma-sin-luz-390.jpg).
- [Doble rendija: gráfico de frecuencias](../../../qa-integral-retos-2026-11-02/aceptacion-doble-grafico-390.jpg).
- [Doble rendija: referencia perdida](../../../qa-integral-retos-2026-11-02/aceptacion-doble-invalida-390.jpg).
- [Doble rendija: comparación válida](../../../qa-integral-retos-2026-11-02/aceptacion-doble-comparacion-390.jpg).

## Revisión del inventario y del informe

El script `inventario.mjs` se inspeccionó: lee los arrays autorales mediante AST de TypeScript y no ejecuta TSX. Los retos ópticos no tienen campo `answer`. Tras la recomendación, el inventario regenerado marca explícitamente sus ocho IDs como `open-comparison`; distingue además 72 `choice-observation` y una pregunta `choice-knowledge`. No trata la ausencia de selector óptico como un control faltante. Las evidencias existentes describen correctamente esa diferencia en `kind` y en sus resultados; el registro general `hallazgos.md` también la declara. El informe general de producto final deberá conservarla.

## Aceptación posterior al ajuste

| ID | Manipulación independiente a 390×844 | Lectura y efecto comprobados junto al control | Resultado |
|---|---|---|---|
| `prisma/principal/reto-01` | Dirección 16°→0° mediante el slider | Referencia blanca; banda actual dispersa; Δz=0,114 u, desviación 38,70°. El aviso conserva que el esquema compara posiciones y no brillo. | APROBADO |
| `prisma/principal/reto-02` | Intensidad 35→100 % | Δz=0,114 u y 38,70° se conservan, cambia la lectura de brillo. Cambiar también dirección produce «Cambió más de una variable»; apagar la fuente elimina banda y medidas actuales y dice «Primero necesitás luz». | APROBADO |
| `prisma/principal/reto-03` | Distancia 3,2→4,2 u | En vivo Δz pasa 0,114→0,154 u, sin cambio angular. Congelada conserva 0,114 y avisa; aplicar/reanudar muestra 0,154. Reinicio devuelve 3,2 u. | APROBADO |
| `prisma/principal/reto-04` | Vidrio→Cuarzo en selector | Bandas en una misma escala, 0,114→0,080 u y 38,70→34,60°. Ayuda explica el material; salir permite elegir Acrílico y actualizar la lectura. | APROBADO |
| `doble-rendija/principal/reto-01` | Sumar 1600 desde el mini de emisión | N pasa 1→1601 con impactos nuevos. La leyenda separa barras/detecciones y línea/predicción; no se dibuja una falsa curva de referencia de un solo punto. Pausa conserva N y deshabilita sumar, con indicación de reanudar. | APROBADO |
| `doble-rendija/principal/reto-02` | d=0,30→0,45 u en slider; luego sumar | Δz calculada 0,583→0,389 u. Al cambiar geometría, N actual=0 y el mini dice que faltan datos. Después suma 1600 y permite comparar frecuencias con la referencia de 1600. | APROBADO |
| `doble-rendija/principal/reto-03` | Detector 0→100 %; luego sumar | Dice «sin franjas entre caminos», conserva difracción en el gráfico y diferencia la referencia del reto. Ocultar teoría elimina su línea/leyenda y dice «Predicción oculta»; restaurar la recupera sin modificar conteos. | APROBADO |
| `doble-rendija/principal/reto-04` | a=0,065→0,100 u con una rendija; luego sumar | Ancho central calculado 5,385→3,500 u. Alterar además λ elimina la corrida actual y declara referencia perdida; reiniciar restaura a=0,065 u y las condiciones del reto. | APROBADO |

En los ocho estados se comprobó **un solo grupo compacto** y **ningún ID duplicado**. El gráfico completo conserva una sola cabecera `chart-title`; el compacto tiene su propia etiqueta accesible sin duplicar ese ID. Los retornos al visor y la explicación siguen disponibles. Se comprobó en UI la última corrección de texto: acumulación enlaza «Ver la explicación completa ↓», porque allí el destino está debajo.

Las muestras a 320×667 cubrieron Prisma congelado y Doble rendija pausada: control, comparación y aviso son legibles. Las muestras a 667×375 no desbordan horizontalmente, pero requieren scroll vertical. En un punto de scroll, el botón flotante de ayuda coincidió con la banda «Ahora» del Prisma; un desplazamiento pequeño despejó la banda conservando visible el selector. No es contenido permanentemente oculto ni un bloqueo del recorrido. No se afirma que todas las lecturas y el gráfico entren simultáneamente en una altura de 375 px.

Se leyó el autoQA del implementador como contexto; los resultados de esta tabla proceden de acciones independientes en UI. Evidencia estructurada: [optical-mini-independent-acceptance.json](../../../qa-integral-retos-2026-11-02/optical-mini-independent-acceptance.json).

Capturas posteriores al ajuste:

- [Prisma: dirección y banda juntas, 390](../../../qa-integral-retos-2026-11-02/aceptacion-optica-prisma-direccion-390.jpg).
- [Prisma: material y comparación, 390](../../../qa-integral-retos-2026-11-02/aceptacion-optica-prisma-material-390.jpg).
- [Prisma: congelada, 320](../../../qa-integral-retos-2026-11-02/aceptacion-optica-prisma-congelado-320.jpg).
- [Prisma: horizontal después de desplazar, 667](../../../qa-integral-retos-2026-11-02/aceptacion-optica-prisma-horizontal-despejada-667.jpg).
- [Doble rendija: detector con gráfica, 390](../../../qa-integral-retos-2026-11-02/aceptacion-optica-doble-detector-390.jpg).
- [Doble rendija: pausa y emisión, 320](../../../qa-integral-retos-2026-11-02/aceptacion-optica-doble-pausa-320.jpg).
- [Doble rendija: retorno al visor 3D, 390](../../../qa-integral-retos-2026-11-02/aceptacion-optica-doble-retorno-visor-390.jpg).

## Revisión científica de la representación

`PrismControlComparison` reutiliza `ReadingComparison` y el mismo `describeLesson` de la comparación completa. Fuente apagada/intensidad cero vacían la señal observada, sin presentar rayos geométricos como luz visible. El esquema mantiene una escala común y declara el centrado y la ausencia de codificación de brillo.

`DoubleSlitControlComparison` reutiliza la lectura y el mismo `describeLesson`; `DistributionChart.compact` comparte conteos, distribución y referencia. Las barras y la referencia se normalizan por sus respectivos N, la teoría se agrega en los mismos bins y todos usan el mismo eje y escala dentro del gráfico. El compacto no introduce un patrón prefabricado, una medida nueva ni una certificación de convergencia. No cambia los modelos ni evaluadores aprobados. Se conservaron sus hashes anteriores; los nueve archivos de representación se registran separadamente en `qa-ciencia-estado.json`.

Fuentes científicas vigentes: S02 para refracción/dispersión y S03 para amplitudes, probabilidades y detecciones; no se añadió una ecuación ni se precisó una referencia científica nueva para este ajuste de presentación. La aprobación científica es independiente de esta aceptación de producto, y continúa siendo una revisión interna documentada. Safari, teléfonos físicos, gestos en hardware real y eficacia con estudiantes siguen fuera de esta cobertura.
