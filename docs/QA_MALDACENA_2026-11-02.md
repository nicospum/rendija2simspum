# Control independiente del recorrido Maldacena

2 de noviembre de 2026. Este registro separa la revisión científica, la revisión de código y la prueba de uso. Un cálculo correcto no certifica por sí solo una experiencia clara.

## Revisión científica previa

Fuentes primarias consultadas: [Preskill, estados y conjuntos](https://www.preskill.caltech.edu/ph229/notes/chap2.pdf), [Calabrese–Cardy, intervalo único](https://arxiv.org/html/hep-th/0405152), [Ryu–Takayanagi](https://arxiv.org/html/hep-th/0603001) y [Bañados–Teitelboim–Zanelli](https://arxiv.org/html/hep-th/9204099).

- **Dos qubits:** para `cosθ|00⟩ + sinθ|11⟩`, las probabilidades de cada parte son `p=cos²θ` y `1−p`. Su entropía binaria puede ser positiva mientras el estado conjunto puro tiene entropía cero. La mezcla clásica diagonal tiene el mismo estado local, pero diferentes correlaciones al cambiar la base. Los ensayos requieren preparar copias nuevas; un resultado correlacionado no envía un mensaje.
- **AdS espacial:** en `ds²=L²(dx²+dz²)/z²`, una geodésica entre `(−ell/2,eps)` y `(ell/2,eps)` tiene radio `sqrt((ell/2)²+eps²)` y longitud `2L asinh(ell/(2eps))`. Es distinto de recortar a cierta altura una semicircunferencia anclada en `z=0`.
- **Intervalo conforme:** el vacío en la línea infinita tiene dependencia universal `(c/3)ln(ell/eps)`, más una constante dependiente de la regularización. `c` es la carga central. La relación `c=3L/(2G3)` vincula los parámetros; no son barras independientes. El resultado geométrico exacto con extremos regulados converge a la expresión logarítmica, pero no coincide con ella a todo corte finito.
- **Temperatura:** para una línea infinita térmica, `S=(c/3)ln[(beta/(pi eps))sinh(pi ell/beta)]+const`. En unidades naturales, el BTZ planar no giratorio tiene `T=1/(2pi zh)`. Es un sistema distinto del Schwarzschild astrofísico de los capítulos anteriores. La actividad compara estados estacionarios, no simula colapso o evaporación.

Se informó al implementador del BTZ una diferencia importante de regulación. La profundidad `zh tanh(ell/(2zh))` corresponde a extremos ideales. Para extremos a altura `eps`, con `u=ell/(2zh)`, se requiere `z*²=zh²−(zh²−eps²)/cosh²u`. El perfil consistente es `z(x)²=zh²−(zh²−z*²)cosh²((x−centro)/zh)`. La distancia exacta es `2L asinh[(zh/eps)sinh u]`; debe distinguirse de su aproximación logarítmica. Son expresiones derivadas de la métrica y de la fórmula de distancia geodésica, no nuevas predicciones del laboratorio.

## Criterios de aceptación de código y aprendizaje

1. Probabilidades normalizadas, entropías finitas y correctas en estados puros y extremos. En el conteo, distinguir `ln Ω` equiprobable de Shannon con probabilidades desiguales.
2. Ensayos muestreados identificados frente a predicciones exactas; al cambiar condiciones no mezclar muestras incompatibles.
3. Longitudes e integrales verificadas con referencias independientes, incluidos límite frío, corte pequeño, traslación e intervalo grande respecto de la escala térmica.
4. Cuatro retos manipulables por módulo, con condiciones de observación visibles. Elegir una respuesta o cargar un montaje no debe acreditar una comparación que todavía no ocurrió.
5. Escena y controles accesibles simultáneamente; asas con teclado, foco y rango acotado. Página desplazable fuera de las asas. Sin superponer texto extenso sobre la geometría.
6. Progreso resistente a almacenamiento malformado y estados incompatibles; restaurar referencia conserva logros sin presentar un ensayo nuevo como ya observado.
7. Explicar qué se calcula, qué es dibujo y qué queda fuera: dos qubits no son gravedad; una geodésica no prueba toda AdS/CFT; frontera no es pared física; el balance térmico de Hawking no es curva de Page.

## Estado de la revisión

Primera revisión de `quantum/physics.ts`: **331 aserciones numéricas independientes aprobadas** sobre seis ángulos, estados puro/mezcla y bases X/Z. Se verificaron normalización, probabilidades no negativas, entropías acotadas, invariancia de la distribución local al cambiar la base remota, diferencia Bell/mezcla en X y conteo/unidades para dos o cuatro variables. Se comprobó también que el estado producto tiene entropía de von Neumann nula aunque una medición en otra base sea aleatoria. Se señaló esa distinción al implementador para evitar confundir la incertidumbre de un resultado con la entropía del estado.

### Hallazgos corregidos durante la construcción

- **BTZ, continuidad fría:** el cálculo inicial de la curva restaba cantidades proporcionales a `zh²`. A temperaturas positivas diminutas podía dar profundidad cero o NaN. No se alcanzaba con el paso ordinario de la barra, pero violaba el límite físico. Se reescribió con la identidad `cosh²u−cosh²v=sinh(u+v)sinh(u−v)` y `sinh(v)/v` regular en cero. Cinco pruebas térmicas aprobadas, incluida una regresión con temperaturas desde `Number.MIN_VALUE` hasta `1e-5`, longitudes 0,5/2/6 y cuadratura independiente.
- **Geometría, cuadratura:** el primer Simpson fijo de 4096 tramos superaba la tolerancia cerca del corte mínimo. Se informó al autor, que aumentó la resolución y agregó contraste cartesiano independiente; ocho pruebas geométricas aprobadas.
- **Interacción cuántica:** se señalaron áreas de pulsación demasiado pequeñas al reducir el SVG a móvil. El autor añadió áreas transparentes grandes y una tabla que conserva las cuatro comparaciones Bell/mezcla en Z/X. Las muestras se separan de las probabilidades exactas.

Estos fueron problemas de la implementación nueva encontrados antes de su publicación, no regresiones de laboratorios anteriores.

### Revisión de componentes y experiencia

Se revisaron `LabFrame`, el pasaporte, los modelos y los componentes de los cuatro capítulos. La colección conserva las claves de progreso anteriores; el especial nuevo tiene una clave propia y reutiliza la decodificación defensiva del pasaporte compartido. Los pasos se acreditan por mediciones o inspecciones con condiciones válidas, no por cargar un preset o elegir la respuesta correcta. Se verificaron por separado las muestras aleatorias y las predicciones exactas, y la diferencia entre bits y nats.

La revisión funcional independiente en Chrome completó **los 16 retos de los cuatro capítulos en 390×844**. También completó **las cuatro preguntas del puente de conteo**, utilizando los controles contextuales junto a la pregunta. Se comprobó el rechazo de una predicción incorrecta y que el mapa mostrara **16/16 descubrimientos tras recargar la página**. En escritorio se completó el primer reto de geometría, dualidad y BTZ; el autor cuántico hizo un segundo pase con los cuatro retos cuánticos y las cuatro preguntas de conteo. Los registros del navegador no mostraron errores ni advertencias en el pase final.

Se usó el ratón para arrastrar realmente el extremo B de la geodésica y el termómetro del BTZ en escritorio, con cambios en longitud/profundidad y temperatura/horizonte respectivamente. También se probaron los controles de escena con teclado. No se inyectaron estados internos para simular esos resultados.

**Se detectaron y corrigieron durante el playtest** dos fallos de presentación importantes: la escena cuántica sumaba hasta 563 px en móvil y dejaba la predicción fuera de pantalla; los desplazamientos heredaban además 78 px de `scroll-padding` que duplicaban la compensación de las escenas. Se compactaron las leyendas y las lecturas, se quitó el espacio vacío que añadía forzar la altura del SVG, se adaptó el modo horizontal y se corrigió la especificidad del desplazamiento. La pestaña térmica necesitó etiquetas de menor tamaño en horizontal corto para conservar el dibujo y los objetivos de control.

La repetición final cubrió **160 estados de disposición**: cuatro capítulos × cuatro retos × dos acciones de navegación («↑ Pregunta» y «Probar en la escena») × cinco tamaños (**390×844, 320×740, 667×375, 568×320 y 1280×900**). En todos, la escena y el control o la predicción correspondiente quedaron dentro del visor, con su centro libre según la comprobación del elemento superior bajo el puntero, y sin desbordamiento horizontal. Esta comprobación complementa las capturas; por sí sola no mide comodidad de lectura de cada rótulo.

El pase dirigido final de modelos ejecutó **22 pruebas aprobadas** de geometría, dos qubits/conteo y BTZ. La compilación, lint y conjunto completo corresponden al cierre del agente principal.

### Valoración educativa

- **Contar:** el registro duplicado junto a las preguntas resuelve tener que volver al panel superior en móvil. El cambio de cuatro posibilidades equiprobables a probabilidades desiguales hace visible que contar soporte y calcular entropía son operaciones distintas.
- **Entrelazados:** inspeccionar A/B y girar analizadores produce cambios visibles y permite reconocer el contraste Bell/mezcla. La tabla conserva las cuatro comparaciones del tercer reto, evitando que el usuario deba memorizar el gráfico anterior.
- **Geometría:** los extremos, la referencia punteada y las dos lecturas distinguen distancia en el dibujo de distancia física. Registrar una medida es una acción explícita, separada de explorar.
- **Dualidad:** el residuo de corte se mantiene visible y las diferencias de entropía enseñan una comparación más informativa que hacer coincidir dos barras por construcción. El capítulo explica el régimen y el diccionario de parámetros.
- **BTZ:** el termómetro desplaza el horizonte y modifica la curva de forma perceptible. El texto distingue la coordenada `zₕ`, el radio areal y el estado térmico; no reutiliza la regla de temperatura de Schwarzschild.

Esta es una evaluación técnica y heurística de un revisor, no una prueba de comprensión con participantes. La continuación más útil es observar a una persona nueva resolver los retos y explicar con sus palabras qué cambió.

Evidencia local: `.work/qa-maldacena-2026-11-02/` en el espacio de trabajo exterior. Incluye resultados de los 16 retos, cuatro preguntas de conteo, matrices `layout-*-final.json`, comprobación del pasaporte y capturas antes/después de las correcciones. Los archivos anteriores sin el sufijo `final` documentan hallazgos y no deben confundirse con la aceptación final. Las capturas `quantum-mobile-final.png`, `geometry-desktop-drag.png` y `thermal-desktop-drag.png` muestran estados representativos; no todas las acciones de los registros tienen una captura individual.

Safari y teléfonos físicos siguen pendientes por decisión previa del usuario. Las pruebas de tamaños de navegador no se presentarán como pruebas táctiles reales ni mediciones de comprensión con participantes.
