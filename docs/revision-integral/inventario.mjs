// Reproduce the reviewed catalog snapshot, not laboratories added after this audit.
import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import ts from 'typescript'

const historicalSourceRef = '2f812e4eae5d06e42c6549a2b3616de1f3d8c1aa'
const readReviewedSource = (file) =>
  execFileSync('git', ['show', `${historicalSourceRef}:${file}`], { encoding: 'utf8' })

const metadata = {
  'doble-rendija': ['src/education/doubleSlitLearning.ts', 'LESSONS', 'src/physics/interference.ts', 'docs/MODELO_DOBLE_RENDIJA.md', 'Modelo idealizado probabilístico de Fraunhofer', 'Ondas, probabilidad y frecuencias relativas'],
  prisma: ['src/prisma/education/prismLearning.ts', 'LESSONS', 'src/prisma/physics/optics.ts', 'docs/MODELO_PRISMA.md', 'Óptica geométrica dispersiva', 'Color, rayos y ángulos'],
  hawking: ['src/hawking/learning.ts', 'LESSONS', 'src/hawking/physics.ts', 'docs/HAWKING_LABORATORIO.md', 'Modelo semiclásico de Schwarzschild con emisión idealizada', 'Masa, temperatura y balance térmico'],
  'lente-gravitacional': ['src/lente/learning.ts', 'LESSONS', 'src/lente/physics.ts', 'docs/LENTE_GRAVITACIONAL.md', 'Geodésicas nulas de Schwarzschild', 'Rayos de luz y distancias'],
  entropia: ['src/entropia/learning.ts', 'LESSONS', 'src/entropia/physics.ts', 'docs/ENTROPIA_LABORATORIO.md', 'Termodinámica idealizada de Schwarzschild', 'Área, proporciones e información'],
  acrecion: ['src/acrecion/learning.ts', 'LESSONS', 'src/acrecion/physics.ts', 'docs/ACRECION_LABORATORIO.md', 'Disco delgado aproximado y transferencia relativista', 'Órbitas, luz y temperatura'],
  horizonte: ['src/horizonte/learning.ts', 'LESSONS', 'src/horizonte/physics.ts', 'docs/HORIZONTE_LABORATORIO.md', 'Caída y luz radial en coordenadas regulares', 'Relojes y señales'],
  'reloj-de-luz': ['src/reloj/learning.ts', 'LESSONS', 'src/reloj/physics.ts', 'docs/RELOJ_DE_LUZ.md', 'Relatividad especial, reloj ideal', 'Distancia, rapidez y duración'],
  'tren-de-einstein': ['src/tren/learning.ts', 'LESSONS', 'src/tren/physics.ts', 'docs/TREN_DE_EINSTEIN.md', 'Transformaciones de Lorentz y protocolos de medida', 'Emisión frente a recepción'],
  'nos-vemos-a-la-vuelta': ['src/gemelos/learning.ts', 'LESSONS', 'src/gemelos/physics.ts', 'docs/GEMELOS_LABORATORIO.md', 'Tiempo propio en trayectos inerciales por tramos', 'Reloj de luz y sistemas de referencia'],
  'ascensor-de-einstein': ['src/ascensor/learning.ts', 'LESSONS', 'src/ascensor/physics.ts', 'docs/ASCENSOR_LABORATORIO.md', 'Equivalencia local, cabina acelerada ideal', 'Caída libre y fuerza de apoyo'],
  'el-tiempo-tiene-altura': ['src/altura/learning.ts', 'LESSONS', 'src/altura/physics.ts', 'docs/ALTURA_LABORATORIO.md', 'Relojes estáticos y orbitales en Schwarzschild', 'Tiempo propio y movimiento'],
  'orbita-que-no-se-cierra': ['src/orbita/learning.ts', 'LESSONS', 'src/orbita/physics.ts', 'docs/ORBITA_MERCURIO.md', 'Órbitas ligadas de Schwarzschild y comparación newtoniana', 'Órbita, perihelio y ángulos'],
  'efecto-fotoelectrico': ['src/fotoelectrico/learning.ts', 'LESSONS', 'src/fotoelectrico/physics.ts', 'docs/EFECTO_FOTOELECTRICO.md', 'Balance energético ideal de fotones y electrones', 'Frecuencia, energía y potencia'],
  entrelazados: ['src/maldacena/quantum/EntanglementLab.tsx', 'QUANTUM_LESSONS', 'src/maldacena/quantum/physics.ts', 'docs/MALDACENA_INFORMACION.md', 'Dos qubits y muestreo de Born', 'Probabilidad e información del todo y las partes'],
  holografia: ['src/maldacena/geometry/learning.ts', 'GEOMETRY_LESSONS', 'src/maldacena/geometry/physics.ts', 'docs/MALDACENA_GEOMETRIA.md', 'AdS3/CFT2 y BTZ estacionario idealizados', 'Entrelazamiento, longitudes y regulador'],
  'curva-de-page': ['src/maldacena/page/learning.ts', 'LESSONS', 'src/maldacena/page/physics.ts', 'docs/PAGE_MODELO.md', 'Particiones de estados puros de qubits; no dinámica de evaporación', 'Entropía reducida y correlaciones'],
}

const controlsAndReadouts = {
  'doble-rendija': 'Emisión individual/continua y pausa; partícula, λ, flujo, tamaño de pulso, número/ancho/separación de aberturas, detector y distancia. Resultados: puntos, histograma normalizado, teoría opcional, referencia y separación/ancho calculados.',
  prisma: 'Fuente, dirección/posición/ancho/intensidad, material, giro y vértice, distancia de pantalla, pausa de lectura y cámara. Resultados: rayos y colores, incidencia/desviación, n y Δz; comparación con referencia.',
  hawking: 'Masa, entorno/fondo térmico, fracción temporal y reproducción; navegación del visor. Resultados: radio, temperatura, potencia, balance, vida ideal y entropía. Los puntos son ayudas de representación.',
  'lente-gravitacional': 'Masa, lente activada, fuente/cámara, dirección y azimut del rayo, imagen/recorridos. Resultados: geodésicas, captura/escape, sombra y escalas físicas.',
  entropia: 'Masa inicial, evaporación fraccional, lupa, vista área/contabilidad y factores de lectura. Resultados: área, S/kB, bits, balance térmico exterior; el puente de información tiene controles propios.',
  acrecion: 'Masa, alimentación de gas, inclinación, transferencia/Doppler, luz curvada, vista disco/estrella y órbita testigo. Resultados: imagen, flujo/temperatura, frecuencia y período/inferencia de masa.',
  horizonte: 'Sostener/caer, radio, tiempo del mapa, masa, separación de pulsos, emisión/escucha y reproducción. Resultados: tiempos propios, llegadas/corrimiento, mapa de futuros y señales sin llegada.',
  'reloj-de-luz': 'Rapidez, reloj seguido, fracción del tic, reproducción, vistas y referencias. Resultados: caminos, fechas del mismo evento, período propio/coordinado y ritmo.',
  'tren-de-einstein': 'Rapidez, emisiones y protocolo de simultaneidad, receptor, reproducción/instante y medición de extremos. Resultados: fechas, recepciones, registros y longitudes por sistema.',
  'nos-vemos-a-la-vuelta': 'Rapideces por tramo, duración en casa, espera, instante del viaje/giro y vistas. Resultados: tiempo propio acumulado, simultaneidad remota, líneas de universo y reencuentro.',
  'ascensor-de-einstein': 'Cabina/nave apoyada, acelerada o libre, intensidad de aceleración, masas y objetos/luz. Resultados: balanza, trayectorias relativas, ausencia de apoyo y caída ampliada del rayo.',
  'el-tiempo-tiene-altura': 'Altura, duración, movimiento orbital y ajuste GPS, referencias y medición. Resultados: deriva temporal, componentes gravitatoria/cinemática y lectura ajustada frente a tiempo propio.',
  'orbita-que-no-se-cierra': 'Newton/Einstein, tamaño orbital, excentricidad, fase/vueltas, lupa y registros. Resultados: perihelio, avance por vuelta/siglo, comparación y órbitas calculadas.',
  'efecto-fotoelectrico': 'Frecuencia, potencia/brillo, material y registros. Resultados: umbral, emisión, energía máxima/potencial de frenado y corriente ideal; fotones/electrones ilustrativos.',
  entrelazados: 'Preparación θ y pureza/mezcla, bases Z/X por lado, muestreo de pares, inspección local/conjunta. Resultados: probabilidades, frecuencias, coincidencias y entropías de estados.',
  holografia: 'Sección, intervalo, centro, regulador, temperatura, vistas y registro. Resultados: geodésica/recta, entropía CFT/geométrica, residuo regulado, horizonte BTZ y pendiente térmica.',
  'curva-de-page': 'Reparto B/R, número/preparación de qubits, referencias Page/independiente y lectura conjunta/separada. Resultados: espectros reducidos, S(R), suma individual, curva y extremos puros.',
}

function value(node) {
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) return value(node.expression)
  if (ts.isStringLiteralLike(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(value)
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText().replaceAll("'", ''), value(p.initializer)]))
  return node.getText()
}
async function authoredArray(file, name) {
  const source = ts.createSourceFile(file, readReviewedSource(file), ts.ScriptTarget.Latest, true)
  let result
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText() === name && node.initializer) result = value(node.initializer)
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (!Array.isArray(result)) throw new Error(`${file}: array ${name} not found`)
  return result
}

const catalog = await authoredArray('src/portal/catalog.ts', 'experiments')
const experiments = []
for (const lab of catalog) {
  const [lessonFile, array, physics, documentation, model, prerequisites] = metadata[lab.id]
  const sections = [{ id: lab.id === 'holografia' ? 'geometria' : 'principal', source: lessonFile, array }]
  if (lab.id === 'holografia') sections.push(
    { id: 'diccionario', source: lessonFile, array: 'DUALITY_LESSONS' },
    { id: 'temperatura', source: 'src/maldacena/thermal/ThermalLab.tsx', array: 'LESSONS' },
  )
  const challenges = []
  for (const section of sections) {
    const lessons = await authoredArray(section.source, section.array)
    lessons.forEach((lesson, index) => challenges.push({
      ...lesson,
      id: `${lab.id}/${section.id}/reto-${String(index + 1).padStart(2, '0')}`,
      nativeId: lesson.id ?? null,
      challengeKind: lesson.choices ? 'choice-observation' : 'open-comparison',
      section: section.id,
      index,
      source: section.source,
      statusReference: 'estado.json',
    }))
  }
  experiments.push({
    id: lab.id, name: lab.title, route: lab.href, discipline: lab.field,
    publication: 'ACTIVO', objective: lab.question, firstAction: lab.discovery,
    model, prerequisites, sourcesAndLimits: documentation, physics,
    controlsAndReadouts: controlsAndReadouts[lab.id],
    sharedComponents: ['src/components/ui/LabJourney.tsx', 'src/education/HelpMode.tsx', ...(lab.id === 'prisma' || lab.id === 'doble-rendija' ? [] : ['src/components/ui/SceneConsole.tsx'])],
    challengeSource: lessonFile, challengeCount: challenges.length, challenges,
    statusReference: 'estado.json',
  })
}
const auxiliaryActivities = [
  { id: 'contar-informacion', route: '/entropia/#information-bridge', source: 'src/maldacena/quantum/CountingBridge.tsx', statusReference: 'estado.json', challengeCount: 4,
    challenges: (await authoredArray('src/maldacena/quantum/CountingBridge.tsx', 'QUESTIONS')).map((lesson, index) => ({ ...lesson, id: `contar-informacion/principal/reto-${String(index + 1).padStart(2, '0')}`, nativeId: lesson.id ?? null, index, source: 'src/maldacena/quantum/CountingBridge.tsx', challengeKind: 'choice-observation', statusReference: 'estado.json' })),
  },
  { id: 'energia-en-reposo', route: '/einstein/', source: 'src/einstein/EnergyNotebook.tsx', statusReference: 'estado.json' },
  { id: 'ecuacion-de-campo', route: '/einstein/#en-field', source: 'src/einstein/FieldEquationNotebook.tsx', statusReference: 'estado.json', challengeCount: 1, challenges: [
    { id: 'ecuacion-de-campo/principal/reto-01', index: 0, source: 'src/einstein/FieldEquationNotebook.tsx', question: '¿Puede haber gravedad donde no hay materia local?', choices: ['Sí: por ejemplo, fuera de una estrella', 'El vacío siempre es espacio-tiempo plano'], answer: 0, challengeKind: 'choice-knowledge', statusReference: 'estado.json' },
  ] },
  { id: 'escalas-agujeros-negros', route: '/agujeros-negros/', source: 'src/series', statusReference: 'estado.json' },
]
const inventory = {
  project: 'SPUM · Experimentos para entender', domain: 'https://www.spumexp.lat/',
  baseline: 'e2e07a7', historicalSourceRef, experiments: experiments.length,
  mainChallenges: experiments.reduce((sum, lab) => sum + lab.challengeCount, 0),
  challenges: experiments.reduce((sum, lab) => sum + lab.challengeCount, 0) + auxiliaryActivities.reduce((sum, activity) => sum + (activity.challenges?.length ?? 0), 0),
  labs: experiments,
  aliases: { '/espacio-con-frontera/': 'holografia/geometria', '/dos-lenguajes/': 'holografia/diccionario', '/frontera-caliente/': 'holografia/temperatura' },
  auxiliaryActivities,
  excluded: [ { id: 'legacy-holography-duplicates', reason: 'Tres URL históricas son alias activos, probados como compatibilidad; no tres laboratorios adicionales.' } ],
  unpublishedDrafts: 'En el catálogo del commit indicado por historicalSourceRef no hay borradores ni laboratorios deshabilitados; las 24 entradas corresponden a ese build histórico, no al catálogo posterior.',
}
await fs.writeFile('docs/revision-integral/inventario.json', JSON.stringify(inventory, null, 2) + '\n')
console.log(JSON.stringify({ experiments: inventory.experiments, challenges: inventory.challenges, labs: experiments.map(lab => [lab.id, lab.challengeCount]) }, null, 2))
