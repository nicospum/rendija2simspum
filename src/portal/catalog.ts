export interface Experiment {
  id: 'doble-rendija' | 'prisma' | 'hawking'
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
]
