// Evidence and inventory consistency check. This is not a browser/markup test.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const repository = path.resolve(directory, '../..')
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'))
const inventory = await read(path.join(directory, 'inventario.json'))
const state = await read(process.argv[2] ? path.resolve(process.argv[2]) : path.join(directory, 'estado.json'))
const science = await read(path.join(directory, 'qa-ciencia-estado.json'))
const registry = await read(path.join(directory, 'fuentes.json'))
const require = (condition, message) => { if (!condition) throw new Error(message) }
const unique = (values, context) => require(new Set(values).size === values.length, `${context}: duplicate IDs`)
const equalSet = (actual, expected, context) => {
  const a = new Set(actual)
  const e = new Set(expected)
  const missing = [...e].filter(id => !a.has(id))
  const extra = [...a].filter(id => !e.has(id))
  require(!missing.length && !extra.length, `${context}: missing=${JSON.stringify(missing)} extra=${JSON.stringify(extra)}`)
}
const tally = values => values.reduce((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {})
const equalCounts = (actual, expected, context) => {
  equalSet(Object.keys(actual), Object.keys(expected), `${context} categories`)
  for (const key of Object.keys(expected)) require(actual[key] === expected[key], `${context}.${key}: ${actual[key]} != ${expected[key]}`)
}

const main = inventory.labs.flatMap(lab => {
  require(lab.challengeCount === lab.challenges.length, `${lab.id}: challengeCount does not match authored inventory`)
  return lab.challenges
})
const auxiliary = inventory.auxiliaryActivities.flatMap(activity => {
  if (activity.challenges) require(activity.challengeCount === activity.challenges.length, `${activity.id}: auxiliary challengeCount mismatch`)
  return activity.challenges ?? []
})
const authored = [...main, ...auxiliary]
const ids = authored.map(challenge => challenge.id)
const stateIds = state.challenges.map(challenge => challenge.id)
require(inventory.labs.length === 17 && inventory.experiments === 17, 'Catalog must contain the17 active laboratories')
require(main.length === 76 && auxiliary.length === 5 && authored.length === 81, 'Inventory must contain76 principal +5 auxiliary =81 challenges')
require(inventory.mainChallenges === 76 && inventory.challenges === 81, 'Inventory total fields mismatch')
require(state.challenges.length === 81, 'State must contain exactly81 challenge records')
unique(ids, 'inventory')
unique(stateIds, 'state')
equalSet(stateIds, ids, 'state versus inventory')
require(authored.every(challenge => challenge.statusReference === 'estado.json'), 'Every authored challenge must point to the single status file')
for (const activity of [...inventory.labs, ...inventory.auxiliaryActivities]) {
  require(activity.statusReference === 'estado.json', `${activity.id}: missing statusReference`)
  for (const property of ['qa', 'qaProduct', 'acceptance']) require(!(property in activity), `${activity.id}: stale duplicated QA state ${property}`)
}
for (const challenge of authored) {
  for (const property of ['qa', 'qaProduct', 'acceptance']) require(!(property in challenge), `${challenge.id}: stale duplicated QA state ${property}`)
}

const scienceChallenges = [...science.labs, ...science.auxiliaryActivities].flatMap(activity => activity.challenges ?? [])
unique(scienceChallenges.map(challenge => challenge.id), 'scientific review')
equalSet(scienceChallenges.map(challenge => challenge.id), ids, 'science versus inventory')
const scientificById = new Map(scienceChallenges.map(challenge => [challenge.id, challenge]))
const sourceIds = registry.sources.map(source => source.id)
unique(sourceIds, 'scientific source registry')
const sources = new Map(registry.sources.map(source => [source.id, source]))
const authoredById = new Map(authored.map(challenge => [challenge.id, challenge]))

let referenceCount = 0
const parsed = new Map()
const checkReference = async reference => {
  require(typeof reference.file === 'string' && reference.file.length > 0, 'Evidence must name a file')
  const file = path.resolve(directory, reference.file)
  await fs.access(file).catch(() => { throw new Error(`Missing evidence file: ${reference.file}`) })
  referenceCount++
  if (!reference.pointer && !reference.expected) return
  if (!parsed.has(file)) parsed.set(file, await read(file))
  let value = parsed.get(file)
  if (reference.pointer) {
    require(reference.pointer.startsWith('/'), `Invalid JSON pointer: ${reference.file} ${reference.pointer}`)
    for (const token of reference.pointer.slice(1).split('/').map(part => part.replaceAll('~1', '/').replaceAll('~0', '~'))) {
      require(value !== null && typeof value === 'object' && Object.hasOwn(value, token), `Missing evidence pointer: ${reference.file}#${reference.pointer}`)
      value = value[token]
    }
  }
  for (const [key, expected] of Object.entries(reference.expected ?? {})) {
    require(value?.[key] === expected, `Evidence identity mismatch: ${reference.file}#${reference.pointer ?? ''} ${key}`)
  }
}
const statuses = new Set(['APROBADO', 'PENDIENTE', 'CORREGIR', 'BLOQUEADO'])
const modes = new Set(['QA_INDEPENDIENTE_DE_IMPLEMENTACION', 'ACEPTACION_POR_BLOQUE_CON_MUESTRA', 'ACEPTACION_INDEPENDIENTE_AJUSTE_VISUAL'])
for (const challenge of state.challenges) {
  const authoredChallenge = authoredById.get(challenge.id)
  require(challenge.source === authoredChallenge.source, `${challenge.id}: source differs from inventory`)
  await fs.access(path.resolve(repository, challenge.source)).catch(() => { throw new Error(`${challenge.id}: source code is absent`) })
  require(challenge.challengeKind === authoredChallenge.challengeKind, `${challenge.id}: challenge kind differs from inventory`)
  require(challenge.qaScience.status === scientificById.get(challenge.id).status, `${challenge.id}: scientific status differs from reviewer decision`)
  require(challenge.qaScience.sourceIds?.length > 0, `${challenge.id}: no scientific sources declared`)
  for (const id of challenge.qaScience.sourceIds) {
    const source = sources.get(id)
    require(source && typeof source.url === 'string' && source.url.startsWith('https://'), `${challenge.id}: missing scientific source ${id}`)
  }
  for (const category of ['qaScience', 'qaProduct', 'acceptance']) {
    const review = challenge[category]
    require(statuses.has(review.status), `${challenge.id}: invalid ${category} status`)
    require(typeof review.reviewer === 'string' && typeof review.scope === 'string', `${challenge.id}: reviewer/scope absent for ${category}`)
    require(review.evidence.length > 0, `${challenge.id}: missing ${category} evidence`)
    for (const reference of review.evidence) await checkReference(reference)
  }
  const expectedOverall = ['qaScience', 'qaProduct', 'acceptance'].every(category => challenge[category].status === 'APROBADO') ? 'APROBADO' : 'PENDIENTE'
  require(challenge.status === expectedOverall, `${challenge.id}: overall status contradicts reviews`)
  require(modes.has(challenge.acceptance.mode), `${challenge.id}: unknown acceptance mode`)
  if (challenge.acceptance.mode === 'ACEPTACION_POR_BLOQUE_CON_MUESTRA') {
    require(ids.includes(challenge.acceptance.independentlyRepeatedId), `${challenge.id}: sampled acceptance refers to an absent ID`)
    require(challenge.acceptance.thisIdIndependentlyRepeated === (challenge.id === challenge.acceptance.independentlyRepeatedId), `${challenge.id}: overclaims independent repetition`)
  }
}
for (const activity of state.nonChallengeActivities) {
  require(activity.countedAsChallenge === false && !ids.includes(activity.id), `${activity.id}: non-challenge counted as a challenge`)
  await fs.access(path.resolve(repository, activity.source))
  for (const reference of activity.evidence) await checkReference(reference)
}

const s = state.summary
require(s.experiments === 17 && s.mainChallenges === 76 && s.auxiliaryChallenges === 5 && s.totalChallenges === 81, 'State summary totals are inconsistent')
equalCounts(s.challengeKinds, tally(state.challenges.map(challenge => challenge.challengeKind)), 'challenge kinds')
equalCounts(s.challengeKinds, { 'open-comparison': 8, 'choice-observation': 72, 'choice-knowledge': 1 }, 'expected challenge kinds')
equalCounts(s.overall, tally(state.challenges.map(challenge => challenge.status)), 'overall')
equalCounts(s.science, tally(state.challenges.map(challenge => challenge.qaScience.status)), 'science')
equalCounts(s.product, tally(state.challenges.map(challenge => challenge.qaProduct.status)), 'product')
equalCounts(s.productByAssignment, tally(state.challenges.map(challenge => challenge.qaProduct.assignment)), 'product assignment')
equalCounts(s.productByAssignment, { Einstein: 29, 'Agujeros negros, Page y Contar información': 28, 'Óptica y Maldacena': 24 }, 'expected product assignment')
equalCounts(s.acceptance, tally(state.challenges.map(challenge => challenge.acceptance.status)), 'acceptance')
equalCounts(s.independentAcceptanceModes, tally(state.challenges.map(challenge => challenge.acceptance.mode)), 'acceptance modes')
require(s.maldacenaIndependentlyRepeatedChallenges === state.challenges.filter(challenge => challenge.acceptance.thisIdIndependentlyRepeated).length, 'Independent sample total mismatch')
require(s.maldacenaIndependentlyRepeatedChallenges === 4, 'Maldacena acceptance must retain four sampled challenges, not claim16 repeats')

console.log(JSON.stringify({ result: 'COHERENTE', challenges: stateIds.length, uniqueIds: new Set(stateIds).size, referenceCount, scientificSources: sources.size, overall: s.overall, productAssignments: s.productByAssignment, limitations: 'Checks records and present evidence, not scientific truth, browser behaviour, deployment or learning outcomes.' }, null, 2))
