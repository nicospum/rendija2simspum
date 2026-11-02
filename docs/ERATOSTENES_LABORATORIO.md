# Dos sombras, una Tierra

Laboratorio independiente número 18 de SPUM, ruta `/eratostenes/`. Geometría y astronomía: reconstruir una circunferencia a partir de una distancia superficial y dos sombras. No se incorpora a un especial de relatividad o información cuántica.

## Experiencia

La vista **El planeta** permite arrastrar un sitio sobre el borde de una sección meridiana. Un selector elige A o B; los rayos solares permanecen paralelos y las verticales siguen las normales locales. La cinta virtual muestra la distancia por el arco, no por una cuerda interior. La vista **Las sombras** acerca cada palo: arrastrar la punta cambia la altura de ambos y sus sombras se recalculan. Las dos lupas comparten escala; en celular se alternan A/B para conservar la lectura. Hay rangos y teclado como alternativa a los gestos.

Las lecturas actuales de distancia, ángulo y altura permanecen junto al dibujo. **Medir y guardar** crea una observación con sus condiciones y calcula C por proporción. El resultado se identifica como última medición guardada, no lectura en vivo. Las dos observaciones requeridas se conservan aunque después se registre otra configuración; sólo la exploración extra se reemplaza. **Volver al montaje del reto** restaura condiciones sin borrar el cuaderno. **Reiniciar** limpia el intento; cambiar de reto prepara otro montaje. Los cuatro hallazgos se conservan durante la visita, no entre recargas.

Se reutilizan `SceneConsole`, `LabMission`, `LabNavigation`, `MoreLabs`, `useSvgScrub` y el inspector de ayuda. Sólo los tiradores capturan el gesto: el resto de la escena permite desplazar la página. No hay animación prefabricada, nuevo motor ni dependencia añadida; SVG representa la geometría calculada en cada cambio y mantiene los controles semánticos en DOM.

## Cuatro retos y condiciones

| ID | Acción y observaciones requeridas | Qué debe entenderse |
|---|---|---|
| `eratostenes/principal/reto-01` | Registrar sitios coincidentes y separados aproximadamente 800 km. | Rayos paralelos, verticales locales distintas. Con Δθ=0 no se infiere un tamaño finito. |
| `eratostenes/principal/reto-02` | Registrar bases de aproximadamente 800 y 1600 km. | Se duplican distancia y ángulo; la proporción devuelve el mismo tamaño. |
| `eratostenes/principal/reto-03` | A unos 800 km, registrar palos de 1 y 2 m. | Sombra y altura se duplican juntas; razón, ángulo y tamaño se conservan. |
| `eratostenes/principal/reto-04` | Registrar bases de aproximadamente 400 y 800 km con margen angular ±0,2°. | Una base mayor acota mejor C con el mismo margen angular. |

Cada reto exige una predicción correcta **y las dos observaciones registradas**. Mover un control sin medir no basta. Los estados incompletos y explicaciones equivocadas reciben devoluciones distintas; la persona puede corregir su predicción. El objetivo de distancia admite ±6 km para el arrastre, mientras que el sitio coincidente exige distancia prácticamente nula. En el contraste se mantienen A y declinación en 23,44°, y la altura/margen que indique la consigna; una configuración adicional se guarda como exploración y explica cómo recuperar el montaje. La marca histórica de hallazgo no aprueba un intento nuevo.

## Modelo y ecuaciones

Mundo esférico didáctico, circunferencia elegida de 40.000 km y radio R=C/(2π). No es una medida nueva de la Tierra real ni un elipsoide geodésico. Las sombras generan los ángulos usados en el cálculo; no se devuelve simplemente la constante del mundo como respuesta.

- Unidades: latitud/declinación/ángulos en grados; h y sombras en metros; distancia superficial y C en kilómetros.
- Mediodía solar común en el mismo meridiano; Sol lejano, rayos paralelos, suelo local ideal y palos radiales. Mediodía solar no significa necesariamente 12:00 civil.
- Ángulo cenital firmado q=φ−δ; sombra firmada s=h·tan(q), positiva al norte.
- Recuperación q=atan2(s,h); Δθ=|qB−qA|. Si las sombras apuntan a lados opuestos, sus magnitudes angulares se suman; no se resta su valor absoluto.
- Distancia de arco d=R·|Δφ| en radianes; inferencia C=360°·d/Δθ en grados. La cinta del modelo provee d; en una práctica real debe conocerse por otra medición.
- Para margen acotado ε sobre la diferencia angular, C queda entre 360d/(Δθ+ε) y 360d/(Δθ−ε). Si Δθ≤ε no hay cota superior finita. Se supone d exacta: no es un intervalo de confianza estadístico.

Dominio: latitudes −35…55°, declinación −23,44…23,44°, palos 0,5…3 m y margen 0…0,5°. Mantiene el Sol sobre el horizonte y evita sombras divergentes. Entradas no finitas o fuera del dominio se rechazan. Sitios coincidentes no producen una estimación. No se incluyen refracción atmosférica, relieve, disco solar, inclinación del palo ni errores de distancia. Palos del globo aumentados; escala de lupas ajustable en común. Las lecturas se redondean, pero los cálculos usan valores completos.

## Historia y fuentes

Eratóstenes estimó la circunferencia en el siglo III a. C. La esfericidad ya tenía argumentos previos: su método usa esa geometría, no se presenta como primera prueba de una Tierra redonda. La unidad del estadio y el relato transmitido por fuentes posteriores impiden atribuir un porcentaje de precisión histórico definitivo. 800 km / 7,2° → 40.000 km es el ejemplo didáctico redondeado de esta aplicación.

La [revisión científica independiente](../research/eratostenes/REVISION_CIENTIFICA.md) conserva ecuaciones, casos y límites; [fuentes.json](../research/eratostenes/fuentes.json) distingue alcance leído de cada referencia. Se usaron NOAA para posición solar/geodesia, antecedentes de NASA/GSFC, historia especializada y la repetición educativa de ESA.

## Validación y alcance

- 18 pruebas nuevas independientes en `tests/eratostenes.test.mjs`: proyección vectorial sobre el suelo tangente, ecuación cenital NOAA, arco central, 180 configuraciones/360 sombras, signos, escalas, cotas, entradas inválidas y cuatro evaluadores con casos correctos, incorrectos e incompletos. Comprueban además conservación de registros, reinicio y ausencia de aprobación por logros previos.
- QA científico y producto son revisores diferentes de la implementación. [Dictamen y hashes científicos](../research/eratostenes/estado-cientifico.json); [pruebas de uso, capturas y límites móviles](QA_ERATOSTENES_2026-11-02.md).
- Suite del proyecto con el nuevo laboratorio: 419 pruebas aprobadas. Lint y compilación aprobados después de las correcciones de QA, con 25 entradas HTML. El pase de producto registra 39 casos de uso y tamaños, incluyendo las repeticiones de los defectos corregidos.
- La auditoría previa de 17 laboratorios/81 preguntas se conserva como snapshot de `2f812e4`: no se le atribuye retrospectivamente cobertura de este laboratorio. Su generador usa ese commit explícito. Este capítulo añade cuatro retos, dejando el catálogo en 18 laboratorios y 85 retos/preguntas contando auxiliares; el build tiene 25 entradas HTML.
- Los tamaños de celular son emulados en Chromium. Safari, gestos en teléfonos físicos y un estudio de comprensión con participantes siguen pendientes; QA de agentes no equivale a certificación externa.

## Ejecutar

```sh
npm ci
npm test
npm run lint
npm run build
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 1027 --strictPort
```

Abrir `/eratostenes/`. No necesita claves, backend, texturas descargadas ni servicios externos para ejecutar el laboratorio.
