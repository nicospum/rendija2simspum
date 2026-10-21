# Lente gravitacional de Schwarzschild

Laboratorio 04 de SPUM, 21 de octubre de 2026. Ruta `/lente-gravitacional/`. La imagen nace de integrar geodésicas nulas; no se superponen anillos prefabricados ni se aplica una fuerza newtoniana a partículas para imitar la relatividad. No agrega dependencias, texturas descargadas, APIs remotas ni credenciales.

## Pregunta y recorrido educativo

¿Podés ver lo que hay detrás de un agujero negro? La imagen y el diagrama se conectan seleccionando una dirección. Una fuente alineada produce un anillo; fuera de alineación aparecen imágenes/arcos. El anillo es una imagen de la fuente de fondo, no un disco de acreción ni radiación de Hawking.

| Reto                | Referencia                                          | Cambio aislado                    | Qué se aprende                                                          |
| ------------------- | --------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| Luz que se desvía   | Con lente; fuente 8°, cámara 0°, masa de referencia | Quitar gravedad                   | Cambia la posición/forma aparente con el mismo fondo.                   |
| Encontrar el anillo | Con lente; fuente 8°, cámara 0°                     | Fuente a 0° (o solo cámara a −8°) | La simetría de trayectorias produce un anillo.                          |
| Captura o escape    | Rayo entrante a 14°, con lente                      | Elegir 3° del centro              | El rastreo alcanza el horizonte: esa dirección no recibe luz del fondo. |
| Escala de la masa   | Masa de referencia, distancias físicas fijas        | M ×2                              | Crecen horizonte y ángulo de sombra; no se reescala la cámara con M.    |

Cada reto tiene predicción, restauración, explicación y referencia propia. El progreso dura la sesión; no se guarda información del visitante. Elegir un píxel es una selección de lectura, no un cambio del campo. El reto de captura sí considera la dirección como su variable. Los cambios combinados no completan una comparación de una sola causa.

## Modelo y derivación

Schwarzschild sin carga ni giro, cámara estática fuera de la esfera de fotones. Radio areal `rₛ = 2GM/c²`, métrica `ds² = −(1 − rₛ/r)c²dt² + dr²/(1 − rₛ/r) + r²dΩ²`. Por simetría esférica, cada geodésica está en un plano. Con `u = rₛ/r`, `B = b/rₛ` y ángulo orbital φ:

```
u'' + u = (3/2)u²
(u')² + u² − u³ = 1/B²
```

α es el ángulo **local**, medido en la base ortonormal de la cámara estática respecto de apuntar al centro. Si `R = r_cámara/rₛ`:

```
B = R sin(α) / √(1 − 1/R)
u(0) = 1/R
u'(0) = cos(α)/B
```

El factor de la base local es necesario; usar un ángulo euclídeo de coordenadas daría otra imagen. α = 0 se trata como rayo radial y termina en el horizonte. Integramos RK4 con paso angular 0,004 rad, hasta `u = 1` (horizonte), `u = rₛ/r_fondo` con derivada negativa (vuelta al fondo), o `φ = 12π` (no resuelto). Localizamos linealmente el cruce final; el diagnóstico de conservación excluye ese segmento interpolado. No se integra el tiempo de Schwarzschild.

El potencial tiene su extremo en `u = 2/3`: esfera de fotones `r = 1,5rₛ` y `B_crítico = 3√3/2`. Para esta cámara y rayos entrantes, el semiancho de sombra es `asin(B_crítico √(1−1/R)/R)`. El horizonte no es el contorno angular de la sombra. Sin gravedad, calculamos exactamente la intersección de una recta con la misma esfera de fondo: no conservamos una esfera negra artificial delante.

## Escalas, proyección y escena

Masa de referencia nominal: 4 millones de masas solares, usando `GM☉ = 1,3271244×10²⁰ m³/s²`. Intervalo ×0,5–×2. Cámara a `24 rₛ,ref` ≈ 1,895 UA; fondo a `90 rₛ,ref` ≈ 7,107 UA. Estos metros quedan fijos al cambiar M. La cámara se compara entre −18° y +18°, siempre mirando al centro: posiciones estáticas, sin velocidad y aberración.

El fondo procedural es una esfera de prueba con estrellas, una banda y una fuente gaussiana dorada. No es una fotografía ni un catálogo astronómico. El color de cada píxel depende del punto al que llega su geodésica. Fuente/estrellas/cuadrícula se conservan entre controles; no son fotometría calibrada ni un espectro con corrimiento gravitacional. La cuadrícula corresponde a coordenadas **del fondo**, no a una malla material del espacio-tiempo.

La fuente está en `n_fuente = (−cos β, sin β, 0)` y la cámara en la dirección `n_obs = (cos γ, sin γ, 0)`. α viene de una cámara con campo vertical 60°; el azimut ψ define el plano. El punto de fondo es `cos φ n_obs + sin φ (cos ψ e_derecha + sin ψ e_arriba)`. Se usa también para medir la separación entre el origen del rayo y la fuente. «Seguir un rayo del anillo» usa una raíz de `φ_final(α) = π`, no una dirección fija elegida visualmente.

El diagrama presenta `(r cos φ, r sin φ)`. No es una incrustación isométrica ni una longitud euclídea medida localmente. El panorama contiene toda la esfera; la ampliación usa ±12 radios de referencia, con escala física fija al cambiar M. Una fuente fuera del plano se identifica como proyección. Hay un rayo elegido y dos direcciones vecinas ±1,5°. Rastreo inverso: cámara → origen; la luz recibida va al revés. Llegar al horizonte no supone luz emitida desde adentro.

## Arquitectura y rendimiento

- `physics.ts`: integrador puro, control plano, umbral, raíz, tabla, proyección y dirección de origen.
- `rayWorker.ts`/`useTransfer.ts`: tabla de 1536 trayectorias, RGBA Float32 transferible de 24 KiB. Muestreo cuadrático concentra resolución cerca del umbral. La simetría permite reutilizar cada radio por todos los azimuts.
- Solo masa y activación de gravedad reintegran la tabla; fuente/cámara/cuadrícula actualizan uniformes. Se agrupan cambios durante 60 ms, se cancelan trabajos viejos y terminan workers anteriores. Ambas vistas conservan la misma masa/gravedad calculada durante la actualización, señalada en pantalla. Si falla el worker se intenta el mismo cálculo puro como alternativa; un fallo numérico deja un mensaje de error.
- `ObserverView.tsx`: una superficie WebGL usando Three/R3F existente. Interpola φ comprobando antes el estado de llegada. La sombra usa el umbral analítico; el extremo sin resolución se oscurece con advertencia. No hay curva ajustada para fabricar un anillo.
- El diagrama integra directamente el rayo. La imagen tiene además error de interpolación: estructuras extremadamente finas junto a la sombra pueden no resolverse. No se promete precisión subpíxel uniforme en el umbral.
- Renderizado bajo demanda y DPR máximo 1,5, sin animación continua. Se liberan texturas GPU, workers y temporizadores. El portal conserva solo una ilustración SVG identificada y no importa el renderer.

No incluye Kerr, plasma, difracción, polarización, disco, evolución temporal, retardos ni Hawking. Si falla WebGL se conservan diagrama, controles y retos; el aviso no afirma que la imagen se haya renderizado.

## Validación

Trece pruebas en `tests/lente.test.mjs`: selección/proyección inversa; todos los azimuts del anillo llegan a la misma fuente; límite numérico sin falsa captura; φ contrastado con una **cuadratura independiente del potencial** (bisección del retorno y sustitución que elimina su singularidad integrable); intersección recta; inicialización local y primer integral; umbral y rayo radial; conservación y refinamiento RK4; límite débil `4GM/(bc²)`; raíz y distancias fijas; tabla contra rayos directos; cuatro retos/referencias/restauración; alineación manual y rechazo de cambios combinados/entradas inválidas.

La suite alcanza 104 pruebas, conservando las diez comprobaciones independientes de Hawking. Lint y compilación se complementan con revisión visual de WebGL, cuatro retos, píxeles, controles, ayudas y anchos 320/390/768/1440 px. Los tamaños de viewport no equivalen a dispositivos físicos ni a medir FPS/consumo en ellos.

## Fuentes

- [David Tong, General Relativity, sección 6](https://www.damtp.cam.ac.uk/user/tong/gr/six.pdf): Schwarzschild, geodésicas y causalidad. La forma de u se deriva del primer integral nulo.
- [ESA ACT, Black Hole Visualization](https://www.esa.int/gsp/ACT/phy/Projects/Blackholes/WebGL/): trazado inverso a esfera de fuentes u horizonte. Sus menciones históricas a futuras imágenes EHT no son una actualización observacional.
- [NASA, Accretion Disk Visualization](https://svs.gsfc.nasa.gov/13326/): distinguir lente/disco y la invariancia cuando también se escalan todas las distancias.
- [Wald, Thermodynamics of Black Holes](https://doi.org/10.12942/lrr-2001-6): base del siguiente laboratorio de entropía, independiente de esta lente.
