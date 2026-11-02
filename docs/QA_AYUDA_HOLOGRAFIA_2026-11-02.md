# Modo ayuda y laboratorio de Holografía · QA independiente

2 de noviembre de 2026. Revisión de código y experiencia de la ampliación del modo ayuda en los laboratorios y de la unión de geometría AdS, diccionario holográfico y frontera caliente. Este documento distingue la cobertura realizada de los criterios pendientes; no atribuye una prueba local al sitio público.

## Criterios de aceptación

- El acceso a ayuda existe en laboratorios, no en portadas de colección o especiales. Su estado está identificado y es reversible.
- En consulta, un toque explica sin emitir qubits, mover asas, cambiar barras o acreditar retos. Al salir, el mismo control vuelve a funcionar.
- Ratón y teclado permiten consultar; Escape o desactivar el modo recuperan el juego; cerrar una tarjeta conserva el modo de consulta. El panel identifica el objeto, su significado, el propósito de la acción y las unidades cuando corresponde.
- Los números de ejes se distinguen de parámetros y de resultados: en Page, 6 en el eje horizontal cuenta qubits de R, no tiempo; en el eje vertical expresa bits de entropía. Un asa de arrastre no es una partícula ni un evento cuántico.
- Canvas/WebGL se describe como escena completa cuando no existe selección física de objetos; no se finge reconocer una partícula por coordenadas.
- La ayuda no captura navegación normal cuando está apagada, ni deja scroll, punteros o teclado bloqueados al cerrar.
- La ayuda y los controles no vuelven ilegible la escena en 390×844, 320×740 y 667×375. Las capturas complementan las mediciones de disposición.
- Holografía reúne tres subsecciones y conserva sus 12 retos, lecturas, fuentes y sello de progreso previo. Entrelazados y Page continúan separados; el especial suma 20 retos.
- Los enlaces anteriores siguen sirviendo como accesos a la subsección correspondiente. AdS se llama anti-de Sitter, no de Sitter, y la preparación geométrica no se presenta por sí sola como una demostración de holografía.

## Cobertura realizada

Prueba independiente en Chromium/Chrome, pestaña exclusiva, sobre `http://127.0.0.1:1027/`.

- **20 rutas de laboratorio**: 17 canónicas y las tres rutas anteriores de geometría/dualidad/BTZ. En cada una, el modo ayuda se activó, se enfocó una barra física y se pulsó flecha derecha: mostró una explicación y conservó el valor. Se desactivó al terminar. El inventario DOM registra botones, barras, selectores, resúmenes y asas SVG para revisar cobertura editorial; no implica que todos se hayan accionado.
- **Cuatro portadas excluidas**: colección, Maldacena, Einstein y agujeros negros no montan el tutor.
- **Page, 390×844**: consultar «Emitir un qubit» conservó `k=0`; salir permitió emitir y pasar a 1. El seis horizontal se explicó como seis qubits en R y el vertical como seis bits de entropía. El punto verde se explicó como asa del reparto, no un qubit en movimiento. Flecha derecha durante consulta mantuvo el valor; Escape y otra flecha lo incrementaron. Captura inspeccionada con curva completa y lectura visibles.
- **Page, 320×740**: la curva permaneció legible; la tarjeta temporal podía cubrir lecturas inferiores según la posición del desplazamiento, pero dejó el gráfico entero visible y se cerró con el acceso fijo. No hubo desbordamiento horizontal.
- **Entropía, 1280×900**: el punto del cuadro de área explicó su función de control y su diferencia con una partícula física. Consultarlo bloqueó el cambio en cero; después de salir, flecha derecha pasó la fracción a 0,025. El atributo temporal `aria-describedby` se retiró al desactivar la ayuda. La tarjeta quedó junto al objeto sin ocultar el horizonte.
- **Holografía, 667×375**: ayuda del asa del intervalo térmico legible, conservando a la vista la curva. El texto distingue control geométrico, longitud y partícula.
- **Navegación unificada**: entrada directa a `?seccion=diccionario#md-map`, cambio desde pestañas junto a la escena, historial atrás y las tres rutas anteriores con `#md-challenges` conservaron la sección correcta. Tras cambiar desde las pestañas compactas, la pregunta quedó abierta sin exigir «Mi reto».
- **Retos de Holografía**: se completó de forma independiente el primero de cada sección. En geometría, una predicción incorrecta después de medir pidió revisar y no acreditó; al corregir la respuesta acreditó. El agente principal recorre los otros retos como cobertura complementaria, que no se atribuye a este pase.
- **Progreso**: el mapa mostró tres tarjetas con 4, 12 y 4 retos. El pasaporte existente de este navegador se conservó y, tras recargar, mostró 20/20; no se afirma que esta revisión haya completado los veinte desde cero.
- **Consola**: sin advertencias o errores en la pestaña durante este recorrido.

Artefactos locales fuera de Git, bajo `.work/qa-ayuda-2026-11-02` en el espacio exterior: `control-inventory.json`, `route-smoke.json`, `help-page-mobile.png`, `help-entropy-desktop.png` y `help-holography-landscape.png`. Las capturas se inspeccionaron por separado de los lotes rápidos para evitar interpretar un fotograma anterior como estado final.

## Hallazgos y correcciones

- Las pestañas compactas nuevas abrían `#md-map`, lo que podía devolver el visor al modo amplio y ocultar el reto. Se cambiaron a `#md-challenges`; se repitió la navegación y la predicción permaneció visible.
- El guard de clic modificado rechazaba una activación accesible sin `button` numérico. Se mantuvo la excepción para Ctrl/Cmd/Shift/Alt y se toleró el valor ausente. Clic de la herramienta y Enter volvieron a navegar; el código conserva la conducta nativa de los modificadores.
- Se encontró una consulta sin explicación en «Cómo explorar» del prisma. Se añadió la explicación del acceso de uso y se repitió: consultar mostró la tarjeta sin abrir el tutorial; salir y tocarlo abrió el diálogo correcto. La ayuda del primer reto de doble rendija se afinó para explicar la acumulación de impactos, en vez de centrarla en distancia a la pantalla. Se repitieron ambos casos.

Los dos primeros problemas se introdujeron en la reorganización de esta entrega y se corrigieron antes de publicar. La falta de explicaciones contextuales era una limitación previa; este modo la amplía sin modificar fórmulas.

## Cierre

Sin fallos bloqueantes abiertos en este pase local. La última modificación de teclado se repitió en Page: flecha derecha durante consulta conservó k=0; Escape y flecha derecha lo pasaron a 1. Se revisó el catálogo de explicaciones frente al inventario DOM; el agente de contenidos añadió cobertura de interfaces y lectura de contexto para controles sin etiqueta propia. Esto amplía la cobertura, pero no se presenta como una validación individual de cada frase o de cada control en todos sus estados.

La versión pública y sus archivos se contrastan por el agente principal después de publicar; los resultados anteriores son de la previsualización local.

## Límites

Safari, dispositivos físicos y gestos táctiles reales permanecen pendientes por decisión previa del usuario. Tamaños emulados en Chromium no son teléfonos reales. La revisión didáctica es heurística; no mide aprendizaje con participantes nuevos.

## Cierre del agente principal

Se completaron los doce retos de Holografía (cuatro por subsección) en 390×844 y se conservaron los estados de confirmación en el artefacto local `holography-12-challenges.json`. La suite completa aprobó 376 pruebas, ESLint, TypeScript y Vite; se compilan 24 entradas HTML sin dependencias nuevas. Sobre el build final se repitió la consulta del eje de Page en 320×740. Se detectó y corrigió una separación insuficiente entre la tarjeta y el botón de salida cuando este ocupa dos líneas: la repetición midió 12 píxeles de separación y ninguna emisión accidental. La prueba específica de disposición volvió a pasar.

El catálogo final tiene 144 temas por laboratorio y 15 ayudas de interfaz, además de anotaciones específicas en SVG. El contraste con 883 controles del inventario verifica cobertura de texto y contexto, no comprensión de cada frase con participantes. La publicación se verifica después con los archivos del build y una revisión visual pública.
