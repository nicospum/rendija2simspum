# El tren de Einstein

Segundo capítulo disponible en `/einstein/`, laboratorio 09 en el catálogo y
entrada independiente `/tren-de-einstein/`. Continúa el reloj de luz con dos
vistas, cuatro retos y un instrumento para registrar extremos.

## Modelo físico

Se reutilizan `C`, `gamma` y `boost` del modelo puro del reloj de luz. No hay
dependencias nuevas, WebGL ni animaciones precalculadas. Se evalúan eventos y
trayectorias analíticas de relatividad especial longitudinal 1D.

En el andén S, el tren se mueve a velocidad v = βc. Su longitud propia L₀ se
define en S′, donde el vagón está en reposo y sus extremos son x′ = ±L₀/2.
Los centros se encuentran en t = t′ = 0. El receptor E está fijo en x = 0;
el pasajero P, en x′ = ηL₀. Los relojes de cada sistema usan sincronización de
Einstein dentro de su propia red.

```
t = γ(t′ + βx′/c)       x = γ(x′ + βct′)
t′ = γ(t − βx/c)       x′ = γ(x − βct)
γ = 1/√(1 − β²)        c = 299 792 458 m/s
```

### Emisión y recepción son eventos diferentes

Cada extremo produce una señal dirigida al otro extremo. A corresponde al
extremo izquierdo del vagón y B al derecho, independientemente del sentido
del movimiento.

- Emisiones simultáneas en el andén: t′ emisión = −βx′/c; t emisión = 0.
- Emisiones simultáneas en el tren: t′ emisión = 0; en el andén sus fechas
  difieren en γβL₀/c.
- Recepción por P: t′ recepción = t′ emisión + |x′ emisión − ηL₀|/c.
- Recepción por E: t recepción = t emisión + |x emisión|/c.

Cada recepción se transforma como un evento completo. Los detectores ideales
registran el paso sin absorber las señales. Las trayectorias cumplen
x = x emisión ± c(t − t emisión) en ambos sistemas. El dibujo deja de mostrar
el pulso poco después de pasar por ambos receptores, conservando sus fechas.

Las tarjetas muestran fechas calculadas de emisión y llegada por separado.
Las marcas de estado distinguen «por emitir», «en viaje» y «recibida» según
el corte temporal de cada panel. No se presenta una predicción futura como
una recepción ya observada.

### Relación entre las dos vistas

El control temporal sigue τ, el tiempo del reloj central del tren. En el panel
S′ se muestra el corte t′ = τ. En el del andén, el corte t = γτ. Estos cortes
coinciden en el evento del centro del tren y difieren en otros lugares; no se
afirma que todas las posiciones de los dos paneles sean eventos idénticos.
Esto permite mostrar la relatividad de la simultaneidad sin mezclarla con
una fotografía o con retrasos ópticos.

El dibujo longitudinal separa verticalmente algunas etiquetas para leerlas:
esas alturas no agregan distancia de viaje. Los paneles comparten escala
espacial y encuadre automático; las fechas y distancias usan SI.

## Longitudes y el instrumento de extremos

En cada sistema se puede registrar un par de extremos simultáneos **en ese
sistema**. En el andén esto da L = L₀/γ. En el tren da L₀. Los pares de
eventos de las dos tarjetas son distintos, como exige la definición de longitud.

La alternativa «Mismo tiempo del tren» usa t′ igual en los dos extremos.
Transformar ese par al andén da separación γL₀ y diferencia temporal
Δt = γβL₀/c: con movimiento relativo, **esa separación no mide la longitud
instantánea en el andén**.

Ejemplo: L₀ = 300 m, β = 0,8, γ = 5/3. Medir simultáneamente en el andén da
180 m. El par simultáneo en el tren se separa 500 m y 1,334256 µs en el andén.

El botón de registro guarda una copia independiente del ensayo y sus eventos.
Adelantar el tiempo conserva las marcas, sin hacerlas seguir al tren. Cambiar
solo el método conserva el instante, pausa y limpia el registro anterior.
Cambiar las condiciones físicas reinicia las señales y limpia el registro.

## Controles, retos y accesibilidad

Rangos: −0,9 ≤ β ≤ 0,9; 100 ≤ L₀ ≤ 400 m; −0,3 ≤ η ≤ 0,3.
El tiempo interno q = cτ/L₀ va de −0,6 a 1,7: cubre todas las emisiones y
recepciones soportadas, incluidas las del pasajero desplazado. La UI y el
texto accesible del rango muestran τ en microsegundos.

La reproducción empieza pausada, se puede sustituir por avance manual y se
detiene al ocultar la página o terminar el recorrido. Actualiza como máximo
30 veces por segundo, con deltas acotados. Los colores y halos ayudan a seguir
las señales; no representan frecuencias ni fuentes de energía adicionales.

Los cuatro retos requieren observaciones y una explicación correcta:

1. **Dos destellos, dos fechas:** comparar emisiones simultáneas en el andén
   a +0,6 c con las fechas que asigna el tren.
2. **Llegar no es ocurrir:** con v = 0 y emisiones simultáneas, comparar al
   pasajero centrado y desplazado +¼L₀. Solo cambian las distancias de viaje.
3. **Invertí el movimiento:** comparar +0,6 c y −0,6 c. Se invierte el orden
   asignado a los destellos separados espacialmente, no una relación causal.
4. **Un tren, no dos instantes:** registrar ambos métodos con L₀ = 300 m y
   β = 0,8, y distinguir longitud de separación entre eventos no simultáneos.

En celular se alternan las vistas conservando el ensayo y el instante. Hay
accesos directos al visor, controles y retos; ayudas que se pueden abrir tocando;
registros textuales alternativos al SVG y controles de al menos 44 px.

## Fuentes y límites

- [Einstein Online: The definition of “now”](https://www.einstein-online.info/en/spotlight/now/): sincronización, fechas y retraso de la luz.
- [Einstein Online: The relativity of space and time](https://www.einstein-online.info/en/relativity_space_time/): simultaneidad y longitudes entre sistemas.

Consultadas el 21/10/2026. Es un experimento mental en espacio-tiempo plano,
sin aceleración, gravedad ni deformación material. La simulación evalúa un
modelo; no es una medición experimental ni una reconstrucción de una foto.

## Validación

`tests/tren.test.mjs` agrega 17 pruebas: fechas de Lorentz, emisiones
simultáneas en ambos sistemas, invariancia nula y causalidad de todas las
recepciones, posiciones de los receptores, desplazamiento del pasajero,
inversión de velocidad, ambos protocolos de longitud, velocidad c, ventana
temporal, cuatro retos y comparaciones incompletas, registros independientes,
pausa/reproducción, conservación del instante al cambiar método, entradas
inválidas y los dos capítulos disponibles del especial.

Las pruebas usan expresiones independientes de tiempo de viaje y longitud,
y tolerancias explícitas para cancelaciones de coma flotante al transformar
de vuelta eventos sobre x = 0. La inspección de navegador cubre los cuatro
retos y tamaños 320, 390, 768 y 1280 px. No reemplaza una prueba física en
iOS/Android o lectores de pantalla nativos.
