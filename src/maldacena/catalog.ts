import { createPassportStore } from '../shared/passport.ts'

export const chapters = [
  {
    id: 'entrelazados',
    title: 'Entrelazados',
    question: '¿El todo puede saber más que sus partes?',
    detail:
      'Prepará dos qubits, elegí cómo medirlos y descubrí qué guarda una correlación.',
    symbol: '↔',
    color: '#a0edcf',
  },
  {
    id: 'espacio-con-frontera',
    title: 'Un espacio con frontera',
    question: '¿La línea más corta siempre parece recta?',
    detail: 'Mové los extremos y medí distancias según la geometría de anti-de Sitter.',
    symbol: '⌒',
    color: '#bba5ff',
  },
  {
    id: 'dos-lenguajes',
    title: 'Dos lenguajes, una misma respuesta',
    question: '¿Podemos calcular información con una geometría?',
    detail:
      'Compará un intervalo en la frontera y una curva en el interior: un caso de holografía.',
    symbol: '≍',
    color: '#ffd58c',
  },
  {
    id: 'frontera-caliente',
    title: 'Calentar la frontera',
    question: '¿Dónde aparece el horizonte al cambiar la temperatura?',
    detail: 'Explorá estados térmicos y el exterior de un agujero negro BTZ.',
    symbol: '♨',
    color: '#ffad9e',
  },
] as const
export type ChapterId = (typeof chapters)[number]['id']
export const passport = createPassportStore(
  chapters.map((c) => c.id),
  'spum.maldacena.passport.v1',
  'spum-maldacena-passport',
)
