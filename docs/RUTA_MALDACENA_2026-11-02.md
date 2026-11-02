# De SPUM a Maldacena: recorrido propuesto

2 de noviembre de 2026. Investigación y propuesta educativa; estos laboratorios nuevos todavía no están construidos. La revisión se basa en el código, los catálogos y la documentación, no en una prueba de aprendizaje con participantes.

## Decisión

**Ya podemos empezar el especial Maldacena.** No hace falta agregar otra tanda de relatividad clásica antes. Conviene abrirlo con dos puentes —entrelazamiento e información parcial, y geometría de anti-de Sitter— y llegar enseguida a una comparación holográfica que el visitante pueda calcular y manipular.

La colección ya contiene 14 laboratorios. El camino más directo no exige hacerlos todos: doble rendija → horizonte → Hawking → entropía → entrelazamiento → AdS → correspondencia. Prisma y los siete capítulos Einstein aportan intuición y son opciones de exploración, pero no todos son prerrequisitos de AdS/CFT.

La conjetura original de Maldacena propone equivalencias entre ciertas teorías cuánticas y teorías de cuerdas/gravedad en espacios anti-de Sitter; su ejemplo emblemático relaciona teoría de cuerdas IIB en AdS5 × S5 con una teoría cuántica conforme en cuatro dimensiones espaciotemporales. Para una primera visualización es más manejable estudiar AdS3/CFT2. Eso no convierte un dibujo 2D en una simulación de toda la teoría original. [Maldacena, 1997/1998](https://arxiv.org/abs/hep-th/9711200), [Aharony y otros, revisión de 1999](https://arxiv.org/abs/hep-th/9905111).

## Lo que tenemos y el puente que falta

| Ya existe | Qué aporta | Qué todavía debe aprenderse |
| --- | --- | --- |
| Doble rendija y efecto fotoeléctrico | Probabilidades, medición y cuantización | Entrelazamiento y estado de una parte del sistema |
| Relojes, tren y gemelos | Sistemas de referencia y tiempos propios | La frontera holográfica no es otro observador ni una perspectiva de cámara |
| Lente, acreción y horizonte | Geometría, luz, causalidad y observación indirecta | La geometría AdS es otra solución física; no es el Schwarzschild aislado de esos capítulos |
| Hawking | Temperatura, emisión y evaporación ideal | Diferenciar entropía térmica de entropía fina y correlaciones |
| Entropía de Bekenstein–Hawking | Ley de área, unidades y balance térmico | Por qué contar posibilidades es distinto de medir área, y qué significa una descripción dual |

El modelo actual de entropía lo aclara correctamente: `Srad = (4/3)(S0 − SBH)` representa una aproximación de entropía térmica de fotones, no la entropía de entrelazamiento de la radiación. No hay que reutilizar esa curva como si fuera una curva de Page. Ver `docs/ENTROPIA_LABORATORIO.md` y `src/entropia/learning.ts`.

## Recorrido de cinco pasos

### 1. «Contar lo que no vemos» — puente breve dentro de entropía

No necesita una nueva tarjeta ni otro laboratorio vacío. Agregaría una actividad corta al capítulo existente: preparar dos o cuatro variables binarias de juguete, ocultar parte del registro y contar las configuraciones compatibles. El visitante mueve el límite entre lo conocido y lo desconocido; al lado cambia la cantidad de posibilidades y su logaritmo.

Cuatro preguntas posibles: una configuración conocida; cuatro alternativas equiprobables; probabilidades desiguales; comparación con el área del horizonte. Debe quedar claro que los cuadros son un modelo de información, no celdas físicas descubiertas sobre un agujero negro.

La ley de área motivó el principio holográfico, pero por sí sola no construye un diccionario interior/frontera. Ese salto conceptual pertenece a los siguientes capítulos. [’t Hooft, 1993](https://arxiv.org/abs/gr-qc/9310026), [Susskind, 1994/1995](https://arxiv.org/abs/hep-th/9409089).

### 2. «Entrelazados: el todo sabe más que sus partes» — primer laboratorio nuevo

Dos sistemas A y B visibles a la vez; se prepara un estado conjunto, se elige qué parte observar y se comparan registros locales con correlaciones conjuntas. Cada ensayo de medición comienza con un par preparado de nuevo.

Cuatro retos: estado producto; estado entrelazado; mezcla clásica con el mismo registro local; comparar el estado total con una parte. La comparación en dos bases evita enseñar que cualquier par de resultados iguales es entrelazamiento. No se anima una señal instantánea entre los dos sistemas.

Un modelo exacto y pequeño basta: `cos(θ)|00⟩ + sin(θ)|11⟩`. La incertidumbre de A se obtiene de los autovalores `p = cos²(θ)` y `1 − p`. En bits, `SA = −p log2(p) − (1−p) log2(1−p)`, mientras el estado conjunto puro tiene entropía cero. La mezcla clásica correspondiente tiene el mismo estado local, pero distintas correlaciones en la base X. Son cálculos de dos qubits, no una simulación de gravedad. [Preskill, Caltech, estados y conjuntos](https://www.preskill.caltech.edu/ph229/notes/chap2.pdf).

### 3. «Un espacio con frontera» — segundo laboratorio nuevo

El visitante arrastra dos extremos en el borde y compara un camino dibujado en el papel con el camino más corto según la métrica. Dos vistas: mapa de coordenadas y longitud física acumulada. Una cuadrícula de tamaños físicos iguales muestra que el borde del dibujo no está a una distancia física pequeña simplemente porque quede cerca en píxeles.

Cuatro retos: línea del dibujo frente a geodésica; mover un extremo; acercar el corte regulador a la frontera; ampliar el intervalo y observar qué profundidad alcanza el camino. No se presenta la frontera como una pared material ni se afirma que esté fuera de nuestro universo.

Para un corte espacial de AdS3 puede usarse `ds² = L²(dx² + dz²)/z²`, con semicírculos ortogonales a la frontera `z = 0`. Debe indicarse que se muestra un corte de tiempo constante, no todo el espacio-tiempo. La explicación pública de Maldacena en IAS es una buena referencia para comunicar qué hace especial a AdS. [Maldacena, conferencia IAS](https://www.ias.edu/sns/malda/public_lectures/EnglishLecture), [guía de AdS/CFT de Natsuume](https://arxiv.org/abs/1409.3575).

### 4. «Dos lenguajes, una misma respuesta» — primer laboratorio propiamente holográfico

Esta sería la pieza central del especial. El visitante cambia con dos asas la longitud de una región de la frontera. En un lado ve la entropía del intervalo de una teoría conforme; en el otro, la geodésica mínima que entra en el espacio AdS. Ambas vistas comparten la misma región y condiciones, pero muestran cálculos distintos.

Cuatro retos: ampliar el intervalo; trasladarlo sin cambiar su tamaño en el estado homogéneo; cambiar la resolución/corte y distinguirlo de un cambio físico; comparar diferencias de entropía entre dos intervalos. La explicación final conecta el cálculo de la frontera con una cantidad geométrica del interior.

Empezaría con **un solo intervalo en el vacío sobre una línea infinita**. El resultado conforme tiene la forma `SA = (cCFT/3) ln(ℓ/ε) + constante`. En la aproximación gravitatoria estática, Ryu–Takayanagi lo relaciona con la longitud de la geodésica dividida por `4G3`, en unidades naturales. `cCFT` es la carga central de la teoría y **no** la velocidad de la luz. [Calabrese–Cardy, intervalo único](https://arxiv.org/abs/hep-th/0405152), [Ryu–Takayanagi, 2006](https://arxiv.org/abs/hep-th/0603001).

La interfaz debe fijar un régimen holográfico semiclásico consistente y un mismo esquema de regularización. Los subíndices incluyen el tiempo: AdS3 tiene 2+1 dimensiones y CFT2, 1+1. No permitiría cambiar independientemente parámetros que el diccionario relaciona. La igualdad asintótica no debe fingirse exacta a un corte finito: se comprobarían la integral geométrica, la fórmula analítica y su convergencia. Mostrar diferencias entre estados o regiones ayuda a separar lo universal de constantes de corte.

Esto explora una relación cuantitativa de AdS/CFT; no prueba la conjetura completa mediante dos gráficos. El diccionario incluye observables y correlaciones, no solo una imagen de menor dimensión. [Witten, 1998](https://arxiv.org/abs/hep-th/9802150), [Gubser–Klebanov–Polyakov, 1998](https://arxiv.org/abs/hep-th/9802109).

### 5. «Calentar la frontera, encontrar un horizonte» — ampliación posterior

Primero terminaría los anteriores. Después permitiría cambiar temperatura e intervalo: la frontera pasa a un estado térmico y el cálculo gravitatorio usa un agujero negro BTZ. No se animaría una formación real por colapso al mover una barra: se compararían estados estacionarios.

Cuatro retos: recuperar el límite frío; comparar intervalos pequeños y grandes respecto de la escala térmica; identificar la contribución térmica; distinguir este agujero negro AdS del Schwarzschild de Hawking. BTZ es una solución en 2+1 dimensiones con constante cosmológica negativa. No debe heredar sin revisión la ley «más masa, más frío» del laboratorio actual. [Bañados–Teitelboim–Zanelli](https://arxiv.org/abs/hep-th/9204099).

Una frontera térmica no tiene en general la misma interpretación de pureza que el vacío del paso anterior. Esta diferencia debe enseñarse antes de hablar de recuperación de información o agujeros de gusano. [Ryu–Takayanagi, apartado térmico](https://arxiv.org/html/hep-th/0603001).

## Qué dejaría para después

- **Curva de Page y paradoja de la información:** muy apropiadas como continuación, con un modelo explícito de estados y correlaciones; no reciclar la entropía térmica del laboratorio actual.
- **Corrección cuántica de errores y reconstrucción del interior:** buen juego posterior de borrar y recuperar partes de un código. Un código clásico de redundancia puede ser una introducción, pero no debe llamarse simulación cuántica de AdS/CFT. Los modelos de redes tensoriales deben identificarse como tales. [Pastawski y otros, 2015](https://arxiv.org/abs/1503.06237).
- **ER=EPR y geometría emergente:** después de distinguir correlación, entrelazamiento y dualidad. Un puente dibujado entre dos partículas no demuestra un agujero de gusano físico. [Van Raamsdonk, 2010](https://arxiv.org/abs/1005.3035).
- Más órbitas, espaguetificación o ondas gravitacionales son buenas experiencias, pero no son el cuello de botella conceptual para este recorrido.

## Mejoras educativas prioritarias para la colección actual

Estas son propuestas de diseño surgidas de la estructura del código y las lecciones; no resultados de una prueba de comprensión con visitantes.

1. Dar a la escena tamaño suficiente para leer el objeto y ver un cambio. Mantener cerca un objetivo, una acción principal y una comparación; desplazar las notas extensas al segundo nivel. El prisma y la doble rendija son las referencias de interacción que el usuario ya valora.
2. Cada cambio debe responder «qué toqué → qué cambió → por qué importa». En Hawking y entropía, mostrar la referencia y los factores de cambio junto a las formas; una cifra SI enorme o pequeña no basta para percibir la relación.
3. En entropía, explicar primero posibilidades, probabilidades y unidades antes del factor 1/4. Hacer visible la diferencia entre `S/kB`, bits y entropía térmica; no convertir unidades en nuevas leyes físicas.
4. Al terminar un reto, pedir una transferencia corta: «¿qué esperarías si...?» con otra condición, sin exigir que el visitante conozca de antemano el valor exacto que habilita un sello.
5. Conectar cada capítulo con una pregunta que el siguiente realmente resuelve. El cierre de entropía puede preguntar: «¿Podrían dos teorías con dimensiones diferentes describir los mismos observables?»; el primer puente responde qué significa información parcial.
6. Mostrar de forma breve qué es cálculo, qué es esquema y qué tiene evidencia observacional. La holografía gravitacional no es un holograma óptico, una fotografía, la hipótesis de simulación ni una constatación de que nuestro universo tenga una pared con datos. La aplicación directa a nuestro universo sigue siendo una cuestión abierta. [IAS, contexto y alcance de AdS/CFT](https://www.ias.edu/ideas/ias-shaping-field-epr-adscft-and-beyond).

## Orden de implementación recomendado

Arreglar y consolidar los visores actuales; sumar el puente breve de conteo al laboratorio de entropía; construir **Entrelazados**; construir **Un espacio con frontera**; construir **Dos lenguajes, una misma respuesta**. El especial Maldacena puede abrirse desde el primer capítulo, con los siguientes identificados como próximos, sin simular que ya están disponibles.

Para cada módulo: cuatro retos manipulables, pruebas de límites y cantidades independientes, controles de escena con teclado y ratón, revisión móvil, y prueba con alguien sin formación previa. Las comprobaciones de tamaños emulados no sustituyen Safari o teléfonos físicos; esas pruebas siguen pendientes según la decisión del usuario.
