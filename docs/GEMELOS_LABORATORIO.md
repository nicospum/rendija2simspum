# Nos vemos a la vuelta

Tercer capítulo del especial Einstein. Ruta: `/nos-vemos-a-la-vuelta/`.
Pregunta: ¿podemos reencontrarnos con edades diferentes?

## Modelo y unidades

Relatividad especial en espacio-tiempo plano, movimiento 1D. Casa representa una estación inercial, sin gravedad terrestre. Se usan años y años luz, de modo que c = 1 al/año. Las velocidades de los controles son β = v/c.

Se eligen la duración total T (2–20 años), las rapideces β₁ y β₂ (0,1–0,95) y la fracción f de espera (0–40 % del total). Con W = fT y M = T − W:

- t₁ = M β₂/(β₁ + β₂)
- t₂ = M β₁/(β₁ + β₂)
- D = β₁t₁ = β₂t₂
- τ = t₁√(1−β₁²) + W + t₂√(1−β₂²)

La distancia se recalcula para regresar a casa en la duración elegida. Comparar velocidades con T fijo cambia también D. Durante la espera ambos están en reposo relativo: dτ/dt = 1.

El reloj de la nave se integra por tramos: τ(t) = ∫√(1−v(t)²)dt. Es continuo en ambos cambios de velocidad. Se idealizan como instantáneas la salida, el giro y la llegada: no se simulan fuerzas, combustible ni una maniobra realizable. La edad no cambia de golpe en el giro. Para aceleraciones de duración finita hay que integrar también ese tramo.

## Dos vistas, mismo ensayo

1. **El viaje:** posición en el sistema de casa. Las vías separadas son una ayuda de dibujo para ida y vuelta; la posición física es unidimensional. La escala espacial usa T/2 como referencia, por lo que cambiar la rapidez cambia visiblemente el destino.
2. **Espacio-tiempo:** coordenadas de casa (t vertical, x horizontal). La escala de años y años luz es igual en ambos ejes; los rayos nulos tienen pendiente 45°. Las líneas tenues son el plan completo y las brillantes la historia recorrida. No es una vista óptica ni un sistema global de reposo de la nave.

En móvil se alternan los paneles conservando el instante. Los dos relojes y la diferencia permanecen debajo de ambas vistas. Antes del reencuentro, su comparación usa simultaneidad de casa; al reencontrarse los relojes están en el mismo evento.

## Simultaneidad comóvil y señales

La línea rosa une la nave con el evento de casa simultáneo en su sistema inercial comóvil actual: t casa = t − vx (c = 1). Al cambiar v, cambia esa asignación lejana. Los botones «Antes de cambiar» y «Después de cambiar» conservan t y τ y seleccionan las dos velocidades límite del primer cambio.

Caso estándar: T = 10 años, β₁ = β₂ = 0,8, f = 0. El giro ocurre en (t,x) = (5,4), con τ = 3. Las fechas remotas asignadas son 1,8 y 8,2 años. Es un salto de coordenadas de 6,4 años, no una discontinuidad física del reloj de casa ni una señal superlumínica. Con espera, el primer cambio es de ida a reposo, y hay un segundo cambio de reposo a vuelta.

La línea amarilla representa el mensaje emitido por la nave que llega ahora a casa. Se resuelve t recepción = t emisión + x emisión en cada tramo lineal. Su fecha propia de emisión se evalúa en el mismo modelo. Se distingue el mensaje recibido, el reloj de la nave en el corte actual y la asignación de simultaneidad. Es una lectura ideal continua, no una animación arbitraria de partículas.

## Cuatro retos

1. Reencuentro: comprobar 10 años en casa y 6 en la nave.
2. Comparación de rapideces: a T fijo, 0,6 c produce 8 años y 0,8 c produce 6.
3. Giro: observar ambos límites y explicar la continuidad del reloj local y el cambio de simultaneidad.
4. Espera: comparar 0 % y 20 %; la nave pasa de 6 a 6,8 años. La espera reemplaza parte del movimiento y acorta D.

El estado exige realizar las comparaciones y elegir una explicación correcta. Reiniciar un reto conserva los logros de otros; no se escriben datos personales ni se agrega almacenamiento. Cambiar un plan pausa y reinicia el ensayo. El deslizador temporal no cambia las condiciones. Reproducción limitada a 30 actualizaciones/s, pausada en pestañas ocultas y detenida al llegar.

## Organización

- `src/gemelos/physics.ts`: itinerario, integración exacta por tramos, simultaneidad y recepción de luz.
- `src/gemelos/learning.ts`: estado puro y validación de los cuatro retos.
- `src/gemelos/Scene.tsx`: SVG calculado desde el modelo, sin WebGL ni dependencias nuevas.
- `src/gemelos/App.tsx`: controles, relojes, ayudas táctiles, retos y explicación.
- `src/gemelos/gemelos.css`: estilos contenidos en el laboratorio, reutilizando el sistema visual Einstein.

## Fuentes primarias

Consultadas el 21 de octubre de 2026:

- [Einstein Online / Max Planck, The case of the travelling twins](https://www.einstein-online.info/en/spotlight/twins/): tiempo propio, comparación al reencontrarse y sistemas inerciales.
- [Einstein Online / Max Planck, Twins on the road](https://www.einstein-online.info/en/spotlight/twinsroad/): la diferencia se acumula a lo largo del recorrido; el giro une los tramos y no concentra mágicamente el envejecimiento.

Las ecuaciones y ejemplos son derivados para este modelo; las ilustraciones son originales de SVG, sin copiar imágenes de las fuentes.

## Validación

`npm test`, `npm run lint`, `npm run build`. Las pruebas de gemelos cubren ejemplos analíticos, rapideces asimétricas, continuidad, cambios de simultaneidad, geodésicas nulas de las señales, extremos de controles, integración numérica independiente, retos incompletos/correctos/incorrectos y reproducción. La inspección de navegador debe completar los cuatro retos en la versión publicada, revisar navegación de los tres capítulos, tamaños de 320–1280 px, ayudas y consola. La emulación de tamaño no sustituye probar hardware iOS/Android ni lectores de pantalla.
