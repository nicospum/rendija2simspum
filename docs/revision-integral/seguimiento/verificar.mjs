// Validate recorded coverage and evidence. This script does not run the UI,
// certify the physics, or turn missing reviewer decisions into approvals.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const directory = path.dirname(fileURLToPath(import.meta.url))
const repository = path.resolve(directory, '../../..')
const read = async file => JSON.parse(await fs.readFile(path.resolve(directory, file), 'utf8'))
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const inventory = await read('inventario.json')
const science = await read('ciencia.json')
const productFiles = ['producto-einstein-cosmos.json', 'producto-optica-cuantica.json']
const products = await Promise.all(productFiles.map(read))
const authored = [...inventory.labs, ...inventory.auxiliaryActivities].flatMap(lab => lab.challenges ?? [])
const scientific = [...science.labs, ...science.auxiliaryActivities].flatMap(lab => lab.challenges ?? [])
const tested = products.flatMap(product => product.challenges)
const ids = authored.map(challenge => challenge.id)
assert(inventory.labs.length === 19 && inventory.mainChallenges === 84 && ids.length === 89 && inventory.htmlEntries.length === 26, 'Unexpected inventory totals: inspect changes instead of silently approving them')
function equalIds(records, label) {
  const other = records.map(record => record.id)
  assert(new Set(other).size === other.length, `${label}: duplicate IDs`)
  assert(other.length === ids.length && ids.every(id => other.includes(id)), `${label}: coverage differs from authored challenges`)
}
equalIds(authored, 'inventory')
equalIds(scientific, 'science')
equalIds(tested, 'product')
assert(scientific.every(challenge => challenge.status === 'APROBADO'), 'Science contains an unresolved decision')
assert(tested.every(challenge => challenge.status === 'APROBADO'), 'Product contains an unresolved decision')

let checkedReferences = 0
const parsed = new Map()
async function reference(ref, fallbackFile) {
  const name = ref.file ?? fallbackFile
  assert(name, 'Evidence has no file')
  const absolute = path.resolve(directory, name)
  await fs.access(absolute)
  checkedReferences++
  for (const pointer of [ref.pointer, ref.acceptancePointer].filter(Boolean)) {
    if (!parsed.has(absolute)) parsed.set(absolute, JSON.parse(await fs.readFile(absolute, 'utf8')))
    let value = parsed.get(absolute)
    assert(pointer.startsWith('/'), `Invalid pointer: ${pointer}`)
    for (const token of pointer.slice(1).split('/').map(v => v.replaceAll('~1', '/').replaceAll('~0', '~'))) {
      assert(value !== null && typeof value === 'object' && Object.hasOwn(value, token), `Missing ${name}#${pointer}`)
      value = value[token]
    }
    if (pointer === ref.pointer) {
      for (const [key, expected] of Object.entries(ref.expected ?? {})) assert(value[key] === expected, `Evidence identity mismatch: ${name}#${pointer}`)
      if (ref.rawId) assert(value.id === ref.rawId && value.state === ref.state, `Current case identity mismatch: ${name}#${pointer}`)
    }
  }
}
for (const [index, product] of products.entries()) {
  await reference({ file: productFiles[index] })
  for (const challenge of product.challenges) {
    for (const ref of challenge.historicalEvidence ?? []) await reference(ref)
    if (challenge.previousEvidence) await reference(challenge.previousEvidence)
    for (const ref of challenge.currentEvidence ?? []) await reference(ref, challenge.currentEvidenceFile)
  }
}
const cosmos = await read(products[0].sourceIdentity.file)
const optical = await read(products[1].inheritance.rawHashesAndLf)
assert(hash(await fs.readFile(path.resolve(directory, products[1].inheritance.rawHashesAndLf))) === products[1].inheritance.sourceManifestSha256, 'Product continuity manifest changed')
const currentCasesFile = products[1].challenges.find(challenge => challenge.currentEvidenceFile).currentEvidenceFile
assert(hash(await fs.readFile(path.resolve(directory, currentCasesFile))) === products[1].currentCasesSha256, 'Browser case records changed')
const reviewedHashes = [
  ...Object.entries(science.reviewedFileSha256),
  ...Object.entries(inventory.sourceHashes),
  ...cosmos.files.map(item => [item.file, item.sha256]),
  ...optical.oldHashes.map(item => [item.file, item.current]),
  ...optical.manifests.flatMap(manifest => manifest.files.map(item => [item.file, item.current])),
]
for (const [file, expected] of reviewedHashes) {
  assert(hash(await fs.readFile(path.resolve(repository, file))) === expected, `Reviewed source changed: ${file}`)
}

if (process.argv.includes('--write-state')) {
  assert(science.finalAcceptanceReview?.status === 'APROBADO', 'Science has not reviewed final product acceptance')
  assert([...science.labs, ...science.auxiliaryActivities].every(lab => lab.acceptanceReview?.status === 'APROBADO'), 'A scientific acceptance review is missing or pending')
  assert(products.every(product => product.finalReview?.status === 'CIERRE_DE_CANDIDATO_APROBADO'), 'A product reviewer has not closed the candidate')
  const challenges = authored.map(challenge => {
    const scientificLabIndex = science.labs.findIndex(lab => lab.challenges?.some(item => item.id === challenge.id))
    const collection = scientificLabIndex >= 0 ? 'labs' : 'auxiliaryActivities'
    const labIndex = scientificLabIndex >= 0 ? scientificLabIndex : science.auxiliaryActivities.findIndex(lab => lab.challenges?.some(item => item.id === challenge.id))
    const scientificIndex = science[collection][labIndex].challenges.findIndex(item => item.id === challenge.id)
    const productIndex = products.findIndex(product => product.challenges.some(item => item.id === challenge.id))
    const challengeIndex = products[productIndex].challenges.findIndex(item => item.id === challenge.id)
    return {
      id: challenge.id, source: challenge.source, status: 'APROBADO',
      science: { status: 'APROBADO', reviewer: science.reviewer, file: 'ciencia.json', pointer: `/${collection}/${labIndex}/challenges/${scientificIndex}` },
      product: { status: 'APROBADO', reviewer: products[productIndex].reviewer, file: productFiles[productIndex], pointer: `/challenges/${challengeIndex}` },
      acceptance: { status: 'APROBADO_EN_ALCANCE_DOCUMENTADO', reviewer: products[productIndex].reviewer, basis: 'QA y aceptación independientes de implementación; recorridos actuales y conservación justificada de aceptación histórica. Los casos nuevos se enumeran en el manifest de producto, no se infieren de esta fila.' },
    }
  })
  const state = {
    phase: 'REVISION_INTERNA_CERRADA', base: science.base,
    candidate: 'Base + SCI-01, UX-01 y UX-02; archivos identificados por los hashes de los tres dictámenes',
    deliveryEvidence: '../../../../qa-integral-seguimiento-2026-11-02/release-verification.json',
    counts: { labs: 19, approvedLabs: 19, correctedLabs: 3, mainChallenges: 84, auxiliaryChallenges: 5, totalChallenges: 89, approvedChallenges: 89, failedChallenges: 0, blockedChallenges: 0 },
    labs: inventory.labs.map(lab => ({ id: lab.id, route: lab.route, challengeIds: lab.challenges.map(item => item.id), science: 'APROBADO', product: 'APROBADO', acceptance: 'APROBADO_EN_ALCANCE_DOCUMENTADO' })),
    challenges,
    ungraded: { activities: ['energia-en-reposo', 'escalas-agujeros-negros'], evidence: 'producto-einstein-cosmos.json#/ungradedExplorations', science: 'ciencia.json#/auxiliaryActivities', countedAsChallenges: false },
    findings: 'hallazgos.md', options: 'opciones.md',
    pending: ['12 avisos moderados de herramientas de desarrollo; producción sin avisos', 'Safari y dispositivos físicos sin acceso, pendientes por decisión del usuario', 'Prueba educativa con participantes; no reemplazada por QA de agentes'],
    next: 'No quedan reparaciones de los tres hallazgos de producto. Verificar y registrar la publicación; las ampliaciones quedan a elección del usuario.',
    limitations: 'No es certificación externa. Las89aprobaciones reúnen evidencia conservada y casos actuales: no son89nuevos recorridos exhaustivos en cada tamaño o dispositivo.',
  }
  await fs.writeFile(path.join(directory, 'estado.json'), JSON.stringify(state, null, 2) + '\n')
}
const state = await read('estado.json')
if (state.challenges) {
  assert(science.finalAcceptanceReview?.status === 'APROBADO', 'Consolidated state no longer has scientific closure')
  assert([...science.labs, ...science.auxiliaryActivities].every(lab => lab.acceptanceReview?.status === 'APROBADO'), 'Consolidated state has a pending scientific acceptance')
  assert(products.every(product => product.finalReview?.status === 'CIERRE_DE_CANDIDATO_APROBADO'), 'Consolidated state no longer has product closure')
  equalIds(state.challenges, 'state')
  assert(state.counts?.labs === inventory.labs.length && state.counts?.totalChallenges === ids.length, 'State totals differ from inventory')
  assert(state.challenges.every(challenge => challenge.status === 'APROBADO' && challenge.science.status === 'APROBADO' && challenge.product.status === 'APROBADO' && challenge.acceptance.status === 'APROBADO_EN_ALCANCE_DOCUMENTADO'), 'State contains inconsistent approval labels')
  for (const challenge of state.challenges) {
    await reference(challenge.science)
    await reference(challenge.product)
  }
}
console.log(JSON.stringify({ result: 'COHERENTE', labs: 19, challenges: 89, sourceHashChecks: reviewedHashes.length, references: checkedReferences, limitation: 'Verifica la trazabilidad, no ejecuta otra vez las escenas ni certifica el aprendizaje.' }))
