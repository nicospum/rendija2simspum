# Modo ayuda de los laboratorios

El botón flotante «Modo ayuda» abre una lectura contextual sin cambiar la preparación del experimento. Con mouse, señalar muestra la explicación; con teclado, Tab recorre los elementos; en celular, tocar consulta. Para volver a manipular el montaje se desactiva el botón o se pulsa Escape. Cerrar una tarjeta conserva el modo. Desplazar la página sigue disponible.

## Cobertura y límites

Solo se monta en rutas de laboratorios: 17 entradas actuales del catálogo y las tres rutas históricas de Holografía. No se monta en la portada ni en los mapas Einstein, agujeros negros o Maldacena. La preferencia se conserva en `sessionStorage` de esa pestaña; si está bloqueado, el modo funciona sin persistencia.

Las explicaciones distinguen qué representa el elemento, cómo se manipula al volver a jugar y por qué importa. Los controles físicos tienen textos por laboratorio. Las asas y ejes de Page, AdS, BTZ y entropía llevan anotaciones específicas: una manija no es una partícula; un eje espacial no es tiempo y los bits no se confunden con nats. La ayuda de un canvas WebGL explica la escena y su leyenda como conjunto: no identifica por raycasting cada estrella o partícula individual.

El modo bloquea acciones de puntero y teclado sobre el montaje mientras se consulta, incluido el zoom sobre canvas; no pausa automáticamente un reloj o simulación que ya está reproduciéndose. No modifica fórmulas, ensayos ni pasaportes. La tarjeta se retira al salir, junto con los listeners y atributos de selección temporales. Las descripciones ARIA previas se restauran.

## Mantenimiento

- `src/education/helpContent.ts`: catálogo de explicaciones y resolución del elemento por contexto. Una anotación `data-help-title` / `data-help-body` tiene prioridad sobre el catálogo. `data-help-scope` identifica la unidad activa de Holografía.
- `HelpMode.tsx`: interacción de consulta, tarjeta y preferencia opcional; su raíz React es independiente del estado físico.
- `mountLabHelp.ts` y `helpPolicy.ts`: montaje y lista explícita de rutas permitidas. Al sumar un laboratorio hay que conectarlo en su entrada y añadir su ruta y explicaciones.
- Para contenido SVG con significado propio, anotar el grupo o el elemento; no inferir la unidad solo del texto de un número. Para un input, conservar su label e ID accesibles.

Las pruebas contrastan efectos físicos opuestos entre laboratorios, prioridades de contexto, exclusión de mapas y disposición de la tarjeta. QA independiente registra pruebas reales de navegador en [QA de ayuda y Holografía](QA_AYUDA_HOLOGRAFIA_2026-11-02.md). Safari y dispositivos físicos siguen pendientes; una ventana móvil de Chromium no reemplaza esas comprobaciones.
