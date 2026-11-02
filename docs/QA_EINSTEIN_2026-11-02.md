# Control de calidad del especial Einstein

Revisión del 2 de noviembre de 2026. Ámbito: los siete laboratorios, sus modelos, criterios educativos, mandos directos y documentación. Esta revisión de agente usa código y pruebas; la revisión visual y del sitio publicado se realiza por separado en la tarea principal. No se ejecutaron Safari ni teléfonos físicos.

## Hallazgo corregido: condiciones ocultas en el ascensor

**Importancia media, existente antes de esta revisión.** Los retos 1 y 2 requerían un objeto de 2 kg y una intensidad de 9,81 m/s² en `learning.ts`, pero no nombraban todas esas condiciones. Los botones rápidos de 1 kg y 4 kg estaban disponibles en cualquier reto. Así, una exploración razonable podía impedir completar una comparación sin indicar el motivo.

Reproducción anterior: elegir el reto 1, predecir la respuesta correcta, cambiar a 1 kg, terminar el ensayo sostenido y terminar el ensayo de nave acelerada. Ambos producen 9,81 N y la misma caída relativa, pero no se registra ninguna observación del guion. En el reto 2 ocurre lo mismo al comparar sostenido, caída libre y deriva. La comprobación respondía solamente que faltaba una comparación.

Se hicieron explícitas las condiciones requeridas de los cuatro retos: instrumento, masa donde corresponde, intensidad, resultado final y, para la luz, ancho de 3 m y escala ampliada. No se relajaron las condiciones del reductor ni se cambiaron fórmulas. La lectura junto al visor incluye la masa actual del objeto y se agregó **«Usar condiciones del reto»**, que usa la acción `tune` existente para recuperar la referencia.

Ese atajo vuelve al inicio y pausa el ensayo, pero conserva la predicción, comparaciones válidas y logros ya obtenidos. Se diferencia de **«Reiniciar este reto»**, que prepara un ensayo educativo nuevo.

## Resultado por laboratorio

| Laboratorio | Resultado del código y las pruebas | Mejora útil posterior |
| --- | --- | --- |
| El reloj de luz | Las dos vistas representan el mismo evento transformado; velocidad y tiempo permanecen acotados; cuatro retos con condiciones y respuesta correcta. | Mostrar de forma contextual, al estar en reposo, que ida y vuelta coinciden espacialmente y que «Espejo/Regreso» distingue el tramo. La explicación ya existe en la ayuda. |
| El tren de Einstein | Se separan fechas de emisión y recepción; mover el pasajero cambia llegadas y reinicia el ensayo; la medición de longitud exige simultaneidad explícita. | Mantener visible qué sistema asigna cada fecha cuando se alternan las vistas; evaluar la legibilidad de Δt y de sus unidades junto al dibujo. No se detectó un fallo matemático. |
| Nos vemos a la vuelta | La suma del tiempo propio, la espera y el cambio de simultaneidad del giro pasan las comprobaciones; no se presenta el giro como envejecimiento instantáneo. | Una comparación visual de referencia entre los dos viajes de los retos 2 y 4 ayudaría a reconocer que la distancia del destino también cambia. Los textos actuales ya lo explican. |
| El ascensor de Einstein | Corregidas las condiciones ocultas y añadido el atajo de recuperación. Los cuatro retos siguen rechazando condiciones incompletas o respuestas incorrectas. | Prueba de uso con alguien nuevo para comprobar que distingue el objeto de la balanza de las dos pelotas libres. La ayuda actual hace esa distinción. |
| El tiempo tiene altura | Se separan ritmo diario, desfase acumulado, movimiento orbital y ajuste de la señal. Valores finitos en los extremos y cuatro retos verificables. | Comparación persistente de dos lecturas de referencia para diferenciar «más altura» de «más tiempo esperando». No es necesario cambiar el modelo. |
| La órbita que no se cierra | La precesión, el límite newtoniano y el aporte de Mercurio pasan las pruebas; la lupa cambia el dibujo, no el resultado físico. | Destacar aún más, junto al planeta, la diferencia entre fase radial explorada y tiempo uniforme. Ya existe la aclaración, pero el gesto puede sugerir un vídeo a velocidad constante. |
| Efecto fotoeléctrico | Umbral, energía máxima y corriente responden a frecuencia, potencia y material según el modelo. Registrar una medición es distinto de mover un control. | Observar en una prueba con participantes si «brillo = potencia» resulta claro al cambiar frecuencia; no equivale a mantener fijo el flujo de fotones. Los textos y el cuarto reto ya lo distinguen. |

Las mejoras de esta tabla son oportunidades didácticas, no defectos observados en usuarios ni funciones que se hayan implementado en esta revisión.

## Observaciones compartidas para la revisión visual

- El modo de jugar activa límites de altura reducidos para los SVG. El diseño anterior limita Einstein a 230 px en escritorio y 175 px en móvil; que el dibujo quede dentro de la pantalla no demuestra que sea suficientemente grande o legible. La tarea principal debe comprobar ocupación útil y textos, además de superposiciones.
- El acceso anterior al visor amplio estaba dentro de «Cómo jugar y qué cambia», después de los controles. Conviene que recuperar tamaño sea una acción fácil de descubrir. Se informó al agente principal para coordinar el ajuste compartido.
- `docs/RELOJ_DE_LUZ.md` todavía describe cuatro capítulos posteriores como propuestas, aunque el catálogo incluye siete disponibles. Es una inconsistencia documental de baja importancia, no un fallo de navegación del sitio.

## Validación

- Conjunto pertinente de Einstein y entrada compartida: **143 pruebas aprobadas** antes de aplicar la corrección.
- Ascensor después del cambio: **20 pruebas aprobadas**, con dos pruebas nuevas del atajo que restaura la referencia y conserva idea, observaciones y logros; incluye recuperación de masa, intensidad, instrumento, ancho y ampliación.
- La revisión de navegador, compilación completa y publicación corresponden al control final de la tarea principal. Las pruebas de lógica no certifican tamaños, colores ni comodidad táctil.

Archivos de la corrección: `src/ascensor/learning.ts`, `src/ascensor/App.tsx` y `tests/ascensor.test.mjs`. Sin dependencias nuevas ni cambios de fórmulas o de almacenamiento.
