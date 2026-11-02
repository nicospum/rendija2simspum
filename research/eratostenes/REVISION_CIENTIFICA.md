# Eratóstenes: revisión científica independiente

Responsable: agente `eratostenes_ciencia`, separado de implementación. Fecha: 2 de noviembre de 2026. **APROBADO científico: física, lógica de los cuatro retos y representación revisada**, sobre el candidato local que amplía `2f812e4`, servido en `1027/eratostenes/`. El QA de producto móvil constituye un pase separado. Es una revisión interna documentada, no una certificación externa ni prueba de comprensión con participantes.

## Qué permite afirmar la historia

Eratóstenes, en el siglo III a. C., estimó la circunferencia terrestre mediante una comparación de sombras y una distancia entre lugares. El relato transmitido por Cleomedes usa Alejandría/Siene, rayos solares paralelos y sitios en el mismo meridiano. La geometría parte de una Tierra esférica: no corresponde presentarlo como el primero que descubrió o probó que la Tierra era redonda. Ya existían argumentos griegos anteriores sobre su esfericidad. [AAS, historia y supuestos](https://aas.org/posts/news/2019/05/month-astronomical-history-june), [NASA/GSFC, antecedentes](https://pwg.gsfc.nasa.gov/stargaze/Scolumb.htm).

No se fija un porcentaje de exactitud histórica. Las fuentes conservan cifras diferentes en estadios y la conversión de esa unidad a metros sigue siendo discutida. El estudio historiográfico de [Tupikova, 2022](https://doi.org/10.1007/s00407-022-00287-6) distingue unidades metrológicas de distancias de itinerario y muestra por qué esa conversión no es inequívoca. «800 km y 7,2° dan 40 000 km» es un **ejemplo didáctico redondeado**, no la certificación de una medición antigua exacta. No se copian conversiones inconsistentes de materiales docentes institucionales.

## Modelo mínimo aprobado para implementar

Supuestos visibles: Tierra esférica de radio fijo; sitios en el mismo meridiano; terreno local horizontal; palos verticales; mediodía solar en ambos sitios; rayos solares paralelos. La implementación prevista elige una circunferencia didáctica de 40 000 km, de modo que 800 km correspondan exactamente a 7,2° en ese mundo. Debe distinguirse esa cifra elegida de una nueva medición real de la Tierra. No se modelan refracción atmosférica, diámetro angular solar, relieve, achatamiento terrestre, inclinación del palo ni errores reales de distancia, salvo el intervalo angular acotado explícito.

Las posiciones son latitudes φ, positivas al norte, y la declinación solar es δ. El mediodía solar corresponde a ángulo horario H=0; no tiene por qué coincidir con las 12:00 del reloj civil. De la ecuación solar de [NOAA](https://gml.noaa.gov/grad/solcalc/solareqns.PDF), `cos(z)=sin(φ)sin(δ)+cos(φ)cos(δ)cos(H)`, se obtiene a mediodía `z=|φ−δ|` mientras el Sol esté sobre el horizonte.

Convención firmada útil: `q=φ−δ`, positivo si la sombra apunta al norte; negativo si apunta al sur. Para un palo de altura h y sombra firmada s:

```
s = h tan(q)
q = atan(s/h)
Δθ = |qB − qA| = |φB − φA|
d = R Δθ                    (Δθ en radianes)
C = 2πd/Δθ = 360°d/Δθ       (segunda expresión: Δθ en grados)
```

La primera relación se deduce del triángulo rectángulo del palo y la sombra. La diferencia angular elimina δ. Si las sombras apuntan a lados opuestos, **se suman sus magnitudes**: no se toma la diferencia entre dos ángulos positivos. Si están del mismo lado, se restan las magnitudes. Conservar el signo en el modelo evita ambos errores. La fórmula de [geodesia de NOAA](https://oceanservice.noaa.gov/education/tutorial_geodesy/geo02_hist.html) se refiere a la distancia superficial norte-sur, no a la cuerda que atraviesa el planeta ni a una carretera sinuosa.

El radio R sirve para generar un mundo simulado, pero el resultado del jugador debe calcularse a partir de d y las sombras, no devolviendo directamente el radio oculto del simulador. Si d se muestra calculada del mapa, debe explicarse que es una distancia provista en este modelo, como dato de una medición de terreno. El laboratorio no constituye una nueva medición real de la Tierra.

### Dominio y casos degenerados

- `h>0`, radio y distancia positivos, entradas finitas; θ=0 no permite inferir una circunferencia finita. No dividir por un número cero o presentar infinito como descubrimiento.
- Exigir `|q|<90°`. Si un rango permite Sol bajo el horizonte, mostrar ausencia de sombra solar válida; no recortar un tan infinito y presentarlo como medida.
- Limitar latitudes/declinación para mantener sombras legibles es una decisión de representación, que no debe cambiar las longitudes del modelo. Se puede ampliar localmente el dibujo señalando que las dos vistas usan distintas escalas.
- Cambiar altura del palo escala su sombra, pero no q ni C. Cambiar δ mueve ambas sombras y conserva Δθ/C si se mantienen sitios y mediodía.
- Una comparación con plano bajo rayos paralelos y palos paralelos produce el mismo ángulo en ambos lugares. Esto contrasta **dos modelos definidos**, no prueba la esfericidad por dos sombras sin los supuestos sobre el Sol.

## Cuatro retos propuestos y criterios de prueba

| Reto | Qué manipular y observar | Respuesta científica esperada | Intento incorrecto / incompleto |
|---|---|---|---|
| 1. Dos lugares revelan la curva | Comparar sitios coincidentes y B a 800 km sobre el meridiano; registrar ambos. | Los coincidentes no dan una diferencia angular para inferir C; al separar aparece Δθ. | Comparar sólo sombras sin distancia no fija tamaño. Un único registro o sitios siempre coincidentes no completan la observación. |
| 2. Medir un mundo con sombras | Obtener sombras y distancias a 800 y 1600 km; aplicar la proporción en ambos casos. | Se duplican d y Δθ, pero C permanece 40 000 km en el mundo didáctico. | «La Tierra medida se duplica al alejar B» es falso. Un único registro o no conservar las demás condiciones no completa el contraste. |
| 3. Una sombra, un ángulo | Alargar el palo 1→2 m, sin mover los sitios, y registrar antes/después. | Se duplican h y s; el cociente s/h, q y tamaño inferido se conservan. | «Un palo mayor implica una Tierra mayor» es falso. Mover sin registrar ambos estados o cambiar también los sitios no completa la observación. |
| 4. ¿Cuánto confiar en la medida? | Mantener error angular fijo y aumentar separación; comparar intervalos de C. | Un mismo error angular produce menor incertidumbre relativa con Δθ mayor. | «Dos decimales aseguran exactitud» o «más distancia empeora siempre» es falso. Deben registrarse ambas bases bajo el mismo error, no variar simultáneamente el error. |

Las cuatro consignas implementadas en `src/eratostenes/learning.ts` corresponden a esta secuencia y sus respuestas esperadas son respectivamente las opciones 1, 0, 2 y 1 (índices desde cero). Se revisaron las opciones incorrectas y las condiciones de registro, además de la respuesta correcta. Cambiar consignas, opciones, ecuaciones o requisitos obliga a reabrir las comprobaciones afectadas.

## Contrastes independientes de referencia

Calculados con Python `math` a partir de trigonometría y arco circular, sin importar el módulo de la aplicación:

| Caso | Resultado esperado |
|---|---|
| R=6371 km | C=40 030,173592041145 km |
| Δθ=7,2°, R=6371 km | d=800,603471840823 km |
| h=1 m, q=7,2° | s=0,12632937844610817 m |
| h=2 m, q=7,2° | s=0,25265875689221634 m, mismo ángulo |
| φA=−10°, φB=20°, δ=0°, h=1 m | sA=−0,17632698070846498 m; sB=0,36397023426620234 m; Δθ=30°, d=3335,847799336762 km |
| d=800 km y Δθ=7,2° redondeados | C=40 000 km; ejemplo didáctico |
| d=400 km, θ=3,6°±0,2° | C en [37 894,73684210527; 42 352,94117647059] km |
| d=800 km, θ=7,2°±0,2° | C en [38 918,91891891892; 41 142,857142857145] km; intervalo más estrecho |

El intervalo usa una cota **del ángulo diferencia total**, no ±0,2° en cada palo: `Cmin=360d/(θ+ε)` y `Cmax=360d/(θ−ε)`, con θ>ε. Si cada medición de q tiene cota ε propia, la cota de Δθ puede llegar a 2ε. No se mezclan ambas convenciones ni se llama al intervalo «95 %» sin modelo probabilístico.

## Revisión del código y comprobaciones ejecutadas

Se leyeron `physics.ts`, `learning.ts` y `Scene.tsx`. El modelo recupera los ángulos mediante `atan2(sombra, altura)`, conserva la dirección norte/sur y calcula C desde distancia y ángulo recuperado. No devuelve directamente la constante elegida para el mundo. Las validaciones rechazan entradas no finitas o fuera del dominio; sitios coincidentes no producen C finita y un intervalo que alcanza θ=0 no ofrece cota superior finita.

Se añadieron **18 pruebas independientes** en `tests/eratostenes.test.mjs`, todas aprobadas. Se contrastan 360 sombras en 180 configuraciones mediante una proyección vectorial de un rayo sobre el plano tangente, el coseno cenital de NOAA, arco central calculado con productos vectoriales y escalares, casos numéricos anteriores, sombras opuestas, cambio de declinación y altura, márgenes acotados, entradas degeneradas y conservación de registros. La prueba de arco distingue explícitamente la cuerda de la distancia superficial.

Para cada uno de los cuatro retos se verificó: respuesta sin observaciones, un registro insuficiente, dos registros válidos, opción incorrecta, corrección de la opción y éxito. Modificar controles sin «Medir y guardar» no da crédito. Cambiar una condición que debía mantenerse fija tampoco aporta observaciones válidas. Reiniciar con huella previa no aprueba automáticamente el nuevo intento. El lint del archivo de pruebas pasó.

Hallazgos durante implementación y estado:

| Hallazgo | Corrección y aceptación |
|---|---|
| El objetivo «mismo lugar» usaba tolerancia de ±6 km, útil para arrastrar a un objetivo distante pero incorrecta para el caso degenerado. | Se exige coincidencia numérica; test con dos sitios a menos de 6 km confirma que ya no recibe la marca de mismo sitio. Corregido y comprobado. |
| Tras dos observaciones válidas, una tercera medición exploratoria podía reemplazar un registro requerido, conservando sus marcas sin su evidencia visible. | Los registros se conservan por clave de condición; repetir reemplaza sólo esa clave y la exploración usa una tercera entrada separada. Prueba independiente confirma preservación de ambas referencias. Corregido y comprobado. |
| El rayo global de ciudad partía de `top+180·sun` y terminaba en la base, por lo que no era paralelo a los demás cuando θ≠0. | QA científico y de producto lo detectaron independientemente. Se cambió a `base+180·sun → base`: dirección única y paralela en ambos sitios. Releído el código corregido. La lupa local ya usaba una línea que pasa por la punta y extremo de la sombra. |
| La lupa llamaba «sombra al N» al caso exacto de sombra nula. | Se presenta «sin sombra» cuando el ángulo es numéricamente cero; releído el código y comprobada la etiqueta en el navegador. |
| Los registros podían mostrar longitudes firmadas negativas sin explicitar el sentido; las operaciones mostraban valores redondeados junto a un cálculo de precisión completa. | La tabla rotula «Sombras firmadas A/B (N+/S−)». La expresión usa ≈ y explica que las lecturas están redondeadas y el cálculo conserva valores completos. Releído y confirmado en UI. |

## Trazabilidad y alcance pendiente

Fuentes leídas y alcance en [fuentes.json](fuentes.json). NASA PUMAS se encontró en búsqueda, pero su PDF redirige a un aviso de sitio temporalmente fuera de servicio: no se usó como evidencia leída. No se incorporan imágenes remotas ni se ejecutan fragmentos de terceros.

Se inspeccionaron también `App.tsx`, `main.tsx` y CSS finales: fórmula, unidades, registro guardado separado de lectura actual, cambios de referencia y texto histórico son coherentes. Los palos del planeta son aumentados, las lupas comparten una escala ajustable y el mundo se declara idealizado. En móvil se selecciona la lupa A/B para mantener legibilidad; el QA de producto comprueba su tamaño y manipulación por separado.

Se abrió una pestaña propia del navegador integrado mediante CUA en el candidato local. Recorrido ejecutado en escritorio: guardar sitios coincidentes → separar 800 km → guardar → vista de sombras. La medición inicial dice que no puede estimar; la segunda muestra 800 km/7,20° y 40 000 km. A presenta «sin sombra», B 0,126 m hacia el norte. La última medición sigue etiquetada como guardada y conserva los dos registros. Captura independiente: [ciencia-sombras-escritorio.jpg](../../../qa-eratostenes-2026-11-02/ciencia-sombras-escritorio.jpg). No se alteró almacenamiento ni se invocó el reducer desde el navegador; la pestaña propia se cerró al terminar.

[estado-cientifico.json](estado-cientifico.json) fija los cuatro IDs y hashes de archivos aceptados. Cambios de modelo, requisitos, conclusiones o representación física requieren reabrir lo afectado. El QA de producto usa navegador a tamaño celular y escritorio; no basta con verificar el número de C. Safari, hardware móvil real y estudio de aprendizaje siguen pendientes por falta de acceso. El contraste científico de navegador descrito aquí es una muestra de escritorio y no se suma como una segunda ejecución exhaustiva de los cuatro retos móviles.

### Aceptación del ajuste final de contraste

QA de producto señaló que la sombra negra se distinguía poco del fondo oscuro. Se revisó el ajuste acotado: franja de suelo clara y una marca de 3 px en el extremo calculado de la sombra, con explicación de que es una marca de medición y no un fotón. No se cambian escala, longitud, ángulo ni posición física del extremo. También se revisaron la extracción del formateador numérico a `format.ts` y la sustitución de `Array.at(-1)` por índice ES2020 en App: conservan los valores y la selección del último registro.

Se repitió la muestra de 800 km, medición y vista de sombras en una pestaña propia de Chrome; el navegador integrado ya no estaba disponible en esa reanudación. A muestra sombra nula y B 0,126 m/7,20°; el resultado sigue siendo 40 000 km. La franja hace visible el extremo negro y la marca sin alterar la geometría. [Captura final](../../../qa-eratostenes-2026-11-02/ciencia-contraste-final-escritorio.jpg). La pestaña propia se cerró; no se modificó el tamaño del navegador ni pestañas de otros agentes/usuario. Se mantienen los hashes previos de física y aprendizaje y se actualizan los de representación más `format.ts`. **Aceptación científica de representación: APROBADO.**

### Cierre de explicación y disposición responsiva

Se revisaron los tres archivos modificados en el último ajuste de producto: App explica que `360/Δθ` indica cuántas veces cabe el arco en una vuelta y que la misma proporción multiplica d. La explicación usa el ángulo completo y sólo aparece cuando la estimación es válida, por lo que no añade división por cero ni altera el cálculo.

Scene añade, para pantallas horizontales bajas, una lectura HTML de la sombra y del ángulo del sitio elegido; toma las mismas magnitudes absolutas ya usadas por su lupa. CSS cambia márgenes de desplazamiento, tamaño y distribución de las lupas y controles, sin modificar coordenadas físicas ni escala relativa de los dos sitios. Las lupas siguen compartiendo la escala calculada; el selector permite ver A/B cuando sólo cabe una. Se leyó también `docs/ERATOSTENES_LABORATORIO.md`: ecuaciones, dominio, cuatro retos, historia y límites concuerdan con la implementación y este dictamen.

El pase de producto independiente informa cuatro retos con casos correctos, incorrectos e incompletos y tamaños 390/320/667/1280 aprobados después del ajuste; la repetición de esos recorridos pertenece a ese informe, no se atribuye al revisor científico. Los hashes de física, aprendizaje, formateo y pruebas no cambiaron. Se actualizan sólo los hashes de App, Scene y CSS: **aceptación científica final conservada, sin reabrir modelos**.

Se revisó el último ajuste de Scene: el símbolo del Sol sigue ahora la misma dirección `(cos δ, −sin δ)` que usan los rayos; su posición en el esquema es `centro+330·dirección`. La explicación deja claro que es un símbolo direccional con distancia comprimida, no un Sol cercano usado por el cálculo. El gradiente decorativo acompaña esa dirección y no se usa para calcular sombras o irradiancia. El cambio hace visible la declinación sin modificar el modelo de rayos paralelos. Se renovó el hash de Scene para incluir este cierre.
