# El ascensor de Einstein

Ruta `/ascensor-de-einstein/`, laboratorio 11 y cuarto capítulo del especial Einstein. Abre el recorrido de relatividad general con caída libre, apoyo, aceleración propia y principio de equivalencia.

## Modelo mecánico

Unidades SI. Campo homogéneo de magnitud g hacia abajo y eje exterior y positivo hacia arriba. Cabina y pelotas parten en reposo. Altura de liberación h = 1,8 m.

| Situación | g exterior | a cabina exterior | Aceleración propia aₚ |
| --- | --- | --- | --- |
| Ascensor sostenido | G | 0 | G |
| Caída libre | G | −G | 0 |
| Nave acelerada | 0 | +G | G |
| Nave a la deriva | 0 | 0 | 0 |

G es el control de intensidad, 1–20 m/s². Valor de referencia: 9,81 m/s². El modelo usa velocidades bajas y una región donde el campo se considera uniforme.

- y cabina = ½ a cabina t²
- y pelota exterior = h − ½gt², antes del contacto
- y relativa = h − ½(g + a cabina)t²
- N = m(g + a cabina) = maₚ para un objeto apoyado

Se muestran una pelota de 1 kg y otra con masa seleccionable entre 0,2 y 5 kg. Sus posiciones relativas coinciden: solo se separan horizontalmente en el dibujo. La balanza sostiene un tercer objeto de la masa seleccionada; no mide la fuerza sobre las pelotas mientras caen. No se simulan aire, impacto elástico ni transitorios de la balanza. Tras el contacto, la pelota acompaña al piso sin rebote.

La duración mecánica es 1,15√(2h/G). Da tiempo a observar el contacto en los casos con apoyo, sin perder la cabina del visor. Cambiar G cambia esta duración: se muestran segundos reales y no se debe comparar la rapidez mirando solo el porcentaje de reproducción.

La vista interior usa coordenadas de la cabina. La exterior usa coordenadas del suelo en los casos con gravedad y un laboratorio inercial en el espacio. Incluye el contorno inicial de la cabina y encuadre calculado para la excursión completa. Las formas de pelotas y pesos son símbolos de puntos materiales; no se modelan sus radios físicos.

## Luz y marcos acelerados

Se usa una cabina local de aceleración propia aₚ y un rayo emitido horizontalmente. En un sistema de Rindler con el origen en el emisor:

- z = aₚ x/c²
- y = −(aₚ x²/c²) / [1 + √(1−z²)]
- t libre = x/c
- τ emisor = (c/aₚ) atanh(z), con límite x/c cuando aₚ = 0
- y emisor en el marco libre = aₚ t libre² / [√(1+(aₚ t libre/c)²) + 1]

El rayo tiene y libre = 0. Las expresiones racionalizadas evitan cancelación numérica: restar directamente √(1−z²)−1 eliminaría el efecto para aceleraciones terrestres.

La referencia exterior del ensayo óptico es un **laboratorio libre local**, inicialmente comóvil, no el marco del suelo usado en el ensayo mecánico. La línea verde es el nivel emisor de la cabina en ese marco. Los dos gráficos comparan coordenadas del mismo rayo. Para el ascensor sostenido cerca de un planeta, Rindler representa la equivalencia local sin curvatura; no es una geodésica global de Schwarzschild. Las variaciones de aceleración propia a través de una cabina rígida son despreciables a estas escalas.

c = 299.792.458 m/s. Para aₚ = 9,81 m/s² y L = 3 m, el descenso es aproximadamente 0,49118 fm y el cruce tarda 10,0069 ns. A primer orden, Δy = aₚL²/(2c²). En caída libre y deriva aₚ = 0, y el rayo es recto en la cabina local.

El gráfico ampliado usa femtómetros verticalmente y metros horizontalmente. **No preserva ángulos ni proporciones geométricas**. El modo sin ampliar usa metros en el eje vertical y hace imperceptible el desvío. Esta selección solo modifica la escala de dibujo y conserva el instante y los resultados físicos. El tiempo del pulso se muestra en ns; es un ensayo separado del movimiento mecánico en segundos.

## Cuatro retos

1. Comparar apoyo en gravedad y nave acelerada: igual caída relativa, acelerómetro y balanza a igualdad de intensidad.
2. Comparar sostenido, caída libre y deriva: peso aparente cero no implica campo cero.
3. Comparar masas de 1 y 4 kg en la nave acelerada: fuerza multiplicada por cuatro con la misma caída.
4. Comparar luz en nave acelerada y caída libre, con desvío ampliado: distinguir curvatura de coordenadas local y rectitud en un marco libre.

Los logros requieren ejecutar las comparaciones y elegir una explicación correcta. Condiciones confundidas, ensayos parciales y el modo de luz equivocado no completan un reto. Cambiar condiciones pausa y reinicia; cambiar vistas o ampliación conserva el instante. La reproducción tiene límite de 30 actualizaciones/s, se suspende en pestañas ocultas y termina en el resultado. No se agregan dependencias ni almacenamiento personal.

## Fuentes y límites

Referencias consultadas el 21 de octubre de 2026:

- [Einstein Online / Max Planck: The elevator, the rocket, and gravity](https://www.einstein-online.info/en/spotlight/equivalence_principle/).
- [Einstein Online / Max Planck: The equivalence principle and the deflection of light](https://www.einstein-online.info/en/spotlight/equivalence_light/).

La equivalencia se aplica localmente, despreciando fuerzas de marea. Un campo real no es globalmente equivalente a una cabina acelerada. Este laboratorio no simula curvatura planetaria, variaciones espaciales del campo, geodésicas globales, ingeniería de motores o relojes en distintas alturas. Ilustraciones originales calculadas con SVG.

## Código y validación

- `src/ascensor/physics.ts`: mecánica, apoyo, coordenadas y luz.
- `src/ascensor/learning.ts`: estado puro, observaciones y retos.
- `src/ascensor/Scene.tsx`: posiciones y trayectorias calculadas.
- `src/ascensor/App.tsx`: controles, lecturas, ayudas y contenido educativo.
- `src/ascensor/ascensor.css`: estilos limitados al laboratorio.

Ejecutar `npm test`, `npm run lint`, `npm run build` y `npm run research:hawking`. Las pruebas incluyen resultados analíticos independientes, integración numérica de la curva de luz, unidades SI, límites de todos los controles, invariancia frente a masa/ampliación, requisitos educativos y reproducción. La revisión visual debe comprobar las cuatro misiones, navegación del especial, ayudas y ausencia de desbordamientos entre 320 y 1280 px. La emulación de tamaño no reemplaza teléfonos físicos ni lectores de pantalla.
