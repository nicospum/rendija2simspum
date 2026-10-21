# Propuesta de serie: agujeros negros

Actualización de horizonte: [Al borde del horizonte](HORIZONTE_LABORATORIO.md) ya está implementado. El recorrido publicado es lente → acreción → horizonte → Hawking → entropía. Incluye caída libre radial, relojes sostenidos y recepción de señales; no incluye aún fuerzas de marea ni cámara inmersiva. Las propuestas restantes conservan ese carácter.

Actualización: ya está implementado [Cómo vemos lo invisible](ACRECION_LABORATORIO.md), que combina disco de acreción y una estrella testigo. El especial `/agujeros-negros/` conecta lente, acreción, Hawking y entropía con índice y anterior/siguiente. Los módulos futuros de este documento siguen siendo propuestas.

21 de octubre de 2026. Son simulaciones de predicciones físicas y exploraciones de evidencia; no todos son experimentos históricos reproducibles. Radiación de Hawking, lente gravitacional y entropía de Bekenstein–Hawking están implementados como laboratorios independientes. Ver [modelo y retos de entropía](ENTROPIA_LABORATORIO.md).

## Primer recorrido de cuatro laboratorios

1. **Lente gravitacional: ¿podés ver lo que está detrás?** Mover una fuente y la cámara, lanzar rayos, comparar la imagen observada con sus trayectorias calculadas. Empezar con Schwarzschild e integración de geodésicas nulas; marcar captura, esfera de fotones y anillos de Einstein. Distinguir sombra aparente y horizonte. Pruebas: límite de campo débil, simetría, convergencia del integrador y parámetro crítico de captura. Si todas las distancias se expresan en radios gravitacionales, cambiar solo la masa no cambia la geometría adimensional: incluir distancias físicas fijas para enseñar cuándo sí cambia la imagen.
2. **Horizonte y tiempo: ¿quién ve caer a quién?** Comparar reloj propio de una sonda y señales recibidas lejos. Cambiar radio de emisión y mostrar corrimiento gravitacional y retraso de llegada. La relación de relojes estáticos fuera de un Schwarzschild es dτ/dt = √(1 − rₛ/r); no aplicarla como si fuera la relación completa de una sonda en caída. El horizonte no es una superficie sólida y el tiempo propio de caída puede ser finito.
3. **Radiación de Hawking: ¿por qué uno más pequeño es más caliente?** Laboratorio existente, mejorado. Cuatro retos: masa, entorno, evaporación ideal y área/entropía. No confundir emisión con acreción ni una señal visual amplificada con fotones visibles. La potencia y la evolución implementadas son un modelo ideal de fotones, no una predicción completa con todas las especies y factores de cuerpo gris.
4. **Entropía: ¿por qué cuenta el área?** Expandir el explorador incorporado en Hawking en un laboratorio propio: comparar radio, área y volumen; duplicar M y descubrir S ×4; interpretar S/kB = A/(4ℓP²); explorar las constantes; contrastar entropía del agujero negro y segunda ley generalizada. Una representación de microestados debe declararse modelo didáctico, no microscopía de un horizonte. No sumar curvas inventadas para afirmar que resolvemos la paradoja de la información.

El recorrido anterior describe relaciones entre temas. Entropía ya está integrada. Para las **próximas implementaciones**, se recomienda: (1) horizonte, relojes y corrimiento al rojo; (2) órbitas de fotones y materia; (3) mareas y espaguetificación; (4) disco de acreción; (5) rotación Kerr y extracción de energía; (6) fusiones y ondas gravitacionales; (7) información, curva de Page y una introducción controlada a holografía/Maldacena. Estos últimos temas necesitan modelos propios y mayor cuidado conceptual. Es una propuesta de continuidad, no trabajo iniciado.

Los cuatro retos implementados de entropía comparan área y volumen asociado al duplicar M; explican el factor ¼ con una lupa algebraica; muestran la disminución de S del agujero negro durante emisión ideal; y suman la entropía térmica de la radiación. Absorción, una contabilidad general de materia entrante y entropía cuántica fina quedan como ampliaciones. La trama es geométrica y la lupa de Planck es un ejemplo aparte; no son estructura microscópica observada.

## Catálogo ampliado

| Módulo                         | Qué manipula el visitante                                      | Qué descubre / alcance                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Lente gravitacional            | Fuente, cámara, masa a distancias físicas fijas, rayos         | Imágenes múltiples, anillos y curvatura de la luz; requiere geodésicas calculadas.                                                          |
| Horizonte y tiempo             | Radio, emisor estático o en caída, observador                  | Tiempo propio, señales y corrimiento al rojo; no congelar universalmente el tiempo.                                                         |
| Radiación de Hawking           | Masa, entorno, tiempo ideal                                    | T ∝ M⁻¹ y evaporación acelerada; predicción semiclásica.                                                                                    |
| Entropía Bekenstein–Hawking    | Masa y comparación de superficies                              | S ∝ A ∝ M²; unión de gravedad, cuántica y termodinámica.                                                                                    |
| Órbitas de luz y captura       | Parámetro de impacto y dirección de emisión                    | Escape/captura y órbita circular inestable; distinguir esfera de fotones de horizonte.                                                      |
| Órbitas de materia e ISCO      | Radio y velocidad inicial                                      | Órbitas estables, precesión y caída; Schwarzschild antes de Kerr.                                                                           |
| Espaguetificación              | Masa, distancia y longitud de un objeto                        | Gradiente de gravedad y fuerzas de marea; comparar a igual distancia y a igual r/rₛ.                                                        |
| Disco de acreción              | Inclinación, sentido de giro y modelo de disco                 | Lente, Doppler y asimetría de brillo; especificar emissividad y distinguir su calor de Hawking.                                             |
| Agujero negro en rotación      | Giro y dirección de órbita                                     | Kerr, ergosfera y arrastre de referencia; coste matemático mayor.                                                                           |
| Energía de la rotación         | Trayectoria dentro de la ergosfera y condiciones de separación | Proceso de Penrose ideal; más adelante superradiancia como problema de ondas separado.                                                      |
| Fusión y ondas gravitacionales | Masas y espines dentro de un modelo válido                     | Señal inspiral–fusión–ringdown, energía radiada y área final. Usar datos o modelos calibrados; no una animación orbital arbitraria.         |
| Segunda ley generalizada       | Absorción o evaporación, contabilidad interior/exterior        | Diferenciar disminución de S del agujero negro de entropía total; declarar qué se calcula.                                                  |
| Información y curva de Page    | Subsistemas, correlaciones, estado puro o mezcla               | Entropía de entrelazamiento mediante sistemas pequeños calculables; analogía explícita, no simulación de evaporación real.                  |
| Holografía y Maldacena         | Sistema de frontera y diccionario de un ejemplo controlado     | Introducción conceptual a AdS/CFT. No presentarlo como una demostración experimental de que todo agujero negro astrofísico es un holograma. |
| Detectar un agujero negro      | Datos de órbitas, brillo o señales gravitacionales             | Inferir parámetros con incertidumbre y comparar hipótesis: qué se mide y qué se deduce.                                                     |

Los módulos de rayos, órbitas y horizonte podrían compartir un núcleo físico probado. Conviene publicarlos por etapas y medir rendimiento en celulares antes de incorporar Kerr o un trazado volumétrico costoso. Evitar construir un integrador genérico enorme antes del primer módulo.

## Fuentes y límites

- [Wald, The Thermodynamics of Black Holes](https://doi.org/10.12942/lrr-2001-6): entropía, temperatura y segunda ley generalizada. La fórmula con todas las constantes es **S = kB c³ A/(4Gℏ)**. Bekenstein propuso la conexión entropía–área; la temperatura de Hawking fijó el coeficiente en relatividad general. ℏ aparece también en la incertidumbre de Heisenberg, pero esa es otra relación.
- [NASA, Anatomy of a Black Hole](https://science.nasa.gov/universe/black-holes/anatomy/): horizonte, esfera de fotones, sombra, acreción y ergosfera.
- [NASA, visualización relativista de caída y sobrevuelo](https://svs.gsfc.nasa.gov/14576/): perspectiva de observadores, luz, horizonte y mareas en un caso no rotatorio.
- [ESA ACT, Black Hole Ray Tracing](https://www.esa.int/gsp/ACT/phy/Projects/Blackholes/WebGL/): referencia técnica de trazado de geodésicas; su texto histórico no es una actualización sobre observaciones actuales.
- [NASA, Black Hole Visualization](https://svs.gsfc.nasa.gov/13326/): disco, inclinación, múltiples imágenes y Doppler; no es una representación de radiación de Hawking.
- [Isi et al., Testing the black-hole area law with GW150914](https://arxiv.org/abs/2012.04486): contraste del teorema de área con datos gravitacionales. No equivale a detección de radiación de Hawking.
- [Page, Information in Black Hole Radiation](https://arxiv.org/abs/hep-th/9306083): información y correlaciones bajo hipótesis de evolución unitaria.
- [Maldacena, The Large N Limit of Superconformal Field Theories and Supergravity](https://arxiv.org/abs/hep-th/9711200): dualidades en espacios anti-de Sitter y teorías conformes concretas; no verificación observacional de un interior astrofísico.

Las fórmulas y las referencias originales de Hawking/Bekenstein están desarrolladas en [HAWKING_INVESTIGACION.md](HAWKING_INVESTIGACION.md). Cada nuevo módulo debe tener cuatro retos con predicción, manipulación de una variable, comparación con referencia y explicación del resultado, más pruebas físicas independientes y revisión móvil.
