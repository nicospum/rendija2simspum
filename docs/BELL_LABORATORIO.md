# Bell: ¿respuestas escritas?

Laboratorio independiente 19 de SPUM, `/bell/`. Extiende el recorrido de información cuántica con las desigualdades de Bell en la forma CHSH. Está enlazado desde Maldacena como ampliación de Entrelazados; no altera los tres laboratorios ni los veinte retos de ese pasaporte.

## Del gesto a una idea

El recorrido distingue tres niveles que suelen confundirse: una detección local ±1, la correlación E de una combinación y la suma S de cuatro correlaciones. El jugador primero compara parejas; después intenta superar el límite con respuestas locales escritas y finalmente contrasta esa construcción con la predicción cuántica.

Tres vistas comparten el montaje y los registros:

- **Experimento:** dos analizadores giratorios, fuente tocable y dos salidas por lado. Arrastrar el punto o usar flechas cambia una orientación. A₀B₀, A₀B₁, A₁B₀ y A₁B₁ eligen una de las cuatro combinaciones; sólo una orientación de cada lado se usa por pareja. Los destellos muestran un resultado realmente incluido en los conteos. Los trazos son un esquema óptico, sin polarizaciones individuales predeterminadas, mensajes entre detectores ni tiempos de propagación simulados.
- **Tarjetas locales:** cuatro casillas ±1 se editan directamente. Los cuatro productos y la cancelación algebraica responden al cambio. Intentar superar el límite permite ver de dónde sale, en lugar de recibirlo como una regla arbitraria. Una tarjeta y su inversa global pueden mezclarse al 50 %: conservan los productos y hacen aleatorias ambas listas locales.
- **Suma CHSH:** las cuatro contribuciones son botones que llevan a examinar sus analizadores. Se distingue E₁₁ negativa de la contribución −E₁₁ positiva. El eje muestra S con signo, de −4 a 4; la banda central es el límite de medias locales. La marca verde es la predicción exacta y la blanca con su cota corresponde al ensayo muestreado. Medir 50 o 1000 pares por combinación modifica esa cota junto al visor.

El reto 3 abre la vista de suma y pliega la exploración de un solo par para acercar los mandos pertinentes. Los ensayos guardados de ambos tamaños se conservan con sus filas y se identifican por los ángulos usados; no se reinterpretan como datos del montaje actual al girar otro analizador. La consola compartida mantiene pregunta, pasos y controles próximos a la escena. En celular horizontal se distribuyen escena y pregunta lado a lado.

La revisión de uso posterior acerca los datos a la acción: el visor de Experimento muestra N medido, el último par, porcentaje de iguales, E observado y la frecuencia de A+, separados de la predicción. Los atajos B y «Medir 200 pares» están en esa misma franja. La leyenda define estaciones, orientaciones y salidas; la tabla explica el orden A/B de los signos. Los textos redundantes se compactan en celular para conservar espacio para la pregunta. Los botones CHSH dicen «4 × 50 pares» y «4 × 1000 pares», con los totales de 200 y 4000 explícitos.

## Cuatro retos

| ID | Observaciones necesarias | Conclusión |
|---|---|---|
| `bell/principal/reto-01` | Con A₀=0°, reunir al menos 200 pares en A₀B₀ con B₀=0° y otros con B₀=45°. | E pasa de +1 a 0 en el modelo, mientras ambas marginales siguen en 50 %. Correlación y azar local son magnitudes distintas. |
| `bell/principal/reto-02` | Guardar una tarjeta con S=+2 y otra con S=−2. | En A₀(B₀+B₁)+A₁(B₀−B₁), uno de los paréntesis es cero y el otro ±2. Cualquier mezcla independiente de los ajustes mantiene la media entre −2 y 2. |
| `bell/principal/reto-03` | Dos ensayos completos con ángulos de Bell: 50 y 1000 pares nuevos por cada combinación. | Predicción exacta 2√2, frecuencias fluctuantes y cotas para lotes prefijados. Más datos no cambian la ley del modelo. |
| `bell/principal/reto-04` | Con A₀=0°, reunir al menos 200 pares con B₀=0° y otros con B₀=90°. | Coincidir frente a diferir no permite que A lea un mensaje de B: su distribución local sigue siendo 50/50. Las correlaciones requieren reunir las listas. |

Se requiere observación y explicación correcta, no una cifra afortunada. Un ensayo con S estimada mayor que 2 **no aprueba por sí solo** ningún reto. Predicciones erróneas e incompletas reciben devoluciones distintas. Reiniciar borra observaciones y verificación del intento; los hallazgos de esta visita no sustituyen una observación nueva. No se persiste este progreso entre recargas.

Cada una de las ocho opciones incorrectas tiene una devolución propia sobre el error conceptual. Los pasos faltantes se mantienen visibles en la consola. Al cambiar o reiniciar el reto, el foco vuelve a su selector si está abierto; no se pierde el recorrido de teclado. Guardar tarjetas pertenece al reto 2; desde otras vistas se ofrece ir a ese reto, sin anunciar un registro inexistente. Invertir las cuatro respuestas se rotula como una transformación que conserva S.

## Modelo cuántico

Se representa el estado puro de polarización Φ⁺=(|HH⟩+|VV⟩)/√2, con medidas lineales proyectivas ideales y dos salidas ±1 por analizador. Todos los pares se detectan; no hay pérdidas, selección de coincidencias, ruido de fondo ni ventanas temporales. Los ángulos son grados y el rango de los mandos es −90°…90°. + y − no son cargas eléctricas.

Para orientaciones a y b:

```
P(++ ) = P(−−) = ½ cos²(a−b)
P(+−) = P(−+) = ½ sin²(a−b)
P(A+) = P(B+) = ½
E(a,b) = ⟨AB⟩ = cos[2(a−b)] = 2P(iguales) − 1
E estimada = (iguales − distintos) / N
S = E(a₀,b₀) + E(a₀,b₁) + E(a₁,b₀) − E(a₁,b₁)
```

Con (a₀,a₁,b₀,b₁)=(0°,45°,22,5°,−22,5°), las tres primeras E son +1/√2 y la cuarta −1/√2, por lo que S=2√2≈2,828. E=0,707 no significa 70,7 % de coincidencias: corresponde a aproximadamente 85,36 %. No se confunde este convenio Φ⁺/polarización con el signo o factor angular de un singlete de espín.

El cálculo usa distribuciones conjuntas de Born. El hecho de que el ordenador calcule ambas salidas conjuntamente no propone un mecanismo local oculto ni una comunicación física entre aparatos. La simulación permite estudiar predicciones; no constituye un experimento real que descarte teorías.

## Modelo local y alcance del límite

Las dieciséis estrategias deterministas asignan A₀,A₁,B₀,B₁∈{−1,+1} antes de elegir las preguntas. Cada estrategia satisface S=±2 por la cancelación anterior. Las correlaciones de una mezcla convexa, con pesos independientes de los ajustes, cumplen |S|≤2. La localidad permite depender del ajuste propio y de información compartida en el origen, sin consultar el ajuste remoto. La independencia de ajustes también es una hipótesis explícita.

Las tarjetas contestan cuatro preguntas etiquetadas; no implementan la ley de Malus de un polarizador clásico para todos los ángulos. Sus diales no se muestran en esa vista. Complementar los cuatro signos deja iguales los productos, de modo que el azar local 50/50 tampoco distingue por sí solo el modelo de la fuente cuántica.

El límite es de **correlaciones medias**. Una estimación finita de una mezcla local general puede fluctuar por encima de 2. El tablero de una tarjeta y su complemento es un caso particular con productos fijos, y se presenta como prueba algebraica. No se promete que todo conjunto de conteos locales finitos permanezca dentro de la banda.

## Datos y cotas

La exploración de un par está separada del ensayo CHSH. Emitir de a uno agrega detecciones hasta 4096; «Lote nuevo · 200 pares» reemplaza esa colección. Sus conteos no se incorporan a S. N=0 se muestra como «sin datos», no como una correlación cero.

Los atajos «B a…» preparan A₀B₀, restauran A₀=0° y eligen el valor de B₀ indicado; se declara junto a esos botones. Para variar sólo un ángulo sin ese preparado se usan el dial o su rango.

Repetir exactamente la orientación, combinación activa o preparado actual no borra las mediciones. Cambiar el montaje sí las invalida; preparar A₀B₀ cuando se estaba mirando otra combinación también selecciona esa combinación y limpia la colección activa. Reiniciar un reto continúa siendo una acción explícita independiente.

Cada botón CHSH genera cuatro lotes **nuevos y de tamaño prefijado**, 50 o 1000 por combinación, todos con la misma instantánea de orientaciones. Girar cualquier orientación limpia la colección y tabla activas, evitando sumar filas de montajes incompatibles. Los registros requeridos conservan sus instantáneas y valores reales. Cambiar sólo la combinación mostrada no altera el ensayo completo ya registrado.

El muestreo usa un PRNG Mulberry32 con semilla transportada por la acción del reducer. Esto permite repetir los cálculos y mantiene puro el reducer bajo StrictMode. No es un generador de aleatoriedad física o criptográfica.

Para α=0,05, a cada media de variables en [−1,1] se aplica radio εᵢ=√[2 ln(8/α)/nᵢ]. La cota de unión da cobertura simultánea de al menos 95 % bajo el modelo de muestreo independiente; se recortan los intervalos de E a [−1,1] y se suman extremos con los signos correctos, incluido el negativo de E₁₁. El intervalo de S se recorta a [−4,4]. Son cotas conservadoras, no un p-valor, ni una probabilidad de que una interpretación de la naturaleza sea verdadera.

Volver a medir reemplaza el ensayo; seleccionar el que parezca favorable no conserva la cobertura declarada para esa selección. Los retos no condicionan la aprobación al signo de una fluctuación, a superar 2 ni a excluirlo de la cota. Los ensayos reales modernos requieren además controlar detección, separación espacial, selección de ajustes y análisis estadístico; no se atribuyen esas garantías a esta aplicación ideal.

## Fuentes y revisión

La [revisión científica independiente](../research/bell/REVISION_CIENTIFICA.md) y [fuentes.json](../research/bell/fuentes.json) conservan alcance leído, convenciones y limitaciones de cinco fuentes primarias: Bell 1964, CHSH 1969, su errata de 1970, Shalm y colaboradores 2015 y Hoeffding 1963. La errata consultada añade un agradecimiento de financiación; no cambia la desigualdad. Las páginas Nobel devolvieron acceso denegado y no se presentan como documentación leída.

[Estado científico y hashes](../research/bell/estado-cientifico.json). [QA de producto y capturas](QA_BELL_2026-11-02.md). Los revisores son diferentes de la implementación; son revisiones internas documentadas, no certificaciones externas ni estudios con estudiantes.

[Seguimiento de uso y correcciones](QA_BELL_SEGUIMIENTO_2026-11-02.md): conserva los problemas reproducidos sobre el primer despliegue y la repetición del candidato corregido. Ninguna aprobación anterior se extiende automáticamente a archivos modificados.

Las 30 pruebas de `tests/bell.test.mjs` contrastan Born mediante vectores independientes en 169 parejas de ángulos, enumeran las 16 tarjetas, prueban marginales, complementos, mezclas, periodicidad, muestreo, límites de conteos, cotas y cuatro evaluadores con aciertos, errores y observaciones incompletas. También verifican limpieza de datos activos, conservación de ambas referencias reales, acciones idénticas sin pérdida de datos, las ocho devoluciones y los conteos reales de las referencias. Se suman a las 419 anteriores: 449 pruebas en la suite.

Los tamaños de celular se emulan en Chromium. Safari, dispositivos físicos, lectores de pantalla completos y eficacia de aprendizaje con participantes siguen pendientes conforme al acuerdo con el usuario. La comprobación de publicación distingue build local, commit desplegado, coincidencia de assets públicos y una muestra de uso en el dominio.

## Integración y ejecución

`src/bell/physics.ts` contiene el modelo; `learning.ts`, los cuatro recorridos y su estado; `Scene.tsx`, analizadores, tarjetas y suma; `App.tsx`, su conexión con controles y notas. Se reutilizan la consola, navegación, ayuda y estilos del especial Maldacena sin cambiar los otros modelos. No se añaden dependencias ni servicios.

El catálogo queda en 19 laboratorios y 26 entradas HTML. Contando las preguntas auxiliares existentes, son 89 retos/preguntas: la auditoría histórica de 17/81 permanece congelada en su commit, Eratóstenes añade cuatro y Bell otros cuatro con revisiones separadas. Ningún dictamen histórico se extiende automáticamente a este laboratorio.

```sh
npm ci
npm test
npm run lint
npm run build
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 1027 --strictPort
```

Abrir `/bell/`. El laboratorio funciona enteramente en el cliente, sin claves, cuentas ni backend.
