# Revisión integral de SPUM

Revisión interna documentada, 2 de noviembre de 2026. Base de código: `e2e07a7`; candidato: esa base más los lotes descritos en [hallazgos](hallazgos.md). Los hashes de archivos revisados constan en [QA científico](qa-ciencia-estado.json) y los registros de aceptación. No constituye una certificación externa ni un estudio de aprendizaje con estudiantes.

## Resultado y alcance exacto

Se inventariaron y revisaron **17 laboratorios canónicos, 76 retos principales y cinco preguntas/retos auxiliares: 81 en total**. Holografía contiene tres secciones de cuatro retos; no se contó como tres laboratorios. Los ocho retos ópticos son comparaciones abiertas y no tienen selector de respuestas: se probaron condiciones válidas, inválidas e incompletas. Los restantes 73 tienen opciones (72 con observación y una pregunta conceptual).

Cada uno de los 81 tiene revisión científica y prueba primaria de producto con intento correcto, incorrecto e incompleto cuando el diseño lo admite. Los agentes hicieron aceptación posterior de las correcciones y revisión del código. La aceptación de Maldacena repite una actividad completa por bloque y contrasta los registros restantes; no representa dos ejecuciones exhaustivas de todos los retos.

Las **24 entradas HTML** son: 17 laboratorios, tres alias históricos de Holografía, portada y tres especiales. Se revisaron los catálogos y actividades auxiliares: cuatro preguntas en Contar lo que no vemos, una en el cuaderno de la ecuación de campo y dos exploraciones sin calificación (energía en reposo y escalas de agujeros negros). No se encontraron borradores o entradas deshabilitadas en los catálogos activos. El historial Git no se considera catálogo de funcionalidades vigentes.

El [inventario generado del código](inventario.json) conserva consignas, respuestas, controles, modelos, prerrequisitos y rutas. El [estado por ID](estado.json) es el registro único de cobertura. Se regenera y comprueba con:

```sh
node docs/revision-integral/inventario.mjs
node docs/revision-integral/generar-estado.mjs
node docs/revision-integral/verificar-estado.mjs
```

## Tabla de revisión

«Aprobado» significa que no quedaron fallos bloqueantes reproducibles en los casos y modelos revisados. Las limitaciones de cada modelo siguen vigentes; no demuestra corrección para cualquier estado imaginable.

| Laboratorio | Retos | Ciencia | Producto / aceptación | Cambio o conclusión principal |
|---|---:|---|---|---|
| Doble rendija | 4 | Aprobado | Aprobado | Comparación y gráfico junto al control activo; teoría y datos separados. |
| Prisma | 4 | Aprobado | Aprobado | Referencia y resultado junto al control; sin luz y lectura congelada explícitas. |
| Hawking | 4 | Aprobado | Aprobado | Casos de masa, baño térmico y tiempo pasan; no se confunden partículas ilustrativas con eventos calculados. |
| Lente gravitacional | 4 | Aprobado | Aprobado | Pista del reto 4 indica duplicar masa 4→8 millones M☉, manteniendo distancias. |
| Entropía | 4 | Aprobado | Aprobado | Foco de «Pasos del reto» queda accesible; área, bits y balance conservan sus dominios. |
| Acreción | 4 | Aprobado | Aprobado | Huella histórica se diferencia del resultado de la observación actual. |
| Horizonte | 4 | Aprobado | Aprobado | Mismo ajuste de huella; caída, pulsos y escucha probados. |
| Reloj de luz | 4 | Aprobado | Aprobado | Pista nombra el control cercano «Seguir reloj de la estación». |
| Tren de Einstein | 4 | Aprobado | Aprobado | Reinicio con logro previo no presenta la predicción nueva como aprobada. |
| Gemelos | 4 | Aprobado | Aprobado | Nombres «Antes/Después del giro» coherentes entre controles y consigna. |
| Ascensor | 4 | Aprobado | Aprobado | Misma distinción de huella; contrastes de apoyo, masas y luz pasan. |
| Tiempo y altura | 4 | Aprobado | Aprobado | Duración, altura, movimiento y corrección GPS pasan. |
| Mercurio | 4 | Aprobado | Aprobado | Contrastes Newton/Einstein, excentricidad y escala pasan. |
| Fotoeléctrico | 4 | Aprobado | Aprobado | Frecuencia, brillo y umbral/material pasan; misma distinción de huella. |
| Entrelazados | 4 | Aprobado | Aprobado | Requiere observaciones locales/conjuntas y bases correctas. |
| Holografía | 12 | Aprobado | Aprobado | Geometría, diccionario y temperatura; aliases y recorrido conservados. |
| Curva de Page | 4 | Aprobado | Aprobado | Particiones, pureza y correlaciones pasan; oracle numérico independiente. |
| Contar lo que no vemos, auxiliar | 4 | Aprobado | Aprobado | Correctas, incorrectas e incompletas; distinguir Shannon de ley de área. |
| Ecuación de campo, auxiliar | 1 | Aprobado | Aprobado | Vacío no implica espacio-tiempo plano; ambos intentos y reinicio pasan. |

Detalle de producto: [Einstein](qa-einstein.md), [agujeros negros y Page](qa-agujeros-negros.md), [óptica y Maldacena](qa-optica-maldacena.md). Aceptación adicional: [óptica](aceptacion-optica.md) y [Maldacena](aceptacion-maldacena.md).

## Qué se corrigió y por qué

Los problemas enumerados existían en `e2e07a7`. No se detectaron defectos materiales nuevos después de los lotes y sus repeticiones; esto se limita a la cobertura documentada.

1. **Contexto móvil de Prisma y Rendija:** al mover el control activo quedaban fuera de vista referencia y efecto. Se reutilizan las lecturas y gráfico actuales en una comparación compacta junto al control. No se vuelve fijo todo el visor ni se duplica estado físico.
2. **Progreso histórico:** siete laboratorios de Einstein, Acreción y Horizonte podían mostrar un resultado de logro previo al iniciar un intento nuevo. Se separa «Huella guardada» del resultado actual, conservando pasaporte, evaluadores y condiciones de finalización.
3. **Consignas:** se precisan objetivo de masa en Lente, nombres del giro en Gemelos y reloj seguido en Reloj. No se agregaron botones que ya existían.
4. **Foco visible:** las reglas de margen de desplazamiento compartidas incluyen enlaces y `summary`, además de los demás controles. Se reprodujo y repitió el caso de Entropía con visor próximo.
5. **Mantenimiento:** se corrige el conteo obsoleto del README y se añaden inventario, estado y evidencia por ID. Sin reescritura de arquitectura ni nuevas dependencias.
6. **Dependencia de desarrollo:** Vite 6.4.4 se actualiza a 6.4.5 dentro de la rama compatible, corrigiendo el aviso de acceso a archivos del servidor de desarrollo por variantes de consulta. [Aviso oficial](https://github.com/advisories/GHSA-8g5g-mxqh-grgj).

Se revisaron el diff, estado/props, reutilización de datos, semántica de controles e IDs. Las fórmulas y evaluadores no se reescribieron: el QA científico no encontró un error central que lo justificara. No se introdujeron nuevos activos decorativos, telemetría ni servicios externos.

Durante el lote óptico apareció un detalle nuevo: el enlace de explicación del reto de acumulación mostraba ↑ aunque su destino quedaba debajo. QA lo detectó, se corrigió a ↓ sólo en ese caso y se comprobó de nuevo en la compilación final. Se registra por separado como UX-06.

## Ciencia y contrastes independientes

La [matriz científica](qa-ciencia.md) enlaza afirmación → ecuación → implementación → fuente → comprobación. [fuentes.json](fuentes.json) contiene referencias primarias con alcance leído y límites. Se revisaron 27 fuentes para el catálogo y siete referencias adicionales para opciones futuras; algunas de estas últimas sólo tienen resumen leído y requieren desarrollo antes de implementar.

Se contrastaron, entre otros, desviación mínima/Snell, interferencia y ceros de difracción, escalas de Schwarzschild, integración nula, balances térmicos, Lorentz, tiempos propios, GPS ideal, avance de Mercurio, energía fotoeléctrica y trazas parciales. Los dominios importan: disco delgado aproximado no equivale a una simulación magnetohidrodinámica; puntos del visor no son siempre eventos físicos; una geodésica espacial AdS no es un rayo; el eje de Page reparte qubits de un estado fijo y no calcula una evaporación gravitatoria.

Para Page se añadió una auditoría independiente con NumPy/SVD frente al solver Jacobi del código: **25 estados y 175 particiones**, error máximo de entropía ≈2,25×10⁻¹⁵ bits frente a tolerancia 10⁻¹⁰. La coordinación inspeccionó y repitió este contraste; no se usó la misma función como respuesta esperada.

```sh
node docs/revision-integral/page-audit.mjs
python docs/revision-integral/page-eigen-audit.py
```

Las comprobaciones de UX siguen principios de manipular, observar y explicar, como los publicados por [PhET](https://phet.colorado.edu/en/research). Se revisó el foco frente a capas próximas usando como referencia [WCAG: foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Esas referencias orientan el trabajo; no certifican este sitio ni sustituyen pruebas con personas.

## Verificación técnica y entrega

- `npm test`: **401 pruebas aprobadas**, sin fallos ni omisiones.
- `npm run lint`: aprobado.
- `npm run build`: aprobado con TypeScript y Vite 6.4.5; 24 entradas HTML.
- `git diff --check`: se ejecuta antes de entregar.
- Auditoría científica focalizada: 244 pruebas de física/evaluación de 20 archivos; incluidas en la suite general.
- Navegación y retos: los 81 casos primarios en 390×844; muestras adicionales a 320 px, 667×375 y escritorio. No se afirma que los 81 se repitieron íntegros en cada tamaño.
- Artefactos brutos y capturas se conservan fuera del Git en `.work/qa-integral-retos-2026-11-02`, junto al checkout. Los informes versionados referencian esos archivos, que no son parte del despliegue público.
- La publicación usa el remoto existente y la integración Git de Vercel. La confirmación final de commit, estado público y comparación de hashes del build se entrega con el mensaje de cierre y `public-assets.json`; una compilación local por sí sola no se presenta como despliegue verificado.

## Pendientes y límites, por importancia

1. **Aprendizaje real:** falta un pase con participantes que lleguen sin saber del tema. Los agentes detectan ambigüedad y prueban comportamiento, pero no demuestran comprensión o diversión de estudiantes. Conviene pedir una predicción antes y una explicación con evidencia después.
2. **Safari y dispositivos físicos:** siguen pendientes por falta de acceso, conforme a la decisión del usuario. Tampoco se certificaron todos los lectores de pantalla. Las comprobaciones móviles son tamaños emulados en Chromium.
3. **Seguridad de herramientas:** `npm audit` baja de 13 a **12 avisos moderados**, sin altos/críticos; los restantes pertenecen a la cadena ESLint/minimatch de desarrollo. `npm audit --omit=dev` da **cero**. No se comprobó una corrección compatible para los restantes; no se aplicó `--force`, downgrade ni override transversal. [Aviso de minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249). Son avisos preexistentes pendientes, no hallazgos de explotación de la aplicación pública.
4. **Representación y estadística:** el umbral de muestras invita a comparar y no garantiza concordancia. Una mejora opcional es expresar dispersión con un criterio bien definido antes de puntuar. Los modelos ideales y amplificaciones visuales deben permanecer explícitos al ampliar escenas.
5. **Cobertura finita:** no se agotaron todas las combinaciones continuas, GPUs, versiones de navegador o condiciones de red. No hubo evidencia reproducible que justificara reemplazar las grillas o motores. Los hallazgos descartados y estados transitorios constan en el registro único.

## Cómo seguir

Se elaboraron [siete opciones fundamentadas](propuestas.md), sin implementarlas: Bell/CHSH, mareas, Michelson–Morley, retardo de Shapiro, chirp de ondas gravitacionales, Doppler relativista y teletransporte cuántico. Cada una separa interacción, modelo, fuente, prueba independiente, límites y esfuerzo.

Para profundizar el camino hacia Maldacena, la prioridad sugerida es **Bell**, como extensión operativa de Entrelazados; para enriquecer intuición y juego visual, **Mareas**. Primero conviene hacer el pase corto con participantes sobre el catálogo actual. No se añadieron nuevas tarjetas ni laboratorios durante esta revisión.
