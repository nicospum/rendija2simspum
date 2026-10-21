import type { ChapterId } from './progress'
import type { ArtifactKind } from '../shared/ScienceArtifact'
type Note = {
  question: string
  objects: readonly { kind: ArtifactKind; name: string; text: string }[]
  idea: { date: string; title: string; text: string; source: string }
  evidence: { date: string; title: string; text: string; source: string }
}
export const CHAPTER_NOTES: Record<ChapterId, Note> = {
  'lente-gravitacional': {
    question:
      'Si una estrella aparece en dos lugares, ¿viste dos estrellas o dos caminos de su luz?',
    objects: [
      {
        kind: 'light',
        name: 'La fuente y sus imágenes',
        text: 'Una misma fuente puede llegar por distintas direcciones. Su imagen aparente depende del recorrido de la luz.',
      },
      {
        kind: 'orbit',
        name: 'El camino que se curva',
        text: 'Los rayos siguen geodésicas nulas. La esfera de fotones es una órbita inestable, no una cáscara material.',
      },
      {
        kind: 'horizon',
        name: 'La sombra',
        text: 'Las direcciones que no traen luz del fondo forman una región oscura. Su borde aparente no coincide con el horizonte.',
      },
    ],
    idea: {
      date: '1915 · ECUACIONES',
      title: 'Einstein cambia la geometría',
      text: 'La relatividad general relaciona energía y geometría. El laboratorio rastrea luz en una solución de Schwarzschild, con fuentes y observador definidos.',
      source:
        'https://www.einstein.caltech.edu/news/one-hundred-years-of-einsteins-field-equations-and-of-the-explanation-of-mercurys-perihelion',
    },
    evidence: {
      date: '2019 · OBSERVACIÓN',
      title: 'La sombra de M87*',
      text: 'La colaboración EHT reconstruyó la emisión alrededor de M87*. El anillo y la sombra se interpretan mediante modelos; nuestro campo de estrellas es una escena ideal.',
      source: 'https://www.eso.org/public/images/eso1907a/',
    },
  },
  acrecion: {
    question:
      'Lo que brilla, ¿salió del interior o de la materia que todavía está afuera?',
    objects: [
      {
        kind: 'disk',
        name: 'El disco caliente',
        text: 'El gas pierde energía al orbitar y caer. El disco puede radiar intensamente antes de cruzar el horizonte.',
      },
      {
        kind: 'light',
        name: 'El lado más brillante',
        text: 'El movimiento y el corrimiento gravitatorio cambian frecuencia e intensidad. Cambiar la inclinación cambia la asimetría.',
      },
      {
        kind: 'orbit',
        name: 'La estrella testigo',
        text: 'Su órbita aporta otra pista: permite inferir una masa central aunque el disco no emita.',
      },
    ],
    idea: {
      date: 'MODELO ASTROFÍSICO',
      title: 'La luz viene del entorno',
      text: 'Acreción y trayectorias relativistas explican buena parte del resplandor. El modelo del disco hace aproximaciones; su luz no representa la temperatura de Hawking.',
      source: 'https://science.nasa.gov/universe/black-holes/anatomy/',
    },
    evidence: {
      date: 'NOBEL 2020 · ÓRBITAS',
      title: 'Genzel, Ghez y una masa invisible',
      text: 'Sus equipos siguieron estrellas del centro galáctico para estudiar un objeto compacto supermasivo. Una órbita y una imagen del gas son mediciones diferentes.',
      source: 'https://www.nobelprize.org/prizes/physics/2020/summary/',
    },
  },
  horizonte: {
    question:
      'El reloj cruza la frontera. ¿Qué puede seguir midiendo y qué puede contarle a alguien afuera?',
    objects: [
      {
        kind: 'clock',
        name: 'El reloj de la sonda',
        text: 'Mide tiempo propio durante la caída. Cruzar el horizonte no obliga a que ese reloj se detenga.',
      },
      {
        kind: 'horizon',
        name: 'La frontera causal',
        text: 'Del interior no salen mensajes hacia el exterior lejano. El horizonte es un límite de comunicación, no una pared.',
      },
      {
        kind: 'light',
        name: 'Los pulsos recibidos',
        text: 'La antena recibe señales con demora y cambio de frecuencia. Una emisión local y una recepción lejana son eventos distintos.',
      },
    ],
    idea: {
      date: '1916 · SOLUCIÓN',
      title: 'Karl Schwarzschild',
      text: 'La solución esférica sin rotación permite estudiar un horizonte. El mapa usa coordenadas regulares para no confundir una singularidad de coordenadas con una pared física.',
      source: 'https://science.nasa.gov/universe/black-holes/anatomy/',
    },
    evidence: {
      date: '1965 · RESULTADO TEÓRICO',
      title: 'Roger Penrose y el colapso',
      text: 'Penrose mostró, bajo condiciones físicas precisas, que el colapso y las singularidades no dependen de una simetría esférica perfecta. Es teoría, no un mensaje recibido del interior.',
      source:
        'https://www.nobelprize.org/prizes/physics/2020/press-release/',
    },
  },
  hawking: {
    question:
      '¿Puede un agujero negro emitir y, al mismo tiempo, ganar energía de su entorno?',
    objects: [
      {
        kind: 'heat',
        name: 'La temperatura de Hawking',
        text: 'Se refiere a la radiación predicha para un observador lejano. Menos masa implica mayor temperatura.',
      },
      {
        kind: 'light',
        name: 'El fondo cósmico',
        text: 'Los marcadores entrantes representan absorción del entorno. Emitir no garantiza perder masa neta.',
      },
      {
        kind: 'clock',
        name: 'El reloj de evaporación',
        text: 'La evolución se acelera para explorarla. La duración física del modelo se muestra aparte; el final cuántico queda fuera.',
      },
    ],
    idea: {
      date: '1974–1975 · PREDICCIÓN',
      title: 'Stephen Hawking une dos teorías',
      text: 'Su cálculo usa campos cuánticos en un espacio-tiempo con agujero negro. No describe una superficie caliente ni necesita un disco de gas.',
      source: 'https://doi.org/10.1007/BF02345020',
    },
    evidence: {
      date: 'ALCANCE DE LA EVIDENCIA',
      title: 'Una predicción que seguimos estudiando',
      text: 'La emisión de un disco no prueba Hawking. Los experimentos análogos estudian sistemas con horizontes efectivos; no constituyen una detección en un agujero negro astrofísico.',
      source: 'https://doi.org/10.1007/BF02345020',
    },
  },
  entropia: {
    question:
      'Si el horizonte se achica, ¿ya contaste también lo que se llevó la radiación?',
    objects: [
      {
        kind: 'area',
        name: 'El área del horizonte',
        text: 'A masa doble, radio doble y área cuádruple. La fórmula de entropía sigue el área, no el volumen euclídeo.',
      },
      {
        kind: 'map',
        name: 'La lupa de Planck',
        text: 'Agrupa áreas para explicar el factor ¼. El mosaico es una ayuda algebraica, no una foto de celdas microscópicas.',
      },
      {
        kind: 'heat',
        name: 'El balance completo',
        text: 'La entropía del agujero negro y la de la radiación cuentan por separado. El modelo térmico es una aproximación.',
      },
    ],
    idea: {
      date: '1973 · PROPUESTA',
      title: 'Jacob Bekenstein mira el área',
      text: 'Propuso asociar entropía al agujero negro y extender el balance termodinámico al horizonte. Esa idea abrió preguntas sobre información y gravedad.',
      source: 'https://doi.org/10.1103/PhysRevD.7.2333',
    },
    evidence: {
      date: '1975 · NORMALIZACIÓN',
      title: 'La temperatura fija el ¼',
      text: 'El cálculo de Hawking permite precisar S = kB A/(4ℓP²). La fórmula no equivale a una medición de microestados ni resuelve por sí sola la paradoja de la información.',
      source: 'https://doi.org/10.1007/BF02345020',
    },
  },
}
