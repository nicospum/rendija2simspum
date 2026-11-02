# Bell / CHSH: revisión científica independiente

Responsable: `bell_ciencia`, separado de la implementación inicial y de las modificaciones de UI. Fecha: 2 de noviembre de 2026. Base inicial: `2007560`; seguimiento de uso sobre `20d6262`. **APROBADO para el alcance científico de los archivos identificados en [estado-cientifico.json](estado-cientifico.json).** En el seguimiento este agente también implementó las devoluciones y acciones nulas del reducer y sus regresiones; esa autoría se distingue de la revisión cruzada de los demás agentes. Es revisión interna documentada, no certificación externa ni estudio de aprendizaje.

## Qué se pone a prueba

Bell mostró una incompatibilidad entre determinadas correlaciones cuánticas y explicaciones locales con variables ocultas. Una correlación perfecta entre dos objetos no alcanza por sí sola: también puede prepararse con información clásica compartida. El contraste aparece al combinar resultados de varias elecciones de medición. [Bell, 1964](https://journals.aps.org/ppf/pdf/10.1103/PhysicsPhysiqueFizika.1.195).

Se usa la versión CHSH: dos elecciones por lado y dos salidas por medición. Las hipótesis relevantes son localidad de la respuesta y una distribución de información compartida independiente de las elecciones. El laboratorio ideal registra ambas salidas de cada par; no elimina detecciones desfavorables. [CHSH, 1969](https://journals.aps.org/prl/pdf/10.1103/PhysRevLett.23.880). Su [errata de 1970](https://journals.aps.org/prl/pdf/10.1103/PhysRevLett.24.549) sólo añade un agradecimiento, no cambia la desigualdad.

La imagen pedagógica de «respuestas escritas» representa los vértices deterministas de ese conjunto local. No equivale a demostrar que ninguna teoría con variables ocultas sea posible, ni a una clasificación de toda interpretación cuántica.

## De una tarjeta al límite 2: derivación propia

Una tarjeta fija cuatro respuestas, cada una ±1: A₀, A₁, B₀, B₁. Hay 2⁴=16 tarjetas. Para cualquier tarjeta,

```
s = A₀B₀ + A₀B₁ + A₁B₀ − A₁B₁
  = A₀(B₀+B₁) + A₁(B₀−B₁).
```

Si B₀=B₁, el segundo paréntesis es cero y el primero ±2. Si son opuestos ocurre lo contrario. Por tanto s es +2 o −2; una mezcla de tarjetas con pesos no negativos que suman uno conserva |S|≤2. La mezcla debe ser la misma para las cuatro elecciones: cambiarla según el ajuste rompería la independencia supuesta.

Conviene mezclar una tarjeta y su complemento global en partes iguales. Así cada lado tiene marginal 50/50, aunque las correlaciones siguen siendo locales: los productos no cambian al invertir los cuatro signos. Esto evita enseñar erróneamente que el azar individual distingue lo cuántico de lo clásico.

El límite corresponde a correlaciones medias del conjunto local. Cuatro estimaciones finitas de una mezcla local general pueden fluctuar por encima de 2; el tablero algebraico de una tarjeta no representa ese error. Una tabla de cuatro parejas aisladas puede incluso dar S estimada=4 sin constituir evidencia contra el límite de la media.

## Modelo cuántico ideal: derivación y convención

Estado de polarización Φ⁺=(|HH⟩+|VV⟩)/√2. Cada analizador mide la base ortogonal definida por su orientación; ambas salidas se detectan idealmente. Rotar las bases y aplicar Born da, con Δ=a−b,

```
P(++ )=P(--)=cos²(Δ)/2
P(+-)=P(-+)=sin²(Δ)/2
E(a,b)=P(igual)−P(distinto)=cos(2Δ).
S=E(a,b)+E(a,b′)+E(a′,b)−E(a′,b′).
```

Ángulos en grados al usuario, convertidos a radianes en trigonometría. A diferencia del singlete de espín de Bell, aquí coinciden los signos para analizadores paralelos y aparece el doble ángulo de polarización. Con a=0°, a′=45°, b=22,5° y b′=−22,5°, las tres primeras E son √2/2 y la última −√2/2; S=2√2≈2,828427. Igualar todos los analizadores produce S=2, no una violación. Invertir la convención de salidas puede cambiar signos, pero no el límite absoluto.

Para todos los ajustes, P(A=+)=P(B=+)=1/2. Cambiar el ajuste remoto no cambia estas distribuciones locales; las correlaciones se descubren al comparar registros posteriormente. Una simulación calcula la distribución conjunta de forma central: no representa un mecanismo local oculto ni una señal instantánea entre detectores.

## Muestreo, incertidumbre y alcance experimental

Una pareja produce un resultado, no una estimación fiable de correlación. Cada lote debe conservar preparación y las cuatro orientaciones. No sumar filas obtenidas bajo configuraciones distintas como si fueran un único CHSH. Los conteos estiman E=(Nigual−Ndistinto)/N; todas las parejas deben contarse.

Para un lote prefijado, los productos X=AB están en [-1,1]. El teorema de [Hoeffding](https://doi.org/10.1080/01621459.1963.10500830), ecuación 2.3 y reescalado de rango, da dos colas `P(|Eestimada−E|≥ε)≤2 exp(−Nε²/2)`. Una unión de cuatro cotas con α=0,05 permite elegir `εᵢ=√(2 ln(8/α)/Nᵢ)`. Se recortan los intervalos individuales a [-1,1] y se combinan sus extremos con los signos de S. Es una cota conservadora simultánea, no una aproximación gaussiana ni un p-valor de un Bell real.

El tamaño debe elegirse antes del lote. Repetir hasta obtener una muestra favorable o parar según el resultado pierde la interpretación fija del 95 %. El progreso educativo debe depender de observaciones y una explicación correcta, nunca sólo de que una fluctuación cruce S=2. La curva exacta debe distinguirse de los datos simulados y permanecer identificada como predicción del modelo.

Las pruebas experimentales reales necesitan además separación espacial, elecciones independientes, tratamiento de pérdidas y un análisis que controle sus hipótesis. [Shalm y colaboradores, 2015](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=919674), páginas 1–3. El laboratorio no cierra esas lagunas ni prueba la naturaleza al programar Born.

## Cuatro retos implementados y revisados

| Paso | Manipulación y comparación | Conclusión / intento incorrecto |
|---|---|---|
| 1. El azar de cada lado | Medir lotes de 200 con A₀=0°, B₀=0° y después B₀=45°; contrastar lecturas locales con coincidencias. | E pasa de 1 a 0, aunque cada lado conserva marginal teórica 50/50. No exigir frecuencias exactamente iguales a la predicción. Una pareja o un registro no basta. |
| 2. El límite de las tarjetas | Cambiar bits y registrar una estrategia con S=+2 y otra con S=−2; desplegar productos y cancelación. | Cada tarjeta da ±2, y las mezclas no superan el límite. Las tarjetas son preguntas abstractas etiquetadas, no polarizadores simulados por Malus. |
| 3. Cuatro preguntas, una desigualdad | En las orientaciones canónicas, generar barridos nuevos de 50 y 1000 parejas por combinación. | Predicción exacta S=2√2 y estimación distinta por muestreo; la incertidumbre disminuye al aumentar N. No basta una fluctuación sobre 2 ni mezclar filas viejas. |
| 4. Correlación sin mensajes | Con A₀=0°, comparar lotes de 200 para B₀=0° y B₀=90°. | E pasa de 1 a −1, pero la marginal teórica de Alice sigue 50/50. Bob no elige el resultado de Alice; comparar registros requiere comunicación ordinaria. |

Se cotejaron las consignas, respuestas y condiciones implementadas. Las cuatro respuestas correctas requieren ambas observaciones; una explicación incorrecta no aprueba aunque haya datos suficientes. Cambiar ángulos borra los datos activos; las referencias conservan el montaje efectivamente observado. Reiniciar limpia el intento y mantiene identificado el logro histórico. Los lotes exploratorios de una combinación no se incorporan a los cuatro lotes independientes usados para S.

## Contrastes independientes ejecutados

- Rotaciones de vectores de dos componentes y proyecciones de Born, sin usar la fórmula `cos(2Δ)` como oracle.
- Enumeración completa de las 16 tarjetas y sumas firmadas; mezclas y complementos globales.
- Casos 0°, 45°, 90°, orientaciones canónicas y periodicidad de 180° de un analizador de polarización.
- Marginales exactas, suma de probabilidades, simetrías e invariancia frente a un cambio remoto.
- Conteos deterministas con fuente pseudoaleatoria controlada, ningún evento perdido y tamaños válidos.
- Cota independiente de Hoeffding para tablas sintéticas; lote vacío/incompleto no produce una falsa S.
- Cuatro evaluadores: correcta con observación faltante, incorrecta tras observar, condiciones confundidas, reinicio con logro previo y datos invalidados al cambiar montaje.

Los 30 tests de [bell.test.mjs](../../tests/bell.test.mjs) pasan: los 24 iniciales y seis regresiones del seguimiento de uso. Se contrastaron 169 pares de orientaciones con proyecciones vectoriales independientes de la fórmula trigonométrica de implementación, las 16 tarjetas y sus complementos, mezclas convexas, muestreo reproducible de 16.384 eventos, el último resultado realmente muestreado y las cotas recortadas. Cada evaluador se comprobó con respuesta correcta, incorrecta, observación incompleta y reinicio. El lint del reducer y del archivo de pruebas también pasa.

## Muestra de representación en navegador

Se abrió una pestaña propia de Chromium integrado mediante CUA, en `http://127.0.0.1:1027/bell/`, a 1280 × 720. Se completaron como muestra científica los retos 2 y 3; el pase móvil exhaustivo de los cuatro retos corresponde al QA de producto independiente.

- En «Suma CHSH», las tres primeras contribuciones son +0,707 y la cuarta resta E₁₁=−0,707, dando también +0,707. La predicción permanece S=2,828 al cambiar N. No se confunde la correlación cruda con su contribución firmada.
- Un ensayo de 1000 parejas por combinación dio E=(0,726; 0,714; 0,698; −0,716), S=2,854 y cota [2,451; 3,257]. Un ensayo nuevo de 50 dio E=(0,720; 0,600; 0,720; −0,680), S=2,720 y cota [0,918; 4,000]. Escena, tabla y referencia guardada coincidieron. Ambos ensayos permanecieron identificados, con sus datos e incertidumbres reales. Aprobar el reto no exigió que la cota excluyera 2.
- La tarjeta con cuatro signos positivos dio S=+2; invertir sólo A₀ dio S=−2. Los productos y el paréntesis nulo coincidieron. Una explicación incorrecta fue rechazada y la correcta fue aceptada después de guardar ambas tarjetas.
- La leyenda distingue mezcla de tarjetas con su complemento y azar local 50/50. No se asignan ángulos físicos a instrucciones abstractas. No hubo desbordamiento horizontal ni errores de consola durante esta muestra.

Capturas y datos fuera del checkout: `../qa-bell-2026-11-02/science-ui-sample.json`, `science-chsh-desktop.jpg` y `science-local-desktop.jpg`. La prueba no demuestra comprensión con participantes; constata operaciones y representaciones coherentes con el modelo.

Fuentes y alcance de lectura: [fuentes.json](fuentes.json). Los PDF escaneados y accesos bloqueados se delimitan allí. Safari y teléfonos físicos continúan pendientes por la decisión previa del usuario; el QA de producto constituye un pase distinto. Cualquier cambio de fórmulas, requisitos, respuestas o significado de la representación reabre los controles afectados; el dictamen identifica el candidato por hashes.

## Cierre acotado de representación

Se cotejaron los cambios finales de App, Scene y CSS: el reto 3 pliega los datos de una pareja y los botones CHSH muestran la suma; el resumen de referencias usa los ensayos guardados y declara sus ángulos canónicos. La expresión numérica de E divide por N sólo cuando hay datos; los atajos de B explican que preparan A₀B₀ con A₀=0°. La leyenda de marcas y cota es inequívoca. Los ajustes de espacio no cambian modelos, evaluadores ni magnitudes. Los hashes de física, aprendizaje y tests permanecen iguales; los tres archivos de presentación quedan actualizados en el dictamen. No se repitió por ciencia un pase completo de los cuatro retos tras estos cambios acotados.

Se leyó [BELL_LABORATORIO.md](../../docs/BELL_LABORATORIO.md): las probabilidades Φ⁺, las hipótesis y el límite de medias locales, las cotas prefijadas y los requisitos de los cuatro retos coinciden con código, pruebas y fuentes. Las limitaciones de la simulación y de las comprobaciones están declaradas.

## Seguimiento de claridad sobre la publicación `20d6262`

La revisión de código para una persona sin conocimientos identificó falta de definiciones visibles de las estaciones, los signos y las combinaciones de orientaciones; una devolución genérica no explicaba las distintas ideas equivocadas. También se detectaron acciones sin cambio físico que borraban los datos y una promesa de guardar tarjetas fuera del reto que efectivamente las registra. El pase de producto independiente reprodujo obstáculos de uso y pérdida de datos en navegador; su detalle corresponde a [QA_BELL_SEGUIMIENTO_2026-11-02.md](../../docs/QA_BELL_SEGUIMIENTO_2026-11-02.md).

Se revisaron independientemente los cambios de representación de root: la escena muestra N, el último resultado, porcentaje observado de iguales, E observada y la frecuencia local A+, separados de las predicciones exactas. Los porcentajes proceden de los mismos conteos; N=0 se conserva como «sin datos». El texto explica qué representan A/B, ₀/₁ y +/−; el juego de tarjetas distingue cuatro respuestas preparadas de cuatro medidas simultáneas. La inversión global conserva productos y S, y se declara. Los botones «4 × 50 pares» y «4 × 1000 pares» evitan confundir parejas de fotones con combinaciones. La franja de −2 a 2 se identifica como límite de medias locales. La normalización del −0 exacto en el formateador no modifica números del modelo.

En `learning.ts`, este agente implementó ocho devoluciones vinculadas a las ideas incorrectas, un listado de observaciones faltantes con acciones de cada reto y registros con conteos y frecuencias reales. Seleccionar el mismo ángulo, combinación o preparado activo conserva el estado por referencia; un cambio real sigue limpiando los datos activos. El preparado sólo es nulo si las cuatro orientaciones coinciden exactamente y ya está elegida A₀B₀: elegir otro par o cambiar incluso 10⁻⁹ grados no se oculta con una tolerancia. La acción de reiniciar un reto permanece separada. No cambian respuestas, umbrales ni criterios de observación.

Seis regresiones verifican las ocho explicaciones incorrectas, pasos faltantes sin repetir los ya observados, acciones nulas en estados aprobados y fallidos, preparado repetido frente a cambio real, ausencia de falsas tarjetas guardadas y frecuencias conservadas desde una colección de 201 eventos. Root confirmó lectura independiente del diff de `learning.ts` y sus tests, incluidas las guardas estrictas de preparados, y aprobó que los requisitos y el muestreo siguen iguales. La revisión cruzada queda identificada en el dictamen; no se presenta como autoevaluación independiente. Este agente no repitió navegador en el seguimiento: la muestra de escritorio anterior se conserva como evidencia histórica y el nuevo QA de producto se registra por separado. Las fuentes y fórmulas físicas no se modificaron en este seguimiento.
