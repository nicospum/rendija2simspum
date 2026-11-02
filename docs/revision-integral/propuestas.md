# Propuestas opcionales después de la revisión

Son opciones para decidir, **no laboratorios implementados ni compromisos de publicación**. El catálogo actual ya permite empezar el recorrido Maldacena; agregar más tarjetas no es un requisito para comprender sus modelos. La prioridad sugerida favorece interacciones nuevas y observables que aún no tienen un laboratorio propio. Cada propuesta requerirá investigación detallada y QA científico y de producto antes de implementarse.

Esfuerzo relativo: bajo = reutilización de motor y escena simples; medio = nuevo modelo pequeño y nueva interacción; alto = tratamiento de datos o render y validación considerable. No son estimaciones en días. Ninguna opción exige por sí sola instalar un motor nuevo o un servicio de pago.

## 1. Bell: ¿pueden las partículas llevar las respuestas escritas?

- **Qué se aprende / diferencia:** Entrelazados ya distingue Bell y mezcla en X/Z; este módulo permitiría elegir orientaciones y construir una desigualdad con cuatro correlaciones. Nivel intermedio, puente hacia información cuántica.
- **Qué se hace y ve:** girar dos analizadores directamente en la escena; elegir cuatro parejas de ajustes y emitir lotes. Ver resultados locales, coincidencias y la suma CHSH juntos, comparando modelo cuántico con un modelo local explícito.
- **Modelo inicial:** estado de Bell ideal, regla de Born para polarización lineal, detectores ideales. Para la convención Φ⁺, E(a,b)=cos[2(a−b)]. Con a=0°, a′=45°, b=22,5°, b′=−22,5°, la combinación E(a,b)+E(a,b′)+E(a′,b)−E(a′,b′) vale 2√2; el límite local es 2. La literatura original estudia además las condiciones experimentales reales: [CHSH, 1969, pp. 880–883](https://journals.aps.org/prl/pdf/10.1103/PhysRevLett.23.880).
- **Reto y verificación:** encontrar ajustes que superen 2 en la predicción exacta; después comparar con muestras y su incertidumbre. Contrastar matrices de Pauli/Born con la fórmula angular y enumerar las 16 asignaciones locales deterministas. No aprobar un reto estadístico por una fluctuación aislada.
- **Límite y viabilidad:** una simulación no prueba que la naturaleza viole Bell ni cierra las lagunas de un ensayo real; no implica mensajes instantáneos. Esfuerzo medio. Reutiliza el generador de pares, histogramas y retos; necesita una nueva medición angular y un evaluador estadístico bien definido.

## 2. Mareas: lo que no desaparece al caer

- **Qué se aprende / diferencia:** complementa Ascensor y Horizonte mostrando el límite de la equivalencia local: estar sin apoyo no elimina las diferencias de aceleración entre lugares cercanos. Nivel inicial/intermedio.
- **Qué se hace y ve:** arrastrar una pequeña nube de sondas en caída libre; cambiar masa, distancia al centro y separación inicial; alternar vista de la nube y de un observador que cae con su centro. Las distancias relativas se estiran radialmente y se comprimen transversalmente.
- **Modelo inicial:** comenzar lejos del horizonte con el tensor de mareas newtoniano: coeficientes 2GM/r³ radial y −GM/r³ transversal, sobre separaciones pequeñas. Si se añade un régimen fuerte, derivar por separado la desviación geodésica en un marco ortonormal. Fundamento conceptual: [Pössel / AEI, de ingravidez a curvatura](https://www.einstein-online.info/en/spotlight/geometry_force/).
- **Reto y verificación:** duplicar la separación manteniendo el resto fijo y comprobar que se duplica la aceleración relativa en el régimen lineal. Contrastar la aproximación con la diferencia de dos campos centrales evaluados directamente y mostrar dónde deja de ser válida.
- **Límite y viabilidad:** no presentar una persona elástica ni su destrucción como cálculo biomecánico; no prolongar una aproximación débil hasta la singularidad. Esfuerzo medio, reutiliza la cámara, las sondas y el contraste de marcos del Ascensor.

## 3. Michelson–Morley: girar y buscar el cambio

- **Qué se aprende / diferencia:** nueva geometría de interferómetro con dos brazos, distinta de la doble rendija. Permite separar una hipótesis clásica de éter, una diferencia física de caminos y una predicción relativista. Nivel inicial/intermedio.
- **Qué se hace y ve:** rotar el aparato con el dedo; soltar un pulso, seguir su división y recombinación; mover un espejo. Mantener el patrón de interferencia junto al recorrido y las lecturas de tiempo/fase.
- **Modelo inicial:** óptica geométrica y superposición de amplitudes monocromáticas coherentes, sin añadir un falso viento en el modelo relativista. El contraste de hipótesis debe indicar qué longitudes y relojes define cada una. Contexto y procedimiento: [OpenStax, sección sobre Michelson–Morley](https://openstax.org/books/university-physics-volume-3/pages/5-1-invariance-of-physical-laws).
- **Reto y verificación:** distinguir girar un aparato simétrico de desplazar físicamente un espejo. Un desplazamiento de espejo λ/2 cambia el camino de ida y vuelta en λ y recorre una franja completa. Contrastar el caso relativista por transformación de los eventos y el desfase por diferencia de caminos.
- **Límite y viabilidad:** no atribuir a un único resultado histórico la prueba de toda la relatividad ni presentar la hipótesis de éter como descripción vigente. Esfuerzo medio; reutiliza trazado, colores y amplitudes, pero requiere una geometría nueva de divisor y espejos.

## 4. La señal que tarda de más: retardo de Shapiro

- **Qué se aprende / diferencia:** Lente estudia posiciones aparentes y Horizonte señales cerca de un agujero negro; aquí se mide un tiempo de ida y vuelta en campo débil. Nivel intermedio, conecta Einstein con una medición espacial real.
- **Qué se hace y ve:** mover una sonda detrás del Sol, enviar radar y comparar reloj de emisión/recepción, geometría sin masa y retardo adicional. Mostrar explícitamente qué observador mide cada tiempo.
- **Modelo inicial:** trayectorias y tiempos de viaje a primer orden posnewtoniano, masa esférica estática, sin plasma solar. Fuente inicial: [Bertotti, Iess y Tortora, Cassini, 2003](https://pubmed.ncbi.nlm.nih.gov/14508481/) —se leyó el resumen autoral— y [descripción de la misión por JPL](https://www.jpl.nasa.gov/news/saturn-bound-spacecraft-tests-einsteins-theory/). Antes de implementar habrá que leer y derivar el desarrollo completo de tiempo y geometría, no limitarse al resumen.
- **Reto y verificación:** acercar el trayecto al limbo sin atravesar el Sol y distinguir el cambio en tiempo geométrico del retardo gravitatorio adicional. Contrastar fórmula de primer orden con integración nula en campo débil y con el caso M→0; comprobar ida y vuelta con eventos, sin duplicar factores por accidente.
- **Límite y viabilidad:** no explicar el efecto como que un fotón local viaja por debajo de c. Esfuerzo medio; reutiliza señales y relojes, con un nuevo integrador/referencia de tiempo.

## 5. Escuchar dos agujeros negros: el chirp

- **Qué se aprende / diferencia:** señal dinámica y detector, todavía ausentes en los cinco módulos de agujeros negros. Nivel intermedio, potencial visual y sonoro alto.
- **Qué se hace y ve:** arrastrar masas y distancia del observador; ver órbita, frecuencia y amplitud juntas; comparar inspiración lenta con un tramo real de GW150914. Sonido sólo después de una acción del usuario y con control de volumen.
- **Modelo inicial:** inspiración cuasicircular posnewtoniana limitada al dominio válido, seguida de un ejemplo de datos/modelo publicado claramente diferenciado. Base primaria: [LIGO/Virgo, artículo de detección](https://dcc.ligo.org/public/0122/P150914/014/LIGO-P150914_Detection_of_GW150914.pdf); [GWOSC ofrece datos y especifica filtros y reconstrucciones](https://gwosc.org/events/GW150914/).
- **Reto y verificación:** a igual masa y frecuencia, duplicar distancia y contrastar la reducción de amplitud; después variar masa chirp y comparar la rapidez del ascenso de frecuencia. Usar solución analítica del régimen temprano, convergencia temporal y un segmento de datos de referencia.
- **Límite y viabilidad:** la fórmula de inspiración no debe generar por extrapolación una falsa fusión exacta. Declarar amplificación visual del strain y procesamiento del sonido/datos. Esfuerzo alto: selección y licencia de datos, filtros reproducibles, accesibilidad sonora y rendimiento móvil; no requiere resolver relatividad numérica en el teléfono.

## 6. El color que llega: Doppler relativista

- **Qué se aprende / diferencia:** hace manipulable una frecuencia recibida, además de los tics coordinados del Reloj y los eventos del Tren. Conviene primero evaluar si alcanza una actividad interna en Reloj, para evitar otra tarjeta pequeña. Nivel inicial.
- **Qué se hace y ve:** acercar o alejar una fuente en la escena; ver pulsos emitidos, llegadas contadas y espectros de fuente/receptor simultáneamente. Una sola convención visible para el signo de velocidad.
- **Modelo inicial:** movimiento radial inercial, f_rec/f_em=√[(1−β)/(1+β)], β positivo al alejarse; c local constante. Fuente con derivación: [OpenStax, Doppler para luz](https://openstax.org/books/university-physics-volume-3/pages/5-7-doppler-effect-for-light).
- **Reto y verificación:** a β=0,6, obtener media frecuencia al alejarse y el doble al acercarse. Contrastar la fórmula con los eventos de emisión/recepción transformados y con el límite β→0.
- **Límite y viabilidad:** la frecuencia recibida incluye propagación; no equivale por sí sola al ritmo coordinado del reloj móvil. El color visible se recorta al espectro humano y debe acompañarse de una lectura numérica. Esfuerzo bajo/medio, con reutilización amplia de Reloj y Tren.

## 7. Teletransportar un estado, sin enviar una señal más rápida que la luz

- **Qué se aprende / diferencia:** añade un protocolo operativo de tres qubits a las correlaciones estáticas de Entrelazados; conecta información, recurso compartido y canal clásico. Nivel avanzado, posterior a los anteriores.
- **Qué se hace y ve:** preparar un estado, compartir el par, medir, retener/liberar los dos bits clásicos y aplicar la corrección en el receptor. Mostrar el estado local disponible en cada paso, sin dibujar una partícula cruzando instantáneamente.
- **Modelo inicial:** puertas y medidas ideales sobre un vector complejo de ocho amplitudes, canal clásico con retardo controlado. Fuente original: [Bennett y colaboradores, 1993](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.70.1895). Se leyó el resumen autoral; el desarrollo completo del circuito deberá leerse y verificarse antes de construirlo.
- **Reto y verificación:** bloquear el mensaje y comprobar que el receptor no reconstruye el estado; liberarlo y recuperar fidelidad 1 en el modelo ideal. Contrastar las cuatro ramas de medida con matrices independientes, estados ±X/±Y/±Z y estados de prueba complejos.
- **Límite y viabilidad:** no teletransporta materia, no clona el original, no comunica sin el canal clásico y no demuestra un agujero de gusano. Esfuerzo medio; reutiliza la base de qubits y trazas parciales, con evolución de tres qubits nueva.

## Mejoras opcionales del catálogo actual

| Prioridad | Mejora a evaluar | Beneficio y alcance | Esfuerzo / dependencias |
|---|---|---|---|
| Alta | Pequeño indicador de dispersión al comparar muestras en Rendija/Entrelazados | Diferenciar fluctuación, predicción y tendencia; conservar que un contador de eventos no certifica una ley. Definir antes un criterio estadístico si se usa para puntuar. | Medio; sin dependencia externa. Probar comprensión, no sólo el intervalo numérico. |
| Alta | Repetir un caso de contraste junto a una huella histórica | Invitar a predecir de nuevo sin confundir un logro guardado con la observación actual. El lote de esta revisión ya corrige el texto de huella; una comparación lado a lado adicional sería opcional. | Bajo/medio; reutiliza pasaporte y presets, exige controlar qué variables permanecen fijas. |
| Media | Al terminar cada especial, elegir una observación y explicarla con un cambio concreto | Comprobar transferencia entre dos laboratorios, por ejemplo apoyo local vs mareas o Shannon vs entropía de entrelazamiento, sin añadir una escena vacía. | Bajo en código, medio en redacción y prueba con participantes. No afirmar que QA técnico prueba aprendizaje. |
| Baja | Selector avanzado de especies/cuerpos grises en Hawking o giro en lentes | Explorar límites de los modelos actuales una vez clara la experiencia básica; no es necesario para corregir fórmulas actualmente declaradas ideales. | Alto en física y validación; necesitaría nuevos datos/modelos y fuentes completas. Posponer frente a interacción y claridad. |

La elección sugerida es Bell si se quiere profundizar Maldacena, o Mareas si se quiere reforzar la intuición visual de relatividad y agujeros negros. GW150914 ofrece el siguiente salto visual grande, con un coste de validación mayor.
