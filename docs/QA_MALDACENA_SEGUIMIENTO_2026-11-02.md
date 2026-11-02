# Maldacena: segunda revisión de claridad y uso

Revisión nueva sobre el especial publicado en `spumexp.lat`, partiendo del commit `08d6b07`. Se mantuvieron las ecuaciones y las claves del pasaporte. Tres agentes repartieron revisión de claridad/cuántica, modelos/controles geométricos y uso móvil; probaron el producto además de leer el código. Los informes anteriores de construcción se conservan como registros históricos.

## Hallazgos de la versión de partida y cambios

1. **Una estadística conjunta aparecía al mirar una sola parte.** En «Solo A» o «Solo B» seguía mostrándose la coincidencia del par. Cambiar el analizador remoto modificaba ese número y podía sugerir un efecto local. La lectura local muestra ahora las probabilidades de esa parte; las coincidencias se identifican como una estadística del conjunto AB. Se comprobó la invariancia local al cambiar la base remota.
2. **Se exigía notación antes de explicarla.** Se añadieron ayudas junto a los controles para A/B, 00, Z/X, Bell, mezcla, longitud ℓ, corte ε, nats, temperatura del modelo y coordenada frente a tamaño del horizonte. Las opciones de dualidad conectan el incremento con su valor numérico. La entrada al recorrido explica el orden de ideas y cómo usar una predicción; volver de las explicaciones conserva montaje y respuesta.
3. **La comparación registro/horizonte no mostraba evidencia antes de responder.** Ahora el botón abre la comparación explícita entre el registro clásico y la ley de área, sin atribuir a las casillas microestados físicos observados.
4. **La segunda vista de BTZ no se podía manipular sobre el dibujo.** El punto coral es ahora una manija de longitud con ratón y teclado. Ambas vistas usan el paso de 0,1 de la barra: se puede regresar exactamente a ℓ=2 después de explorar, evitando decimales residuales que no satisfacían las condiciones del reto.
5. **Los datos visibles no siempre respondían a la pregunta actual.** En geometría, ℓ y ε acompañan al mapa en una lectura HTML. En BTZ, las lecturas se adaptan al reto: profundidad frente al horizonte, pendiente térmica o radio físico y parámetro de masa. La pendiente solo se activa en su reto y abre la gráfica pertinente; salir de su temperatura desactiva esa comparación.
6. **El redondeo podía enseñar una conclusión incorrecta.** La curva próxima al horizonte y el horizonte se mostraban ambos como 0,66, aunque el reto distingue aproximarse de cruzar. Se aumentó la precisión y se muestra la separación positiva; T=0 tiene un mensaje específico. Las diferencias de corte positivas menores que la precisión se expresan como tales, sin fingir un cero exacto.
7. **Lectura y pulsación móvil.** Se ampliaron rótulos clave del mapa y las áreas de las manijas, se separó el extremo del eje de su número y se dio una altura mínima de 44 px a los desplegables de ayuda dentro de los controles. Los textos extensos permanecen fuera de la escena fija.

Al exponer los marginales en la lectura nueva se detectó un valor ligeramente mayor que uno por redondeo de punto flotante, cuyo complemento se veía como «−0 %». Se acotaron los marginales al intervalo físico [0,1] y se añadió una regresión. Los desplegables nuevos necesitaron el mismo margen de desplazamiento que los otros controles para que su foco no quedara detrás de la escena. Los enlaces de regreso también trasladan el foco al visor: el siguiente Tab entra en sus controles, conservando el montaje. Estos defectos se detectaron y corrigieron durante los cambios; los problemas de los puntos anteriores ya estaban en la versión de partida.

## Validación y evidencia

- [Claridad y cuántica](QA_MALDACENA_CLARIDAD_2026-11-02.md): comparación con la web publicada, código, cuatro retos cuánticos y cuatro preguntas de conteo, predicción incorrecta y lectura local frente al conjunto.
- [Geometría, dualidad y BTZ](QA_MALDACENA_MODELOS_2026-11-02.md): fórmulas, condiciones, doce retos, precisión y nuevos gestos.
- [Uso móvil](QA_MALDACENA_USO_2026-11-02.md): recorrido público, repetición local y escenas/controles/predicciones visibles en tamaños pequeños.
- El agente principal comprobó además que «Volver a mi escena y mi reto» conserva la longitud explorada, la predicción y el modo de reto. Se ejecutan la suite completa, lint, TypeScript y build de producción antes de publicar; el cierre de la entrega registra el resultado y contrasta los archivos públicos con el build.

**Cierre local:** 355 pruebas aprobadas, ESLint sin errores, TypeScript y build de producción correctos. El agente de uso repitió **96 estados** (cuatro capítulos, cuatro retos, dos posiciones de navegación en 390×844, 320×740 y 667×375) y **12 casos con las ayudas abiertas**. Todos conservan escena y objetivo accesibles, sin desbordamiento. Los otros agentes completaron de nuevo los 16 retos y las cuatro preguntas de conteo; se probaron respuestas incorrectas, registro de comparaciones, vuelta al visor amplio y los gestos modificados. [Resumen de evidencia](qa/maldacena-followup-2026-11-02.json).

La evidencia de esta ronda está fuera de Git en `.work/qa-maldacena-followup-2026-11-02/` y `.work/qa-maldacena-claridad-2026-11-02/`, bajo el espacio de trabajo exterior del proyecto de prisma. La nueva ronda no sustituye las evidencias anteriores ni afirma haber vuelto a recorrer los otros catorce laboratorios en navegador.

## Límites

Esta fue una revisión técnica y heurística desde la perspectiva de un principiante, no un estudio de comprensión con visitantes. Safari, teléfonos físicos y mediciones de rendimiento de GPU siguen pendientes. Los tamaños emulados permiten encontrar oclusiones y problemas de acceso, pero no certifican gestos táctiles reales. La comprensión final debe contrastarse observando a una persona nueva explicar qué cambió y por qué.
