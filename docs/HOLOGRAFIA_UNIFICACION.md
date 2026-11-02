# Holografía: geometría y frontera

El especial Maldacena presenta ahora tres laboratorios: **Entrelazados**, **Holografía: geometría y frontera** y **La paradoja de la información**. Se mantienen los 20 retos disponibles. Holografía reúne los doce retos de tres experiencias que antes se mostraban como tarjetas separadas:

1. **Geometría AdS**: los caminos se miden con una métrica. Es la preparación geométrica; por sí sola no constituye una demostración de holografía.
2. **Dos lenguajes**: comparación de entropía de un intervalo CFT₂ con longitud regulada en AdS₃, en el régimen y convención ya documentados.
3. **Frontera caliente**: estados térmicos y exterior BTZ, con el mismo diccionario entre magnitudes.

AdS significa anti-de Sitter. No debe confundirse con de Sitter (dS). La reorganización no cambia fórmulas, aproximaciones, unidades ni criterios de observación de los doce retos.

## Enlaces y estado

La entrada es `/holografia/`. Cada sección se identifica mediante `?seccion=geometria`, `?seccion=diccionario` o `?seccion=temperatura`; los anclajes normales `#md-map` y `#md-challenges` siguen funcionando sin cambiar la sección. Se admiten también los anclajes de entrada `#geometria`, `#diccionario` y `#temperatura`.

Las rutas históricas `/espacio-con-frontera/`, `/dos-lenguajes/` y `/frontera-caliente/` siguen cargando su sección correspondiente, bajo el encabezado y las pestañas del laboratorio unificado. No se eliminan sus entradas HTML ni se depende de redirecciones del alojamiento. El catálogo público muestra una sola tarjeta para Holografía.

Cambiar de sección prepara un ensayo nuevo, tal como se indica junto a las pestañas. El pasaporte conserva los logros: la clave `spum.maldacena.passport.v1` y sus cinco identificadores internos no cambian. Los tres grupos públicos suman sus sellos como 4, 12 y 4; no se reinterpretan ni se borran los datos anteriores.

Los componentes físicos se cargan por sección. Solo se monta una escena, de modo que no hay controles ocultos con IDs duplicados ni tres motores de dibujo simultáneos. Las pestañas junto a los controles permiten cambiar de sección manteniendo el foco en la escena, también después de la primera carga diferida del componente.

## Verificación

`tests/maldacena-integration.test.mjs` comprueba la partición de los cinco IDs internos en tres laboratorios, la presencia de las entradas históricas y nuevas, las rutas de sección y la conservación de la selección al usar anclajes de escena/pregunta. Las pruebas de física y aprendizaje anteriores siguen aplicando sin cambiar su modelo. QA independiente revisa además navegación, progreso, interacción y disposición en navegador; los tamaños pequeños no equivalen a teléfonos físicos.
