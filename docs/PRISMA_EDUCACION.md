# Prisma: del control a la explicación

El recorrido pide hacer una predicción, cambiar una sola variable y contrastar la lectura con una referencia. La referencia se registra al seleccionar el reto; no se utiliza «Congelar lectura» como sustituto de esa comparación.

| Reto                  | Preparación y cambio propuesto                          | Qué se compara                                                                                 |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Luz blanca y espectro | Haz que evita el prisma a 16°; llevar su dirección a 0° | Luz blanca sin refracción frente a componentes separados después del prisma.                   |
| Brillo y trayectoria  | Misma geometría; intensidad de 35 a 90 %                | Cambia el brillo, permanecen ángulos y separación.                                             |
| Pantalla más lejos    | Distancia de 3,2 a 4,2 u                                | Δz pasa de aproximadamente 0,114 a 0,154 u (+35 %), con la misma desviación angular de 38,70°. |
| Material diferente    | Vidrio a cuarzo con idéntica geometría                  | Cambia n con λ: varían desviación y separación. Son materiales idealizados del modelo.         |

«Probar este cambio» aplica únicamente la variable del reto. También se puede mover el control resaltado; «Mover el control» y «Ver la comparación» conectan ambos sectores, especialmente en celular. Reiniciar prepara otra vez la referencia. Explorar libremente conserva la configuración y termina el recorrido.

## Escalas y conclusiones

La banda original ajusta su escala automáticamente y lo indica de forma visible. El comparador dibuja referencia y actualidad sobre **la misma escala**, centrando ambos espectros para comparar su separación. No compara posiciones absolutas sobre el banco ni brillo radiométrico. Se muestran además Δz, desviación e intensidad de la fuente.

`src/prisma/education/prismLearning.ts` deriva el comentario de las configuraciones y rayos reales; no depende de haber pulsado un botón. Comprueba antes congelación, fuente encendida, intensidad, impactos dentro del banco visible, mezcla de haces y espectro completo. Exige cambiar una sola variable frente a la referencia. Cuando esas condiciones no se cumplen, explica el problema sin afirmar que se ha observado el resultado del reto.

Las diez pruebas nuevas cubren los cuatro cambios, referencias independientes, ajustes pendientes, apagado, intensidad cero, mezcla, reflexión interna e impactos exteriores. No se modifican las ecuaciones ópticas ni la cámara.

## Historia y alcance

Newton explicó la luz blanca como una mezcla de componentes con distintas refrangibilidades. Contrastó esa explicación seleccionando porciones del espectro, refractándolas con otro prisma y reuniendo colores para recuperar blanco. Esas pruebas adicionales **no están simuladas** en este banco de un solo prisma.

La explicación conecta este aporte con la naturaleza del color y la aberración cromática de las lentes: las componentes no enfocan igual. Ese problema motivó a Newton a explorar telescopios con espejos. La lectura histórica enlaza su fuente de 1672 y distingue el lenguaje moderno de longitudes de onda.

La simulación ya presupone un espectro y n(λ): explora consecuencias del modelo y no constituye evidencia independiente para decidir cómo se originan los colores. Las 33 longitudes de onda son muestras de una representación continua.

- [Newton, carta sobre luz y colores, 1672](https://newtonproject.ox.ac.uk/view/texts/normalized/NATP00006).
- [OpenStax, dispersión](https://openstax.org/books/university-physics-volume-3/pages/1-5-dispersion).

Como extensión podría agregarse selección/recombinación, con su propio modelo y verificaciones. La comprensión del recorrido debería contrastarse con estudiantes o docentes; las pruebas de software no sustituyen esa evaluación.
