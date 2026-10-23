# Gestos sobre la escena y pruebas pendientes en Safari

Revisión del 23 de octubre de 2026.

## Alcance real de la verificación

**Safari y teléfonos físicos no se probaron.** La sesión corre en Windows y el inventario de navegadores accesibles solo ofrece Chromium. No se encontró un teléfono accesible en el inventario local; la consulta de dispositivos Android no pudo ejecutarse porque ADB no está instalado. La búsqueda de una integración para BrowserStack/Sauce Labs no devolvió una capacidad utilizable en esta sesión. Ninguno de esos resultados certifica compatibilidad ni incompatibilidad de SPUM con un dispositivo.

No se instaló un navegador antiguo para Windows ni se cambió el identificador del navegador para presentar emulación como Safari. Para cerrar la solicitud hace falta acceso a un Mac/iPhone y a un Android, o una sesión de pruebas remotas con dispositivos reales.

| Entorno | Estado | Qué demuestra |
| --- | --- | --- |
| Safari en macOS | Pendiente de acceso | Nada comprobado en este motor |
| Safari en iPhone/iPad físico | Pendiente de acceso | Nada comprobado sobre tacto, barras del navegador o área segura |
| Chrome en Android físico | Pendiente de acceso | Nada comprobado sobre tacto físico |
| Chromium de la app, 390 × 844 y 667 × 375 | Revisado | Entrada de ratón, acciones de escena y distribución en tamaños emulados |
| Pruebas unitarias del manejo de punteros | Aprobadas | Secuencias de eventos con identificadores diferentes, cancelación y pérdida de captura; no eventos producidos por hardware |

## Fallos de código encontrados y corregidos

1. **Hawking aceptaba otro dedo durante un arrastre.** El mapa no comprobaba `isPrimary` ni conservaba la identidad del puntero propietario. Un segundo contacto podía reemplazar el inicio, mover la vista o cerrar el gesto del primero.
2. **Una cancelación ajena podía interrumpir un mando.** Los dos manejadores compartidos de arrastre limpiaban el gesto ante cualquier `pointercancel` o `lostpointercapture`, sin comprobar el identificador.
3. **Hawking no limpiaba la vista al perder captura.** Después de una pérdida de captura, la referencia de arrastre podía seguir activa. Ahora una cancelación o pérdida de captura del propietario termina el gesto sin interpretarlo como una selección informativa.
4. **La geometría del tren requiere el mismo cuidado.** El pasajero conserva la escala del vagón que existía al iniciar su propio gesto. Liberar o cancelar otro contacto no debe borrar esa referencia.

Eran defectos anteriores de la lógica de entrada. Se unificó el ciclo de captura en `usePointerDrag`, empleado por los mandos SVG, los mandos sobre imágenes y el mapa de Hawking. El primer puntero primario posee el gesto; los otros no pueden modificarlo ni cancelarlo. Se procesa la posición final antes de liberar la captura. El tren prepara y limpia su geometría dentro de ese ciclo, sin duplicar los manejadores.

Hawking conserva `touch-action: pan-y` y no cancela el comportamiento predeterminado al comenzar: el desplazamiento vertical de página sigue siendo una responsabilidad del navegador. Los mandos pequeños conservan su área de arrastre específica; el resto de la escena permite desplazarse. Se siguió la distinción entre captura, cancelación y desplazamiento de la [especificación W3C de Pointer Events](https://www.w3.org/TR/pointerevents3/). Esto es una decisión de implementación, no el resultado de una prueba táctil en Safari.

No se agregaron dependencias, cambios de fórmulas, requisitos de retos ni modificaciones del progreso guardado.

## Comprobaciones ejecutadas

- **321 pruebas automáticas aprobadas**, incluidas siete nuevas del ciclo de gestos. Prueban segundo dedo, otro dispositivo primario, cancelación, pérdida de captura, recuperación, captura fallida y conservación del comportamiento predeterminado del mapa. Se ejecuta el hook real con registros de eventos y un destino de captura de prueba; no se emula un teléfono físico.
- Lint, TypeScript y compilación de producción correctos.
- **13 acciones de escena en el navegador:** los doce capítulos, más el ejemplo algebraico de entropía. Se arrastraron los objetos con el ratón, se soltaron las pelotas del ascensor y se movió, seleccionó y cerró información del mapa de Hawking. Se comprobaron los valores visibles resultantes y el visor. En el reloj se apuntó al tramo real de la trayectoria: el centro de la caja geométrica de una línea quebrada no siempre pertenece a la línea.
- **48 comprobaciones de distribución sobre la compilación de producción:** controles y pregunta de los doce capítulos a 390 × 844 y 667 × 375. Se comprobó que el visor esté dentro de pantalla y que el centro de la escena y del control o predicción activos no esté tapado por otra capa. Eso no garantiza por sí solo que todas las áreas de todos los gestos sean cómodas para un dedo.
- Evidencia compacta: `research/interaccion/touch-review-2026-10-23.json`.

## Prueba que falta hacer en equipos reales

Registrar modelo, sistema, versión del navegador, orientación y tamaño de texto. Mantener el zoom de accesibilidad disponible.

1. En cada capítulo, arrastrar el objeto indicado con un dedo y soltar fuera del área inicial. Confirmar que cambia la lectura física correspondiente y que deja de cambiar al levantarlo. En el ascensor, tocar una pelota para soltar ambas.
2. Desplazar la página desde una zona de fondo. En Hawking, comparar movimiento horizontal del mapa y desplazamiento vertical. Ninguno debería dejar el gesto enganchado ni abrir una ficha al terminar un arrastre.
3. Durante un gesto, apoyar accidentalmente otro dedo y retirarlo. El contacto ajeno no debe apropiarse del mando. Interrumpir un gesto con desplazamiento del navegador o cambio de orientación y comprobar que se puede iniciar otro después. La respuesta nativa a esos casos sigue pendiente de observación.
4. Abrir una ficha, cerrarla, elegir una predicción y usar «Probar en la escena» y «↑ Pregunta». Confirmar que el control activo y el experimento se ven y se pueden tocar; repetir con las barras del navegador expandidas y contraídas, y en horizontal con área segura.
5. Completar un reto por capítulo sin ayuda externa; comprobar que se exige la observación y la explicación correctas. Para una certificación completa, recorrer los cuatro retos de cada capítulo.

No marcar estas filas como aprobadas hasta contar con observación del dispositivo o evidencia de una sesión remota identificada.
