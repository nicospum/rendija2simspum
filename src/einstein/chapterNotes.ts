import type { ChapterId } from './progress'
import type { ArtifactKind } from './Artifact'
interface Note {
  question: string
  objects: readonly { kind: ArtifactKind; name: string; text: string }[]
  idea: { date: string; title: string; text: string; url: string }
  evidence: { date: string; title: string; text: string; url: string }
}
const book = 'https://www.gutenberg.org/files/5001/5001-h/5001-h.htm'
export const CHAPTER_NOTES: Record<ChapterId, Note> = {
  'reloj-de-luz': {
    question:
      'Si todos miden la misma velocidad de la luz, ¿qué tiene que cambiar cuando el camino es más largo?',
    objects: [
      {
        kind: 'mirror',
        name: 'Dos espejos',
        text: 'La ida y vuelta del pulso define un tic. La separación transversal se mantiene.',
      },
      {
        kind: 'light',
        name: 'La diagonal luminosa',
        text: 'Desde la estación, el pulso acompaña al reloj que se mueve. El camino es más largo.',
      },
      {
        kind: 'clock',
        name: 'Dos lecturas',
        text: 'El tiempo propio pertenece al reloj seguido. El otro sistema le asigna un intervalo mayor.',
      },
    ],
    idea: {
      date: '1905 · IDEA',
      title: 'Einstein y la relatividad especial',
      text: 'La velocidad de la luz y la equivalencia de los sistemas inerciales obligan a revisar la comparación de tiempos.',
      url: book,
    },
    evidence: {
      date: '2010 · MEDICIÓN',
      title: 'Los relojes atómicos del NIST',
      text: 'El equipo del NIST midió diferencias de ritmo asociadas al movimiento. El reloj de luz es nuestra herramienta mental para entenderlas.',
      url: 'https://www.nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal-scale',
    },
  },
  'tren-de-einstein': {
    question:
      'Antes de decidir qué ocurrió primero, ¿ya descontaste lo que tardó la luz en llegar?',
    objects: [
      {
        kind: 'train',
        name: 'Tren y andén',
        text: 'Cada uno usa su propia red de relojes sincronizados. Ninguno trae un tiempo universal.',
      },
      {
        kind: 'light',
        name: 'Los dos destellos',
        text: 'Las fechas de emisión y las fechas de llegada son datos distintos. La distancia al receptor importa.',
      },
      {
        kind: 'map',
        name: 'Las marcas de longitud',
        text: 'Medir el tren exige registrar sus extremos al mismo tiempo del sistema que hace la medición.',
      },
    ],
    idea: {
      date: '1916 · RELATO DE EINSTEIN',
      title: 'Un tren para pensar la simultaneidad',
      text: 'En su libro de divulgación, Einstein usa el ferrocarril para separar la simultaneidad del simple encuentro de señales.',
      url: book,
    },
    evidence: {
      date: 'EXPERIMENTO MENTAL',
      title: 'No hubo un «tren del experimento»',
      text: 'El dibujo organiza relojes, eventos y señales. Una fotografía añade los tiempos de viaje de la luz; no mide por sí sola una longitud simultánea.',
      url: book,
    },
  },
  'nos-vemos-a-la-vuelta': {
    question:
      'Los relojes vuelven a encontrarse. ¿Recorrieron la misma historia en el espacio-tiempo?',
    objects: [
      {
        kind: 'clock',
        name: 'Los relojes que se reúnen',
        text: 'La comparación final ocurre en un mismo evento. No depende de ver una imagen atrasada.',
      },
      {
        kind: 'map',
        name: 'El viaje dibujado',
        text: 'Cada tramo aporta tiempo propio. Ir, esperar y volver dejan una suma concreta.',
      },
      {
        kind: 'train',
        name: 'El cambio de recorrido',
        text: 'Quien vuelve cambia de sistema comóvil. Su criterio de simultaneidad remoto cambia, sin saltos del reloj local.',
      },
    ],
    idea: {
      date: '1911 · EXPERIMENTO MENTAL',
      title: 'El viajero de Paul Langevin',
      text: 'Langevin presentó un viaje de ida y vuelta para explorar cómo dos recorridos pueden acumular tiempos diferentes.',
      url: 'https://fr.wikisource.org/wiki/L%E2%80%99%C3%89volution_de_l%E2%80%99espace_et_du_temps',
    },
    evidence: {
      date: '1971 · VIAJE / 1972 · PUBLICACIÓN',
      title: 'Hafele y Keating llevan relojes en avión',
      text: 'Compararon relojes viajeros y terrestres. Esas pruebas incluyen movimiento y gravedad; no reproducen el giro instantáneo de nuestra nave ideal.',
      url: 'https://doi.org/10.1126/science.177.4044.168',
    },
  },
  'ascensor-de-einstein': {
    question:
      'Si soltás la balanza junto con vos, ¿qué fuerza queda sosteniéndote?',
    objects: [
      {
        kind: 'cabin',
        name: 'La cabina',
        text: 'Su aceleración cambia lo que ocurre respecto del piso. La comparación es local, en una región pequeña.',
      },
      {
        kind: 'scale',
        name: 'La balanza',
        text: 'Mide fuerza de apoyo. En caída libre puede marcar cero aunque siga habiendo gravedad.',
      },
      {
        kind: 'light',
        name: 'El pulso lateral',
        text: 'En coordenadas de una cabina acelerada, el recorrido de la luz deja de verse recto.',
      },
    ],
    idea: {
      date: '1907 · PRINCIPIO DE EQUIVALENCIA',
      title: 'La pista de la caída libre',
      text: 'Einstein conecta aceleración y gravedad local. El ascensor permite explorar qué puede distinguir un observador dentro.',
      url: book,
    },
    evidence: {
      date: '2022 · RESULTADOS FINALES',
      title: 'MICROSCOPE compara materiales en caída libre',
      text: 'La misión puso a prueba la universalidad de la caída libre con masas de distinta composición. Es una prueba de ese aspecto del principio.',
      url: 'https://cnes.fr/projets/microscope',
    },
  },
  'el-tiempo-tiene-altura': {
    question:
      'Si el ritmo cambia apenas un poquito, ¿cuánta diferencia se acumula después de varios días?',
    objects: [
      {
        kind: 'clock',
        name: 'El reloj elevado',
        text: 'A mayor potencial gravitatorio terrestre, un reloj estático acumula un poco más de tiempo propio.',
      },
      {
        kind: 'earth',
        name: 'El satélite',
        text: 'La altura y el movimiento aportan efectos distintos. En el GPS hay que considerar ambos.',
      },
      {
        kind: 'meter',
        name: 'La lectura corregida',
        text: 'Ajustar una señal no elimina la diferencia física entre los tiempos propios de los relojes.',
      },
    ],
    idea: {
      date: 'RELATIVIDAD GENERAL',
      title: 'La gravedad también interviene en el tiempo',
      text: 'Comparar relojes a distintas alturas permite hacer visible una diferencia de ritmo gravitatoria.',
      url: book,
    },
    evidence: {
      date: '2010 / 2022 · MEDICIONES',
      title: 'De centímetros a milímetros',
      text: 'El NIST comparó relojes separados 33 cm en 2010. JILA/NIST detectó en 2022 el efecto dentro de una nube atómica de escala milimétrica.',
      url: 'https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale',
    },
  },
  'orbita-que-no-se-cierra': {
    question:
      'Una vuelta parece cerrar. ¿Qué revela la dirección del siguiente punto más cercano al Sol?',
    objects: [
      {
        kind: 'orbit',
        name: 'El perihelio',
        text: 'Es el punto de la órbita más cercano al Sol. Su dirección puede avanzar de una vuelta a la siguiente.',
      },
      {
        kind: 'map',
        name: 'Las marcas de cada vuelta',
        text: 'La lupa amplía el giro del dibujo. El avance físico se sigue midiendo en segundos de arco.',
      },
      {
        kind: 'meter',
        name: 'El residuo de Mercurio',
        text: 'Unos 43″ por siglo corresponden al aporte relativista. No son toda la precesión observada.',
      },
    ],
    idea: {
      date: '1915 · EXPLICACIÓN',
      title: 'Einstein encuentra el aporte que faltaba',
      text: 'La relatividad general explica el pequeño aporte adicional a la precesión de Mercurio.',
      url: 'https://pgda.gsfc.nasa.gov/products/66',
    },
    evidence: {
      date: 'MESSENGER · SEGUIMIENTO ORBITAL',
      title: 'Las órbitas también prueban la gravedad',
      text: 'Las mediciones de la misión permiten refinar la dinámica de Mercurio. Este laboratorio aísla un Sol esférico; no calcula una efeméride completa.',
      url: 'https://pgda.gsfc.nasa.gov/products/66',
    },
  },
  'efecto-fotoelectrico': {
    question:
      '¿Estás sumando más fotones o aumentando la energía que lleva cada uno?',
    objects: [
      {
        kind: 'light',
        name: 'La fuente de luz',
        text: 'La frecuencia fija hf. El brillo del modelo fija la potencia y, con ella, el flujo de fotones.',
      },
      {
        kind: 'metal',
        name: 'La superficie del metal',
        text: 'La función trabajo es el costo de extracción. Si cada fotón no lo supera, no hay emisión en este ideal.',
      },
      {
        kind: 'meter',
        name: 'El medidor de corriente',
        text: 'Cuenta carga por segundo. Más corriente no implica que cada electrón salga con más energía.',
      },
    ],
    idea: {
      date: '1905 · LEY FOTOELÉCTRICA',
      title: 'Einstein propone cuantos de energía',
      text: 'La energía de un fotón se reparte entre extracción y energía cinética. El Nobel de 1921 destacó esta ley.',
      url: 'https://www.nobelprize.org/prizes/physics/1921/summary/',
    },
    evidence: {
      date: '1916 · CONTRASTE EXPERIMENTAL',
      title: 'Millikan compara frecuencia y energía',
      text: 'Sus mediciones contrastaron cuantitativamente la ecuación fotoeléctrica. El premio a Einstein se entregó en 1922.',
      url: 'https://doi.org/10.1103/PhysRev.7.355',
    },
  },
}
