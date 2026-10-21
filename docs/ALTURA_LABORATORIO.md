# El tiempo tiene altura

Laboratorio 12, quinto capítulo del especial Einstein. Ruta: `/el-tiempo-tiene-altura/`.

## Física y convenciones

Se comparan intervalos de tiempo propio en una Tierra esférica no rotante descrita por Schwarzschild. Un reloj de referencia está fijo en r = R. El otro permanece en r = R + h, con rapidez local v medida por un observador estático en ese radio. Ambos tienen un cero inicial asignado por convenio; no se modelan transporte ni reuniones.

Constantes: c = 299.792.458 m/s, GM = 3,986004418×10¹⁴ m³/s² y R = 6.378.137 m. GM y R se toman como parámetros de una esfera de referencia a partir de los valores WGS 84; no se simula el elipsoide ni su rotación.

α(r) = √(1 − 2GM/(rc²))

dτ elevado/dτ referencia = [α(r)/α(R)]√(1 − v²/c²).

La diferencia de ritmo es δ = esta razón − 1; el desfase físico es δ × tiempo propio de referencia. En el límite débil: δ ≈ GM(1/R − 1/r)/c² − v²/(2c²). Para alturas pequeñas, relojes quietos: δ ≈ gh/c². No basta con comparar las magnitudes locales de g: importa la diferencia de potencial.

### Precisión numérica

No se calcula una diferencia entre dos números redondeados a 1. Se racionaliza el incremento gravitatorio:

q = [rₛh/(R(R+h))]/(1 − rₛ/R), δg = q/[√(1+q)+1].

Para el movimiento: δk = −β²/[√(1−β²)+1]. Se suman δg + (1+δg)δk. Así se conservan efectos de centímetros o micrómetros, aunque representar directamente la razón total en un `number` la redondeara a uno. Las tarjetas muestran el desfase por separado del tiempo de referencia. La contribución de movimiento incluye el producto gravitatorio, de modo que ambas contribuciones suman exactamente el balance del modelo.

## Relojes en altura

Alturas de 0–4.000 m, ambos relojes quietos. El control y la ilustración usan escala logarítmica log(1+h); las etiquetas siempre muestran metros físicos. Presets: 0 m, 33 cm, 100 m y 4.000 m. A 100 m el reloj elevado gana aproximadamente 0,94 ns por día; el ritmo permanece constante y siete días acumulan siete veces el desfase de uno.

Las carátulas son símbolos; sus aros muestran avance del ensayo. No se exageran agujas pretendiendo mostrar segundos físicos distintos. El efecto se aprecia en cifras y en el gráfico de diferencias. El modo «Tiempo sin ampliar» compara los tiempos totales en segundos, prácticamente coincidentes. Cambiar la representación conserva todos los resultados físicos.

## Satélite y GPS

Alturas de 400–36.000 km. Se puede sostener el reloj en reposo, elegir rapidez o usar órbita circular libre. En esta última:

v local = √(GM/r)/α(r), Ω = √(GM/r³).

El período respecto de la referencia es 2π√(r³/GM)α(R). La posición de la órbita usa Ωt de coordenadas, con t = τ referencia/α(R). El encuadre conserva la relación entre radio orbital y radio terrestre; el satélite es simbólico.

El preset GPS tiene h = 20.200 km. Gravedad aporta unos +46 µs/día y movimiento unos −7 µs/día; balance de unos +38 µs/día. Son cifras del modelo esférico no rotante, no una implementación de tiempo GPS o de referencia al geoide. En órbita baja el movimiento puede dominar y producir un balance negativo.

La rapidez manual compara trayectorias ideales a radio y rapidez constantes, que pueden requerir propulsión. No se dibuja una trayectoria libre incorrecta. Sostener el reloj sin movimiento también exige apoyo o propulsión.

### Ajuste y pseudodistancia

El botón de ajuste compara una señal cuya frecuencia fue corregida **desde el inicio del ensayo**: Δf/f = −δ/(1+δ). Su lectura ideal mantiene desfase cero con la referencia, mientras el desfase físico de tiempo propio permanece igual. Cambiar el botón conserva el instante y recalcula ese ensayo alternativo, no aplica un salto físico al reloj orbital.

cΔt es el sesgo de pseudodistancia equivalente de una señal. No se presenta como un error de posición del receptor: este depende de geometría, estimación del reloj y otras señales. Se omiten rotación, Sagnac, geoide, excentricidad, atmósfera, retardos y solución de navegación. Un GPS operativo incluye ajustes nominales y correcciones variables.

## Cuatro retos

1. Comparar un día a igual altura y un día a 100 m.
2. Comparar uno y siete días a 100 m, distinguiendo ritmo de desfase acumulado.
3. Comparar reposo y órbita circular a altura GPS, identificando las contribuciones opuestas.
4. Comparar señal sin ajuste y señal ajustada desde la salida, conservando el tiempo propio físico.

Se requieren observaciones completas y una explicación correcta. Cambiar condiciones reinicia y pausa; cambiar escala, vista o ajuste conserva el instante. La reproducción se suspende en pestañas ocultas y termina en el resultado. Logros limitados a la sesión, sin datos personales ni dependencias nuevas.

## Fuentes primarias

Consultadas el 21 de octubre de 2026:

- [NIST: Putting Einstein to the Test](https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test): dilatación por gravedad y movimiento, relojes y GPS.
- [NIST/JILA: relojes a escala milimétrica](https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale): evidencia experimental de diferencias de ritmo por altura.
- [ESA Navipedia: Relativistic Clock Correction](https://gssc.esa.int/navipedia/index.php/Relativistic_Clock_Correction): ajuste nominal de frecuencia y corrección orbital periódica en sistemas reales.
- [NGA: parámetros WGS 84](https://earth-info.nga.mil/?action=wgs84&dir=wgs84): R y GM de referencia. El valor específico de GM indicado allí para usuarios GPS difiere ligeramente; este laboratorio usa el valor geocéntrico general declarado arriba.

## Código y validación

`src/altura/physics.ts` contiene ecuaciones y constantes, `learning.ts` el estado puro de los retos, `Scene.tsx` las vistas SVG calculadas, `App.tsx` controles y explicaciones y `altura.css` estilos locales. No se carga Three.js.

Ejecutar `npm test`, `npm run lint`, `npm run build` y `npm run research:hawking`. Pruebas de potencial débil independiente, precisión para diferencias diminutas, fórmula geodésica circular independiente, balance de contribuciones, compensación, órbitas, controles extremos, escala, retos y reproducción. La revisión visual debe completar los cuatro retos, comprobar índice de cinco capítulos, ayudas y diseños de 320–1280 px. Emular tamaños no sustituye probar teléfonos físicos, multitáctil ni lectores de pantalla.
