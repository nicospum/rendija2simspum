# Modelo físico del prisma

La simulación usa óptica geométrica: calcula trayectorias a partir de la geometría y del índice de refracción, y vuelve a calcularlas cuando cambian los controles. Los colores de la pantalla proceden de los impactos calculados. La escena representa un haz continuo en régimen estacionario; no simula la propagación temporal de ondas electromagnéticas a la velocidad de la luz.

## Geometría y unidades

El modelo de `src/prisma/physics/optics.ts` trabaja en una sección horizontal `(x, z)`. La escena extruye esa misma sección en el eje vertical `y` para construir el prisma 3D. Compartir los vértices evita que las caras visibles difieran de las caras utilizadas para refractar.

- Longitud de onda: nanómetros en la API; micrómetros dentro de Cauchy.
- Ángulos: grados en la configuración y las mediciones; radianes para trigonometría.
- Distancias: unidades de escena, indicadas como `u`; no representan metros o centímetros.
- Fuente: `x = −3,6 u`, con dirección y desplazamiento lateral configurables.
- Pantalla: plano `x = screenDistance`, medido desde el centro del prisma.
- Rotación del prisma: el dial muestra una variación respecto de una orientación de referencia fija de 20°. El cero del dial no es el ángulo de incidencia.

El modelo muestrea 33 longitudes de onda entre 380 y 700 nm, cada 10 nm. Para un haz con anchura utiliza tres posiciones transversales —borde, centro y borde—; con anchura cero utiliza únicamente la central. Es un muestreo finito, no un espectro continuo completo.

La escena destaca siete trayectorias centrales con líneas finas para facilitar la lectura; el haz suave y la pantalla utilizan el conjunto calculado. Las líneas conservan la desviación física y la separación calculadas; el modelo sigue trazando las 33 longitudes de onda.

## Dispersión: ecuación de Cauchy

Se conserva la fórmula y los coeficientes que existían en el repositorio:

```text
n(λ) = A + B / λ² + C / λ⁴
λ = longitudDeOndaNm / 1000
```

| Material | A | B | C |
| --- | ---: | ---: | ---: |
| Vidrio | 1,5046 | 0,00420 | −0,000108 |
| Cuarzo | 1,4580 | 0,00354 | −0,000099 |
| Acrílico | 1,4870 | 0,00370 | −0,000105 |

Son aproximaciones educativas heredadas, sin una fuente experimental documentada. No son especificaciones certificadas de un vidrio comercial. El material llamado «cuarzo» se trata como isotrópico y no representa la birrefringencia del cuarzo cristalino. La fórmula se limita al intervalo implementado de 380–700 nm.

Con estos coeficientes, las longitudes de onda cortas tienen mayor índice que las largas y cambian más de dirección. La dependencia del índice respecto de la longitud de onda explica la separación del espectro. [Referencia conceptual: dispersión, OpenStax](https://openstax.org/books/university-physics-volume-3/pages/1-5-dispersion).

## Refracción y reflexión interna

Para cada rayo se encuentra la intersección más próxima con una cara del triángulo. La dirección cambia aplicando la ley de Snell en forma vectorial:

```text
n₁ · sen(θ₁) = n₂ · sen(θ₂)
```

Los ángulos se miden respecto de la normal de la cara. El aire se aproxima por `n = 1`; el prisma utiliza `n(λ)`. Se calculan separadamente la entrada y la salida, con sus normales reales. [Referencia: refracción, OpenStax](https://openstax.org/books/university-physics-volume-3/pages/1-3-refraction).

Si al intentar salir se cumple `(n₁ / n₂) · sen(θ₁) > 1`, no existe una dirección transmitida y el rayo se refleja dentro del prisma. El cálculo continúa hasta que sale o alcanza un límite de 12 reflexiones internas. Ese límite evita trabajo sin cota en configuraciones con rebotes repetidos. [Referencia: reflexión interna total, OpenStax](https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection).

El algoritmo utiliza tolerancias numéricas para caras casi paralelas, impactos en vértices y el ángulo crítico. En un vértice ideal no existe una única normal: ante caras empatadas se escoge la más frontal al rayo.

## Potencia y pantalla

En cada interfaz transmitida se estima la reflectancia de Fresnel para luz no polarizada. La potencia relativa del rayo principal se multiplica por `1 − R` en cada cruce. Se sigue la rama transmitida y la reflexión interna total; las ramas de reflexión parcial no se dibujan. No se modelan absorción volumétrica ni rugosidad óptica.

La intensidad de la lámpara controla el brillo relativo, sin cambiar el índice o la dirección. El color RGB de cada longitud de onda es una aproximación para la pantalla del dispositivo, no una conversión colorimétrica calibrada. La pantalla suma contribuciones en 192 celdas y normaliza el brillo para que se vean las franjas; no representa una lectura radiométrica. La transparencia del material 3D y el brillo visual son recursos de representación y no sustituyen el cálculo de las trayectorias.

El modelo devuelve impactos sobre un plano de pantalla infinito. El panel 3D adapta su tamaño y posición a los impactos, con un límite lateral de `−12 ≤ z ≤ 12 u`. Un rayo puede alcanzar el plano fuera del banco visible: la escena informa cuántos impactos quedaron fuera. Ese recorte visual no cambia las mediciones del modelo.

## Lecturas disponibles

- **Incidencia:** ángulo respecto de la normal en la entrada, para el rayo central de 550 nm.
- **Desviación:** cambio de dirección entre entrada y salida del mismo rayo de 550 nm. Puede tener signo según el sentido del giro.
- **Separación espectral:** distancia lateral entre los impactos de los rayos centrales de 380 y 700 nm, cuando ambos llegan al plano de pantalla después de atravesar el prisma.
- **Reflexiones internas:** cantidad de rebotes calculados para todos los rayos muestreados.

Cuando una lectura no aplica —por ejemplo, la lámpara no alcanza el prisma o uno de los extremos del espectro no llega a la pantalla— el modelo devuelve `null`. No se inventa un valor para mantener un arcoíris visible.

## Límites de uso

El modelo sirve para explorar refracción, dispersión y reflexión interna total. No incluye difracción por rendijas, interferencia, polarización, birrefringencia, espectro de una lámpara comercial ni movimiento fuera de la sección horizontal. Para hacer mediciones de laboratorio haría falta incorporar materiales y unidades calibrados, densidad espectral de la fuente y respuesta espectral del detector.
