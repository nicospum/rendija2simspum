# QA de producto y aprendizaje · Einstein

Revisión interna documentada por el agente `retos_einstein`, independiente de implementación. Candidato inicial: HEAD `e2e07a7`, servido en `http://127.0.0.1:1027`. Se abrió primero el sitio público, pero se usó el origen local para tener intentos sin huellas históricas. Sólo se manipula la interfaz mediante CUA; no se escribe almacenamiento ni se llama a reducers desde el navegador.

## Estado del pase

| Laboratorio | Retos con correcto/incorrecto/incompleto y negativo de observación | Estado |
|---|---:|---|
| El reloj de luz | 4/4 | APROBADO producto; nombres corregidos y retesteados |
| El tren de Einstein | 4/4 | APROBADO producto |
| Nos vemos a la vuelta | 4/4 | APROBADO producto; nombres corregidos y retesteados |
| El ascensor de Einstein | 4/4 | APROBADO producto |
| El tiempo tiene altura | 4/4 | APROBADO producto |
| La órbita que no se cierra | 4/4 | APROBADO producto |
| Efecto fotoeléctrico | 4/4 | APROBADO producto |

Base de los **28/28 retos**: Chrome con viewport 390×844. Se repitió Reloj3 en 320×740, Gemelos3 en 667×375 y los cuatro retos fotoeléctricos en 1280×900. En escritorio se probó además reproducción/pausa y presencia de las dos vistas de los siete laboratorios, sin desbordamiento horizontal. Los IDs se corresponden con `${ruta}/principal/reto-01…04` del inventario común; en el JSON los índices visibles son 1–4.

El candidato final de este pase es `e2e07a7` más los cambios locales revisados de `LabJourney.tsx`/prop `saved`, las nueve Apps consumidoras, las consignas de Reloj/Gemelos y `SceneChallenge.css`. El coordinador debe vincular este dictamen al commit integrado y a la aprobación científica separada. No se declara aprobación de una versión pública todavía sin publicar.

## Evidencia persistente

Los eventos y lecturas DOM se guardan después de cada caso en `../qa-integral-retos-2026-11-02/einstein-product-results.json`, fuera del checkout publicable. Cada registro contiene ruta, viewport, pregunta, predicción, siguiente paso, habilitación y feedback de evaluación. Las capturas representativas se guardan en esa misma carpeta. Una captura no sustituye los intentos registrados.

Se conservaron **177 registros** de estados e intentos. `einstein-product-manifest.json` vincula cada uno de los 28 retos con sus etiquetas de evidencia. `einstein-playback-desktop.json` documenta los estados de reproducción/pausa y disposición; los cuadernos tienen `einstein-widget-results.json` y `einstein-field-reset.json`. Algunas capturas tomadas inmediatamente después de una acción corresponden al frame anterior de la emulación; no se usan para acreditar una respuesta exitosa. Las capturas `*-final.jpg` se tomaron en un llamado posterior, con el estado estabilizado, y la evaluación se acredita con los registros DOM de cada intento.

## Casos ejecutados

- **Reloj 1:** predicción sin observar bloqueada; medio tic no satisface tic completo; respuesta incorrecta y correcta; reinicio limpia predicción y observación.
- **Reloj 2:** un solo tic a 0,6 c no satisface la comparación; completar también a 0,8 c permite comprobar, pero sólo la explicación correcta da éxito.
- **Reloj 3:** un reloj seguido no satisface ambos; cambiar a Estación y completar permite responder. No se reutilizan marcas del reto previo.
- **Reloj 4:** tic a 0,8 c y ritmo 60% no satisface 49,5–50,5%; preset ≈0,866 c y tic completo sí. Respuesta 0,5 c rechazada.
- **Tren 1:** instante del encuentro no basta; todas las llegadas habilita comprobación. Simultaneidad universal rechazada y B anterior aceptado.
- **Tren 2:** sólo pasajero central deja el paso hacia B pendiente; ambas llegadas habilitan comprobación; se distingue recibir de emitir.
- **Tren 3:** sólo velocidad positiva deja negativa pendiente; repetir a −0,6 c habilita; la inversión causal incorrecta no se acepta.
- **Tren 4:** todas las llegadas sin medir no basta. Un protocolo deja el otro pendiente. Medir el segundo con 0,81 c no satisface el ensayo requerido; restaurar 0,8 c y registrar ambos sí. 500 m rechazado, 180 m aceptado. Reinicio limpia el intento.
- **Gemelos 1:** giro no equivale a reencuentro; incorrecta 10 años rechazada y 6 aceptada.
- **Gemelos 2:** sólo ensayo a 0,6 c no satisface comparación; ambos tramos a 0,8 c y reencuentro habilitan. Respuesta invertida rechazada.
- **Gemelos 3:** antes/después del giro requieren ambas observaciones; al cambiar de reto y volver no conserva esas marcas. Controles inline permiten el mismo ensayo sin perder el visor. El salto físico de edades se rechaza.
- **Gemelos 4:** cambiar el plan de espera no completa el viaje; es necesario volver al reencuentro. La comparación 6 frente a 6,8 años y ambas evaluaciones funcionan.
- **Ascensor 1:** sólo sostenido no basta; nave acelerada y resultado final habilitan. Respuesta de equivalencia local aceptada; planeta imprescindible rechazada.
- **Ascensor 2:** sostenido/caída aún deja deriva pendiente; completar los tres casos habilita. No se acepta que la gravedad se apague.
- **Ascensor 3:** sólo 1 kg deja 4 kg pendiente; cuatro kg reinicia el tiempo y necesita resultado nuevo; masa no cambia aceleración, sí fuerza.
- **Ascensor 4:** sin ampliación no se acredita la observación requerida; después de ampliar y comparar cohete/caída libre se habilita. No acepta que la luz cambie c. Reinicio limpia intento.
- **Altura 1:** sólo altura cero no basta; subir a 100 m reinicia el tiempo y todavía requiere observar un día. Incorrecta y correcta se distinguen.
- **Altura 2:** sólo un día deja siete pendientes. La respuesta de ritmo siete veces mayor se rechaza; se acepta acumulación siete veces mayor con el mismo ritmo.
- **Altura 3:** sólo reloj sostenido deja órbita pendiente; cambiar movimiento no registra automáticamente el nuevo ensayo. El movimiento aporta una resta, no otra gravedad.
- **Altura 4:** requiere ensayo sin ajuste y con ajuste; la cuenta transmitida se distingue del tiempo propio físico. Una respuesta de desaparición de efectos físicos se rechaza.
- **Órbita 1:** un solo perihelio no satisface diez vueltas. El avance de Einstein frente al cierre newtoniano se evalúa correctamente.
- **Órbita 2:** una sola excentricidad no basta. Cambiar forma sin recorrer de nuevo tampoco; ambas comparaciones completas habilitan responder.
- **Órbita 3:** doble tamaño con sólo una vuelta no basta; ambas series de diez vueltas habilitan la comparación. Mitad de avance por vuelta se acepta, duplicación se rechaza.
- **Órbita 4:** giro real solo deja ampliado pendiente. Cambiar la lupa conserva el ensayo físico y permite comparar ambas representaciones. No se acepta que 43″ sea la precesión total observada.
- **Fotoeléctrico 1:** cambiar color sin registrar no cuenta. Sólo rojo deja azul pendiente. Se rechaza que cualquier luz suficientemente brillante emita en este modelo.
- **Fotoeléctrico 2:** sólo 25 % deja 100 % pendiente; se rechaza energía individual cuatro veces mayor y se acepta cambio de flujo/corriente con energía máxima fija.
- **Fotoeléctrico 3:** una sola superficie no basta. Zinc registrado con brillo 25 % no satisface la comparación a 50 %; al restaurar 50 % y registrar se habilita. La función trabajo explica el resultado.
- **Fotoeléctrico 4:** cambiar a UV sin registrar no basta. Ambas mediciones habilitan y la evaluación distingue energía máxima de flujo a potencia fija.

## Historia guardada, nuevo intento y reinicio

Tras la corrección compartida se volvieron a abrir los **28 retos**, se usó el reinicio de la consola y se eligió una predicción nueva. En todos, la misión mostraba «Huella guardada…» y la comprobación permanecía deshabilitada con los pasos de observación nuevamente pendientes. Ninguno reutilizó la huella como éxito del nuevo intento.

En Fotoeléctrico 4 se repitió el ciclo completo con la huella previa: respuesta incorrecta después de dos mediciones → devolución de error; cambio a la explicación correcta → «Descubrimiento comprobado» y «✓ Resultado». Reloj 3 se repitió igualmente en 320 px con botones inline, y Gemelos 3 en horizontal. Se conserva el avance histórico, sin confundirlo con la evaluación actual.

## Cuadernos activos del mapa Einstein

- **E₀=mc²:** se probaron 1 mg, preset 1 g, mínimo 0,1 mg y máximo 1 g por teclado. El valor pasó de 89,88 GJ a 89.875,52 GJ; el mínimo mostró 8,99 GJ. La nota aclara energía en reposo, escala logarítmica y que el equivalente no es energía automáticamente aprovechable. La interfaz diferencia mg/g y GJ/kWh; no presentó overflow en 390 px. Recargar devuelve 1 mg, tal como corresponde a una exploración sin guardado.
- **Ecuación de campo:** se tocaron las tres partes, sus explicaciones y el desplegable de Λ. El reto auxiliar `ecuacion-de-campo/principal/reto-01` se probó sin respuesta (ambos botones no seleccionados, sin feedback), incorrecta («Mirá el exterior de una estrella…») y correcta («¡Exacto! …»). La recarga elimina la respuesta y vuelve al estado inicial. La actividad explica que vacío local no implica espacio-tiempo plano, diferencia la ecuación de campo de E₀=mc² y del tren de simultaneidad, y explicita Λ=0 en estos modelos. Las tres superficies interactivas de la fórmula tienen 112 px o más de alto en 390 px.

## Fricciones enviadas al coordinador

1. **Resuelto:** la consigna de Reloj 3 mencionaba un selector remoto aunque los botones inline ya existían. Ahora nombra «Seguir reloj de la estación» junto al visor. Se repitió el recorrido completamente inline a 320 px, conservando la escena visible.
2. **Resuelto:** Gemelos 3 usaba «Antes de cambiar/Después de cambiar» en la consigna y «Antes del giro/Después del giro» junto a la escena. Ahora ambos lugares usan los segundos nombres; retest en 667×375 correcto.
3. **Resuelto:** la misión superior de visitas con pasaporte previo decía «Reto completado» aunque la predicción actual estuviera vacía. El nuevo texto de huella guardada lo separa de la comprobación actual; la repetición cubre los 28 retos.

No se encontraron bloqueantes funcionales de producto en esta cobertura final. Como mejora opcional futura, la devolución ante una explicación incorrecta podría referirse a los valores concretos de cada comparación en lugar de la indicación genérica del capítulo. Actualmente permite reintentar y nombra qué magnitudes mirar, por lo que no impide completar el recorrido.

No se modificó implementación desde este agente. La ciencia la revisa el responsable científico por separado; estos resultados no certifican eficacia educativa con participantes. Se revisaron estados visibles, correspondencia entre consignas/controles/evaluación, código de learning y cambios de implementación; la aprobación científica y la aceptación cruzada final pertenecen a sus responsables. No se probaron todos los retos en todos los tamaños, todos los gestos táctiles ni límites de frecuencia de renderizado. Safari, dispositivos físicos y tecnologías de asistencia reales no están disponibles y continúan pendientes.
