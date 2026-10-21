# Laboratorio de radiación de Hawking

Primera implementación: 20 de octubre de 2026. Entrada `/hawking/`, integrada al catálogo de SPUM. No agrega dependencias. La investigación, las derivaciones y las fuentes primarias están en [HAWKING_INVESTIGACION.md](HAWKING_INVESTIGACION.md).

## Aprendizaje y comparación

Cada reto prepara una referencia independiente, conserva las condiciones al probar el cambio y permite predecir antes de mostrar el resultado. El feedback distingue referencia, comparación propuesta y cambios de otras condiciones. Los cuatro indicadores de progreso significan relaciones exploradas en el modelo, no verificación experimental ni evaluación del alumno. El progreso dura la sesión de la página; no se guarda información del visitante.

| Reto               | Referencia                    | Cambio                    | Relación que se observa                                 |
| ------------------ | ----------------------------- | ------------------------- | ------------------------------------------------------- |
| Masa y temperatura | 10¹² kg, vacío, t = 0         | M × 2                     | r × 2, T × 0,5                                          |
| Entorno            | Una masa solar nominal, vacío | Fondo cósmico a 2,7255 K  | Misma emisión, absorción mayor y potencia neta negativa |
| Evaporación        | 10¹² kg, vacío, t = 0         | t = 0,75τ₀ o reloj/slider | M × 0,630, T × 1,587, Pideal × 2,520                    |
| Área y entropía    | 10¹² kg, vacío                | M × 2                     | A × 4, S/kB × 4                                         |

Los controles manuales también actualizan las comparaciones. El deslizador de masa ahora es lineal: ×0,5–×2 de la escala elegida, con pasos de ×0,01. Los ejemplos de 10¹² kg y una masa solar seleccionan deliberadamente otra escala. Los botones ÷2/×2 también se acotan a ese intervalo y se desactivan al alcanzar el extremo correspondiente. Restaurar, ejecutar un reto o cambiar de reto recupera su escala, evitando que el valor quede fuera del rango del input. La tolerancia educativa del 1 % para reconocer el doble se conserva, sin modificar los resultados físicos. Elegir otro reto pausa el reloj y conserva el progreso explorado.

## Código y ecuaciones

- `src/hawking/physics.ts`: constantes SI y funciones puras para radio, área, temperatura, entropía, potencia ideal, absorción y espectro. Rechaza entradas no finitas y resultados fuera del rango numérico.
- `src/hawking/learning.ts`: estado, acciones, referencias y evaluación causal. No depende de React ni del visor.
- `src/hawking/App.tsx`: controles, predicciones, comparaciones, historia, referencias y reloj. No existe una API remota ni credenciales en el cliente.
- `src/hawking/Horizon.tsx`: shader WebGL procedural mediante las dependencias Three/R3F existentes. Una sola superficie, sin texturas descargadas ni secuencias prefabricadas. Los marcadores se calculan por celdas polares, evitando recorrer todas las partículas en cada fragmento.
- `src/hawking/Spectrum.tsx`: curva calculada SVG. Las dos distribuciones usan los mismos ejes de energía y potencia absoluta; no se normaliza cada una por separado. Densidad `dP/dln(E)`, no `dP/dE`, con el factor jacobiano correcto y un pico en E/(kBT) = 3,92069.
- `hawking/index.html` y `vite.config.ts`: cuarta entrada estática. Cada laboratorio conserva estilos y estado independientes. El portal sigue sin importar Three.js.

El agujero negro es de Schwarzschild, sin carga ni rotación, y las magnitudes corresponden a un observador lejano. La temperatura y la entropía siguen las expresiones semiclásicas; potencia y vida usan **solo fotones, cuerpo negro ideal con área del horizonte**. No se implementan factores de cuerpo gris, otras especies, acreción real, expansión cosmológica, rotación ni el final cuántico de la evaporación. La aproximación puede diferir considerablemente de una potencia/vida total real, especialmente en masas pequeñas. El motor conserva el dominio didáctico inicial 10⁹–10⁴⁰ kg y sus pruebas; la interfaz ya no hace recorrer 31 órdenes de magnitud en una sola barra.

En vacío se usa la solución analítica `M/M₀ = cbrt(1 − t/τ₀)`, evitando integrar errores acumulados y potencias intermedias enormes. La evolución se detiene a 0,95τ₀, con explicación visible. La masa restante puede quedar por debajo del mínimo de masa inicial del control: sigue siendo un resultado válido. Al cambiar masa inicial se reinicia el tiempo.

El entorno usa el balance instantáneo ideal `Pneta = Aσ(T⁴ − Tentorno⁴)`. Activarlo reinicia el tiempo y desactiva tanto el reloj como su slider. Nunca se aplica allí la solución analítica aislada. Signo positivo: pierde masa; negativo: gana masa. No se integra una evolución con baño térmico.

## Qué significa el visor

El horizonte es un disco esquemático. Su radio varía linealmente respecto a la referencia punteada fija entre ×0,22 y ×2,2. Fuera de ese intervalo se comprime el dibujo y aparece una indicación explícita; los valores y curvas conservan sus magnitudes reales. En una comparación M → 2M el horizonte duplica su radio sin cambiar la escala de cámara. La circunferencia de referencia también se ve sobre el interior oscuro, identificada como comparación y no como otro horizonte.

La navegación del visor es independiente del modelo físico: acercamiento ×1–×2,4, desplazamiento acotado y botón «Ir al horizonte» que enfoca el borde, además de «Vista general». Arrastre con ratón y flechas; en celular, el arrastre horizontal permite desplazar y el vertical conserva el desplazamiento de la página. El acercamiento puede recortar parte del disco deliberadamente. No representa la caída de un observador, una órbita ni un cambio de masa. El horizonte y la referencia comparten la misma transformación, por lo que sus tamaños relativos se conservan.

`SceneExplorer.tsx` ofrece seis explicaciones: horizonte, interior, energía emitida, energía absorbida, referencia y fondo. Se abren al señalar, enfocar o tocar; un toque las fija y ×/Escape las cierra. Los botones de elementos también permiten acceder sin apuntar a un marcador móvil. Las ayudas muestran datos actuales y proponen una comparación. El fondo estelar ilustrativo se diferencia explícitamente del baño cósmico térmico. `exploration.ts` comparte las semillas y posiciones de los marcadores con el shader: la detección usa la misma fase y transformación que lo dibujado, incluido zoom y desplazamiento. No usa zonas fijas desconectadas de las partículas.

El borde y los marcadores dorados no representan color térmico visible, disco de acreción, una foto ni trayectorias físicas de fotones. Desde la revisión didáctica del 21/10/2026, el brillo y la velocidad de los marcadores responden a la potencia relativa: `clamp(0,45 + 0,15 log₂(P/P_ref), 0,04, 1)`. La señal está amplificada y acotada para mostrar cambios; no codifica una velocidad física ni una tasa literal de fotones. La emisión usa la potencia emitida y el azul la absorbida, respecto de la emisión de referencia. La trama no integra geodésicas ni lente gravitatoria. Las medidas y gráficos mantienen los valores físicos sin esa compresión.

## Revisión didáctica del 21/10/2026

- `impact.ts` deriva relaciones, causas y señales visuales desde las mismas lecturas físicas. Identifica cambios combinados para evitar atribuciones a una sola variable. Explorar otra masa sin combinar controles ya no presenta una advertencia de comparación incorrecta.
- `LiveImpact.tsx`, junto al visor: cuatro factores relativos con barras de referencia/actual en escala común por magnitud, explicación causal y balance emisión/absorción con escala común de potencia. No renormaliza cada barra por separado. Los factores conservan rangos extremos mediante notación científica.
- Masa ÷2/×2 para explorar cambios medidos dentro del enorme rango logarítmico; feedback de temperatura/potencia junto al control, balance junto al entorno y masa restante/temperatura/potencia junto al reloj. Cambiar masa reinicia el tiempo, como antes.
- `EntropyExplorer.tsx`: fórmula Bekenstein–Hawking con seis símbolos explorables y explicación del coeficiente 1/4. Diferencia ℏ y la incertidumbre de Heisenberg del nombre de la relación de entropía. Dos cuadrados representan áreas de horizontes desplegados: el lado cambia con la raíz del factor de entropía. El dibujo se limita como el horizonte y avisa cuando se comprime. La cuadrícula no afirma celdas microscópicas observadas. El botón prepara explícitamente el reto de 10¹² kg en vacío; no duplica silenciosamente cualquier configuración existente.
- El espectro explica el cambio de energía del máximo y distingue altura de potencia de número de fotones. Conserva ejes compartidos.

Seis pruebas adicionales en `tests/hawking-impact.test.mjs` verifican respuestas opuestas térmicas/geométricas, escalado cuadrático de áreas, causalidad del baño y del reloj, comparaciones combinadas y señales finitas/acotadas en el rango completo. La suite completa pasa 87 pruebas y las diez comprobaciones científicas independientes. La propuesta de futuros módulos está en [SERIE_AGUJEROS_NEGROS.md](SERIE_AGUJEROS_NEGROS.md).

La revisión posterior de navegación y masa agrega cuatro pruebas en `tests/hawking-exploration.test.mjs`: límites de masa tras operaciones repetidas en ambas escalas; detección del horizonte al acercar/desplazar en varios formatos; coincidencia de marcadores dorados/azules con sus zonas de información; y distinción entre interior, horizonte, referencia y fondo. La suite pasa ahora 91 pruebas. Las ayudas de controles explican la diferencia masa/zoom, el fondo cósmico, τ₀ y la masa restante, y cada reto incluye «¿Qué mirar?». Las ayudas de magnitudes también explican unidades y conexiones físicas, además de las fórmulas.

## Interacción y rendimiento

Controles de al menos 44 px de alto, rangos etiquetados, predicciones con estado seleccionado, navegación por anclas y tarjetas apiladas en celular. Los tooltips abren por hover, foco o toque y cierran al salir, perder foco o pulsar Escape. El gráfico usa menos marcas y una disposición de ejes propia en pantallas pequeñas. No hay desplazamiento horizontal intencional.

El reloj usa `requestAnimationFrame`, actualiza el modelo aproximadamente 12 veces por segundo y limita saltos largos a 0,25 s. Al ocultar la página no acumula tiempo; al volver toma un nuevo punto de partida. Pausa del reloj y pausa visual son controles distintos: la primera detiene la evolución física, la segunda los marcadores ilustrativos. El visor deja de renderizar continuamente al pausarlo, al ocultar la pestaña o con preferencia de movimiento reducido. Los cambios de controles siguen repintando la imagen. DPR limitado a 1,5 y contexto de bajo consumo. Un fallo de creación de WebGL tiene una vista alternativa; cálculos, gráficos y retos permanecen fuera del canvas.

## Validación

`tests/hawking.test.mjs` contrasta la implementación con el JSON de referencia calculado por el programa de investigación independiente; verifica escalas, primera ley, Stefan–Boltzmann, conservación de energía por integración independiente, normalización y máximo espectral, signos del baño térmico, entradas inválidas, referencias inmutables, controles manuales, comparaciones confundidas, pausa y límites del reloj. Las diez verificaciones originales siguen en `npm run research:hawking`.

Inspección de navegador: escritorio y anchos de 768, 390 y 320 px, cuatro retos, predicciones y progreso, controles de masa y entorno, extremos del rango, avance/pausa, límite del 95 %, gráfico y tooltips. La revisión de tableta corrigió un pequeño solapamiento entre el botón de restaurar y el enlace a los retos, conservando áreas de toque de 44 px. Esto comprueba tamaños de viewport y funcionamiento en el navegador disponible; no equivale a una prueba en dispositivos físicos iOS/Android ni a medir autonomía o FPS allí. La vista alternativa y las preferencias de accesibilidad requieren comprobaciones adicionales en esos dispositivos.
