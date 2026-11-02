# QA de modelos y comprensión · seguimiento del especial Maldacena

2 de noviembre de 2026. Revisión de código de geometría, correspondencia y BTZ a partir de `08d6b07`, seguida de uso en navegador sobre la versión local corregida. La versión pública inicial y la matriz móvil completa corresponden al agente independiente de uso; este informe no las sustituye.

## Hallazgos y correcciones

1. **BTZ: los datos podían sugerir que la curva había llegado al horizonte.** En el segundo reto, T=0,24 y ℓ=6 daban `z*=0,66` y `zₕ=0,66` al redondear a dos decimales. La opción incorrecta era precisamente que la curva llegaba al horizonte. La geodésica era correcta: el fallo era de presentación. La lectura muestra ahora cuatro decimales y la separación positiva en coordenadas z, con seis decimales. Si se explora T=0, aclara que no hay horizonte a z finito, sin comparar infinitos. Las diferencias de entropía menores que 0,0001 tampoco se presentan como cero exacto.
2. **BTZ: gesto y teclado no compartían el paso de la barra.** La manija podía producir longitudes continuas, mientras los retos requieren ℓ=2, 4 o 6; sumar repetidamente 0,1 con el teclado podía acumular un error binario y no recuperar exactamente la referencia. Se agregó un mapeo de interacción que redondea al mismo paso de la barra y mantiene sus límites. Dos regresiones nuevas comprueban ambos mapas y que Home + quince flechas alcance exactamente ℓ=2.
3. **La segunda vista térmica mostraba un punto sin interacción.** Ahora el punto coral de entropía es también un slider con puntero y teclado; cambia el mismo ℓ que la manija geométrica. El tercer reto abre esta vista y la acción de pendiente muestra la gráfica que se está comparando. El botón de pendiente se ofrece en ese reto; antes aparecía en todos y cambiaba silenciosamente T a 0,32 aunque no fuera la comparación pedida.
4. **Los datos junto al dibujo no siempre respondían la pregunta.** BTZ mantiene visibles profundidad/horizonte en el reto 2, pendiente/densidad en el 3 y radio físico/parámetro de masa en el 4. En geometría y dualidad se incluyen ℓ y ε en la lectura existente, sin agregar otra fila a la escena fija. Así se reconoce qué condición está cambiando sin bajar al panel.
5. **Había vocabulario sin explicar junto a los mandos.** Se añadieron ayudas desplegables sobre ℓ, centro, ε, geodésica, nats, T, zₕ y r₊. T se identifica junto a la barra como una escala del modelo, sin kelvin o Celsius. Se explica que al calentar el número zₕ disminuye y la línea sube en el mapa, aunque el radio físico crezca. La lectura de un mapa no se confunde con tamaño físico.
6. **Dos predicciones de dualidad exigían interpretar una expresión antes de enseñar la idea.** Se expresa el incremento concreto de 13,86 nats para cCFT=60 y se conserva su derivación `20 ln 2` en la explicación. La predicción pregunta por sumar frente a duplicar; no exige calcular un logaritmo mentalmente.
7. **Medir y explorar parecían la misma operación.** Geometría/dualidad ahora indican si la lectura actual está registrada o si es una lectura viva distinta de la última guardada. La ayuda explica que mover actualiza cifras y medir guarda esas condiciones. Se conservan las comparaciones válidas de la sesión.
8. **Rótulos del SVG demasiado pequeños en móvil.** Se ampliaron títulos, coordenadas y letras A/B sin reducir el campo ni agregar altura al visor. Se separó la etiqueta x del último valor 3 del eje. Las lecturas HTML siguen ofreciendo los valores principales con mayor tamaño.

No se cambiaron las ecuaciones físicas, los parámetros del diccionario, las claves de progreso o las condiciones de éxito. La revisión conserva la distinción entre estado, fórmula asintótica y curva regulada.

## Verificación ejecutada

- **17 pruebas dirigidas aprobadas** de geometría, BTZ, revisión independiente de la métrica y mapeos de interacción; incluyen dos regresiones nuevas de puntero/teclado.
- ESLint de los módulos propios y TypeScript aprobados.
- **12/12 retos completados en navegador**: los cuatro de geometría y los cuatro de BTZ en escritorio, y los cuatro de dualidad en 320×740, con predicciones y mediciones/acciones nativas. También se inspeccionaron las dos vistas geométricas en 320×740.
- Arrastre real de ratón sobre el nuevo punto coral: ℓ pasó de 4 a 5,8. En esa misma vista, Home y quince flechas derechas recuperaron exactamente 2.
- Se inspeccionaron capturas de las dos vistas geométricas y de frontera en 320 px: los textos mayores permanecen dentro del SVG; las barras y las lecturas conservan su escala. La matriz de escena/pregunta/control después de las correcciones queda a cargo del agente independiente de uso.
- Se restauró el viewport de Chrome y se cerró únicamente la pestaña temporal creada para este pase.

Evidencia fuera de Git, en `.work/qa-maldacena-followup-2026-11-02/` del espacio de trabajo exterior: `models-challenges-followup.json`, `models-tests.txt`, `geometry-labels-320.png` y `duality-labels-320.png`. El JSON conserva la lectura que permitió detectar el redondeo engañoso de BTZ antes de su corrección final; no debe confundirse con una captura final de ese rótulo.

## Contraste científico y límites

Se contrastaron el intervalo único en una CFT y la relación geométrica con [Ryu–Takayanagi](https://arxiv.org/html/hep-th/0603001) y [Calabrese–Cardy](https://arxiv.org/html/hep-th/0405152). Se mantiene el cálculo con extremos en z=ε y su residuo frente al límite logarítmico; el programa no presenta igualdad exacta a corte finito ni prueba toda AdS/CFT. Las nats usan logaritmo natural, con conversión a bits por división por ln 2.

La revisión de claridad es una evaluación heurística de un revisor técnico; no certifica aprendizaje en personas que desconocen el tema. Safari, dispositivos físicos, gestos táctiles reales y rendimiento de GPU continúan pendientes según lo acordado con el usuario. No se añadieron dependencias ni se hicieron commits desde este agente.
