# El efecto fotoeléctrico

Laboratorio 14 de SPUM, séptimo capítulo del especial Einstein y primero de su bloque cuántico. Ruta canónica: `/efecto-fotoelectrico/`. Dos vistas calculadas en SVG, sin imágenes prefabricadas ni dependencias nuevas: celda fotoeléctrica y reparto de energía.

## Modelo físico

Luz monocromática y fotoemisión de un fotón por interacción. Frecuencia f entre 350 y 1.600 THz. Brillo entre 0 y 100%, definido como potencia incidente total sobre el metal: `P = brillo/100 × 1 µW`. No es una escala de percepción visual humana ni un flujo de fotones fijo.

```
E_fotón = hf
f₀ = φ/h
Kmáx = hf − φ                 si f > f₀ y P > 0
Φ_fotones = P/(hf)
N_electrones/s = η Φ_fotones   si hay emisión
I_ideal = e N_electrones/s
vmáx = √(2 Kmáx / m_e)        con Kmáx en joules
e V_freno = Kmáx
```

No se permite transporte cuando f ≤ f₀ o P = 0. En el umbral exacto la energía cinética disponible es cero. El exceso energético se calcula desde `h(f−f₀)` para evitar un signo espurio por redondeo al construir la frecuencia umbral. El valor potencial por fotón sigue disponible con la fuente apagada; no se presenta como electrones realmente emitidos.

Las constantes SI son h = 6,62607015×10⁻³⁴ J·s, e = 1,602176634×10⁻¹⁹ C, c = 299.792.458 m/s y m_e = 9,1093837139×10⁻³¹ kg. Las energías de interfaz se expresan en eV; la igualdad numérica entre Kmáx en eV y V_freno en V se deriva de la conversión por e, no elimina unidades.

Materiales nominales de la tabla de OpenStax/Rice: sodio 2,46 eV, zinc 4,31 eV y plata 4,73 eV. La función trabajo depende de la superficie; estos números no son valores universales de cada elemento ni energías de ionización atómica. Para la corriente se fija una eficiencia cuántica **ilustrativa** η = 0,10, con colección completa y alimentación estacionaria. En un fotocátodo real η varía con la frecuencia y la superficie. La experiencia no se ajusta a un dispositivo concreto.

Ejemplo reproducible: sodio, 650 THz y brillo 50% → λ ≈ 461,22 nm; hf ≈ 2,68818 eV; Kmáx ≈ 0,228184 eV; vmáx ≈ 283,31 km/s; I_ideal ≈ 18,5999 nA. A 450 THz no hay emisión. A 1.000 THz el sodio emite y el zinc no.

## Qué representa el visor

Las posiciones de los representantes se calculan a partir de flujo estacionario, tiempo de exploración y tránsito libre a rapidez constante. La rapidez electrónica relativa depende de √Kmáx. Los puntos representan flujos reducidos, no un conteo literal ni correspondencias individuales fotón/electrón. Cada representante resume un número enorme de eventos; se limita su cantidad para acotar el trabajo de dibujo.

Los tamaños son simbólicos y el tiempo de vuelo se amplía. Fotones y electrones no usan una misma escala temporal en el dibujo. Los electrones representados corresponden al extremo máximo de energía, no a una distribución física completa. La pausa congela el dibujo, conservando los resultados estacionarios. La luz se apaga llevando el brillo a cero. La animación se limita a 30 Hz, acota el incremento tras suspensiones y no actualiza si la pestaña está oculta.

La barra y el gráfico de energía tienen escalas fijas. La barra distingue energía aportada, costo de extracción y sobrante. El gráfico traza Kmáx(f) solo sobre el umbral; las líneas tenues muestran otros materiales. Un marcador debajo del umbral indica ausencia de emisión, no electrones de energía cero. Con la fuente apagada se identifica el reparto como potencial. Los colores visibles son aproximados; UV e infrarrojo usan colores simbólicos explícitos.

No se modelan calentamiento, procesos multifotónicos, carga espacial, reflexiones dependientes de frecuencia, campos de colección reales, potenciales de contacto ni distribuciones de energía o ángulo. El circuito es una representación de colección ideal; el potencial de frenado se calcula en la explicación, sin simular su aplicación.

## Retos y mediciones

1. Sodio, brillo 100%: registrar rojo de 450 THz y azul de 650 THz. Entender que más fotones por debajo del umbral no sustituyen energía suficiente por fotón.
2. Sodio, 650 THz: comparar brillo 25% y 100%. La corriente ideal cambia ×4; Kmáx permanece.
3. 1.000 THz, brillo 50%: comparar sodio y zinc. Cambia φ, no la energía de los fotones.
4. Sodio, brillo 50%: comparar 650 y 1.000 THz. La energía máxima crece; el flujo fotónico y la corriente ideal bajan porque la potencia está fija.

Los retos exigen registrar las condiciones previstas y elegir la explicación correcta. Cambiar controles sin medir no acredita observaciones. Se conservan las dos últimas configuraciones distintas, independientes de cambios posteriores. Los registros se deduplican y su cantidad está acotada. Reiniciar un reto limpia sus mediciones y observaciones; conserva los descubrimientos completados. No se guardan datos personales ni se usa almacenamiento persistente.

En escritorio se ven ambas vistas; en celular hay un selector. Hay controles compactos de frecuencia, brillo y material junto al visor y un panel con explicaciones y botones de ensayo exacto. Rangos y botones se operan con teclado, las explicaciones se abren con mouse o toque, y hay accesos a controles, mediciones, retos y contexto. El índice conecta los siete laboratorios de Einstein y el cierre lleva a la doble rendija.

## Fuentes

- [Nobel Prize: Física 1921](https://www.nobelprize.org/prizes/physics/1921/summary/) y [discurso de presentación](https://www.nobelprize.org/prizes/physics/1921/ceremony-speech/): motivo del premio y contexto experimental.
- [R. A. Millikan, A Direct Photoelectric Determination of Planck's h (1916)](https://doi.org/10.1103/PhysRev.7.355): contraste experimental de la relación entre frecuencia y energía.
- [NIST, constantes CODATA 2022](https://physics.nist.gov/cuu/pdf/all.pdf): constantes SI y masa del electrón.
- [OpenStax/Rice, University Physics Vol. 3, sección 6.2](https://openstax.org/books/university-physics-volume-3/pages/6-2-photoelectric-effect): valores nominales de función trabajo elegidos para la experiencia.

## Verificación

`tests/fotoelectrico.test.mjs` comprueba el ejemplo numérico, umbrales, ausencia de emisión con fuente apagada o frecuencia baja, escalamiento del brillo, pendientes energéticas, diferencias entre materiales, balance de energía, flujo, corriente y velocidad en todo el dominio, entradas inválidas, flujo gráfico acotado, cuatro retos, mediciones independientes y pausas. El índice se contrasta en `tests/tren.test.mjs`. Se ejecutan también `npm run lint`, `npm run build`, `npm test` y las diez comprobaciones de `npm run research:hawking`.

La revisión de navegador cubre emisión, gráficos, controles, cuatro retos, explicaciones y navegación en escritorio y ventanas móviles. No reemplaza las pruebas en teléfonos físicos.
