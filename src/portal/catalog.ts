export interface Experiment {
  id: 'doble-rendija' | 'prisma' | 'hawking' | 'lente-gravitacional' | 'entropia' | 'acrecion' | 'horizonte' | 'reloj-de-luz' | 'tren-de-einstein' | 'nos-vemos-a-la-vuelta' | 'ascensor-de-einstein' | 'el-tiempo-tiene-altura'
  number: string
  field: string
  title: string
  subtitle: string
  question: string
  discovery: string
  tags: readonly string[]
  href: string
}

// El catálogo organiza la portada; cada laboratorio tiene su propia entrada HTML.
export const experiments: readonly Experiment[] = [
  {
    id: 'doble-rendija',
    number: '01',
    field: 'FÍSICA CUÁNTICA',
    title: 'La doble rendija',
    subtitle: 'De a una. Un patrón inesperado.',
    question: '¿Cómo pueden detecciones individuales formar un patrón de interferencia?',
    discovery:
      'Emití partículas, acumulá impactos y compará qué cambia cuando se mide por cuál rendija pasan.',
    tags: ['Interferencia', 'Probabilidad', 'Medición'],
    href: '/doble-rendija/',
  },
  {
    id: 'prisma',
    number: '02',
    field: 'ÓPTICA',
    title: 'El prisma de Newton',
    subtitle: 'El color ya estaba en la luz.',
    question: '¿El prisma crea los colores o separa los que componen la luz blanca?',
    discovery:
      'Dirigí el haz, girá el prisma y compará materiales para descubrir cómo se desvía cada color.',
    tags: ['Refracción', 'Dispersión', 'Luz'],
    href: '/prisma/',
  },
  {
    id: 'hawking',
    number: '03',
    field: 'AGUJEROS NEGROS',
    title: 'Radiación de Hawking',
    subtitle: 'Hasta la oscuridad tiene temperatura.',
    question: '¿Por qué un agujero negro que pierde masa se vuelve más caliente?',
    discovery:
      'Explorá masa, temperatura, entorno y entropía con cuatro retos y un modelo de evaporación ideal.',
    tags: ['Gravedad', 'Termodinámica', 'Física cuántica'],
    href: '/hawking/',
  },
  {
    id: 'lente-gravitacional',
    number: '04',
    field: 'RELATIVIDAD GENERAL',
    title: 'Lente gravitacional',
    subtitle: 'Una fuente. Más de un camino.',
    question: '¿Podés ver lo que hay detrás de un agujero negro?',
    discovery:
      'Compará la imagen con los caminos de la luz: alineá una fuente, explorá la sombra y cambiá la masa con cuatro retos.',
    tags: ['Luz', 'Geodésicas', 'Agujeros negros'],
    href: '/lente-gravitacional/',
  },
  {
    id: 'entropia',
    number: '05',
    field: 'AGUJEROS NEGROS',
    title: 'Entropía de Bekenstein–Hawking',
    subtitle: 'La información también tiene una superficie.',
    question: '¿Por qué la entropía de un agujero negro sigue al área de su horizonte?',
    discovery:
      'Agrandá el horizonte, descifrá la fórmula y contá la radiación con cuatro retos sobre área, entropía y segunda ley.',
    tags: ['Entropía', 'Área', 'Información'],
    href: '/entropia/',
  },
  {
    id: 'acrecion',
    number: '06',
    field: 'AGUJEROS NEGROS',
    title: 'Cómo vemos lo invisible',
    subtitle: 'El agujero es oscuro. Sus pistas, no.',
    question: '¿Cómo detectamos un agujero negro si su interior no deja escapar luz?',
    discovery:
      'Encendé el disco de acreción, curvá su luz y pesá una masa invisible con una estrella testigo y cuatro retos.',
    tags: ['Acreción', 'Doppler', 'Órbitas'],
    href: '/acrecion/',
  },
  {
    id: 'horizonte',
    number: '07',
    field: 'AGUJEROS NEGROS',
    title: 'Al borde del horizonte',
    subtitle: 'El reloj sigue. El mensaje tarda.',
    question: '¿Qué pasa con el tiempo y la luz cuando una sonda cruza el horizonte?',
    discovery: 'Compará caída libre y relojes sostenidos, enviá señales y descubrí qué puede recibir alguien que espera afuera con cuatro retos.',
    tags: ['Caída libre', 'Relojes', 'Causalidad'],
    href: '/horizonte/',
  },
  {
    id: 'reloj-de-luz',
    number: '08',
    field: 'RELATIVIDAD ESPECIAL',
    title: 'El reloj de luz',
    subtitle: 'Dos miradas. Una misma luz.',
    question: '¿Un segundo dura lo mismo para todos?',
    discovery: 'Seguí un pulso desde la nave y la estación: cambiá la velocidad y descubrí la dilatación temporal con cuatro retos.',
    tags: ['Einstein', 'Luz', 'Tiempo propio'],
    href: '/reloj-de-luz/',
  },
  {
    id:'tren-de-einstein',number:'09',field:'RELATIVIDAD ESPECIAL',title:'El tren de Einstein',
    subtitle:'Ocurrió. Viajó. Llegó.',question:'¿Qué significa “al mismo tiempo”?',
    discovery:'Compará fechas y llegadas de luz desde el tren y el andén. Medí longitudes con cuatro retos de simultaneidad y relatividad especial.',
    tags:['Einstein','Simultaneidad','Longitudes'],href:'/tren-de-einstein/',
  },
  {
    id:'nos-vemos-a-la-vuelta', number:'10', field:'RELATIVIDAD ESPECIAL', title:'Nos vemos a la vuelta',
    subtitle:'Un reencuentro. Dos historias.', question:'¿Podemos volver con edades diferentes?',
    discovery:'Planeá el viaje de los gemelos, compará sus relojes y explorá el tiempo propio, los giros y la simultaneidad con dos vistas y cuatro retos.',
    tags:['Einstein','Gemelos','Tiempo propio'], href:'/nos-vemos-a-la-vuelta/',
  },
  {
    id:'ascensor-de-einstein', number:'11', field:'RELATIVIDAD GENERAL', title:'El ascensor de Einstein',
    subtitle:'Una cabina pequeña. Una idea enorme.', question:'¿Gravedad o aceleración?',
    discovery:'Soltá pelotas, compará la balanza y seguí un pulso de luz en cuatro escenarios para descubrir el principio de equivalencia con cuatro retos.',
    tags:['Einstein','Caída libre','Equivalencia'], href:'/ascensor-de-einstein/',
  },
  {
    id:'el-tiempo-tiene-altura', number:'12', field:'RELATIVIDAD GENERAL', title:'El tiempo tiene altura',
    subtitle:'La misma Tierra. Distintos tiempos.', question:'¿Un segundo pasa igual en el suelo y en órbita?',
    discovery:'Elevá un reloj, compará el tiempo propio y explorá el balance entre gravedad y movimiento en el GPS con cuatro retos educativos.',
    tags:['Einstein','Relojes','GPS'], href:'/el-tiempo-tiene-altura/',
  },
]
