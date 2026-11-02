# Revisión independiente de código del modo ayuda

Fecha: 2 de noviembre de 2026. Base revisada: `6939fd8`.

## Alcance y límites

Revisión del montaje del tutor, resolución de contenido, registro de escenas, captura de eventos, teclado, limpieza de efectos y posición de la tarjeta. Archivos principales: `src/education/*`, `src/components/ui/SceneConsole.tsx` y usos de controles SVG en los laboratorios.

Se comprobaron las rutas de los 17 laboratorios actuales, las tres secciones de Holografía y las tres rutas anteriores que se conservan. La ayuda queda limitada a laboratorios: no se monta en la portada ni en los índices de especiales. Se revisaron las explicaciones de los controles principales y las distinciones científicas entre ayudas gráficas, asas, partículas, coordenadas y magnitudes calculadas.

Este informe corresponde a código y pruebas de Node. La revisión visual de escritorio y de tamaños de celular está asignada por separado a los agentes de navegador; este documento no sustituye sus capturas ni prueba aprendizaje con participantes. Safari y teléfonos físicos siguen pendientes por decisión del usuario.

## Hallazgos anteriores a esta revisión

### 1. La protección de la escena sólo se aplicaba a consultas de proveedores 3D

En `HelpMode`, `protectedSceneRect` se utilizaba cuando el tip tenía `scene`. Las consultas sobre SVG o controles HTML sólo guardaban `entry` y `target`; utilizaban `helpPosition` y, en celular, una tarjeta fijada al borde inferior. Así las dos vistas de Einstein y las escenas SVG no tenían la misma protección que WebGL. Es un fallo de diseño confirmado en código; corresponde comprobar cada disposición en navegador.

Se comunicó al implementador principal, que asumió la corrección del contexto visual y del diseño. Este agente no modificó `HelpMode`, su CSS ni la política de posición.

### 2. Las teclas con modificadores eludían el bloqueo de controles

La captura de teclado retornaba ante cualquier Ctrl, Meta o Alt antes de comprobar si una flecha o Home/End cambiaba un control. Por tanto, la ayuda podía permitir una modificación mediante teclado mientras indicaba que sólo se estaba consultando. El agente principal confirmó en producción que Ctrl+ArrowRight cambiaba el reparto de Page de 0 a 1 y modificaba S(R), y asumió la corrección y su prueba de regresión.

### 3. Acciones del reto recibían explicaciones de la física de la escena

Reproducción en Node: «Tu predicción junto a la escena» y «Elegir reto junto a la escena» obtenían la descripción del canvas en los cinco laboratorios 3D. En «El tiempo tiene altura» recibían una explicación sobre los relojes; «Ampliar visor» en Mercurio recibía la explicación de la lupa de precesión. Además, «Comprobar explicación» no tenía coincidencia porque el texto común exigía «mi explicación».

Se corrigió `SceneConsole` con explicaciones explícitas para elegir reto, predecir, comprobar, ampliar, abrir/cerrar el reto, volver a la pregunta, volver a los controles y consultar los pasos. Estas explicaciones indican qué acción realiza la interfaz y distinguen el cambio de disposición de un cambio físico. El fallback reconoce ambas variantes de «Comprobar explicación».

### 4. cCFT quedaba atrapado por la búsqueda genérica de CFT

`helpForText('/dos-lenguajes/', 'cCFT=60')` devolvía la comparación genérica de dos cuentas sin explicar la constante. Ocurría también con la leyenda real «Misma escala: … nats. cCFT=60; G₃=…».

Se delimitó la palabra CFT para que no coincida dentro de cCFT. La leyenda recibe ahora la explicación de carga central, G₃ y nats; CFT como palabra independiente conserva la explicación de la comparación holográfica. No se cambiaron constantes, fórmulas ni resultados.

### 5. La acción de emisión de Page necesitaba una explicación inequívoca

Otro agente de navegador informó que al tocar «Emitir un qubit» en producción aparecía «Pureza del conjunto». La búsqueda aislada del texto del botón ya devolvía la explicación correcta en código, por lo que no se atribuyó sin evidencia a un error en las fórmulas ni al reparto del estado.

Se anotaron explícitamente los botones de emitir y devolver para explicar B→R, la conservación del estado puro completo y el cambio de S(R) al estudiar otra colección. El texto distingue el reparto abstracto de una emisión física de Hawking y el rebobinado de una absorción real. Se requiere la repetición visual de ese recorrido con el diseño corregido.

## Comprobaciones de código

- Las anotaciones explícitas tienen prioridad sobre los temas inferidos de la ruta. `data-help-scope` distingue la sección activa de Holografía.
- Las opciones de predicción no se presentan como respuestas correctas al consultarlas.
- Los proveedores de escena se retiran al desmontarse; los listeners globales y el RAF se limpian al desactivar el modo.
- El tutor conserva la referencia `aria-describedby` anterior y la restaura al retirar la consulta. La tarjeta y su cierre tienen etiquetas accesibles.
- Las explicaciones distinguen S/kB de bits, cCFT de c, la coordenada BTZ del radio areal y la entropía fina de Page de la cuenta térmica de radiación.
- No se modificaron física, condiciones de retos, almacenamiento de avances ni dependencias.

## Verificación ejecutada por este agente

`node --test tests/help-content.test.mjs`: 7 pruebas, 7 aprobadas. Incluyen el botón de Page, cCFT frente a CFT, la etiqueta «Comprobar explicación» y prioridad de ayudas explícitas frente a los temas amplios de escenas.

`eslint src/components/ui/SceneConsole.tsx src/education/helpContent.ts src/maldacena/page/PageLab.tsx`: aprobado.

La compilación completa y la suite global quedan a cargo del agente principal para validar el conjunto de cambios concurrentes. La repetición de QA visual debe incluir los selectores del reto y la predicción, el botón de Page, las teclas con modificadores y las consultas SVG con dos vistas visibles.

## Cierre de la revisión independiente

Revisado también el diff final del implementador principal en `HelpMode`, `helpPolicy` y sus regresiones. El contexto visual protege la unión de los renderers SVG/WebGL visibles; consultar un control HTML o un asa SVG no habilita por error la lista de objetos 3D.

La búsqueda de un visor visible cubre ahora los controles de Prisma y doble rendija, así como preguntas situadas fuera del contenedor del experimento. Se detectó y corrigió durante esta revisión un caso adicional: un icono SVG de 18×18 o un minigráfico no debe impedir buscar el visor principal. El código final comprueba tamaño y visibilidad del SVG/canvas cercano antes de aceptarlo; si no cumple, continúa con el visor visible.

También se revisó el bloqueo de Enter/Espacio con Ctrl, Meta o Alt en botones SVG. Las teclas de activación y de modificación de un control se consultan sin ejecutar el experimento; Tab y los atajos de copiar o del navegador siguen disponibles. Las regresiones cubren ambos grupos.

El nuevo indicador «✓ Resultado» depende de la verificación del reto y lleva a la pregunta, predicción y devolución del mismo ensayo. No altera variables ni reinicia la comparación.

Validación final de este revisor: 11/11 pruebas entre `help-content.test.mjs` y `help-policy.test.mjs`; lint de los cinco archivos de implementación afectados y `git diff --check`, aprobados. Los agentes visuales comunicaron repetición aprobada de Einstein, Prisma/doble rendija, Page, entropía y entrelazados; su evidencia y límites corresponden a `QA_AYUDA_EINSTEIN_2026-11-02.md` y `QA_AYUDA_RESTO_2026-11-02.md`.

**Dictamen de código: sin defectos bloqueantes pendientes en el alcance revisado; apto para publicar una vez aprobadas las comprobaciones globales del agente principal.** No se afirmó cobertura de Safari, dispositivos físicos ni pruebas de aprendizaje con participantes.
