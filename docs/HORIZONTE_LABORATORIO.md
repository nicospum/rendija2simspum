# Al borde del horizonte

Laboratorio 07: `/horizonte/`. El especial de agujeros negros conecta lente → acreción → horizonte → Hawking → entropía. Conserva todas las rutas anteriores y no agrega dependencias.

## Objetivo educativo

Distinguir un tiempo propio, una coordenada de tiempo y una señal recibida. El mapa no es una fotografía de la sonda. Su reloj cruza el horizonte en tiempo propio finito; los pulsos exteriores cada vez más cercanos al horizonte se reciben más tarde y a menor frecuencia. Los pulsos emitidos en el horizonte o dentro no tienen llegada a la antena exterior. No se muestra una imagen brillante congelada para siempre.

Los cuatro retos son:

1. **Dos alturas, dos ritmos:** comparar ensayos de reloj sostenido a 4 y 1,2 rs, al mismo T. El cociente de ritmos baja de 88,9 % a 41,9 %. Cambiar el radio recalcula un ensayo independiente, borra envíos manuales y pausa; no representa trasladar instantáneamente un reloj real.
2. **Cruzar sin parar el reloj:** visitar el horizonte y un punto interior; distinguir cruce propio finito de recepción exterior. El botón de horizonte usa su tiempo exacto.
3. **Mensajes cada vez más rojos:** guardar pulsos de la caída en 3 y 1,05 rs. Comparar frecuencia recibida y demora. La tabla del tren usa intervalos de emisión propios iguales y calcula diferencias finitas entre llegadas, sin confundirlas con una aproximación diferencial.
4. **El último lugar para avisar:** guardar un pulso exterior (1,2 rs) y otro interior (0,8 rs), y recibir el exterior desde su tarjeta. El primero tiene una llegada futura, el segundo no. La tarjeta adelanta el mapa hasta esa llegada calculada; «Escuchar el próximo» recorre todas las señales, incluido el tren automático. También se acredita la recepción exterior si se alcanza su llegada con el tiempo o la reproducción.

No basta elegir una respuesta correcta: hacen falta comparaciones o envíos guardados del reto. Las predicciones pueden revisarse. Cambiar de reto restaura sus condiciones y conserva los ya completados durante la sesión. No se usa almacenamiento persistente. La historia manual tiene un máximo de 16 entradas; se muestran las cuatro últimas.

## Modelo físico y unidades

Schwarzschild eterno, sin giro ni carga, con sonda y luz de prueba. `rs = 2GM/c²`, `x = r/rs`, `T = ctPG/rs`. La unidad de tiempo físico es rs/c; para cuatro millones de masas solares nominales equivale a unos 39,4 s. La antena permanece estática a 20 rs (radio finito, no infinito).

La métrica radial en coordenadas entrantes de Painlevé–Gullstrand es:

`ds²/rs² = −(1−1/x)dT² + 2/√x dT dx + dx²`.

Estas coordenadas son regulares en x = 1; no son el tiempo t de Schwarzschild. Los relojes del mapa se inicializan con lectura cero en T = 0. Sus lecturas corresponden al mismo corte PG, una convención de simultaneidad, no a una observación óptica directa. Para saber qué conoce la antena se propaga cada pulso.

### Relojes sostenidos

Para radio fijo exterior: `dτ = √(1−1/x) rs/c dT`. El cociente sonda/antena es `√[(1−1/x)/(1−1/20)]`. La aceleración propia necesaria es `a = c²/[2 rs x² √(1−1/x)]`. Es divergente al acercarse al horizonte; el control solo permite sostener un reloj entre 1,2 y 4 rs.

### Caída elegida

Geodésica radial E = 1, caída desde reposo en infinito. La simulación comienza en 4 rs **ya con velocidad de caída**: no se suelta en reposo en 4 rs. Sus relojes empiezan a contar al entrar en el tramo.

`dx/dT = −1/√x`, `dτsonda = rs/c dT`.

`x(T) = [4^(3/2) − 3T/2]^(2/3)`.

El horizonte se cruza en `T = (2/3)(8−1) = 14/3`, con τ ≈ 183,9 s para cuatro millones M☉. La aceleración propia de la sonda es cero; eso no implica ausencia de curvatura o fuerzas de marea en un objeto extenso. No se calculan mareas.

El tramo dibujado termina en x = 0,6. Después desaparecen sonda y lectura propia; no se congela un reloj ni se inventa una trayectoria posterior. La antena puede seguir escuchando hasta T = 48. El botón de horizonte trata la igualdad numérica con cuidado para evitar convertir un pulso exactamente sobre el horizonte en uno exterior por redondeo.

### Rayos y recepción

Las dos direcciones radiales de luz cumplen `dx/dT = ±1 − 1/√x`. Son velocidades de coordenadas, no velocidades medidas localmente. Un observador local mide c. La dirección saliente aumenta x fuera, permanece en x = 1 sobre el horizonte y disminuye x dentro.

Para una emisión saliente exterior en (Te, xe):

`Tarr = Te + Q(20) − Q(xe)`

`Q(x) = x + 2√x + 2 ln|√x−1|`.

El reloj físico de la antena marca `τarr = √(1−1/20) Tarr rs/c`. Las demoras se expresan con ese mismo reloj, `Δτant = √(1−1/20)(Tarr−Te) rs/c`; no se resta sin más un tiempo propio emisor a uno receptor.

El mapa de fotones invierte Q por bisección en la rama correspondiente. La rama interior termina al alcanzar la singularidad, sin prolongación ni llegada exterior. En el horizonte el rayo saliente conserva x = 1. Para la dirección entrante se invierte `H(x) = −x + 2√x − 2 ln(1+√x)`; ambas curvas del diagrama son rayos nulos, no flechas ajustadas a mano. El diagrama amplía su escala cerca del horizonte y siempre muestra sus ejes.

La frecuencia recibida respecto de la emitida es:

- Sostenida: `g = √[(1−1/x)/(1−1/20)]`.
- Caída E = 1, rayo saliente: `g = (1−1/√x)/√(1−1/20)`, solo para x > 1.

La segunda expresión incluye el Doppler del emisor que cae además del factor gravitacional. Puede derivarse componiendo el factor estático con `1/[γ(1+β)]`, β = 1/√x y γ = 1/√(1−β²). También coincide con el inverso de la derivada del tiempo propio de llegada respecto del de emisión. La tabla usa llegadas exactas de pulsos separados, no supone que un intervalo finito sea igual a su derivada local.

El receptor solo muestra como recibido un pulso cuyo Tarr ya pasó en el mapa. Las tarjetas de envíos muestran **predicciones de llegada**, claramente separadas de esa recepción. No recibir una señal aún y no poder recibirla nunca son estados diferentes. Las llegadas que superan T = 48 se identifican como fuera de la ventana de escucha; no se clasifican como imposibles.

## Visualización y funcionamiento

- React y SVG calculado: no necesita WebGL ni incorpora dependencias. No es una cámara inmersiva ni una imagen de lente.
- Fondo estelar y brillo del aro ilustrativos. El aro marca el límite; no emite luz. El radio gráfico exterior usa una compresión logarítmica explícita y el interior una escala lineal.
- HUD con relojes junto al mapa, más lecturas detalladas y ayudas. El color de los pulsos representa cambios de frecuencia, no un espectro visible literal ni su intensidad física. El punto interior violeta solo existe en el mapa causal, no es luz vista desde afuera.
- Dos vistas: caída y futuros radiales de la luz. Antena, tarjetas comparativas y tabla de intervalos complementan las vistas.
- Tiempo inicialmente pausado; reproducción explícita a ritmo nominal 0,8 rs/c por segundo animado, avance por pasos, radio directo y accesos a puntos clave.
- Animación limitada a 30 actualizaciones por segundo, detenida al pausar, ocultar la pestaña o terminar la ventana. Los pasos de cuadro están acotados para evitar saltos al recuperar una pestaña. La preferencia de movimiento reducido se informa y todos los retos pueden hacerse sin animación.
- Reducer puro probado para configuración, reloj, envíos, escucha, predicciones y progreso. Datos inválidos no corrompen el estado. Cambiar de modo elimina envíos incompatibles; cambios de masa recalculan unidades físicas manteniendo la geometría normalizada.
- Controles nativos etiquetados y operables con teclado. Ayudas `InfoPopover` compartidas, con toque/ratón, cerrar/Escape y límites de viewport. Navegación móvil entre mapa, controles, mensajes y retos.

## Fuentes primarias y académicas

- [Dray, Geometry of General Relativity, Oregon State: radial geodesics](https://sites.science.oregonstate.edu/physics/coursewikis/GGR/book/dfggr/oradial.html): caída E = 1, tiempo propio y observadores estáticos.
- [Oregon State: Schwarzschild observers](https://sites.science.oregonstate.edu/coursewikis/GGR/book/ggr/schwobs.html): familias de observadores y distinción entre coordenadas y medidas.
- [Hamilton y Lisle, The river model of black holes](https://arxiv.org/abs/gr-qc/0411060), American Journal of Physics 76 (2008), 519–532: formulación regular y causalidad. No se interpreta la velocidad del «río» como una velocidad material local mayor que c.
- [Pössel, Einstein Online: Changing places](https://www.einstein-online.info/en/spotlight/changing_places/): explicación de la estructura causal interior.
- [NASA SVS 14576](https://svs.gsfc.nasa.gov/14576/): referencia de una visualización distinta, inmersiva, de la caída. No se usan sus imágenes ni se promete reproducir esa cámara.

## Validación

`tests/horizonte.test.mjs` contrasta: métrica y relojes en SI, escalas con masa, normalización temporal de la geodésica, cruce exacto, derivada de Q, cuadratura independiente de la demora, frecuencia derivada de llegadas y de un tetrado local, rayos comparados con RK4 independiente, norma nula, captura y recepción, trenes de tiempo propio igual, cuatro retos, pausa, límites de memoria y rechazo de entradas inválidas. El resto de pruebas de SPUM se conserva.

La revisión de viewport no reemplaza pruebas sobre teléfonos físicos, lectores de pantalla reales o baterías de dispositivos. Los límites del modelo y la separación entre mapa, predicción y recepción quedan visibles en la interfaz.
