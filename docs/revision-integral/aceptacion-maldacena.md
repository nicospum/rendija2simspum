# Aceptación cruzada de producto: Maldacena

Fecha: 2 de noviembre de 2026. Revisor independiente del lote implementado por root: `retos_agujeros`.

**Resultado: aprobado para los cuatro bloques revisados, sin un defecto nuevo confirmado.** Esta aceptación contrasta la evidencia completa de root con una muestra independiente ejecutada en navegador. No constituye una segunda repetición completa de los 16 retos ni una evaluación con participantes principiantes.

## Versión y método

- Candidato local `http://127.0.0.1:1027`, base `e2e07a70310af0965e571187f51d4869bafb3a8a`, con las correcciones compartidas del lote en curso. No se modificaron fórmulas ni evaluadores de Maldacena durante esta aceptación.
- Chrome, pestaña propia, viewport emulado de **390 × 844**. Acciones reales mediante CUA; lectura DOM únicamente para registrar texto, números, geometría visible y desbordamiento. No se invocó lógica privada de la aplicación.
- Se inspeccionaron los cuatro archivos `*-product-results.json` de root: contienen cuatro IDs estables por bloque, casos sin predicción, incompletos, incorrectos y correctos. Geometría, diccionario y temperatura registran reinicio por reto; entrelazados registra además `resetBoundary`.
- Se repitió independientemente **un reto por bloque**, con abrir → comprender → intervenir → comparar → responder mal/bien → reiniciar, junto con el límite relevante. Se guardaron **16 estados propios**. Los cuatro enunciados y los resultados incorrectos/correctos coinciden con la evidencia de root; ninguno de los estados propios presenta desbordamiento horizontal.

## Muestra independiente

| ID estable | Acciones y límite probado | Resultado observado |
| --- | --- | --- |
| `entrelazados/principal/reto-03` | Bell y mezcla clásica en Z/Z y X/X; muestra de un par frente a 200 pares; respuesta indistinguible y luego distinguible. | Un par no satisface la comparación. La tabla distingue 100 % frente a 50 % previstos en X/X; una muestra de mezcla produjo **49,5 %**, sin exigir que el muestreo coincida exactamente con el promedio. La respuesta incorrecta pide revisar la comparación y la correcta confirma el descubrimiento. Reiniciar borra las cuatro mediciones y los logros del intento actual. |
| `holografia/geometria/reto-01` | Comparar recta y geodésica con ℓ=2, ε=0,2; elegir recta y luego arco; reiniciar y medir con ℓ=3. | Hace falta medir ambos caminos antes de resolver. Para la referencia muestra **4,625 L** frente a **10 L**. La medida con otra longitud no reutiliza la observación de referencia ni completa el reto. |
| `holografia/diccionario/reto-03` | Registrar ε=0,3 y ε=0,03; predecir igualdad exacta y luego error menor. | La primera medida deja pendiente la segunda. El residuo visible baja de **0,43553 nats** a **0,0045 nats**. La devolución distingue el corte finito del límite asintótico. Reiniciar restaura el corte grueso y ambas observaciones pendientes. |
| `holografia/temperatura/reto-04` | T=0,08 y T=0,16 con ℓ=2; trasladar erróneamente la regla de Schwarzschild y luego elegir radio areal doble; reiniciar y llegar a T=0. | La primera temperatura sola no completa el reto. El panel distingue la coordenada **zₕ**, que disminuye, del radio físico **r₊/L**, que aumenta; explica que BTZ no usa la regla térmica de Schwarzschild. La respuesta correcta confirma la comparación. Tras reiniciar no quedan observaciones válidas y T=0 muestra **«Vacío: sin horizonte a z finito»**, con radio y masa cero, sin NaN. |

El registro preserva la predicción tras reiniciar, pero elimina las observaciones y el éxito del intento actual. Eso permite volver a poner a prueba una idea sin fingir que ya se repitió la medición.

## Escena, lenguaje y continuidad

- Se pudo volver desde los controles a la pregunta con **↑ Pregunta**, manteniendo accesible el visor y la predicción en el ancho móvil. Los pasos y el reinicio del reto siguen disponibles; no se encontró un bloqueo del experimento por una superposición.
- La interfaz distingue mediciones aleatorias de valores previstos, nats de bits, el corte de regulación de una discrepancia física y las coordenadas de un radio físico. Se verificó que esas distinciones aparezcan en los textos y resultados utilizados, sin emitir aquí una nueva aprobación matemática.
- La introducción de holografía aclara que explorar una rebanada espacial de AdS no demuestra por sí mismo la dualidad y que AdS y de Sitter son distintos. El bloque térmico indica que usa unidades del modelo y estados BTZ, no grados Kelvin ni una simulación de evaporación.
- Se recorrieron los enlaces reales **Entrelazados → Geometría AdS → Dos lenguajes → Frontera caliente → Curva de Page**. Cada sección abrió la ruta esperada; Page terminó de cargar con su escena, controles y reto.

## Evidencia

Los archivos siguientes están en `../qa-integral-retos-2026-11-02` respecto de la raíz del repositorio:

- [Estados de esta aceptación](../../../qa-integral-retos-2026-11-02/aceptacion-maldacena-results.json).
- [Captura del visor térmico y reto en móvil](../../../qa-integral-retos-2026-11-02/maldacena-aceptacion-temperatura390.jpg).
- Evidencia de cobertura completa producida por root, contrastada con la muestra: [entrelazados](../../../qa-integral-retos-2026-11-02/entrelazados-product-results.json), [geometría](../../../qa-integral-retos-2026-11-02/geometria-product-results.json), [diccionario](../../../qa-integral-retos-2026-11-02/diccionario-product-results.json) y [temperatura](../../../qa-integral-retos-2026-11-02/temperatura-product-results.json).

## Límites

Esta ronda acepta el candidato local, no prueba por sí sola que la misma versión esté publicada. La comprobación posterior al despliegue corresponde al cierre de root. La validación científica fue realizada en una revisión separada. No hubo Safari, teléfonos físicos ni una prueba de comprensión con personas sin conocimientos previos; esas comprobaciones siguen pendientes por falta de acceso a equipos, según lo ya acordado con el usuario.

No se cambió código de producto, ni se publicó ni se creó un commit desde esta revisión.
