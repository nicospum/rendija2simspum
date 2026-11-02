// Consolidate recorded review decisions; does not run or approve the laboratories.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const evidenceDirectory = '../../../qa-integral-retos-2026-11-02/'
const read = async file => JSON.parse(await fs.readFile(path.resolve(directory, file), 'utf8'))
const inventory = await read('inventario.json')
const science = await read('qa-ciencia-estado.json')
const einstein = await read(evidenceDirectory + 'einstein-product-manifest.json')
const einsteinCases = await read(evidenceDirectory + 'einstein-product-results.json')
const blackHoles = await read(evidenceDirectory + 'qa-agujeros-coverage.json')
const blackHoleCases = await read(evidenceDirectory + 'qa-agujeros-cases.json')
const crossCases = await read(evidenceDirectory + 'aceptacion-maldacena-results.json')
const opticalAcceptance = await read(evidenceDirectory + 'optical-mini-independent-acceptance.json')
const reference = (file, pointer, expected) => ({ file, ...(pointer ? { pointer } : {}), ...(expected ? { expected } : {}) })
const external = (file, pointer, expected) => reference(evidenceDirectory + file, pointer, expected)
const principal = inventory.labs.flatMap(lab => lab.challenges.map(challenge => ({ ...challenge, activity: lab.id, route: lab.route, kind: 'PRINCIPAL' })))
const auxiliary = inventory.auxiliaryActivities.flatMap(activity => (activity.challenges ?? []).map(challenge => ({ ...challenge, activity: activity.id, route: activity.route, kind: 'AUXILIAR' })))

const scienceById = new Map()
for (const collection of ['labs', 'auxiliaryActivities']) {
  science[collection].forEach((activity, activityIndex) => {
    activity.challenges?.forEach((challenge, challengeIndex) => {
      scienceById.set(challenge.id, {
        status: challenge.status,
        reviewer: science.reviewer,
        reviewed: science.reviewed,
        candidate: science.candidate,
        scope: challenge.scope ?? 'Consigna, conclusión, modelo, unidades y límites; no sustituye la prueba de interacción.',
        sourceIds: challenge.sources ?? activity.sources,
        evidence: [reference('qa-ciencia-estado.json', `/${collection}/${activityIndex}/challenges/${challengeIndex}`, { id: challenge.id }), reference('qa-ciencia.md'), reference('fuentes.json')],
      })
    })
  })
}

const products = new Map()
einstein.laboratories.forEach((lab, labIndex) => lab.challenges.forEach((challenge, challengeIndex) => {
  products.set(challenge.id, {
    status: challenge.qaProduct,
    reviewer: 'retos_einstein',
    assignment: 'Einstein',
    candidate: einstein.candidate,
    scope: 'QA independiente de implementación: correcto, incorrecto, incompleto, condición negativa, reinicio e historia según registros; todos los retos a390×844 y tamaños adicionales representativos.',
    evidence: [
      reference('qa-einstein.md'),
      external('einstein-product-manifest.json', `/laboratories/${labIndex}/challenges/${challengeIndex}`, { id: challenge.id }),
      ...challenge.evidence.map(label => {
        const index = einsteinCases.findIndex(record => record.label === label)
        if (index < 0) throw new Error(`${challenge.id}: missing Einstein case ${label}`)
        return external('einstein-product-results.json', `/${index}`, { label })
      }),
    ],
  })
}))
products.set(einstein.auxiliaryChallenge.id, {
  status: einstein.auxiliaryChallenge.qaProduct,
  reviewer: 'retos_einstein',
  assignment: 'Einstein',
  candidate: einstein.candidate,
  scope: 'Pregunta auxiliar sin prerrequisito de medición: sin respuesta, respuesta incorrecta/correcta y recarga. Las respuestas se documentan en el informe y manifest; el snapshot del cuaderno conserva la correcta.',
  evidence: [reference('qa-einstein.md'), external('einstein-product-manifest.json', '/auxiliaryChallenge', { id: einstein.auxiliaryChallenge.id }), external('einstein-widget-results.json', '/field'), external('einstein-field-reset.json', undefined, { id: einstein.auxiliaryChallenge.id })],
})

blackHoles.results.forEach((challenge, index) => {
  products.set(challenge.id, {
    status: challenge.qaProduct,
    reviewer: 'retos_agujeros',
    assignment: 'Agujeros negros, Page y Contar información',
    candidate: blackHoles.candidate,
    scope: 'QA independiente de implementación: correcto, incorrecto, incompleto y límites/reinicio según registros. Cinco laboratorios inicialmente públicos; correcciones, Page y Contar información contrastados en1027.',
    evidence: [reference('qa-agujeros-negros.md'), external('qa-agujeros-coverage.json', `/results/${index}`, { id: challenge.id }), ...['correct', 'incorrect', 'incomplete'].map(key => {
      const label = challenge[key]
      const caseIndex = blackHoleCases.findIndex(record => record.label === label)
      if (caseIndex < 0) throw new Error(`${challenge.id}: missing black-hole case ${label}`)
      return external('qa-agujeros-cases.json', `/${caseIndex}`, { label })
    })],
  })
})

const rootFiles = ['prisma', 'doble', 'entrelazados', 'geometria', 'diccionario', 'temperatura']
for (const prefix of rootFiles) {
  const file = prefix + '-product-results.json'
  const data = await read(evidenceDirectory + file)
  data.results.forEach((challenge, index) => {
    for (const required of ['correct', 'incorrect', 'incomplete']) {
      if (!challenge[required]) throw new Error(`${challenge.id}: missing ${required} product evidence`)
    }
    const optical = prefix === 'prisma' || prefix === 'doble'
    products.set(challenge.id, {
      status: 'APROBADO',
      reviewer: 'root',
      assignment: 'Óptica y Maldacena',
      candidate: data.candidate,
      scope: optical
        ? 'Cobertura funcional previa al ajuste visual compacto: comparación abierta, no selector de respuesta. Incorrecto significa configuración o comparación inválida; no calificación de una predicción escrita. La aceptación del ajuste visual final se registra por separado.'
        : 'Correcto, incorrecto, incompleto y sin predicción en390×844; reinicio por reto en holografía y resetBoundary en entrelazados. Esta ejecución de root no se presenta como aceptación independiente.',
      evidence: [external(file, `/results/${index}`, { id: challenge.id }), ...(data.resetBoundary ? [external(file, '/resetBoundary')] : [])],
    })
  })
}

const sampled = {
  'entrelazados': 'entrelazados/principal/reto-03',
  'geometria': 'holografia/geometria/reto-01',
  'diccionario': 'holografia/diccionario/reto-03',
  'temperatura': 'holografia/temperatura/reto-04',
}
const acceptanceFor = (challenge, product) => {
  const optical = ['prisma', 'doble-rendija'].includes(challenge.activity)
  if (optical) {
    const index = opticalAcceptance.results.findIndex(result => result.lab === challenge.activity && result.reto === challenge.index + 1)
    if (index < 0) throw new Error(`${challenge.id}: missing optical control acceptance`)
    return {
      status: opticalAcceptance.status,
      reviewer: opticalAcceptance.reviewer,
      mode: 'ACEPTACION_INDEPENDIENTE_AJUSTE_VISUAL',
      candidate: opticalAcceptance.candidate,
      scope: 'Cobertura funcional previa más repetición independiente de los ocho controles del ajuste compacto a390×844 y muestras320/667. Comparación abierta, no calificación de respuestas. El visor3D sigue accesible; en horizontal hace falta scroll normal.',
      evidence: [reference('aceptacion-optica.md'), external('optical-mini-independent-acceptance.json', `/results/${index}`, { lab: challenge.activity, reto: challenge.index + 1 })],
    }
  }
  if (product.reviewer !== 'root') return {
    status: 'APROBADO',
    reviewer: product.reviewer,
    mode: 'QA_INDEPENDIENTE_DE_IMPLEMENTACION',
    scope: 'Aceptación dentro del alcance del pase de producto y retest de correcciones documentados. No afirma una segunda repetición independiente completa de todos los intentos.',
    evidence: [reference(product.reviewer === 'retos_einstein' ? 'qa-einstein.md' : 'qa-agujeros-negros.md'), product.evidence[1]],
  }
  const block = challenge.activity === 'entrelazados' ? 'entrelazados' : challenge.section
  const repeatedId = sampled[block]
  const records = crossCases.flatMap((record, index) => record.label.startsWith(block + '-') ? [external('aceptacion-maldacena-results.json', `/${index}`, { label: record.label })] : [])
  if (!repeatedId || !records.length) throw new Error(`${challenge.id}: missing independent block acceptance`)
  return {
    status: 'APROBADO',
    reviewer: 'retos_agujeros',
    mode: 'ACEPTACION_POR_BLOQUE_CON_MUESTRA',
    block,
    independentlyRepeatedId: repeatedId,
    thisIdIndependentlyRepeated: repeatedId === challenge.id,
    scope: 'Revisión de los registros completos de root y un reto repetido en navegador por bloque. Este ID se acepta dentro del bloque; sólo el ID indicado tiene repetición independiente. No equivale a repetir los16 retos.',
    evidence: [reference('aceptacion-maldacena.md'), ...records],
  }
}

const challenges = [...principal, ...auxiliary].map(challenge => {
  const qaScience = scienceById.get(challenge.id)
  const qaProduct = products.get(challenge.id)
  if (!qaScience || !qaProduct) throw new Error(`${challenge.id}: missing science or product review`)
  const acceptance = acceptanceFor(challenge, qaProduct)
  return {
    id: challenge.id,
    activity: challenge.activity,
    route: challenge.route,
    kind: challenge.kind,
    challengeKind: challenge.challengeKind,
    nativeId: challenge.nativeId ?? null,
    source: challenge.source,
    status: [qaScience.status, qaProduct.status, acceptance.status].every(status => status === 'APROBADO') ? 'APROBADO' : 'PENDIENTE',
    qaScience,
    qaProduct,
    acceptance,
  }
})
const counts = values => values.reduce((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {})
const state = {
  schemaVersion: 1,
  reviewed: '2026-11-02',
  baseline: inventory.baseline,
  candidate: 'Base e2e07a7 + lote local de revisión integral; aprobación limitada al candidato y evidencias declaradas, no al sitio público posterior.',
  role: 'Estado consolidado único por ID. Inventario y documentos fuente remiten aquí; este script reúne dictámenes existentes y no crea aprobaciones mediante tests.',
  reproduce: ['node docs/revision-integral/inventario.mjs', 'node docs/revision-integral/generar-estado.mjs', 'node docs/revision-integral/verificar-estado.mjs'],
  evidenceBase: 'Rutas relativas a este archivo. Los registros de navegador están fuera del checkout; el verificador exige tenerlos disponibles para no acreditar evidencia ausente.',
  summary: {
    experiments: inventory.experiments,
    mainChallenges: principal.length,
    auxiliaryChallenges: auxiliary.length,
    totalChallenges: challenges.length,
    challengeKinds: counts(challenges.map(challenge => challenge.challengeKind)),
    overall: counts(challenges.map(challenge => challenge.status)),
    science: counts(challenges.map(challenge => challenge.qaScience.status)),
    product: counts(challenges.map(challenge => challenge.qaProduct.status)),
    productByAssignment: counts(challenges.map(challenge => challenge.qaProduct.assignment)),
    acceptance: counts(challenges.map(challenge => challenge.acceptance.status)),
    independentAcceptanceModes: counts(challenges.map(challenge => challenge.acceptance.mode)),
    maldacenaIndependentlyRepeatedChallenges: challenges.filter(challenge => challenge.acceptance.thisIdIndependentlyRepeated).length,
  },
  limitations: ['Revisión interna de agentes; no certificación externa ni prueba de comprensión con participantes.', 'Los81 IDs tienen prueba de producto registrada;8 comparaciones ópticas son abiertas y no tienen respuesta incorrecta seleccionable.', 'Maldacena: cobertura primaria de16 retos más aceptación cruzada por cuatro bloques con una muestra por bloque; no dos repeticiones completas.', 'Tamaños emulados de navegador; Safari, teléfonos físicos y tecnologías de asistencia reales siguen pendientes según el acuerdo con el usuario.', 'Publicación y comprobación del commit integrado en spumexp.lat corresponden al cierre del coordinador.'],
  challenges,
  nonChallengeActivities: [
    { id: 'energia-en-reposo', source: 'src/einstein/EnergyNotebook.tsx', countedAsChallenge: false, qaScience: 'APROBADO', qaProduct: 'APROBADO', reviewer: 'retos_einstein', evidence: [reference('qa-einstein.md'), external('einstein-widget-results.json', '/energy'), external('einstein-field-reset.json')] },
    { id: 'escalas-agujeros-negros', source: 'src/series', countedAsChallenge: false, qaScience: 'APROBADO', qaProduct: 'APROBADO', reviewer: 'retos_agujeros', evidence: [reference('qa-agujeros-negros.md'), external('qa-atlas-agujeros.json')] },
  ],
}
await fs.writeFile(path.join(directory, 'estado.json'), JSON.stringify(state, null, 2) + '\n')
console.log(JSON.stringify(state.summary, null, 2))
