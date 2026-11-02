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
  {
    id: 'curva-de-page',
    title: '¿Se pierde la información?',
    question: '¿Qué nos cuenta la curva de Page?',
    detail:
      'Reuní qubits de radiación, compará entropías y buscá las pistas en las correlaciones.',
    symbol: '⌁',
    color: '#8fe6ff',
  },
] as const
export type ChapterId = (typeof chapters)[number]['id']

// Learning-unit IDs remain stable so earlier discoveries keep their passport stamps.
export const holographySections = [
  { ...chapters[1], slug: 'geometria', label: 'Geometría AdS' },
  { ...chapters[2], slug: 'diccionario', label: 'Dos lenguajes' },
  { ...chapters[3], slug: 'temperatura', label: 'Frontera caliente' },
] as const
export type HolographySection = (typeof holographySections)[number]['slug']
export const laboratories = [
  { ...chapters[0], href: '/entrelazados/', chapterIds: [chapters[0].id] },
  {
    id: 'holografia',
    title: 'Holografía: geometría y frontera',
    question: '¿Cómo se traduce información en geometría?',
    detail:
      'Un laboratorio, tres secciones: geometría AdS, el diccionario holográfico y una frontera caliente.',
    symbol: '≍',
    color: '#bba5ff',
    href: '/holografia/',
    chapterIds: [chapters[1].id, chapters[2].id, chapters[3].id],
  },
  { ...chapters[4], href: '/curva-de-page/', chapterIds: [chapters[4].id] },
] as const
export function chapterHref(id: string) {
  const section = holographySections.find((section) => section.id === id)
  return section ? `/holografia/?seccion=${section.slug}` : `/${id}/`
}
export function resolveHolographySection(
  pathname: string,
  hash: string,
  search = '',
): HolographySection {
  const explicit = holographySections.find((section) => hash === `#${section.slug}`)
  if (explicit) return explicit.slug
  const requested = new URLSearchParams(search).get('seccion')
  const queried = holographySections.find((section) => section.slug === requested)
  if (queried) return queried.slug
  const legacy = holographySections.find(
    (section) => pathname.replace(/\/$/, '') === `/${section.id}`,
  )
  return legacy?.slug ?? 'geometria'
}
export const passport = createPassportStore(
  chapters.map((c) => c.id),
  'spum.maldacena.passport.v1',
  'spum-maldacena-passport',
)
