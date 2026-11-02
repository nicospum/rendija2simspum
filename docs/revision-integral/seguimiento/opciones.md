# Opciones después de revisar el catálogo actual

Estas opciones no forman parte de las reparaciones ni fueron implementadas. Bell y Eratóstenes ya existen: no se vuelven a proponer como novedades. Se conserva el desarrollo detallado de las seis opciones restantes en [la lista histórica](../propuestas.md), con interacción, modelo, reto, comprobación independiente, simplificaciones y dependencias.

## Orden recomendado

| Prioridad | Propuesta / pregunta | Acción directa y aprendizaje | Reto verificable | Esfuerzo y reutilización |
|---|---|---|---|---|
| 1 | **Teletransporte cuántico:** ¿qué hace falta para transferir un estado? | Preparar un qubit, compartir un par, medir y retener/liberar los dos bits clásicos; aplicar la corrección. Distinguir recurso entrelazado y comunicación. Nivel intermedio/avanzado, después de Entrelazados y Bell. | Antes del mensaje, el estado accesible a Bob no permite reconstruir el original; después de la corrección, fidelidad 1 en las cuatro ramas ideales. Contrastar con matrices independientes y estados complejos. | Medio; reutiliza qubits, trazas parciales y controles. Nuevo vector de tres qubits y protocolo. No transmite materia, no clona ni demuestra un agujero de gusano. |
| 2 | **Mareas:** ¿qué no desaparece al caer libremente? | Arrastrar una nube de sondas, variar distancia, masa y separación, observar estiramiento radial y compresión transversal. Nivel inicial/intermedio; completa Ascensor y Horizonte. | Duplicar la separación duplica la aceleración relativa en el régimen lineal; contrastar con diferencia de dos campos centrales. | Medio; reutiliza sondas y cámara. Empezar con tensor débil; no extrapolar hasta la singularidad ni simular lesiones humanas. |
| 3 | **Michelson–Morley:** ¿girar es lo mismo que mover un espejo? | Rotar un interferómetro y desplazar un espejo; relacionar caminos, fase y franjas. Nivel inicial/intermedio. | Desplazar un espejo λ/2 recorre una franja por el camino de ida y vuelta. Comparar predicción relativista y una hipótesis clásica identificada. | Medio; reutiliza óptica y franjas, nueva geometría. El resultado histórico no prueba por sí solo toda la relatividad. |
| 4 | **Retardo de Shapiro:** ¿por qué tarda más la señal? | Mover una sonda, enviar radar cerca del Sol y separar tiempo geométrico de retardo gravitatorio. Nivel intermedio. | Comparar dos parámetros de impacto sin atravesar el Sol; comprobar límite de masa cero y eventos de ida/vuelta. | Medio; reutiliza relojes y rayos, nuevo modelo de primer orden y referencia independiente. No decir que la luz local va más lento que c; excluir plasma explícitamente. |
| 5 | **Escuchar dos agujeros negros:** ¿qué cuenta un chirp? | Mover masas y distancia, ver órbita/frecuencia/amplitud y escuchar una señal tras activar sonido. Comparar con datos públicos. Nivel intermedio. | A igual masa y frecuencia, duplicar distancia reduce amplitud a la mitad; variar masa chirp cambia la evolución de frecuencia. | Alto; usa GWOSC, filtros reproducibles y alternativa visual al sonido. Separar inspiración aproximada, fusión y datos medidos; no extrapolar una fórmula hasta fingir una fusión exacta. |
| 6 | **Doppler relativista:** ¿qué color recibe quien espera? | Arrastrar una fuente acercándola/alejándola; contar llegadas y comparar espectros emitido/recibido. Nivel inicial. | A β=0,6, frecuencia recibida mitad al alejarse y doble al acercarse; contrastar con eventos transformados. | Bajo/medio; reutiliza Reloj y Tren. Evaluar primero una actividad dentro de Reloj para evitar otra tarjeta breve. Diferenciar frecuencia recibida de ritmo coordinado de un reloj. |

**Para seguir hacia Maldacena elegiría teletransporte ideal.** Es una propuesta de progresión educativa, no una consecuencia de que Bell pruebe la dualidad. Permite practicar estados, correlaciones y canal clásico antes de hablar de modelos gravitatorios que usan ese lenguaje. Para ampliar la intuición visual de gravedad con menos conocimientos previos, elegiría mareas.

## Fundamento y límites de esta recomendación

Se reabrieron fuentes primarias o institucionales durante este seguimiento. Se leyó el contenido pertinente, no se trató un resultado de búsqueda como validación completa:

- [Bennett y colaboradores, PRL 70, 1895 (1993)](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.70.1895): resumen autoral del protocolo, recurso compartido, medida conjunta, mensaje clásico y reconstrucción. La derivación completa debe leerse y contrastarse antes de implementar. El estado reducido accesible de Bob antes del mensaje es distinto de una rama condicionada al resultado que conserva Alice.
- [Pössel / Albert Einstein Institute, gravedad y curvatura](https://www.einstein-online.info/en/spotlight/geometry_force/): equivalencia local, campos no uniformes y mareas. La fórmula lineal requiere separación pequeña respecto del radio.
- [OpenStax / Rice University, invariancia de las leyes físicas](https://openstax.org/books/university-physics-volume-3/pages/5-1-invariance-of-physical-laws): marcos inerciales, postulados y contexto de Michelson–Morley. Derivar aparte fases, geometría y cada hipótesis al implementar.
- [JPL, Cassini (2 de octubre de 2003)](https://www.jpl.nasa.gov/news/saturn-bound-spacecraft-tests-einsteins-theory/): medición del tiempo de ida/vuelta y control del plasma. La publicación de Bertotti–Iess–Tortora y su derivación completa siguen siendo necesarias para el modelo de Shapiro.
- [LIGO/Virgo, datos de GW150914](https://gwosc.org/events/GW150914/): origen, parámetros, unidades, datos y filtros de las curvas publicadas. No confundir una reconstrucción de señal con datos crudos.
- [OpenStax / Rice University, Doppler relativista](https://openstax.org/books/university-physics-volume-3/pages/5-7-doppler-effect-for-light): derivación radial, convención de alejamiento y relación de frecuencias.

El QA científico independiente revisó fundamento y viabilidad como **opciones**. No aprobó modelos nuevos aún inexistentes ni comprometió su desarrollo.

## Mejoras opcionales de actividades existentes

1. **Prueba con personas que llegan sin saber:** predicción breve, intervención, explicación con una observación concreta. Prioridad alta, bajo coste técnico; falta reclutamiento y sesiones, no otro sistema en la web.
2. **Incertidumbre junto a muestras de Rendija/Entrelazados:** ayudar a comparar fluctuación y predicción. Esfuerzo medio; definir el estadístico y su uso antes de puntuar. Bell ya tiene su cota: no duplicarla como novedad.
3. **Transferencia al cerrar un especial:** una pregunta que conecte dos observaciones existentes. Esfuerzo medio de diseño educativo, bajo de código; primero validar con personas, sin añadir otra escena vacía.
4. **Modelos más ricos de agujeros negros:** giro, especies emitidas o cuerpos grises sólo después de consolidar los supuestos actuales. Esfuerzo alto de física, referencias y rendimiento; no necesarios para reparar las actividades de este ciclo.
