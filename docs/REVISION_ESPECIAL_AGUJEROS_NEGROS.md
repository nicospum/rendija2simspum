# Revisión del especial de agujeros negros

Fecha: 21/10/2026. Sitio: https://www.spumexp.lat/agujeros-negros/.
Base revisada: `c7d0870`. Este informe corresponde a los cinco capítulos de
agujeros negros; `REVISION_CINCO_LABS.md` conserva la revisión histórica del
catálogo anterior.

## Recorrido y retos

Se recorrió la web pública desde el especial hasta el último capítulo mediante
los enlaces de la interfaz. El índice de cada capítulo contiene los cinco
destinos, señala el capítulo actual y ofrece anterior/siguiente; el último
regresa al mapa del especial. Los destinos y el orden se comprobaron también
en la copia local con las correcciones.

En un visor de 390 × 844 se completaron las veinte comparaciones mediante los
controles visibles, seleccionando una explicación y comprobando el progreso
4/4 de cada laboratorio:

| Capítulo | Comparaciones realizadas |
| --- | --- |
| Lente gravitacional | Con/sin lente; fuente alineada; rayo capturado; doble masa con distancias físicas fijas. |
| Cómo vemos lo invisible | Gas apagado/encendido; inclinación y curvatura; contraste Doppler y vista de frente; período orbital con doble masa. |
| Al borde del horizonte | Reloj sostenido a 4 y 1,2 rs; cruce e interior; pulsos a 3 y 1,05 rs; recepción de un envío exterior frente a uno interior sin llegada. |
| Hawking | Masa ×2 y temperatura ×½; absorción del fondo cósmico; avance al 75 % de la vida ideal; área y entropía ×4. |
| Bekenstein–Hawking | Doble masa; 16 áreas de ejemplo divididas por cuatro; emisión del 25 % de masa; inclusión de la entropía térmica de la radiación. |

Se comprobaron además extremos de controles, selección de cámara/rayo,
comparación con la referencia, pausa del disco, navegación al horizonte de
Hawking, unidades y giro del mapa de entropía. No se encontraron errores en
las relaciones físicas o en la resolución de los retos durante esta revisión.

## Problemas anteriores corregidos

1. **Saltos móviles poco previsibles en capítulos largos.** Hawking, lente y
   entropía heredaban desplazamiento suave: al alternar entre retos y controles
   la URL podía señalar el destino antes de que el panel estuviera visible.
   El estilo compartido ahora usa saltos inmediatos hasta 850 px. Conserva el
   espacio de 78 px sobre el destino para el menú fijo de 58 px. En los cinco
   capítulos, los diez saltos probados a retos/controles terminaron a unos
   78 px del borde superior, por debajo del menú.
2. **Retorno de foco que podía mover la página al cerrar una explicación.**
   El cierre y Escape mantienen el retorno al botón de ayuda, usando
   `preventScroll` para respetar la posición de lectura.

Son cambios de interfaz compartida, sin dependencias nuevas ni cambios a las
ecuaciones. Las modificaciones alcanzan también a otros laboratorios que
reutilizan estos componentes.

## Verificación adaptable y técnica

- Los cinco capítulos se inspeccionaron a 320, 390, 768 y 1280 px. Sin
  desbordamiento horizontal ni anclas internas inexistentes. Botones, rangos
  y desplegables visibles conservan áreas de interacción de al menos 44 px.
- Las ayudas de horizonte, acreción y entropía se abrieron/cerraron con los
  controles. En 320 px el panel queda dentro del visor; abrir la ayuda junto a
  «Curvar la luz» no altera la casilla. Los visores WebGL se verificaron
  visualmente, además de leer la interfaz accesible: el contenido alternativo
  de un canvas no prueba que WebGL haya fallado.
- `npm test`: 142 pruebas aprobadas.
- `npm run research:hawking`: 10 comprobaciones independientes aprobadas.
- `npm run lint`, `npm run build` y `git diff --check`: aprobados.

Para comprobar una publicación se comparan los SHA-256 de los nueve HTML y
los JS/CSS de `dist` con los archivos servidos por el dominio, y se repiten los
saltos a retos/controles y la apertura de ayudas en la web pública.

## Límites de la revisión

Las pruebas móviles usan un navegador con dimensiones de celular. No sustituyen
una prueba en teléfonos iOS/Android reales, gestos multitáctiles, lectores de
pantalla nativos o mediciones de batería y rendimiento sostenido. La suite
numérica comprueba el modelo; no constituye una validación astronómica.
