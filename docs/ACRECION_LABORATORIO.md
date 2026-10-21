# Cómo vemos lo invisible

Laboratorio 06, `/acrecion/`. Integrado al especial `/agujeros-negros/` junto a lente gravitacional, Hawking y entropía. Las rutas anteriores siguen disponibles. Cada miembro tiene índice desplegable, posición y enlaces anterior/siguiente, al principio y al final.

## Pregunta y recorrido

¿Cómo detectamos una masa que no deja salir luz de su interior? Dos pistas complementarias: radiación del gas exterior y movimiento de una estrella cercana. La órbita revela masa encerrada; identificar un agujero negro requiere también restricciones sobre su compacidad y descartar alternativas.

1. **Quién enciende la oscuridad:** llevar gas a cero y luego al menos a 60 %. La masa y la órbita permanecen, el disco desaparece y vuelve. No es radiación de Hawking.
2. **Un disco, dos apariencias:** inclinar a 70° o más y comparar luz curva/recta. El arco corresponde a luz que cambia de camino, no a gas fuera del plano.
3. **El lado que viene hacia vos:** activar movimiento relativista con inclinación alta y después mirar de frente. Comparar refuerzo Doppler y desaparición de su asimetría entre lados.
4. **Pesar algo que no vemos:** con radio fijo 100 UA, duplicar masa de 4 a 8 millones M☉. El período se divide por √2.

Cada reto requiere observaciones y una respuesta. La predicción puede revisarse tras probar. Una respuesta correcta sin manipular no lo completa. Las observaciones de cada reto se reinician al elegirlo; los retos ya completados se conservan durante la sesión. No se escribe almacenamiento local. El botón de referencia muestra el estado inicial sin modificar la prueba ni acreditar observaciones; sus controles se deshabilitan hasta volver.

## Modelo físico

### Geometría y luz

Schwarzschild, sin giro ni carga. `rs = 2GM/c²`. Observador estático a 28 rs; disco opaco de espesor nulo, entre 3 y 14 rs. El borde interior es el ISCO, no el horizonte.

Se reutiliza **sin modificar** `src/lente/physics.ts::traceNormalized`, con la ecuación de geodésicas nulas `u'' = −u + 3u²/2`, `u = rs/r`, integrada mediante RK4. La tabla contiene u en función del ángulo local inicial y del ángulo orbital φ. Se reconstruyen y desenvuelven los ángulos de las posiciones del integrador. Los rayos capturados se prolongan con u = 1 como centinela opaco; poner cero produciría falsas intersecciones emisoras al interpolar el final.

Por simetría esférica, un rayo vive en un plano. Con normal de cámara O, dirección lateral E y normal del disco z, los cruces cumplen `cos φ O.z + sin φ E.z = 0`. El shader busca el primer cruce en el anillo emisor (hasta tres cruces). Se usa interpolación de la tabla, con resolución finita; no se prometen todos los órdenes de imagen ni precisión de imágenes científicas.

La masa no obliga a recalcular trayectorias porque tanto cámara como disco conservan sus dimensiones en rs. Cambian los tamaños físicos, el flujo térmico y el período de la estrella. No es la comparación de distancias físicas fijas del laboratorio de lente.

### Emisión y transferencia

Flujo por cara del disco delgado estacionario, newtoniano, con torque nulo en el borde:

`F(r) = 3GM Ṁ/(8πr³) [1 − √(rin/r)]`

`Tef = (F/σ)^(1/4)`; máximo en `(49/36) rin = 4,0833 rs`.

El control 100 % equivale a `10^-3 M☉/año`; cero suprime la emisión. A suministro físico fijo y r/rs fijo, F escala como M^-2 y T como M^-1/2. La imagen conserva exposición fija y responde a ese flujo. Los colores representan el cociente de frecuencias, no un espectro RGB real. El suministro cambia soluciones estacionarias: no se simula el vaciado instantáneo de un disco, su masa o la evolución del agujero.

La luminosidad mostrada integra ambas caras hasta 14 rs:

`L = Ṁc²/12 [1 − 3rin/rout + 2(rin/rout)^(3/2)]`.

Es potencia emitida en la aproximación newtoniana, no la potencia recibida por la cámara o una eficiencia relativista exacta.

Para emisores en órbitas circulares Schwarzschild:

`g = √[(1 − 3/(2r))/(1 − 1/ro)] / (1 − Ω λ)`

con radios en rs, `Ω = 1/√(2r³)`, y λ momento angular axial conservado dividido por energía del fotón hacia el observador. `Iobs = g⁴ Iem` para intensidad integrada sobre frecuencias. Desactivar movimiento compara con emisores estáticos, conservando el corrimiento gravitacional. Desactivar lente sustituye caminos rectos: es una comparación artificial, no otra solución de Einstein.

El contraste numérico es un diagnóstico **local a 6 rs**, `[(1+β sin i)/(1−β sin i)]⁴`, `β = 1/√[2(r−1)]`. No es el cociente entre píxeles extremos de la imagen curvada. Sin gas se muestra un guion, pues no hay intensidades que comparar.

### Estrella testigo

Órbita circular ideal vista desde arriba, de radio fijo 100 UA. `T = 2π√(a³/GM)`, válida como aproximación de campo débil para este rango (a > 600 rs). No se simulan precesión, emisión de señales ni datos de una estrella real. La referencia conserva 4 millones M☉, el mismo radio y el mismo tiempo visual. Cambiar masa reinicia ambas fases. Un segundo animado equivale a 0,2 años; pausa y pestaña oculta detienen la animación.

## Implementación y rendimiento

- Vite MPA, React, Three/R3F ya existentes. Sin dependencias nuevas.
- Tabla de geodésicas 768×768 Float32 calculada una vez en worker (unos 2,25 MiB). Transferencia de buffer sin copia; cancelación al desmontar. Respaldo de cálculo 256×384 si Worker falla.
- Shader por píxel, hasta tres cruces y sin integración numérica por píxel. Cambiar gas, masa, inclinación o comparadores solo actualiza uniforms.
- Pixel ratio máximo 1,5. Render a demanda; bucle solo mientras hay movimiento y gas. Se detiene en pestaña oculta. Preferencia de movimiento reducido inicia pausado.
- Textura y workers se liberan al desmontar. Sin capturas de cámara, APIs externas ni entradas HTML del usuario.
- La órbita usa SVG y funciona sin WebGL. El visor informa indisponibilidad de WebGL; los valores y controles siguen disponibles.
- Ayudas compartidas `InfoPopover`: ratón o toque, cerrar/Escape, contenidas en el viewport. Controles nativos etiquetados; rangos operables con teclado, radios y foco visible.
- Fondo estelar y textura advectada ilustrativos. No catálogo astrométrico, turbulencia real ni magnetohidrodinámica. Sin Kerr, chorros, transferencia espectral completa o solución de Novikov–Thorne.

## Fuentes

- [NASA, Black Hole Accretion Disk Visualization](https://svs.gsfc.nasa.gov/13326/): perspectiva, luz curvada y asimetría Doppler.
- [NASA, Anatomy](https://science.nasa.gov/universe/black-holes/anatomy/): horizonte, disco y sombra.
- [Sądowski et al. (2016), sección 2](https://academic.oup.com/mnras/article/456/4/3915/1031079): ecuaciones del flujo térmico newtoniano y sus supuestos.
- [Page y Thorne (1974)](https://doi.org/10.1086/152990): contexto del tratamiento relativista completo; el laboratorio **no implementa** su solución de emisividad.
- [Derivación y validación de las geodésicas compartidas](LENTE_GRAVITACIONAL.md).

## Verificación

`tests/acrecion.test.mjs` cubre apagado del gas, máximo de temperatura, integración independiente de luminosidad, escalas con masa y suministro, inferencia orbital en SI, Doppler local, transferencia de frecuencia comparada con un tetrado local, extremos de controles, tabla y captura, cuatro recorridos educativos y rutas del especial. Se mantienen las pruebas de los cinco laboratorios anteriores.

Revisión en navegador: cuatro retos completados a 390 px; controles de al menos 44 px y sin desbordamiento a 320/390 px; ventanas de información contenidas. Es emulación de viewport, no pruebas sobre dispositivos iOS/Android físicos.
