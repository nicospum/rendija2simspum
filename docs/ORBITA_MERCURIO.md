# La órbita que no se cierra

Laboratorio 13 de SPUM, sexto capítulo del especial Einstein. Ruta: `/orbita-que-no-se-cierra/`. Sin dependencias nuevas, con SVG calculado desde las variables. No es un video ni una elipse prefabricada rotada arbitrariamente.

## Modelo y precisión

Se compara una elipse newtoniana de dos cuerpos, con masa planetaria despreciable, con una geodésica temporal del exterior de Schwarzschild. El Sol es esférico, no rotante y fijo. Las órbitas comparten radios extremos y fase radial, no posiciones simultáneas.

En SI: `a` es la semisuma de radios extremos; `p = a(1−e²)` es una longitud y `q = GM/(pc²)`. Para la anomalía radial de Darwin χ:

```
r(χ) = p / (1 + e cosχ)
dφ/dχ = [1 − q(6 + 2e cosχ)]^(−1/2)
Δϖ = integral_0^2π (dφ/dχ − 1) dχ
```

Se integra el exceso angular mediante Simpson con 512 intervalos, guardando una tabla acumulada de una vuelta e interpolando linealmente entre muestras. Se repite el incremento para las diez vueltas. Se racionaliza `1/√(1−z)−1 = z/[√(1−z)(1+√(1−z))]` para evitar la cancelación de cifras de Mercurio. El error de interpolación afecta solo la posición entre muestras, no el avance integrado por vuelta.

El período radial se integra con la ecuación de tiempo coordenado de Schwarzschild. Con `b = 1+e cosχ`:

```
dt/dχ = √(p³/GM) · √[(1−2q)²−4q²e²]
        / [b²(1−2qb)√(1−q(6+2e cosχ))]
```

El período corresponde al tiempo estático normalizado en el infinito, no al tiempo propio del planeta. El avance por siglo usa `Δϖ × 36.525 días / período`. La aproximación de primer orden `6πGM/[a(1−e²)c²]` se muestra separada y se contrasta en pruebas.

Constantes: c = 299.792.458 m/s; UA = 149.597.870.700 m; GM solar = 1,3271244004127942×10²⁰ m³/s². Mercurio usa elementos medios J2000 de NASA: a = 0,38709893 UA, e = 0,20563069. Resultados aproximados: 0,1035″ por vuelta, 42,98″ por siglo y 87,97 días de período radial.

Los controles a ∈ [0,25; 1] UA, e ∈ [0,05; 0,70], M ∈ [0,5; 2] M☉ mantienen un campo débil y una órbita estable muy lejos de la separatriz. No se ofrece e = 0 porque un círculo no tiene dirección de perihelio. Cambiar las variables prepara otra órbita con otra energía y momento angular; no representa una transformación instantánea del Sol durante la trayectoria.

## Qué está ampliado

La lupa dibuja `φ_visual = χ + 100.000(φ−χ)` solo en la vista de Einstein. No altera radios, masa, período, avance físico ni resultados educativos. La curva ampliada no conserva la escala angular física. En giro real las curvas casi se superponen. El gráfico de un siglo usa una escala vertical ajustada y etiquetada; no usa la lupa.

El encuadre se ajusta al afelio y muestra su radio en UA. Los cuerpos tienen tamaños simbólicos. Los ejes polares de Schwarzschild se dibujan en un plano; no es una fotografía ni una representación de distancias propias sobre una superficie plana. La reproducción avanza la fase radial a velocidad de exploración, **no el tiempo físico**: no debe interpretarse como velocidad orbital uniforme. No se incluyen perturbaciones planetarias, achatamiento o espín del Sol, retroacción ni efemérides reales.

Los ~43″ por siglo son el **aporte relativista**, no toda la precesión observada. Otros planetas ya causan precesión en la mecánica newtoniana. El modelo aísla el efecto de un único Sol esférico.

## Recorrido educativo

1. Completar diez vueltas y comparar la dirección del perihelio de Newton y Einstein.
2. Comparar e = 0,10 y 0,60 manteniendo a y M de Mercurio.
3. Comparar a de Mercurio y 2a manteniendo e y M: distinguir avance por vuelta de avance por siglo.
4. Restaurar Mercurio y comparar giro real y ampliado, identificando qué significa el residuo de ~43″ por siglo.

Cada reto exige condiciones controladas, recorrido completo y una predicción correcta. Una respuesta errónea permite revisar; no borra las observaciones. Cambiar variables físicas reinicia la fase; la lupa conserva el recorrido. Reiniciar un reto conserva los capítulos completados.

La interfaz ofrece dos vistas simultáneas en escritorio y un selector en celular. Controles táctiles de al menos 44 px, rangos operables con teclado, botones de ensayo exacto, explicaciones al pasar el cursor o tocar, pausa, avance manual y enlaces a controles/visor/retos. La animación pausa sus actualizaciones si la pestaña está oculta, limita la frecuencia a 30 Hz y acota el incremento tras suspensiones.

## Fuentes primarias

- [NASA: Mercury Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html): elementos medios J2000, distancias y período.
- [JPL: Astrodynamic Parameters](https://ssd.jpl.nasa.gov/astro_par.html): GM solar, unidad astronómica y constantes.
- [Hopper et al., Physical Review D 92, 044048 (2015)](https://link.aps.org/accepted/10.1103/PhysRevD.92.044048): sección II, ecuaciones 2.4–2.7 de las geodésicas parametrizadas con χ. Su p es adimensional, p de este código dividido por GM/c².
- [NASA/MESSENGER: pruebas de la gravedad](https://pgda.gsfc.nasa.gov/products/66) y [artículo de Genova et al.](https://ntrs.nasa.gov/api/citations/20180000952/downloads/20180000952.pdf): precesión de Mercurio y aporte relativista de ~42,98″ por siglo.
- [Nobel Prize: Física 1921](https://www.nobelprize.org/prizes/physics/1921/summary/): Einstein fue premiado especialmente por la ley del efecto fotoeléctrico. El índice lo distingue de Mercurio y conecta con el [laboratorio fotoeléctrico](EFECTO_FOTOELECTRICO.md), ya implementado.

## Validación reproducible

`npm test` incluye `tests/orbita.test.mjs`: valor de Mercurio, predicción independiente de campo débil en todo el dominio, convergencia al refinar Simpson, cierre de Newton, radios extremos, continuidad entre vueltas, independencia de la lupa, dependencia de masa/tamaño/excentricidad, entradas inválidas, cuatro retos, errores y reinicios, pausas y reproducción acotada. `tests/tren.test.mjs` comprueba las siete rutas del especial. También se ejecutan lint, compilación y comprobaciones científicas de Hawking.

La inspección con navegador verifica ambas vistas, controles, explicaciones, cuatro retos y navegación en escritorio y ventanas móviles. Una ventana móvil emulada no reemplaza pruebas en teléfonos físicos.
