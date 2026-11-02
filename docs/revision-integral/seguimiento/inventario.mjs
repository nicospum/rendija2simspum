// Current source inventory; the original 17-lab audit remains a frozen record.
// Parsing authored lesson definitions is not QA approval.
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import ts from 'typescript'

const directory = path.dirname(fileURLToPath(import.meta.url))
const repository = path.resolve(directory, '../../..')
const previous = JSON.parse(await fs.readFile(path.join(directory, '../inventario.json'), 'utf8'))
const read = file => fs.readFile(path.join(repository, file), 'utf8')
const sourceHashes = {}
function value(node) {
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node)) return value(node.expression)
  if (ts.isStringLiteralLike(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(value)
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText().replaceAll("'", ''), value(p.initializer)]))
  return node.getText()
}
async function array(file, name) {
  const text = await read(file)
  sourceHashes[file] = createHash('sha256').update(text).digest('hex')
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  let result
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText() === name && node.initializer) result = value(node.initializer)
    ts.forEachChild(node, visit)
  }
  visit(ast)
  if (!Array.isArray(result)) throw new Error(`${file}: missing authored array ${name}`)
  return result
}
const extra = {
  eratostenes: {
    challengeSource: 'src/eratostenes/learning.ts', physics: 'src/eratostenes/physics.ts',
    sourcesAndLimits: 'docs/ERATOSTENES_LABORATORIO.md',
    model: 'Geometría esférica idealizada con dos sombras al mediodía solar y rayos paralelos',
    prerequisites: 'Sombras, ángulos y proporciones; se explican en el recorrido',
    controlsAndReadouts: 'Dos latitudes sobre un meridiano, altura de la varilla, declinación solar y margen angular; vistas planeta/sombras. El radio del modelo es fijo. Sombras firmadas, ángulo central, mediciones guardadas y circunferencia inferida. No prueba aislada de la forma terrestre sin supuestos.',
  },
  bell: {
    challengeSource: 'src/bell/learning.ts', physics: 'src/bell/physics.ts',
    sourcesAndLimits: 'docs/BELL_LABORATORIO.md',
    model: 'Pares de fotones Φ+ ideales, muestreo Born, tarjetas locales y CHSH',
    prerequisites: 'Porcentajes y comparación de resultados; signos, orientaciones y correlación se introducen aquí',
    controlsAndReadouts: 'Giro de analizadores A/B, ajustes 0/1, emisión, lotes de 200 pares, tarjetas ±1, lotes CHSH de 4×50 o 4×1000. Datos sintéticos medidos separados de E teórico; suma S y cota local. No ensayo experimental ni comunicación instantánea.',
  },
}
const catalog = await array('src/portal/catalog.ts', 'experiments')
const labs = []
for (const lab of catalog) {
  const old = previous.labs.find(item => item.id === lab.id)
  const metadata = old ?? extra[lab.id]
  if (!metadata) throw new Error(`Unclassified laboratory: ${lab.id}`)
  const sections = lab.id === 'holografia'
    ? [['geometria', metadata.challengeSource, 'GEOMETRY_LESSONS'], ['diccionario', metadata.challengeSource, 'DUALITY_LESSONS'], ['temperatura', 'src/maldacena/thermal/ThermalLab.tsx', 'LESSONS']]
    : [['principal', metadata.challengeSource, lab.id === 'entrelazados' ? 'QUANTUM_LESSONS' : 'LESSONS']]
  const challenges = []
  for (const [section, source, name] of sections) {
    const lessons = await array(source, name)
    lessons.forEach((lesson, index) => challenges.push({
      ...lesson, id: `${lab.id}/${section}/reto-${String(index + 1).padStart(2, '0')}`,
      nativeId: lesson.id ?? null, index, section, source,
      challengeKind: lesson.choices ? 'choice-observation' : 'open-comparison', statusReference: 'estado.json',
    }))
  }
  labs.push({
    id: lab.id, name: lab.title, route: lab.href, discipline: lab.field,
    publication: 'ACTIVO', objective: lab.question, firstAction: lab.discovery,
    model: metadata.model, prerequisites: metadata.prerequisites,
    sourcesAndLimits: metadata.sourcesAndLimits, physics: metadata.physics,
    controlsAndReadouts: metadata.controlsAndReadouts,
    sharedComponents: metadata.sharedComponents ?? ['src/components/ui/LabJourney.tsx', 'src/education/HelpMode.tsx', 'src/components/ui/SceneConsole.tsx'],
    challengeSource: metadata.challengeSource, challengeCount: challenges.length, challenges, statusReference: 'estado.json',
  })
}
const auxiliaryActivities = structuredClone(previous.auxiliaryActivities)
const counting = auxiliaryActivities.find(item => item.id === 'contar-informacion')
counting.challenges = (await array(counting.source, 'QUESTIONS')).map((lesson, index) => ({
  ...lesson, id: `contar-informacion/principal/reto-${String(index + 1).padStart(2, '0')}`,
  nativeId: lesson.id ?? null, index, source: counting.source, challengeKind: 'choice-observation', statusReference: 'estado.json',
}))
// The one inline conceptual question has no authored array; bind its existing
// manually reviewed inventory to the exact current source for drift detection.
for (const activity of auxiliaryActivities.filter(item => item.id !== 'escalas-agujeros-negros')) {
  sourceHashes[activity.source] = createHash('sha256').update(await read(activity.source)).digest('hex')
}
const config = await read('vite.config.ts')
sourceHashes['vite.config.ts'] = createHash('sha256').update(config).digest('hex')
const htmlEntries = [...config.matchAll(/\w+: '([^']+\.html)'/g)].map(match => match[1])
const classified = new Set(['index.html', 'einstein/index.html', 'agujeros-negros/index.html', 'maldacena/index.html', ...labs.map(lab => `${lab.route.slice(1)}index.html`), ...Object.keys(previous.aliases).map(route => `${route.slice(1)}index.html`)])
for (const entry of htmlEntries) if (!classified.has(entry)) throw new Error(`Unclassified active HTML entry: ${entry}`)
for (const entry of classified) if (!htmlEntries.includes(entry)) throw new Error(`Missing build entry: ${entry}`)
const inventory = {
  project: 'SPUM · Experimentos para entender', domain: 'https://www.spumexp.lat/',
  generatedFromHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
  experiments: labs.length, mainChallenges: labs.reduce((sum, lab) => sum + lab.challengeCount, 0),
  challenges: labs.reduce((sum, lab) => sum + lab.challengeCount, 0) + auxiliaryActivities.reduce((sum, item) => sum + (item.challenges?.length ?? 0), 0),
  labs, aliases: previous.aliases, auxiliaryActivities, htmlEntries,
  excluded: previous.excluded,
  unpublishedDrafts: 'No hay entradas activas sin clasificar. No se encontraron borradores o funciones deshabilitadas en los catálogos; el historial Git no se cuenta como producto activo.',
  inheritedMetadata: 'Objetivos técnicos de los 17 laboratorios anteriores conservados tras contrastar el código; consignas extraídas de las fuentes actuales. La pregunta auxiliar inline se controla mediante hash y revisión explícita.',
  sourceHashes,
}
await fs.writeFile(path.join(directory, 'inventario.json'), JSON.stringify(inventory, null, 2) + '\n')
console.log(JSON.stringify({ experiments: inventory.experiments, mainChallenges: inventory.mainChallenges, challenges: inventory.challenges, htmlEntries: htmlEntries.length }))
