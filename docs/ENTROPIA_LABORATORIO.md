# Entropía de Bekenstein–Hawking · laboratorio 05

Ruta pública: `/entropia/`. Integrado al catálogo de SPUM, con enlaces desde Hawking y lente gravitacional. No agrega dependencias ni modifica sus modelos físicos.

## Pregunta y recorrido

¿Por qué la entropía de un agujero negro sigue el área de su horizonte? La experiencia compara un mapa geométrico, cuadrados de área relativa, valores SI, proporciones y una contabilidad térmica del exterior. Cada reto pide una predicción y una comparación con referencia propia:

1. **El área manda:** duplicar la masa inicial de 10 a 20 masas solares sin emisión: radio ×2, área y entropía ×4. El volumen euclídeo asociado crece ×8, pero no es la ley de entropía ni un volumen interior físico único.
2. **Descifrar el ¼:** pasar de 8 a 16 áreas de Planck en un ejemplo algebraico separado; S/kB pasa de 2 a 4. No modifica el agujero negro ni afirma la existencia de un horizonte microscópico de celdas. Cuatro unidades de S/kB no son cuatro bits.
3. **Lo que pierde el horizonte:** emitir el equivalente al 25 % de la masa inicial. Queda M/M₀ = 0,75, S/S₀ = 0,5625 y T/T₀ = 4/3.
4. **Contar todo:** con esa fracción ya emitida, incluir la radiación en la contabilidad: Srad/S₀ = 7/12 y (SBH + Srad)/S₀ = 55/48 ≈ 1,145833. El interruptor cambia qué se cuenta, no el estado físico.

Los atajos restauran las otras condiciones de la referencia del reto para aislar el cambio. Los controles manuales también funcionan. Se exige una predicción para marcar una comparación explorada; una predicción equivocada permite aprender y corregirse, no bloquea el recorrido. Mezclar variables se identifica como exploración, sin atribuir el resultado a un cambio aislado. Las referencias se conservan independientes del estado actual. El progreso es local a la página, sin almacenamiento ni seguimiento.

## Ecuaciones y unidades

Schwarzschild, sin giro ni carga, evaluado como sucesión de estados cuasiestáticos:

```text
rₛ = 2GM/c²
A = 4πrₛ²
ℓP² = ℏG/c³
SBH = kB c³ A/(4Gℏ) = kB A/(4ℓP²)
SBH/kB = 4πGM²/(ℏc)
T = ℏc³/(8πGMkB)
```

Se reutilizan `blackHole()` y las constantes SI de `src/hawking/physics.ts`: c = 299792458 m/s, G = 6,67430 × 10⁻¹¹ m³/(kg s²), kB = 1,380649 × 10⁻²³ J/K y ℏ = h/(2π), con h = 6,62607015 × 10⁻³⁴ J s. La masa solar nominal usa GM☉ = 1,3271244 × 10²⁰ m³/s² dividido por G, igual que los otros módulos. No se altera ninguna constante desde la interfaz.

Las opciones `S/kB`, `J/K` y `bits` son conversiones de la misma cantidad: S = kB(S/kB) y bits = S/(kB ln 2). No se calcula Ω = exp(S/kB), que desbordaría la aritmética y no aporta valor didáctico. La relación estadística S = kB ln Ω se explica con su alcance.

La masa inicial es lineal y acotada a 5–20 M☉, paso 0,1. Los atajos ÷2 y ×2 se deshabilitan si el resultado sale del intervalo. La masa actual es M = M₀(1 − f), con f entre 0 y 0,5. El radio, el área y las proporciones reaccionan inmediatamente. La referencia visual siempre es 10 M☉ sin emisión, incluso al cambiar de reto. La referencia causal de cada reto es independiente de esa regla visual fija.

## Evaporación y segunda ley: alcance del modelo

Fotones ideales de cuerpo negro en vacío, sin acreción ni baño térmico, usando la aproximación de Hawking ya implementada. La barra elige fracción de masa emitida, **no tiempo real transcurrido**. Para el cálculo del tiempo ideal, M³ = M₀³(1 − t/τ₀), por lo que t/τ₀ = 1 − (1 − f)³. Se reutiliza la vida ideal τ₀ del módulo Hawking. Para estas masas la vida es inmensa y el fondo cósmico actual dominaría la emisión si se lo incluyera: el panel desplegable lo aclara. No se extrapola al final de evaporación.

El balance integra una temperatura variable, no evalúa toda la emisión a T inicial:

```text
dErad = −c² dM
dSBH = c² dM/T
dSrad = 4 dErad/(3T)
Srad = (4/3)(S₀ − SBH)
SBH + Srad = S₀ + (S₀ − SBH)/3
```

Son entropías térmicas coarse-grained. No se calcula entropía de entrelazamiento, correlaciones finas, información recuperada ni curva de Page. El factor 4/3 resulta de esta aproximación; incluir barreras de dispersión, otras especies y un espectro real modifica el balance. La suma ilustra la segunda ley generalizada en este modelo, no constituye una demostración general de esa ley.

Para evitar restar números enormes casi iguales cerca de f = 0, la fracción de entropía perdida se calcula como f(2 − f). El rango de entrada se valida antes de usar el modelo; los valores no finitos y los estados fuera del recorrido se rechazan explícitamente.

## Representación y arquitectura

- `physics.ts`: modelo puro y validación; reutiliza el núcleo SI de Hawking.
- `learning.ts`: referencias, predicciones y cuatro comparaciones, con reductor puro.
- `HorizonMap.tsx`: proyección ortográfica calculada de una esfera de radio areal rₛ. Meridianos y paralelos se proyectan y se ocultan por profundidad; el control de giro es solo presentación. No es un render de lente gravitacional.
- `Formula.tsx`: símbolos seleccionables y lupa algebraica de 4–64 ℓP², agrupada de a cuatro. Las constantes tienen explicaciones y valores; no hay controles que inventen cambios de las leyes físicas.
- `App.tsx` y `entropia.css`: controles, conversiones, barras con escala común, balance térmico, retos, historia y límites. Tooltips disponibles con ratón, teclado o toque. Navegación móvil por anclas.
- `entropia/index.html` y Vite: sexta entrada MPA (portada + cinco laboratorios), con documento y estilos aislados.

El mapa tiene una escala fija en km y referencia punteada. El cuadrado lateral preserva la razón de áreas, con una escala gráfica propia explícita; no pretende desplegar la esfera sin distorsión ni compartir el metro gráfico del mapa. La trama, el halo y los colores son ayudas geométricas; no son fotones, microestados observados ni píxeles físicos del horizonte. Las barras de comparación usan 0–8× con marca en 1×. Las del balance usan 0–4/3 de S₀ con marca en S₀. Los porcentajes del balance siempre se normalizan por la masa inicial seleccionada; no por la referencia de 10 M☉ del mapa.

Se usa SVG calculado para esta geometría estática y accesible. No hay texturas externas, WebGL obligatorio, bucles de animación, timers ni solicitudes de datos; solo se recalcula al interactuar. El bundle del laboratorio no carga Three.js. Se respeta `prefers-reduced-motion`; los botones y zonas de ayuda tienen al menos 44 px y los controles son nativos. La verificación en tamaños de celular no sustituye pruebas de dispositivos físicos.

## Validación

`tests/entropia.test.mjs` comprueba:

- área de Planck frente a CODATA y fórmula de masa independiente de la fórmula de área;
- valores de referencia, escalas r ∝ M, A ∝ M² y volumen euclídeo asociado ∝ M³;
- conversión SI/kB/bits y distinción entre grupos y bits;
- fracción emitida, energía y tiempo ideal;
- integral numérica independiente de c² dM/T;
- integrales de Bose para energía y entropía fotónicas, cuya razón da 4/3;
- suma térmica creciente en todo el dominio, caso de emisión nula y estabilidad para fracciones pequeñas;
- entradas inválidas, cuatro recorridos, aislamiento de referencias, controles manuales y rechazo de comparaciones confundidas.

Ejecutar `npm test`, `npm run research:hawking`, `npm run lint` y `npm run build`. Revisar además las interacciones, los tooltips y el catálogo en navegador, en producción y en anchos 320, 390, 768 y 1440 px. No se agregan dependencias ni se cambian los núcleos de los otros cuatro laboratorios.

## Fuentes primarias

- [Bekenstein, Black Holes and Entropy (1973)](https://doi.org/10.1103/PhysRevD.7.2333): propuesta de entropía de área y segunda ley generalizada.
- [Hawking, Particle Creation by Black Holes (1975)](https://doi.org/10.1007/BF02345020): temperatura y emisión semiclásica.
- [Wald, The Thermodynamics of Black Holes (2001)](https://doi.org/10.12942/lrr-2001-6): fundamentos, alcance y problemas abiertos.
- [Aghapour y Hajian (2016)](https://arxiv.org/abs/1603.02866): relación 3/4 entre pérdida de entropía del emisor y entropía de radiación de cuerpo negro.
- [Page (2013)](https://arxiv.org/abs/1301.4995): diferencia con la entropía fina y con coeficientes de emisión más completos.
- [NIST, CODATA 2022](https://physics.nist.gov/cuu/Constants/Table/allascii.txt): constantes físicas y longitud de Planck. Valores consultados el 21 de octubre de 2026.

No se presentan las ilustraciones como observaciones de estructura microscópica ni como evidencia de detección astrofísica de radiación de Hawking.
