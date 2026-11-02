# Paradoja de la información y curva de Page: modelo calculado

## Qué representa

El laboratorio usa un estado cuántico complejo puro de **4 a 8 qubits**, generado de forma reproducible a partir de una semilla. Se toma un vector de amplitudes gaussianas complejas independientes y se normaliza: es el procedimiento de muestreo de estados puros de Haar, implementado con números pseudoaleatorios y precisión finita.

Al mover el contador `k`, los primeros `k` qubits forman la colección **R** y los `N−k` restantes forman **B**. El estado conjunto se mantiene fijo; cambia qué subsistema se considera «radiación». La dimensión del espacio total permanece `2^N`; las de las partes son `2^k` y `2^(N−k)`. Los qubits que pasan a R son los bits más significativos de los índices de la base computacional.

**No se simula una dinámica de evaporación, un horizonte geométrico ni la teoría de gravedad cuántica.** Repartir un estado puro aleatorio entre dos subsistemas permite estudiar la lógica informacional del argumento de Page. El eje horizontal cuenta qubits repartidos, no segundos, masa ni energía de un agujero negro real. El máximo cercano a la mitad del reparto no es una predicción del tiempo de Page físico. Para N impar la media tiene dos puntos centrales iguales; una realización concreta no necesita tener simetría especular.

## Qué calculamos

El estado puro global tiene entropía de von Neumann cero. Cada parte puede tener entropía positiva:

`ρR = TrB |ψ⟩⟨ψ|`, `S(R) = −Tr(ρR log₂ρR)`.

La implementación traza la parte complementaria y diagonaliza la matriz reducida. Se aprovecha la igualdad de los autovalores de Schmidt no nulos para calcular con la parte más pequeña, de dimensión máxima 16. Esto conserva `S(R)=S(B)` para el mismo reparto puro y evita matrices grandes en celular. Las matrices hermíticas complejas se convierten en una matriz simétrica real de bloques `[[Reρ,−Imρ],[Imρ,Reρ]]`; sus autovalores aparecen duplicados y se emparejan antes de normalizar la traza y calcular la entropía. La diagonalización usa Jacobi cíclico con tolerancia; no requiere bibliotecas nuevas. Se valida convergencia, normalización y positividad numérica.

Las curvas muestran cantidades diferentes:

- **Estado calculado:** entropía reducida de ese estado y ese reparto. Se vuelve a calcular cada punto; no se carga una curva dibujada.
- **Media de Page:** expectativa del conjunto de estados puros complejos de Haar. Para `m≤n`, la fórmula en bits es `⟨S⟩ = [Σ(j=n+1…mn) 1/j − (m−1)/(2n)]/ln2`. Aquí `m=2^min(k,N−k)` y `n=2^max(k,N−k)`. Page la propuso en 1993; las demostraciones posteriores establecieron la expresión. La media no tiene por qué coincidir con cada semilla individual.
- **Cota de dimensión:** `min(k,N−k)` bits, la capacidad máxima del menor espacio de Hilbert. No es una entropía de Bekenstein–Hawking calculada a partir de masa o área.
- **Hipótesis de emisión independiente maximamente mezclada:** `k` bits para R. Es un contraste informacional deliberado: al final puede quedar una entropía positiva de la radiación si se descartan correlaciones. No se presenta como la entropía térmica de fotones `Srad=(4/3)(S0−SBH)` del laboratorio de Hawking, ni como una cuenta que comparta el mismo estado puro calculado.

## Partes individuales frente a colección

También se calculan estados reducidos de cada qubit emitido y sus entropías `S(Ri)`. La cantidad `Σi S(Ri) − S(R)` mide la **correlación total** de la colección; puede incluir contribuciones clásicas y cuánticas y no se etiqueta íntegramente como entrelazamiento.

Cuando todos los qubits están en R, `S(R)=0` para el estado global puro, aunque cada qubit tomado por separado pueda tener entropía cercana a un bit. Esta diferencia ayuda a entender por qué leer solo partes o sumar incertidumbres locales no equivale a conocer el estado conjunto. El dibujo no implementa un decodificador, no reconstruye un mensaje del interior y no demuestra cómo se recupera información de un agujero negro astrofísico.

## Verificación numérica

`tests/maldacena-page-physics.test.mjs` cubre:

- Normalización compleja, reproducibilidad y cambio de semilla.
- Producto con fase local compleja: omitir las coherencias imaginarias daría una entropía falsa.
- Espectro de Schmidt conocido y entropía binaria independiente.
- Dos pares de Bell cruzados y GHZ: estados diferentes producen curvas diferentes y GHZ no sigue el triángulo de la cota.
- Pureza por autovalores frente a una traza parcial independiente de la matriz completa de R, tanto cuando R es la parte pequeña como cuando es la grande.
- Cotas, pureza de los extremos, correlación total no negativa y entropía de cada parte.
- Fórmula armónica de Page y media numérica de 192 semillas fijas; es una comprobación de consistencia del muestreo, no una demostración del teorema por simulación.
- Rechazo explícito de estados manuales no normalizados o inválidos.

## Fuentes primarias

- [Hawking, 1976 · Breakdown of predictability in gravitational collapse](https://doi.org/10.1103/PhysRevD.14.2460): planteo histórico de evolución de estado puro a mezcla en el argumento de evaporación.
- [Page, 1993 · Average Entropy of a Subsystem](https://arxiv.org/abs/gr-qc/9305007): media de entropía de un subsistema de un estado puro aleatorio.
- [Page, 1993 · Information in Black Hole Radiation](https://arxiv.org/abs/hep-th/9306083): argumento de información en la radiación si formación y evaporación se describen unitariamente.
- [Foong y Kanno, 1994 · Proof of Page’s conjecture on the average entropy of a subsystem](https://doi.org/10.1103/PhysRevLett.72.1148).
- [Siddhartha Sen, 1996 · Average Entropy of a Subsystem](https://arxiv.org/abs/hep-th/9601132): demostración de la fórmula media.

Este modelo se suma a los anteriores como una experiencia de información cuántica finita. No sustituye los cálculos gravitatorios de islas, ni prueba por sí mismo AdS/CFT, unitariedad de la evaporación física o solución completa de la paradoja de la información.
