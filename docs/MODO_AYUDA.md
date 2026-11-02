# Modo ayuda de los laboratorios

El botón flotante «Modo ayuda» abre una lectura contextual sin cambiar la preparación del experimento. Con mouse, señalar muestra la explicación; con teclado, Tab recorre los elementos; en celular, tocar consulta. Para volver a manipular el montaje se desactiva el botón o se pulsa Escape. Cerrar una tarjeta conserva el modo. Desplazar la página sigue disponible.

## Cobertura y límites

Solo se monta en rutas de laboratorios: 17 entradas actuales del catálogo y las tres rutas históricas de Holografía. No se monta en la portada ni en los mapas Einstein, agujeros negros o Maldacena. La preferencia se conserva en `sessionStorage` de esa pestaña; si está bloqueado, el modo funciona sin persistencia.

Las explicaciones distinguen qué representa el elemento, cómo se manipula al volver a jugar y por qué importa. Los controles físicos tienen textos por laboratorio. Las asas y ejes de Page, AdS, BTZ y entropía llevan anotaciones específicas: una manija no es una partícula; un eje espacial no es tiempo y los bits no se confunden con nats. Las escenas WebGL de Hawking, lente, acreción, prisma y doble rendija permiten consultar objetos concretos. Se usan raycasting de las geometrías o las mismas coordenadas y tablas del shader. «Objetos de la escena» ofrece una alternativa de teclado o toque para elementos finos. Ver [selección 3D y alcance](AYUDA_ESCENAS_3D.md).

El modo bloquea acciones de puntero y teclado sobre el montaje mientras se consulta, incluido el zoom sobre canvas; no pausa automáticamente un reloj o simulación que ya está reproduciéndose. No modifica fórmulas, ensayos ni pasaportes. La tarjeta se retira al salir, junto con los listeners y atributos de selección temporales. Las descripciones ARIA previas se restauran.

Las tarjetas de controles y asas SVG protegen el mismo conjunto de vistas visibles que las consultas 3D: se ubican al lado, debajo o encima del dibujo según el espacio disponible. Las dos vistas de un laboratorio se consideran juntas. En ventanas donde no cabe toda la escena y una tarjeta, la explicación se compacta y evita el punto consultado; se puede cerrar o salir sin reiniciar la prueba. Ctrl/Meta/Alt con flechas, Enter o Espacio tampoco acciona los controles durante la consulta; Tab y los atajos de copiar o del navegador siguen disponibles.

Los menús del reto, predicción, comprobación y ampliación tienen ayuda propia: explican una acción de la interfaz en lugar de confundirla con un cambio físico. Al completar una comparación, el acceso «↑ Pregunta» pasa a «✓ Resultado» para volver a la devolución sin desplazar automáticamente el experimento mientras se manipulan variables.

## Mantenimiento

- `src/education/helpContent.ts`: catálogo de explicaciones y resolución del elemento por contexto. Una anotación `data-help-title` / `data-help-body` tiene prioridad sobre el catálogo. `data-help-scope` identifica la unidad activa de Holografía.
- `HelpMode.tsx`: interacción de consulta, tarjeta y preferencia opcional; su raíz React es independiente del estado físico.
- `mountLabHelp.ts` y `helpPolicy.ts`: montaje y lista explícita de rutas permitidas. Al sumar un laboratorio hay que conectarlo en su entrada y añadir su ruta y explicaciones.
- `sceneHelp.ts` registra proveedores con selección y listado por escena. `SceneHelpR3F.tsx` y `sceneHelpThree.ts` resuelven geometrías Three; los shaders tienen sus propios clasificadores coherentes con el render. El registro se retira al desmontar.
- Para contenido SVG con significado propio, anotar el grupo o el elemento; no inferir la unidad solo del texto de un número. Para un input, conservar su label e ID accesibles.

Las pruebas contrastan efectos físicos opuestos entre laboratorios, prioridades de contexto, exclusión de mapas y disposición de la tarjeta. Ver el pase transversal con cobertura y límites en [QA de todos los laboratorios](QA_AYUDA_TOTAL_2026-11-02.md), además de [QA de ayuda y Holografía](QA_AYUDA_HOLOGRAFIA_2026-11-02.md). Safari y dispositivos físicos siguen pendientes; una ventana móvil de Chromium no reemplaza esas comprobaciones.
