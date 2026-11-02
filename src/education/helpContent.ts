/** Contextual explanations for the laboratory help mode.
 * Pure text lookup is kept separate from DOM discovery so it can be tested in Node.
 * Equations and approximations follow the individual laboratory model documents.
 */
export interface HelpEntry {
  title: string
  body: string
}
interface HelpTopic extends HelpEntry {
  paths: readonly string[]
  match: RegExp
}
const topic = (
  paths: readonly string[],
  match: RegExp,
  title: string,
  body: string,
): HelpTopic => ({ paths, match, title, body })
const page = ['curva-de-page']
const geometry = ['espacio-con-frontera', 'dos-lenguajes', 'holografia']
const thermal = ['frontera-caliente', 'holografia']
const quantum = ['entrelazados']

export const HELP_TOPICS: readonly HelpTopic[] = [
  topic(
    ['holografia'],
    /^1\.?\s*geometria ads/,
    'Sección 1: preparar la geometría',
    'Entrás a la parte donde medís distancias en una rebanada espacial de AdS. Sus cuatro retos preparan la idea geométrica que después usa la holografía. Cambiar de sección conserva los sellos completados del recorrido.',
  ),
  topic(
    ['holografia'],
    /^2\.?\s*dos lenguajes/,
    'Sección 2: usar el diccionario',
    'Entrás a la comparación entre entropía de un intervalo de frontera y longitud dividida por 4G₃. Son cuatro retos del mismo laboratorio; no una nueva geometría vacía. La diferencia a corte finito queda visible para interpretar la aproximación.',
  ),
  topic(
    ['holografia'],
    /^3\.?\s*frontera caliente/,
    'Sección 3: cambiar el estado térmico',
    'Entrás a cuatro retos que relacionan temperatura de frontera, geometría exterior BTZ y entropía del intervalo. Calentar selecciona estados distintos; no anima un colapso. Los sellos previos se conservan y Page continúa como laboratorio separado.',
  ),
  topic(
    ['doble-rendija'],
    /un punto a un patron|solo impacto|descubrir las franjas/,
    'De un punto a un patrón',
    'Un impacto aislado es localizado y no permite reconocer franjas. Al preparar y detectar muchas partículas bajo las mismas condiciones aparece una distribución estadística. La simulación muestrea la probabilidad calculada; el patrón no es una trayectoria dibujada por una sola partícula.',
  ),
  topic(
    ['prisma'],
    /normales/,
    'Una dirección de referencia',
    'La normal es la línea perpendicular a una cara del prisma. Los ángulos de incidencia y refracción se miden respecto de ella, no respecto de la superficie. Mostrarla ayuda a leer la ley de Snell; no es otro rayo de luz.',
  ),
  topic(
    ['prisma'],
    /etiquetas/,
    'Nombres sobre el banco',
    'Muestra u oculta los nombres que identifican las piezas y lecturas del banco óptico. Las etiquetas ayudan a relacionar lámpara, prisma y pantalla con sus controles; ocultarlas despeja la escena sin cambiar la óptica.',
  ),
  topic(
    ['prisma'],
    /fuente de luz|luz blanca|espectro|reflexion interna/,
    'La luz que entra y sale',
    'La fuente envía luz blanca, que contiene distintas longitudes de onda. Al entrar y salir del vidrio, cada componente se refracta de forma distinta. Con ciertos ángulos puede haber reflexión interna total en una cara. Los presets preparan condiciones para explorar esos casos.',
  ),
  topic(
    ['doble-rendija'],
    /campo ilustrativo|curva teorica/,
    'La predicción y la ayuda gráfica',
    'La curva teórica muestra la distribución calculada de detecciones; el campo ilustrativo sugiere amplitudes y se puede ocultar. Ninguno es una trayectoria secreta de cada partícula. Comparalos con las frecuencias acumuladas, que fluctúan cuando hay pocos impactos.',
  ),
  topic(
    ['doble-rendija'],
    /guardar.*corrida|limpiar detecciones/,
    'Conservar o reiniciar los datos',
    'Guardar conserva las condiciones y frecuencias de la corrida para compararlas con una nueva. Limpiar borra sus impactos y contadores para empezar de nuevo bajo las condiciones actuales. Más datos reducen fluctuaciones, pero no cambian la distribución del modelo.',
  ),
  topic(
    ['hawking'],
    /vida ideal|evaporacion|evaporar/,
    'Una vida estimada, no un cronómetro observado',
    'La vida ideal procede de integrar la pérdida de masa con la potencia de emisión de fotones del modelo. Avanzar una fracción de ella permite ver cómo cambia la masa; no reproduce toda la física de la fase final ni una evaporación astrofísica medida.',
  ),
  topic(
    ['hawking'],
    /entorno|fondo|balance de energia/,
    'Comparar lo que entra con lo que sale',
    'El entorno puede aportar energía mientras el agujero negro continúa emitiendo. Si la absorción supera la emisión, el balance instantáneo apunta a ganar masa. La temperatura del agujero negro y la del baño térmico son cantidades distintas.',
  ),
  topic(
    ['hawking'],
    /radio|horizonte/,
    'La escala del horizonte',
    'En Schwarzschild rₛ=2GM/c². Más masa implica un horizonte de mayor radio, aunque la temperatura de Hawking sea menor. El borde del esquema señala esa frontera causal, no una superficie material que brille.',
  ),
  topic(
    ['entropia'],
    /informacion: radio/,
    'El radio areal del horizonte',
    'rₛ=2GM/c² fija el área A=4πrₛ² del horizonte de Schwarzschild. Al duplicar la masa, el radio se duplica y el área se cuadruplica. El horizonte es una frontera causal, no una corteza sólida.',
  ),
  topic(
    ['hawking'],
    /10¹²|hipotetico|se reduce a la mitad|se duplica/,
    'Una predicción para contrastar',
    'La comparación propuesta conserva una referencia de masa. Para Schwarzschild, duplicar M duplica el radio, cuadruplica el área y reduce a la mitad la temperatura. El ejemplo de masa pequeña es hipotético; no representa un agujero negro observado en evaporación.',
  ),
  topic(
    ['entropia', 'hawking'],
    /^a$|area del horizonte/,
    'A es el área, no el volumen',
    'A=4πrₛ² es el área del horizonte esférico de Schwarzschild. La entropía de Bekenstein–Hawking es proporcional a ella. Duplicar la masa duplica rₛ y cuadruplica A; no se usa el volumen interior para esa fórmula.',
  ),
  topic(
    ['entropia', 'hawking'],
    /^c$|^c³$|c · velocidad/,
    'La velocidad de la luz',
    'c conecta las escalas de espacio, tiempo y energía en relatividad. En la entropía del horizonte aparece c³. Es una constante fija del modelo; mostrarla no significa que puedas cambiar la velocidad física de la luz.',
  ),
  topic(
    ['entropia', 'hawking'],
    /^g$|g · gravitacion/,
    'La constante de gravitación',
    'G fija la escala de la interacción gravitatoria. Con ℏ y c define el área de Planck ℓP²=ℏG/c³. En esta experiencia se mantiene fija: las variables manipulables son la masa, el reparto o el área de ejemplo.',
  ),
  topic(
    ['entropia', 'hawking'],
    /^4$|^¼$/,
    'El coeficiente un cuarto',
    'La temperatura de Hawking fijó el factor 1/4 de la relación entre entropía y área propuesta por Bekenstein en relatividad general. La lupa de áreas muestra esa división; no cuenta partículas ni observa teselas físicas del espacio.',
  ),
  topic(
    ['entropia'],
    /sin emision|emision ideal|chico.*caliente/,
    'Antes y después de emitir masa',
    'Sin emisión conserva la masa inicial. Al emitir masa disminuyen el radio, el área y la entropía del agujero negro, mientras aumenta su temperatura. La fracción es un estado del modelo ideal, no una animación de partículas saliendo del interior.',
  ),
  topic(
    ['entropia'],
    /trama|bits|que mide la entropia|informacion: entropia|que entropia estamos sumando/,
    'Área y cuenta de información',
    'La trama es una ayuda para comparar áreas, no celdas físicas observadas. S/kB cuenta unidades adimensionales de entropía y dividirla por ln 2 la expresa en bits. Mostrar bits no implementa un lector de la información de un agujero negro.',
  ),
  topic(
    ['entropia'],
    /volumen|por 2|por 8|contar todo/,
    'Comparar leyes de escala',
    'El radio crece como M, el área como M² y el volumen euclídeo asociado como M³. La fórmula de entropía usa el área. El volumen señalado con asterisco es una referencia geométrica, no una definición única del volumen interior relativista.',
  ),
  topic(
    ['entropia'],
    /10 m☉/,
    'Una masa de referencia',
    'M☉ es una masa solar. Este atajo permite recuperar la referencia de 10 masas solares para comparar el radio, el área y la entropía en una escala común. Cambiar la masa afecta esas tres cantidades de formas distintas.',
  ),
  topic(
    ['entropia'],
    /variable|registro|q-revealed|ocultar todas|mostrar todas|revelar|ocultar/,
    'Qué sabemos de un registro clásico',
    'Las casillas son variables binarias del ejercicio previo, separadas del agujero negro. Revelar una permite conocer su valor y reduce las configuraciones compatibles. La actividad distingue cantidad de variables, incertidumbre y lo que ya se conoce.',
  ),
  topic(
    ['entropia'],
    /q-probability|probable|0 y 1|dieciseis|incertidumbre cero|ninguna/,
    'Posibilidad no es probabilidad',
    'Un registro de cuatro variables binarias tiene hasta 16 configuraciones. Conocer todas deja una compatible; probabilidades desiguales reducen la incertidumbre media aunque siga habiendo dos resultados posibles por variable. Este ejercicio usa información clásica, no estados entrelazados.',
  ),
  topic(
    ['acrecion'],
    /sombra|horizonte/,
    'La sombra no es el borde del horizonte',
    'La región oscura corresponde a direcciones de rayos capturados que no encontraron antes el disco. La sombra aparente puede ser mayor que el horizonte. El brillo viene del gas exterior y los arcos de la curvatura de su luz.',
  ),
  topic(
    ['acrecion'],
    /colores|temperatura efectiva|luminosidad|brillo|numero para comparar/,
    'Leer el color y la emisión',
    'El color identifica cambios de frecuencia de manera ilustrativa y la luminosidad procede de la aproximación de disco delgado. La temperatura efectiva no es la temperatura de Hawking. Compará con las mismas condiciones para separar efectos del gas y del movimiento.',
  ),
  topic(
    ['acrecion'],
    /enciende|lado que viene|pesar algo/,
    'Una pista distinta sobre el mismo objeto',
    'Este reto propone comparar gas, movimiento o estrella testigo para inferir qué produce la señal. El horizonte por sí solo no es una lámpara. Cada prueba pide mantener unas condiciones y modificar la variable que señala su guía.',
  ),
  topic(
    ['lente-gravitacional'],
    /recorrido de la luz|luz que se desvia|brillo de la estrella|horizonte|sombra/,
    'Brillo y desviación son cosas distintas',
    'La lente cambia de dónde parece venir la luz mediante sus trayectorias, no solo el brillo de una estrella. El diagrama conserva las coordenadas elegidas y permite seguir el rayo correspondiente a la dirección que señalaste en la imagen.',
  ),
  topic(
    ['lente-gravitacional'],
    /cuadricula|corte horizontal|coordenadas|ampliacion cercana/,
    'Orientarse en el diagrama',
    'La cuadrícula y el corte son referencias de coordenadas. La ampliación cercana muestra las mismas trayectorias y distingue horizonte y esfera de fotones, sin cambiar la masa ni las distancias físicas del ensayo. No es otra simulación de gravedad.',
  ),
  topic(
    ['horizonte'],
    /horizonte|lejos|cerca|adentro|afuera|rs|rₛ|dos alturas/,
    'Posiciones respecto de la frontera causal',
    'r/rₛ=1 marca el horizonte. Fuera, un pulso saliente puede alcanzar radios mayores; dentro, ambas direcciones futuras de luz llevan a radios menores. Los atajos permiten comparar radios precisos. Estar sostenido y caer libremente son ensayos diferentes.',
  ),
  topic(
    ['horizonte'],
    /escuchar|rojos|avisar|avanzar un paso/,
    'Esperar la llegada de una señal',
    'Enviar un pulso no lo hace llegar de inmediato. Avanzar o escuchar el próximo recorre el cálculo hasta una recepción posible; las señales exteriores cercanas al horizonte se retrasan y pierden frecuencia. Las interiores no llegan al receptor exterior.',
  ),
  topic(
    ['reloj-de-luz'],
    /ritmo|quien se mueve/,
    'Comparar desde cada sistema',
    'Cada observador puede describir al otro reloj como móvil. Esa comparación usa eventos y simultaneidad de su propio sistema, no dos miradas de una cámara lenta. El tiempo propio de un tic se mide donde ese reloj está en reposo.',
  ),
  topic(
    ['reloj-de-luz'],
    /avanzar un paso|reflejo|encuentro/,
    'Recorrer eventos del tic',
    'El pulso sale, se refleja y vuelve. Estos atajos permiten comparar el mismo evento en ambas vistas sin reproducir todo el movimiento. El punto es un asa para elegir el evento, no un control de la velocidad de la luz.',
  ),
  topic(
    ['tren-de-einstein'],
    /destellos a la vez|lanzar destellos|fechas de emision|dos destellos/,
    'Fijar las fechas de emisión',
    'Preparás emisiones simultáneas en un sistema y calculás las fechas que les asigna el otro. Que los destellos lleguen en momentos distintos no basta para decidir cuándo ocurrieron: hay que separar fecha de emisión y tiempo de viaje.',
  ),
  topic(
    ['tren-de-einstein'],
    /llegad|llegar|ocurr|encuentro|volver al inicio/,
    'No confundir un evento con su noticia',
    'Las llegadas incluyen cuánto tardó la luz en alcanzar al receptor. τ=0 marca el encuentro de los centros; un tiempo negativo significa antes de ese encuentro. Recorrer el ensayo cambia el instante que inspeccionás, no las fechas físicas de sus emisiones.',
  ),
  topic(
    ['tren-de-einstein'],
    /p al centro|p hacia|hacia b|^centro$/,
    'Mover al pasajero receptor',
    'P es el pasajero que recibe las señales. Desplazarlo cambia las distancias de viaje y las fechas de llegada. No modifica por sí mismo cuándo fueron emitidos los destellos; por eso se distingue recepción de simultaneidad de emisión.',
  ),
  topic(
    ['tren-de-einstein'],
    /0[,.]?[068] c|^0 c$|inverti el movimiento/,
    'Velocidad con dirección',
    'El signo indica hacia qué lado se mueve el tren respecto del andén; el número es una fracción de c. Invertirlo puede invertir el orden temporal asignado a emisiones separadas espacialmente. No invierte el sentido causal de una señal luminosa.',
  ),
  topic(
    ['tren-de-einstein'],
    /300 m|tren, no dos instantes/,
    'La longitud propia del vagón',
    'Los 300 m son una longitud medida en reposo con el tren. Medirlo desde el andén requiere registrar ambos extremos simultáneamente en el andén. Dos posiciones tomadas en tiempos distintos no dan automáticamente la longitud de un objeto móvil.',
  ),
  topic(
    ['nos-vemos-a-la-vuelta'],
    /linea de universo|salida|reencuentro|antes de cambiar|despues de cambiar|cita de los relojes/,
    'Inspeccionar el recorrido del reloj',
    'La línea de universo reúne los eventos del viaje. Arrastrar el punto o usar estos atajos recorre esos eventos; no mueve físicamente una nave instantáneamente. La comparación definitiva se hace al reencontrarse, cuando ambos relojes están juntos.',
  ),
  topic(
    ['nos-vemos-a-la-vuelta'],
    /0[,.]?[68] c|10 anos|aceleracion.*anos|llega por luz/,
    'Qué acumula cada gemelo',
    'Los valores preparan la rapidez de los tramos o la duración en casa. Cada reloj suma tiempo propio sobre su recorrido; el giro cambia el sistema comóvil y no es una resta mágica de años. Ver luz de casa incluye retraso de señal y no equivale a leer su reloj presente.',
  ),
  topic(
    ['ascensor-de-einstein'],
    /desde afuera|sostenido|caida libre|deriva|caer|equivalencia|medir adentro/,
    'Elegir la situación local',
    'La cabina sostenida o acelerada ejerce apoyo; en caída libre o a la deriva, el instrumento ideal queda sin apoyo. Comparar interior y exterior ayuda a distinguir lo que mide la balanza de cómo se mueve la cabina en otras coordenadas.',
  ),
  topic(
    ['ascensor-de-einstein'],
    /objeto|peso aparente|9,81|9.81/,
    'Masa, apoyo e intensidad',
    'El objeto tiene masa, pero la balanza mide fuerza de apoyo. En una cabina sostenida con g=9,81 m/s², un kilogramo requiere aproximadamente 9,81 N; en caída libre ideal el apoyo es cero. El atajo prepara esa condición para comparar.',
  ),
  topic(
    ['el-tiempo-tiene-altura'],
    /donde estan|que acumulan|escena|diferencia que se acumula|distancia equivalente/,
    'Dos maneras de leer los relojes',
    'La escena ubica los relojes y el gráfico compara sus tiempos propios o desfases. Una diferencia de ns puede acumularse sin verse en el avance ordinario de las agujas. Convertirla en c·Δt es una distancia equivalente de señal, no un desplazamiento físico del reloj.',
  ),
  topic(
    ['orbita-que-no-se-cierra'],
    /alargada/,
    'Una órbita más o menos excéntrica',
    'Estos atajos cambian la excentricidad e conservando el semieje mayor. Una órbita más alargada llega más cerca del centro y cambia su precesión relativista. No cambian la inclinación de la cámara ni un giro añadido a mano.',
  ),
  topic(
    ['orbita-que-no-se-cierra'],
    /mercurio|doble tamano|43 segundos|perihelio|vuelta no empata/,
    'La pequeña corrección de Mercurio',
    'El preset recupera una escala orbital concreta para comparar. El perihelio avanza ligeramente en la órbita relativista; la contribución de Schwarzschild es de unos 43 segundos de arco por siglo para Mercurio. La lupa del dibujo no altera ese valor físico.',
  ),
  topic(
    ['efecto-fotoelectrico'],
    /sodio|zinc|plata/,
    'Cambiar el metal de la celda',
    'Cada metal tiene una función de trabajo diferente: la energía mínima para extraer un electrón. Elegirlo cambia el umbral de frecuencia. Con la misma luz, un material puede emitir y otro no, o dejar distinta energía cinética máxima.',
  ),
  topic(
    ['efecto-fotoelectrico'],
    /medir desde los controles|hertz|millikan|nobel/,
    'Conectar el balance con una medición',
    'Registrar conserva frecuencia, brillo, material y resultados para compararlos. Einstein explicó la ley del efecto fotoeléctrico con cuantos de luz; la energía individual depende de la frecuencia. Las pruebas históricas del efecto no se sustituyen por esta simulación ideal.',
  ),
  topic(
    quantum,
    /que son a\/b|qubits/,
    'Sistemas y preguntas cuánticas',
    'A y B son dos sistemas cuánticos de dos niveles. Z y X son bases de medición, no lugares. Bell nombra un estado entrelazado del conjunto: cada parte puede ser incierta aunque el estado conjunto sea puro. Los círculos no envían mensajes entre sí.',
  ),
  topic(
    geometry,
    /medir distancias|comprobar el calculo/,
    'Una distancia física, no la longitud en píxeles',
    'La longitud se obtiene con la métrica espacial de AdS y también se contrasta con una integración independiente. Compará la recta de coordenadas con la geodésica entre los mismos extremos; mover la cámara o cambiar de vista no cambia esa cuenta.',
  ),
  topic(
    thermal,
    /interior y horizonte|entropia del intervalo|^t=/,
    'Vincular temperatura y geometría',
    'Estas vistas y presets comparan un estado térmico de frontera con su exterior BTZ. T=0 recupera el límite frío; a T positiva hay un horizonte en zₕ=1/(2πT). La entropía se refiere al intervalo elegido, no al brillo de una superficie.',
  ),
  topic(
    page,
    /que representan|numeros del estado|explorar otras preparaciones/,
    'Las palabras y los números del modelo',
    'B es lo que queda y R la colección reunida. La pureza describe el estado y S(R) su entropía al ignorar B. Las preparaciones permiten comparar curvas de distintos estados puros; el promedio no cambia para un tamaño fijo y los retos usan seis qubits.',
  ),
  topic(
    page,
    /page-size|tamano del sistema|otra preparacion/,
    'La preparación completa',
    'Elegís cuántos qubits tiene el conjunto y qué estado puro se prepara. Otra preparación cambia las amplitudes, por eso la curva concreta fluctúa. No cambia la media de Page para el mismo tamaño. Cambiar estas condiciones reinicia las observaciones del reto.',
  ),
  topic(
    page,
    /page-emitted|reparto|qubits que pasaron|emitir un qubit|pasar un qubit|devolver un qubit|volver un paso/,
    'Repartir el mismo estado',
    'Pasás un qubit de B, lo que queda, a R, la radiación reunida. El estado completo sigue siendo el mismo: cambia qué parte incluís en R y se recalcula su entropía. Es un modelo de información, no una emisión de Hawking resuelta en el tiempo. Volver un paso rebobina el reparto del modelo.',
  ),
  topic(
    page,
    /promedio de page|media de page/,
    'Una media entre muchas preparaciones',
    'La línea dorada es la entropía media de subsistemas de estados puros aleatorios complejos. No es una segunda medición ni tiene que coincidir con cada preparación. Permite distinguir la tendencia de Page de las fluctuaciones de pocos qubits.',
  ),
  topic(
    page,
    /independiente|linea coral/,
    'La hipótesis con la que contrastamos',
    'Esta referencia supone que cada qubit emitido es independiente y máximamente mezclado: k qubits suman k bits de entropía. No cambia el estado calculado. El contraste con un conjunto final puro muestra qué se pierde al ignorar sus correlaciones; no es el cálculo gravitatorio completo de Hawking.',
  ),
  topic(
    page,
    /por separado|suma de entropias|σs|Σs|correlacion total/,
    'Las partes no cuentan toda la historia',
    'Cada qubit puede tener entropía aunque R completo sea puro. Sumar S(Rᵢ) ignora las correlaciones entre las partes. La diferencia ΣS(Rᵢ)−S(R) es correlación total, que puede incluir contribuciones clásicas y cuánticas; no es por sí sola una medida general de entrelazamiento.',
  ),
  topic(
    page,
    /r como conjunto|conjunto br|estado puro|pureza|tr\(/,
    'Pureza del conjunto',
    'Puro describe el estado cuántico completo, no exige que cada parte sea pura ni que cada medición sea predecible. Si R reúne todos los qubits del conjunto puro, S(R)=0. Al ignorar B, una parte de ese mismo conjunto puede tener entropía positiva.',
  ),
  topic(
    page,
    /limite por tamano|cota|min\(k|capacidad/,
    'Un límite por dimensiones',
    'La línea gris min(k,N−k) es la mayor entropía que podría tener la parte menor de este conjunto puro. Es una cota, no la fórmula exacta de Page, ni un área del horizonte. Los valores se expresan en bits.',
  ),
  topic(
    page,
    /inicio:|primer qubit|mitad:|todo en r/,
    'Comparar repartos concretos',
    'Los atajos llevan a R vacío, su primer qubit, la mitad o el conjunto completo. Compará la lectura S(R) sin cambiar la preparación: puede crecer en los repartos intermedios y vuelve a cero cuando R incluye todo el estado puro.',
  ),
  topic(
    page,
    /dibujar la curva|estado elegido|entropia calculada|s\(r\)|bits/,
    'Qué cuenta esta curva',
    'El eje horizontal cuenta qubits incluidos en R; no es tiempo ni porcentaje de evaporación. El vertical muestra la entropía de R en bits, calculada al ignorar B. El punto verde es un asa para elegir el reparto; no es una partícula. La curva se revela a medida que explorás.',
  ),
  topic(
    page,
    /repartir los qubits|reunidos|quedan/,
    'B y R son dos partes del modelo',
    'B representa los qubits que aún no incluís en la radiación y R los que ya reuniste. Los cuadrados son sistemas cuánticos abstractos de dos niveles; no son fotografías de partículas. Tocá B para pasar uno a R y R para devolverlo.',
  ),

  topic(
    thermal,
    /btz-temperature|termometro|temperatura|calentar|limite frio/,
    'Temperatura de la frontera',
    'Seleccionás otro estado térmico de la teoría de frontera y su geometría BTZ correspondiente. En estas unidades zₕ=1/(2πT): al aumentar T disminuye esa coordenada del horizonte, mientras crece su radio areal. No estás calentando un agujero negro de Schwarzschild ni simulando un colapso.',
  ),
  topic(
    thermal,
    /btz-length|intervalo termico|longitud desde el grafico/,
    'Qué región de la frontera observás',
    'ℓ es la longitud de la región cuya entropía calculamos. Al alargarla, la curva se acerca más al horizonte y la entropía cambia. A temperatura alta o en regiones grandes aparece un crecimiento aproximadamente proporcional a ℓ; no significa que una señal haya cruzado el horizonte.',
  ),
  topic(
    thermal,
    /pendiente|extensiv|regimen termico/,
    'La huella de la temperatura',
    'La pendiente compara cuánto crece la entropía al aumentar la longitud. En el régimen térmico domina una contribución extensiva: aproximadamente la misma entropía adicional por cada unidad de longitud. El límite frío recupera la comparación del vacío.',
  ),
  topic(
    geometry,
    /cutoff|corte|regulador|ε|epsilon/,
    'El corte regulador ε',
    'La frontera ideal está en z=0, donde estas longitudes divergen. Colocamos los extremos a z=ε para poder comparar números finitos. Reducir ε acerca la comparación al límite de frontera y cambia la longitud regulada. El punto que movés es un asa del corte, no una partícula.',
  ),
  topic(
    geometry,
    /center|centro del intervalo|mover el centro/,
    'Mover la región sin cambiar su tamaño',
    'Desplazás ambos extremos juntos sobre la coordenada de frontera x. En este modelo homogéneo, mover el centro conservando ℓ y ε no cambia la longitud ni la entropía. Sirve para distinguir posición de tamaño.',
  ),
  topic(
    geometry,
    /interval|extremo|longitud del intervalo|ℓ=/,
    'Los extremos de una región',
    'Las asas fijan los extremos de un intervalo de longitud ℓ en la frontera. Separarlas cambia qué región estudiamos y la profundidad de la geodésica. Son controles de coordenadas, no objetos que caen; la curva conecta esos extremos en una rebanada espacial.',
  ),
  topic(
    geometry,
    /medir los dos|registrar esta comparacion/,
    'Conservar una comparación',
    'Guarda los valores del montaje actual para contrastarlos con otro. En geometría se comparan dos caminos entre los mismos extremos; en el diccionario holográfico, una cuenta de entropía y una de longitud. Cambiá una variable por vez para reconocer su efecto.',
  ),
  topic(
    geometry,
    /recta|geodesica|camino|ads|profundidad/,
    'Distancia según la geometría',
    'Una geodésica espacial minimiza longitud con la métrica de AdS. Las longitudes se expresan en L, la escala de curvatura fijada a 1. Puede verse curva en estas coordenadas: recto en el dibujo no significa más corto físicamente. La vista muestra una rebanada espacial, no una trayectoria luminosa ni un objeto viajando en el tiempo.',
  ),
  topic(
    geometry,
    /\bcft\b|4g|dos lenguajes|holograf|residuo|diferencia/,
    'Dos cuentas de una misma región',
    'Comparamos la entropía de un intervalo de una CFT₂ con una longitud en AdS₃ dividida por 4G₃. La fórmula CFT mostrada es asintótica; el corte finito deja un residuo visible. Este caso ilustra el diccionario holográfico, no demuestra que nuestro universo tenga una pared física.',
  ),
  topic(
    [...geometry, ...thermal],
    /carga central|ccft|g₃|g3|nats/,
    'Constantes y unidades del diccionario',
    'cCFT es la carga central de la teoría, no la velocidad de la luz. Aquí se fija junto con L y G₃ mediante cCFT=3L/(2G₃). La entropía usa logaritmo natural y se expresa en nats; dividir por ln 2 la convertiría en bits.',
  ),

  topic(
    quantum,
    /quantum-theta|preparacion|sin entrelazar|maximo entrelazamiento|estado puro/,
    'Preparar el par',
    'θ cambia las amplitudes del estado cosθ|00⟩+sinθ|11⟩. A 0° es un producto; a 45° es un par de Bell. Preparar el estado y elegir cómo medirlo son operaciones distintas: θ no gira los analizadores.',
  ),
  topic(
    quantum,
    /mezcla clasica/,
    'Mismas partes, otro conjunto',
    'La mezcla conserva las probabilidades locales del ejemplo pero elimina las coherencias del estado conjunto. Compararla con Bell en Z y en X permite ver que una coincidencia clásica en una base no basta para identificar entrelazamiento.',
  ),
  topic(
    quantum,
    /analizador|base|ambos en|cambiar base/,
    'Elegir la pregunta de medición',
    'Z y X son bases distintas para medir cada qubit. Cambian las probabilidades de resultados y las correlaciones observadas. Cambiar la base en B no cambia las probabilidades locales de A ni permite enviar mensajes instantáneos.',
  ),
  topic(
    quantum,
    /medir .*par|muestra|coincidencia/,
    'Medir copias nuevas',
    'Cada par medido se prepara de nuevo y da un resultado aleatorio según Born. Muchas mediciones aproximan las probabilidades; no son mediciones repetidas del mismo par. Las coincidencias se conocen reuniendo ambos registros por comunicación ordinaria.',
  ),
  topic(
    quantum,
    /inspeccionar|conjunto ab|s\(a|s\(b|entropia/,
    'Mirar una parte o el conjunto',
    'La entropía de von Neumann describe el estado, no cuántos resultados distintos aparecen en una base. AB puede ser puro y tener S(AB)=0 mientras A y B por separado tienen entropía positiva. Los círculos representan qubits abstractos, no emisores de mensajes.',
  ),

  topic(
    ['entropia'],
    /en-patch|area de ejemplo|cuatro|factor|¼/,
    'La lupa del factor ¼',
    'La entropía de Bekenstein–Hawking es S/kB=A/(4ℓP²). Esta cuadrícula permite ver la división por cuatro con un área de ejemplo. No modifica el agujero negro ni muestra celdas físicas observadas del espacio.',
  ),
  topic(
    ['entropia'],
    /emit|fraccion|radiacion|evapora/,
    'Área perdida y radiación',
    'Emitir una fracción de masa reduce el radio y el área del horizonte. La entropía del agujero negro baja; al incluir la cuenta térmica ideal de radiación se compara el balance generalizado. Esta cuenta no es la entropía fina de Page.',
  ),
  topic(
    ['entropia'],
    /masa|horizonte|mapa|radio|rₛ/,
    'Cambiar la masa y mirar el área',
    'En Schwarzschild, rₛ es proporcional a M y el área es proporcional a M². Duplicar la masa cuadruplica área y entropía. El punto sobre el horizonte es un asa para cambiar masa; no es una partícula ni un lugar al que viaja un observador.',
  ),
  topic(
    ['entropia', 'hawking'],
    /boltzmann|kb|k_b|j\/k/,
    'Entropía y unidades',
    'kB convierte la cuenta estadística en entropía con unidades J/K. S/kB es adimensional: para expresarla en bits se divide además por ln 2. Una entropía enorme no significa que esta simulación pueda leer un mensaje del agujero negro.',
  ),
  topic(
    ['entropia', 'hawking'],
    /ℏ|hbarra|planck|hbar/,
    'La escala cuántica',
    'ℏ=h/(2π) es la constante de Planck reducida. Con G y c define ℓP²=ℏG/c³. Aparece en la temperatura de Hawking y en la entropía; no es la misma ecuación que la incertidumbre de Heisenberg.',
  ),
  topic(
    ['entropia', 'hawking'],
    /formula|sbh|s_bh|area|bekenstein/,
    'La entropía del horizonte',
    'S_BH=kB c³ A/(4Gℏ). Para un agujero negro de Schwarzschild aumenta con el área, y por tanto con M². La fórmula conecta gravedad, relatividad y física cuántica; la textura del visor es una ayuda gráfica, no una fotografía microscópica.',
  ),

  topic(
    ['hawking'],
    /hk-age|tiempo|reloj|adelantar/,
    'Tiempo de evaporación ideal',
    'Avanzar el reloj cambia la masa según la potencia del modelo de fotones ideal. Al perder masa, el agujero negro se calienta y emite más potencia. El reloj acelera enormemente la evolución; su velocidad de reproducción no es una constante física.',
  ),
  topic(
    ['hawking'],
    /fondo cosmico|cmb|azul|absorb|entra|vacio/,
    'Emisión frente a balance neto',
    'El fondo a 2,7255 K puede aportar energía al agujero negro. El flujo azul representa absorción y el dorado emisión. Emitir no implica perder masa: hay que comparar ambas potencias. Las estrellas del fondo son decoración, no ese baño térmico.',
  ),
  topic(
    ['hawking'],
    /masa|mass|×2|÷2|temperatura|potencia|espectro/,
    'Más masa, menos temperatura',
    'Para Schwarzschild, T_H es inversamente proporcional a M; la potencia ideal es proporcional a 1/M². Dividir M por dos duplica T y cuadruplica la potencia. Los colores y puntos del visor están amplificados: no representan fotones visibles a su escala real.',
  ),
  topic(
    ['hawking'],
    /horizonte|interior|dorado|sale|mapa|referencia/,
    'Un mapa esquemático',
    'El borde señala el horizonte: no es una pared. El dorado simboliza energía emitida; no son partículas clásicas escapando desde el interior. Acercar y mover la vista permite inspeccionar el mapa sin cambiar masa, temperatura ni tiempo.',
  ),

  topic(
    ['acrecion'],
    /gas|aliment|suministro/,
    'El combustible del disco',
    'El gas que cae hacia la región interior pierde energía y puede emitir radiación. Subir el suministro aumenta la emisión del disco; con gas apagado no hay disco luminoso, pero la gravedad del agujero negro sigue actuando. Esta luz no es radiación de Hawking.',
  ),
  topic(
    ['acrecion'],
    /inclina|angulo|doppler|contraste|ac-angle|de frente|movimiento relativista/,
    'Ver un disco que gira',
    'La inclinación cambia cómo vemos el movimiento del gas. El lado que se aproxima puede verse más brillante por transferencia relativista; de frente la asimetría Doppler se reduce. El brillo mostrado responde al modelo, no a un lado del horizonte que emita luz.',
  ),
  topic(
    ['acrecion'],
    /masa|m☉|estrella|periodo|orbita/,
    'Pesar algo que no vemos',
    'La órbita de una estrella testigo cambia con la masa central. A radio fijo, más masa implica un período más corto. Esa relación permite inferir masa aunque no llegue luz desde dentro del horizonte; la estrella del modelo es una referencia orbital ideal.',
  ),
  topic(
    ['acrecion'],
    /disco|imagen|trayectoria|luz/,
    'Luz que llega desde el gas',
    'La imagen se calcula siguiendo geodésicas de Schwarzschild hasta el disco. La gravedad curva el camino de la luz y deforma su apariencia; por eso parte del disco puede aparecer sobre o bajo la sombra. La emisividad del disco es una aproximación identificada en el modelo.',
  ),

  topic(
    ['lente-gravitacional'],
    /masa|ln-mass/,
    'Cambiar la escala gravitatoria',
    'Al variar la masa se mantiene la distancia física de la cámara y el fondo. Cambian rₛ y la región de captura en esas mismas unidades; así el efecto no queda oculto por un zoom que acompañe automáticamente al agujero negro.',
  ),
  topic(
    ['lente-gravitacional'],
    /fuente|source|aline|anillo/,
    'Alinear la luz del fondo',
    'Mover la fuente cambia su alineación con el agujero negro y el observador. Una alineación apropiada puede producir un anillo: distintas direcciones de llegada corresponden a luz de la misma fuente. No es una superficie luminosa del horizonte.',
  ),
  topic(
    ['lente-gravitacional'],
    /rayo|ray|captura|escape|direccion/,
    'Elegir una trayectoria de luz',
    'El punto o cruz es un asa para elegir la dirección de un rayo, no una estrella adicional. El integrador calcula si alcanza el fondo, cae al horizonte o agota el límite numérico. Compará la imagen con el diagrama de ese mismo rayo.',
  ),
  topic(
    ['lente-gravitacional'],
    /camara|observador|imagen|gravedad|lente|geodesica/,
    'Lo visto y el camino de la luz',
    'La imagen sigue rayos hacia atrás desde la cámara para saber qué luz podría llegar. El diagrama muestra trayectorias con la misma física. Sin desviación se conserva el fondo para comparar; con gravedad cambian las direcciones aparentes de las fuentes.',
  ),

  topic(
    ['horizonte'],
    /hz-mass|masa/,
    'La masa fija las escalas',
    'La masa determina rₛ=2GM/c² y la escala de tiempo rₛ/c. El mapa usa radios en unidades del horizonte: el borde r/rₛ=1 siempre señala el horizonte, aunque su tamaño en metros cambie.',
  ),
  topic(
    ['horizonte'],
    /radio|radius|sonda|caida|sosten|hz-live-radius/,
    'Caer o mantenerse en posición',
    'Una sonda en caída libre sigue su trayectoria; un reloj sostenido necesita apoyo para quedarse a radio fijo. No puede sostenerse estático en el horizonte o dentro. El asa permite elegir la posición o recorrer una caída calculada, no teletransportar una sonda física.',
  ),
  topic(
    ['horizonte'],
    /pulso|senal|recibid|antena|intervalo/,
    'Enviar no es recibir',
    'Un pulso exterior puede llegar cada vez más retrasado y corrido al rojo. Un pulso emitido dentro del horizonte no alcanza al receptor exterior. Las lecturas separan el evento de envío, la predicción de llegada y las señales que la antena ya recibió.',
  ),
  topic(
    ['horizonte'],
    /reloj|tiempo|futuro|luz|mapa/,
    'Qué reloj estás leyendo',
    'El tiempo propio de la sonda y las coordenadas del mapa son cuentas distintas. El dibujo usa coordenadas regulares de Painlevé–Gullstrand para atravesar el horizonte; cruzarlo no detiene el reloj propio. Las señales recibidas añaden el tiempo de viaje de la luz.',
  ),

  topic(
    ['reloj-de-luz'],
    /beta|velocidad|rapidez|0,| c/,
    'Rapidez relativa',
    'β=v/c compara la velocidad relativa con la de la luz. Al aumentar β, el mismo pulso recorre una diagonal más larga en el sistema donde los espejos se mueven. Como la luz conserva c, ese sistema asigna más tiempo al tic.',
  ),
  topic(
    ['reloj-de-luz'],
    /pulso|espejo|tic|recorrido|fraction/,
    'Un tic que podés recorrer',
    'El punto representa el pulso entre espejos. Arrastrarlo recorre eventos calculados del mismo viaje en ambas vistas; no cambia la velocidad física de la luz. Un tic completo compara salida, reflexión y retorno al mismo reloj.',
  ),
  topic(
    ['reloj-de-luz'],
    /nave|estacion|vista|sistema|tiempo/,
    'Dos sistemas, los mismos eventos',
    'Cada vista asigna coordenadas al mismo pulso. El reloj que se sigue tiene su tiempo propio; otro sistema puede asignar una duración mayor entre los mismos eventos. Cambiar de vista no produce una segunda luz ni cambia el experimento.',
  ),

  topic(
    ['tren-de-einstein'],
    /simultaneos en el /,
    'Elegir qué emisiones coinciden en el tiempo',
    'Prepara dos emisiones que tienen la misma fecha en el sistema elegido: andén o tren. El otro sistema puede asignarles fechas distintas. Este botón cambia los sucesos físicos del ensayo; alternar la vista conserva esos sucesos y solo cambia cómo se describen.',
  ),
  topic(
    ['tren-de-einstein'],
    /speed|rapidez|velocidad/,
    'Mover el tren respecto del andén',
    'La velocidad cambia cómo cada sistema asigna tiempos y posiciones. Invertirla invierte el orden asignado a ciertos eventos separados espacialmente; no hace viajar una señal hacia su propio pasado.',
  ),
  topic(
    ['tren-de-einstein'],
    /offset|pasajero|posicion/,
    'Cambiar quién recibe las señales',
    'Mover al pasajero cambia cuánto tarda cada pulso en alcanzarlo. Fechas de emisión y fechas de recepción son distintas: recibir dos señales en momentos distintos no prueba por sí solo que fueran emitidas en momentos distintos.',
  ),
  topic(
    ['tren-de-einstein'],
    /length|longitud|extremo|simultan|metodo|mismo tiempo del tren|regla de medir/,
    'Medir una longitud requiere simultaneidad',
    'Para medir la longitud en un sistema se registran ambos extremos al mismo tiempo de ese sistema. Usar extremos simultáneos en el tren no equivale a hacerlo en el andén. La longitud propia L₀ es la medida en reposo con el tren.',
  ),
  topic(
    ['tren-de-einstein'],
    /time|tiempo|senal|pulso|anden|vagon/,
    'Emisión, viaje y recepción',
    'La barra recorre eventos de las señales de luz. Compará las fechas asignadas a sus emisiones y las llegadas a cada receptor; ambos sistemas usan luz a c. Cambiar de vista conserva los mismos eventos y permite separar perspectiva de simultaneidad.',
  ),

  topic(
    ['nos-vemos-a-la-vuelta'],
    /speed|rapidez|velocidad/,
    'Rapidez de cada tramo',
    'La nave acumula tiempo propio según su recorrido. A mayor rapidez respecto de casa, menos tiempo propio por cada año de casa en ese tramo. La comparación final se hace al reunirse, no comparando imágenes que llegaron con retraso.',
  ),
  topic(
    ['nos-vemos-a-la-vuelta'],
    /duration|duracion|wait|espera/,
    'Dar forma al viaje',
    'La duración y la espera cambian los tramos del recorrido y, por tanto, la suma de tiempo propio. Esperar en reposo respecto de casa añade el mismo ritmo en ambos; el giro cambia de sistema comóvil y rompe la simetría entre los recorridos.',
  ),
  topic(
    ['nos-vemos-a-la-vuelta'],
    /time|tiempo|viaje|espacio|giro|ahora|casa|nave/,
    'Tiempo sobre un recorrido',
    'Cada línea del espacio-tiempo es la historia de un reloj. Arrastrar el cursor recorre el viaje calculado. Tiempo propio, tiempo asignado a casa y señal recibida no son lo mismo; al regreso se comparan directamente los relojes reunidos.',
  ),

  topic(
    ['ascensor-de-einstein'],
    /strength|intensidad|acelera|gravedad|cabina|situacion/,
    'Apoyo y caída libre',
    'Una cabina sostenida en un campo gravitatorio y una nave acelerada tienen efectos locales comparables. En caída libre ideal la balanza no ejerce apoyo. El principio de equivalencia es local: no afirma que todo campo gravitatorio sea idéntico a una aceleración uniforme en regiones grandes.',
  ),
  topic(
    ['ascensor-de-einstein'],
    /mass|masa|pelota|balanza/,
    'La masa y lo que marca la balanza',
    'La balanza mide fuerza de apoyo en newtons, no la gravedad por sí sola. En la caída libre ideal ambas masas tienen la misma aceleración y el apoyo es cero. Cambiar la masa ayuda a separar trayectoria y fuerza de apoyo.',
  ),
  topic(
    ['ascensor-de-einstein'],
    /width|ancho|luz|pulso|vertical|femtometro/,
    'La luz dentro de una cabina acelerada',
    'Mientras el pulso cruza, la cabina se desplaza respecto de la referencia libre y su recorrido en la cabina aparece curvado. El desvío real es diminuto: la lupa vertical se identifica y no modifica el cálculo. El asa recorre el pulso; no acelera la luz.',
  ),
  topic(
    ['ascensor-de-einstein'],
    /time|tiempo|recorrer|exterior|interior/,
    'Recorrer el mismo ensayo',
    'Las vistas interior y exterior describen el mismo estado del ensayo. La barra avanza ese instante sin cambiar las condiciones físicas. Compará apoyo y movimiento relativo; no confundas una pausa de la reproducción con que se haya detenido la gravedad.',
  ),

  topic(
    ['el-tiempo-tiene-altura'],
    /height|altura|subir|bajar/,
    'Cambiar el potencial gravitatorio',
    'Un reloj estático a mayor altura acumula más tiempo propio por unidad de tiempo de la referencia inferior. El eje de altura puede ser logarítmico para recorrer grandes escalas; la separación en píxeles no es una regla lineal en metros.',
  ),
  topic(
    ['el-tiempo-tiene-altura'],
    /speed|velocidad|movimiento|orbita|satelite/,
    'La velocidad también cambia el ritmo',
    'A igual altura, el movimiento reduce el tiempo propio respecto de la referencia estática. En una órbita circular la rapidez se calcula a partir de su radio: no es una variable independiente. En GPS compiten el efecto gravitatorio y el cinemático.',
  ),
  topic(
    ['el-tiempo-tiene-altura'],
    /gps|ajuste|correg|lectura/,
    'Ajustar la señal no cambia el envejecimiento',
    'La corrección ideal compensa el ritmo de la lectura transmitida. No deshace el tiempo propio que acumuló el reloj orbital. Distinguir lectura ajustada y desfase físico explica por qué GPS necesita considerar ambos efectos relativistas.',
  ),
  topic(
    ['el-tiempo-tiene-altura'],
    /days|duracion|tiempo|time|reloj|grafico|ampli/,
    'Acumular una diferencia pequeña',
    'El desfase es la diferencia entre tiempos propios, no una detención de los segundos locales. Más duración acumula más diferencia bajo las mismas condiciones. La vista ampliada muestra el desfase en ns o µs; la vista sin ampliar conserva los tiempos totales.',
  ),

  topic(
    ['orbita-que-no-se-cierra'],
    /excentric|or-live-e|or-e|forma/,
    'La forma de la elipse',
    'e mide qué tan alargada es la órbita. Cambiarla modifica la distancia de máximo acercamiento y la precesión relativista, manteniendo el semieje mayor elegido. No es la inclinación de la órbita.',
  ),
  topic(
    ['orbita-que-no-se-cierra'],
    /semieje|or-a|or-live-a|tamano orbital/,
    'El tamaño del recorrido',
    'El semieje mayor a fija la escala de la órbita. Acercar una órbita al cuerpo central refuerza las correcciones relativistas. Se expresa en unidades astronómicas; la cámara y la ampliación del giro son controles de representación distintos.',
  ),
  topic(
    ['orbita-que-no-se-cierra'],
    /masa|or-mass/,
    'La masa del cuerpo central',
    'Más masa central aumenta la intensidad gravitatoria y modifica tanto el período como la precesión. El modelo compara una elipse newtoniana con una órbita de Schwarzschild; no suma aquí las perturbaciones de los otros planetas.',
  ),
  topic(
    ['orbita-que-no-se-cierra'],
    /amplia|lupa|giro|avance|precesion/,
    'Un giro pequeño que se acumula',
    'El perihelio es el punto más cercano al centro. En relatividad general avanza entre vueltas y la órbita no se cierra como una elipse fija. La lupa puede ampliar el dibujo del giro; los valores físicos en segundos de arco conservan su escala real.',
  ),
  topic(
    ['orbita-que-no-se-cierra'],
    /phase|recorrer|vueltas|newton|einstein|explorar orbitas/,
    'Comparar las dos órbitas',
    'El cursor recorre vueltas radiales calculadas. Compará cuándo vuelve a acercarse al centro y hacia dónde apunta ese perihelio. El giro relativista de Mercurio es una corrección pequeña y comprobable, no un espiral de caída al Sol.',
  ),

  topic(
    ['efecto-fotoelectrico'],
    /frequency|frecuencia|thz|color/,
    'Energía de cada fotón',
    'La frecuencia fija E=hf. Si supera el umbral del material, la energía sobrante puede aparecer como energía cinética del electrón. Por debajo del umbral, aumentar el brillo no produce emisión en este modelo de un fotón.',
  ),
  topic(
    ['efecto-fotoelectrico'],
    /brightness|brillo|potencia|intensidad/,
    'Más fotones, no más energía por fotón',
    'A frecuencia fija, aumentar el brillo aporta más fotones por segundo y puede aumentar la corriente. No aumenta la energía máxima de cada electrón ni sustituye la frecuencia necesaria para superar el umbral.',
  ),
  topic(
    ['efecto-fotoelectrico'],
    /material|metal|trabajo|φ|umbral/,
    'El costo de extraer un electrón',
    'Cada material tiene una función de trabajo φ: la energía mínima para liberar un electrón. Cambiar el material mueve el umbral de frecuencia. Compará hf con φ antes de mirar la energía cinética máxima Kmáx=hf−φ.',
  ),
  topic(
    ['efecto-fotoelectrico'],
    /electron|corriente|energia|celda|reparto|medici/,
    'Qué significa cada detección',
    'Los puntos representan emisión de electrones en el modelo ideal; la corriente cuenta carga por segundo. El diagrama de energía separa el costo de extracción y la energía sobrante. Una medición guardada conserva sus condiciones para compararla con otra.',
  ),

  topic(
    ['prisma'],
    /light-angle|direccion|light-offset|posicion lateral/,
    'Hacer que la luz encuentre el prisma',
    'Mover o girar la lámpara cambia el punto y el ángulo de entrada. Si el haz evita el vidrio, esa parte sigue como luz blanca. Al atravesarlo, cada longitud de onda sigue una dirección calculada por la refracción.',
  ),
  topic(
    ['prisma'],
    /intensity|intensidad|brillo/,
    'Cambiar cuánta luz llega',
    'El brillo cambia la intensidad visible, no la separación de colores ni sus trayectorias. Al llevarlo a cero deja de verse el haz. Compararlo con el material ayuda a distinguir cantidad de luz de dispersión.',
  ),
  topic(
    ['prisma'],
    /material|vidrio|dispersion/,
    'Distinta respuesta a cada color',
    'El índice de refracción depende del material y de la longitud de onda. Cambiar el vidrio modifica cuánto se desvía y se separa el espectro. El prisma separa componentes de la luz blanca; no fabrica los colores.',
  ),
  topic(
    ['prisma'],
    /prism-angle|apex-angle|giro|angulo del prisma|apice/,
    'Geometría del prisma',
    'El giro y el ángulo del prisma cambian cómo el rayo encuentra sus caras. La refracción se recalcula en cada encuentro; algunos ajustes pueden hacer que la luz no salga por la cara esperada. Observá tanto la entrada como la pantalla.',
  ),
  topic(
    ['prisma'],
    /screen-distance|pantalla|distancia/,
    'Proyectar la separación',
    'Alejar la pantalla convierte la misma separación angular en una mayor distancia entre colores. No cambia la composición de la luz ni las direcciones de salida. La escala común permite comparar las posiciones sobre la pantalla.',
  ),
  topic(
    ['prisma'],
    /light-width|ancho del haz/,
    'Un haz con ancho',
    'Un haz más ancho superpone posiciones y hace más difícil distinguir colores cercanos. No añade longitudes de onda nuevas. Reducirlo ayuda a separar el efecto de la geometría del ensanchamiento de la fuente.',
  ),

  topic(
    ['doble-rendija'],
    /wavelength|longitud de onda|λ/,
    'Longitud de onda',
    'Una longitud de onda mayor abre el patrón: separa las franjas y ensancha la envolvente. Las longitudes usan las unidades normalizadas del modelo; cambiar de partícula no asigna aquí una energía real automáticamente.',
  ),
  topic(
    ['doble-rendija'],
    /slit-separation|separacion|centros/,
    'Separación entre rendijas',
    'Al aumentar la distancia entre centros, las franjas internas se acercan. Si el ancho de cada abertura se conserva, la envolvente de difracción conserva su escala. Compará frecuencias relativas y cambiá una variable por vez.',
  ),
  topic(
    ['doble-rendija'],
    /slit-width|ancho/,
    'Ancho de cada abertura',
    'Una abertura más estrecha produce difracción más extendida. Esto ocurre incluso con una sola rendija y sigue presente al registrar el camino. La separación entre aberturas controla además la interferencia entre ellas.',
  ),
  topic(
    ['doble-rendija'],
    /detector|registro|camino|informacion/,
    'Conocer por dónde pasó',
    'El registro del camino reduce la interferencia entre alternativas. No depende de que una persona mire la pantalla: importa qué información queda físicamente disponible. La difracción de cada rendija no desaparece.',
  ),
  topic(
    ['doble-rendija'],
    /emission-rate|burst-size|particulas por|detecciones por|emitir|continua/,
    'Construir el patrón punto a punto',
    'Cada detección es localizada y aleatoria según la distribución calculada. Emitir más rápido o en grupos reúne datos antes; no cambia la probabilidad de cada posición. Muchos impactos hacen visible el patrón estadístico.',
  ),
  topic(
    ['doble-rendija'],
    /screen-distance|distancia|pantalla|histograma|patron/,
    'De impactos a una distribución',
    'La distancia a la pantalla cambia la escala del patrón. Los puntos son detecciones, las barras cuentan frecuencias y la curva opcional es la predicción del modelo de Fraunhofer. No muestran trayectorias ocultas de las partículas.',
  ),
  topic(
    ['doble-rendija'],
    /slit-count|rendija|particle-type|particula/,
    'Comparar las condiciones',
    'Una abertura difracta; varias pueden interferir cuando no se registra el camino. A igual longitud de onda y geometría, las partículas del modelo tienen el mismo patrón ideal. Cambiar una condición física inicia una corrida nueva.',
  ),
  topic(
    ['prisma'],
    /canvas|escena|visor/,
    'Un banco óptico calculado',
    'La lámpara envía luz blanca hacia el prisma y la pantalla. Los rayos representan longitudes de onda con trayectorias calculadas por refracción; su grosor y color ayudan a verlas. Mové la fuente o el prisma y buscá qué parte atraviesa el vidrio. El prisma separa colores presentes en la luz de entrada.',
  ),
  topic(
    ['doble-rendija'],
    /canvas|escena|visor/,
    'Impactos y amplitudes son cosas distintas',
    'Los puntos de la pantalla son detecciones individuales. La trama de ondas es una ayuda cualitativa para pensar amplitudes; no dibuja un camino secreto de cada partícula. La distribución se calcula con el modelo de Fraunhofer y se revela al acumular impactos.',
  ),
  topic(
    ['lente-gravitacional'],
    /canvas|escena|visor/,
    'La imagen de un observador',
    'Cada dirección de la imagen se asocia a una trayectoria de luz calculada en Schwarzschild. La desviación puede desplazar y multiplicar imágenes del fondo; la zona oscura corresponde a direcciones capturadas. Elegí un rayo y comparalo con su trayectoria en el diagrama.',
  ),
  topic(
    ['acrecion'],
    /canvas|escena|visor/,
    'El brillo pertenece al gas',
    'El disco es gas emisor fuera del horizonte. Su imagen combina trayectorias de luz de Schwarzschild con una aproximación de disco delgado y transferencia relativista. Cambiar suministro e inclinación permite separar cantidad de gas y asimetría del movimiento. No es emisión de Hawking.',
  ),
  topic(
    ['hawking'],
    /canvas|escena|visor/,
    'Energía y horizonte en un esquema',
    'El círculo oscuro y la trama sirven para orientarse. Los marcadores dorados representan emisión y los azules absorción del baño térmico; su brillo y movimiento están amplificados, no son fotones observados. El radio, temperatura y potencias se calculan a partir de la masa y el entorno.',
  ),
]

export const COMMON_HELP: readonly Omit<HelpTopic, 'paths'>[] = [
  {
    match: /ver los siete capitulos|los [35] laboratorios|atlas de lo invisible|indice/,
    title: 'El índice del recorrido',
    body: 'Abre la lista de laboratorios del especial para ubicar dónde estás y elegir el siguiente. Los capítulos relacionados comparten una pregunta de fondo; sus retos y los sellos ya guardados se conservan al navegar.',
  },
  {
    match: /comprobar (?:mi )?explicacion|empezar el primer reto/,
    title: 'Probar y explicar',
    body: 'El reto combina una predicción con observaciones requeridas. Primero explorá las condiciones indicadas; después contrastá tu explicación con lo observado. Una respuesta acertada sin las comparaciones no completa la actividad.',
  },
  {
    match:
      /como se calcula|que simplifica|que representa|que representan|que idealiza|cuanto tiempo representa|como pueden|prueba experimental|hay experimentos|fundamento|que muestran/,
    title: 'Leer el modelo y sus límites',
    body: 'Abre el detalle de qué se calcula, qué es una representación gráfica y qué aproximaciones se usan. También distingue una predicción del modelo de una observación experimental o histórica. Consultarlo ayuda a interpretar los números sin confundir la animación con una medición real.',
  },
  {
    match:
      /desde afuera|desde el tren|iniciar ensayo|iniciar recorrido|ver resultado|volver al inicio|congelar lectura/,
    title: 'Elegir una vista o un instante',
    body: 'Permite inspeccionar el ensayo desde otra vista o en un momento concreto, sin convertir la reproducción en una nueva ley física. Al recorrer el tiempo compará las lecturas calculadas; las posiciones dibujadas pueden estar ampliadas para mostrar efectos pequeños.',
  },
  {
    match: /camara|perspectiva 3d|vista superior|encuadrar|dejar de girar/,
    title: 'Cambiar el punto de vista',
    body: 'Girar, acercar o encuadrar cambia la cámara, no las condiciones físicas del ensayo. En celular el modo de giro reserva el gesto para la cámara; desactivalo para volver a manipular objetos o desplazar la página. La vista superior ayuda a comparar trayectorias en el plano.',
  },
  {
    match:
      /como explorar|el fundamento|tutorial|guia|cerrar informacion|cerrar ayuda|volver al experimento/,
    title: 'Una guía para explorar',
    body: 'Abre o cierra la explicación de uso y del fenómeno. Te ayuda a identificar qué podés mover y qué observar antes de comparar. Para ejecutar la acción o seguir jugando, desactivá el modo ayuda; consultar esta explicación no cambia el montaje.',
  },
  {
    match: /prediccion|elegi una idea|tu idea/,
    title: 'Primero, una idea para contrastar',
    body: 'Elegí lo que pensás que va a pasar antes o durante la prueba. Podés corregirlo después de observar. Una opción correcta por sí sola no completa el reto: también tenés que realizar las comparaciones indicadas.',
  },
  {
    match: /pasos del reto|referencia|comparacion|observar|condiciones del reto/,
    title: 'Comparar con una referencia',
    body: 'La lista indica qué observaciones faltan. Conservá las condiciones que el reto pide mantener y cambiá la variable indicada. Restaurar el montaje recupera esas condiciones para que la comparación tenga sentido.',
  },
  {
    match: /restablecer|reiniciar|restaurar|usar condiciones/,
    title: 'Volver a un montaje conocido',
    body: 'Recupera las condiciones del ensayo o del reto indicado. Puede limpiar la corrida o las observaciones de esa prueba; los descubrimientos ya guardados en el pasaporte se conservan. Revisá el estado antes de continuar una comparación.',
  },
  {
    match: /pausa|reanudar|reproducir|continuar|play|animar/,
    title: 'Controlar la reproducción',
    body: 'Pausa o continúa la evolución que muestra el laboratorio. Podés inspeccionar los valores con calma; detener la reproducción no altera las leyes ni las constantes del modelo.',
  },
  {
    match:
      /ampliar|visor|volver al reto|cerrar reto|mi reto|pregunta|probar en la escena/,
    title: 'Mantener experimento y pregunta cerca',
    body: 'Estos controles alternan entre el visor amplio y el panel del reto sin reiniciar el montaje. Podés volver a los controles o a tu predicción conservando el estado de la escena.',
  },
  {
    match: /elegir reto|siguiente reto|reto educativo|descubrimiento/,
    title: 'Avanzar por una pregunta',
    body: 'Cada reto plantea una comparación y una explicación. Cambiar de reto prepara su ensayo; los logros completados quedan en el pasaporte de este navegador. El sello registra la actividad, no una evaluación formal de aprendizaje.',
  },
  {
    match: /vista|sistema|diagrama|grafico|imagen/,
    title: 'Otra vista del mismo modelo',
    body: 'Cambia qué representación observás. Las vistas comparten las condiciones del ensayo; compararlas ayuda a separar el fenómeno calculado de las coordenadas o la ampliación con que se dibuja.',
  },
  {
    match: /fuentes|limites|formula|modelo|como jugar|que cambia/,
    title: 'Entender el alcance',
    body: 'Abrí esta sección para ver las ecuaciones, las aproximaciones o cómo se relaciona el control con lo observado. Una simulación representa aspectos concretos del fenómeno; aquí se explica qué calcula y qué es una ayuda visual.',
  },
  {
    match:
      /mapa del especial|siguiente capitulo|siguiente laboratorio|siguiente seccion|volver al recorrido|todos los laboratorios|spum/,
    title: 'Seguir el recorrido',
    body: 'Navegá entre laboratorios, secciones o regresá al mapa del especial. Los retos completados se guardan localmente en este navegador; cambiar de página no borra esos sellos.',
  },
]

const normalized = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
export function helpForText(pathname: string, text: string): HelpEntry | null {
  const path = normalized(pathname),
    value = normalized(text)
  const found =
    HELP_TOPICS.find(
      (entry) =>
        entry.paths.some((route) => path.includes(route)) && entry.match.test(value),
    ) ?? COMMON_HELP.find((entry) => entry.match.test(value))
  return found ? { title: found.title, body: found.body } : null
}

/** Resolve only DOM-visible context; no React state or private application globals. */
export function resolveHelp(pathname: string, target: Element): HelpEntry | null {
  const explicit = target.closest('[data-help-body]')
  if (explicit)
    return {
      title: explicit.getAttribute('data-help-title') || 'Ayuda del laboratorio',
      body: explicit.getAttribute('data-help-body') || '',
    }
  const scope = target.closest('[data-help-scope]')?.getAttribute('data-help-scope')
  const contextPath = scope ? `/${scope}/` : pathname
  if (target.closest('canvas')) return helpForText(contextPath, 'canvas')
  const control =
    target.closest(
      'button,input,select,summary,a,[role="slider"],[role="button"],[role="switch"],label,output',
    ) ?? target
  if (control.getAttribute('type') === 'radio')
    return {
      title: 'Una predicción para poner a prueba',
      body: 'Esta opción expresa una posible explicación del resultado. Elegila al salir del modo ayuda y contrastala con las observaciones que pide el reto. Podés cambiar tu idea; el objetivo es relacionar el cambio del montaje con lo que muestra la escena, no acertar sin probar.',
    }
  const id = control.getAttribute('id') || ''
  const label = id
    ? Array.from(control.ownerDocument.querySelectorAll('label[for]')).find(
        (item) => item.getAttribute('for') === id,
      )?.textContent
    : ''
  const containingLabel = control.closest('label')?.textContent
  const outputLabel =
    control.tagName?.toLowerCase() === 'output'
      ? control.parentElement?.querySelector('label')?.textContent
      : ''
  const aria = control.getAttribute('aria-label')
  const ownText = control.textContent?.trim() || ''
  const numericTags = ['strong', 'b', 'output', 'dd', 'td']
  const parentText = numericTags.includes(control.tagName?.toLowerCase())
    ? control.parentElement?.textContent?.trim()
    : ''
  const metricContext = parentText && parentText.length <= 320 ? parentText : ''
  const context = [
    label,
    containingLabel,
    outputLabel,
    aria,
    ownText.slice(0, 350),
    metricContext,
    id,
  ]
    .filter(Boolean)
    .join(' ')
  const specific = helpForText(contextPath, context)
  if (specific) return specific
  // Existing authored descriptions often explain a slider more precisely than a generic topic.
  const descriptions = (control.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter((ref) => ref && ref !== 'spum-help-card')
    .map((ref) => control.ownerDocument.getElementById(ref)?.textContent?.trim())
    .filter(Boolean)
  if (descriptions.length)
    return {
      title: label?.trim() || aria || 'Qué cambia este control',
      body: descriptions.join(' '),
    }
  const labelled = target.closest('[aria-label]')
  return labelled
    ? helpForText(contextPath, labelled.getAttribute('aria-label') || '')
    : null
}
