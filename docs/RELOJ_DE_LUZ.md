# El reloj de luz · Especial Einstein

## Recorrido y ejecución

`/einstein/` abre el especial. Su primer capítulo disponible es
`/reloj-de-luz/`; también figura como laboratorio 08 en el catálogo general.
El tren de Einstein ya está disponible como segundo capítulo; los cuatro
siguientes se presentan como propuestas, sin enlaces a laboratorios inexistentes. Lente y horizonte conectan con el especial de
agujeros negros ya disponible.

Las dos entradas se compilan con `npm run build` y se ejecutan con `npm run dev`,
como el resto de SPUM. No se agregan dependencias. El laboratorio usa SVG
calculado, sin WebGL ni recursos de imagen externos. La ilustración de Einstein
y el diagrama de la portada son SVG propios.

## Modelo físico

Dos espejos ideales, separados transversalmente L = 150 m, acompañan a un reloj
inercial. Un pulso parte del espejo inferior y se refleja en el superior. **Un
tic se cuenta al regresar al mismo espejo emisor**, no en cada reflejo.

Se usa c = 299 792 458 m/s, exactamente. En el sistema propio:

```
Δτ = 2L/c = 1,0006922856 µs
x₀ = 0
y(f) = 2L min(f, 1 − f)    0 ≤ f ≤ 1
τ(f) = f Δτ
```

En un sistema donde ese reloj se mueve a velocidad u = βc:

```
γ = 1/√(1 − β²)
t = γ(τ + βx₀/c)
x = γ(x₀ + βcτ)
y = y₀
```

Por tanto, para el pulso seguido, t = γτ y x = βct. Cada rama tiene componentes
de velocidad (βc, ±c/γ), cuyo módulo es c. El recorrido completo mide 2γL y el
intervalo asignado es γΔτ. La separación transversal de los espejos no cambia.

En la UI β va de 0 a 0,95. Seguir el reloj de la nave usa +β en la estación;
seguir el de la estación usa −β en la nave. Se invierte el reloj seguido,
conservando la misma relación entre tiempo propio y tiempo asignado.

### Qué representan las dos vistas

Ambos paneles coinciden en **el mismo evento del pulso seguido**, transformado
con Lorentz. Cada sistema dibuja su corte de simultaneidad y los espejos del
reloj seguido en ese instante. No se dibuja un segundo reloj distante con una
lectura óptica inventada. El tiempo del sistema donde se mueve el reloj se
asigna mediante una red de relojes sincronizados: los extremos del tic ocurren
en posiciones distintas allí.

Al cambiar el reloj seguido comienza otro ensayo desde el encuentro inicial y
se compara otro par de eventos. La reciprocidad no afirma que dos relojes se
reúnan con edades simultáneamente menores. No se simula un viaje de ida y vuelta.

Los paneles usan la misma escala espacial y encuadre automático para conservar
los espejos y un tic entero a cualquier velocidad admitida. La regla indica
metros por división; la distancia entre espejos se rotula como 150 m. El halo y
los colores distinguen sistemas, no frecuencias físicas diferentes.

## Controles y rendimiento

- Velocidad lineal y acotada; ejemplos 0, 0,6, 0,8 y √3/2 ≈ 0,866 c.
- Selector del reloj seguido: nave o estación. Cambiar velocidad/reloj pausa y
  reinicia el ensayo, sin simular aceleración ni conservar una trayectoria incompatible.
- Recorrido manual, reflejo, regreso, avance de 10 %, reproducción y pausa.
- Guía opcional del recorrido calculado del tic completo.
- En celular se alternan las perspectivas sin cambiar el evento ni los datos.

La animación empieza pausada; todo se puede explorar manualmente. Al reproducir,
un tic tarda 5γ segundos de pantalla: se avanza a un ritmo constante de tiempo
coordenado del sistema donde el reloj se mueve. No se confunden esos segundos
visuales con los microsegundos físicos mostrados. La UI actualiza como máximo
30 veces por segundo, limita deltas grandes y detiene el bucle al ocultar la
página o completar el tic. El SVG estático no necesita ningún bucle activo.

## Cuatro retos

1. **Primero, el mismo ritmo:** completar un tic con β = 0 y comparar los tiempos.
2. **Más camino, la misma luz:** completar tics de la nave a 0,6 c y 0,8 c. Los
   caminos son 375 y 500 m; los intervalos asignados, 1,250865 y 1,667820 µs.
3. **¿Quién se mueve?:** a 0,8 c, completar un tic siguiendo cada reloj, para
   observar la reciprocidad entre sistemas inerciales.
4. **Encontrá el medio ritmo:** completar un tic con 1/γ entre 49,5 y 50,5 %.
   La solución exacta central es β = √3/2, γ = 2.

Cada reto exige las observaciones correspondientes y una explicación correcta.
Elegir una respuesta, mostrar un camino parcial o usar un sistema inadecuado
no alcanza. Cambiar de reto conserva los descubrimientos de la sesión, pero
prepara un ensayo y una predicción independientes. El progreso representa
aprendizaje de relaciones del modelo, no una medición experimental.

## Fuentes y alcance

- [Pössel, Einstein Online: From light clocks to time dilation](https://www.einstein-online.info/en/spotlight/light-clocks-time-dilation/): reloj transversal, tiempo propio, reciprocidad y definición local del tic.
- [Pössel, Einstein Online: The dialectic of relativity](https://www.einstein-online.info/en/spotlight/dialectic/): simultaneidad y aparentes contradicciones entre sistemas.

Modelo de relatividad especial en espacio-tiempo plano, sin gravedad,
aceleración, dispersión de espejos ni propagación posterior hasta una cámara.
Las fuentes se consultaron el 21/10/2026. La transformación usada es analítica;
no se aproximan trayectorias mediante animaciones prefabricadas.

## Validación

`tests/reloj.test.mjs` añade 13 pruebas: referencias SI, medio ritmo, trayectos
nulos en todo el rango, módulo c de la velocidad, transformación inversa,
intervalo de Minkowski, correspondencia entre paneles, reciprocidad, definición
del tic, entradas inválidas, los cuatro retos, comparaciones incompletas,
reinicio y reproducción/pausa. Incluye la presencia de las entradas MPA.

La revisión de navegador completó los cuatro retos a 390 px y comprobó tamaños
320, 390, 768 y 1280 px, controles de al menos 44 px, ayudas contenidas,
alternancia de vistas, pausa y enlaces desde SPUM/Einstein. Se corrigió un
desbordamiento de la ilustración en 320 px. La comprobación en teléfonos
iOS/Android reales y lectores de pantalla nativos queda pendiente.
