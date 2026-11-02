import test from 'node:test'
import assert from 'node:assert/strict'
import { helpForText, resolveHelp } from '../src/education/helpContent.ts'

test('context keeps opposite causal effects distinct across laboratories', () => {
  const brightness = helpForText('/efecto-fotoelectrico/', 'pe-brightness')
  assert.match(brightness.body, /No aumenta la energía máxima/)
  const frequency = helpForText('/efecto-fotoelectrico/', 'pe-frequency')
  assert.match(frequency.body, /E=hf/)
  assert.notEqual(brightness.title, frequency.title)
  assert.match(helpForText('/hawking/', 'masa').body, /inversamente proporcional/)
  assert.match(helpForText('/frontera-caliente/', 'temperatura').body, /zₕ=1/)
  assert.match(
    helpForText('/tren-de-einstein/', 'Simultáneos en el andén').body,
    /cambia los sucesos físicos/,
  )
  assert.match(
    helpForText('/tren-de-einstein/', 'Simultáneos en cada sistema').body,
    /registran ambos extremos/,
  )
  assert.match(
    helpForText('/acrecion/', 'ac-live-main Masa invisible').body,
    /período más corto/,
  )
  assert.match(
    helpForText('/acrecion/', 'ac-live-main Inclinación del disco').body,
    /inclinación cambia/,
  )
  assert.match(
    helpForText('/entropia/', 'en-live-main Fracción de masa emitida').body,
    /reduce el radio/,
  )
})

test('Page explanations distinguish state, comparison hypothesis and correlation', () => {
  assert.match(helpForText('/curva-de-page/', 'emitir un qubit').body, /mismo/)
  assert.match(
    helpForText('/curva-de-page/', 'Emisión independiente').body,
    /No cambia el estado/,
  )
  assert.match(
    helpForText('/curva-de-page/', 'por separado').body,
    /no es por sí sola una medida general de entrelazamiento/,
  )
  assert.match(helpForText('/curva-de-page/', 'Dibujar la curva').body, /no es tiempo/)
  const button = {
    tagName: 'BUTTON',
    textContent: 'Emitir un qubit →',
    getAttribute: () => null,
    ownerDocument: { querySelectorAll: () => [] },
    closest(selector) {
      return selector.startsWith('button,') ? this : null
    },
  }
  const emission = resolveHelp('/curva-de-page/', button)
  assert.match(emission.body, /Pasás un qubit de B/)
  assert.match(emission.body, /recalcula su entropía/)
  assert.match(emission.body, /no una emisión de Hawking/)
})

test('geometry explanations identify handles and regulator without inventing physical objects', () => {
  assert.match(
    helpForText('/espacio-con-frontera/', 'Extremo izquierdo del intervalo').body,
    /no objetos que caen/,
  )
  assert.match(
    helpForText('/dos-lenguajes/', 'Corte regulador ε').body,
    /no una partícula/,
  )
  assert.match(
    helpForText('/dos-lenguajes/', 'carga central').body,
    /no la velocidad de la luz/,
  )
  assert.match(helpForText('/entropia/', 'masa').body, /asa para cambiar masa/)
})

test('the numeric cCFT legend explains its constants and units rather than matching CFT', () => {
  for (const label of [
    'cCFT=60',
    'Misma escala: 0 a 100 nats. cCFT=60; G₃=0,025',
  ]) {
    const entry = helpForText('/dos-lenguajes/', label)
    assert.match(entry.body, /carga central/)
    assert.match(entry.body, /no la velocidad de la luz/)
    assert.match(entry.body, /nats/)
  }
  assert.match(helpForText('/dos-lenguajes/', 'S CFT asintótica').body, /corte finito/)
})

test('shared challenge actions explain their action instead of a scientific scene', () => {
  assert.match(
    helpForText('/curva-de-page/', 'Comprobar explicación').body,
    /predicción con observaciones/,
  )
  const explicit = {
    getAttribute: (key) => ({
      'data-help-title': 'Elegir una idea antes de probar',
      'data-help-body': 'Registra tu predicción; no cambia las condiciones físicas.',
    })[key] ?? null,
  }
  // These routes have broad scene/visor topics. Authored UI actions must win.
  for (const route of ['hawking', 'el-tiempo-tiene-altura', 'orbita-que-no-se-cierra']) {
    assert.equal(
      resolveHelp(`/${route}/`, {closest: () => explicit}).body,
      'Registra tu predicción; no cambia las condiciones físicas.',
    )
  }
})

test('all legacy laboratory groups have useful control or scene explanations', () => {
  const controls = {
    prisma: 'prism-material',
    'doble-rendija': 'detector-strength',
    hawking: 'hk-mass',
    entropia: 'en-patch',
    'lente-gravitacional': 'ln-ray',
    acrecion: 'ac-gas',
    horizonte: 'hz-radius',
    'reloj-de-luz': 'rl-beta',
    'tren-de-einstein': 'tr-length',
    'nos-vemos-a-la-vuelta': 'gv-duration',
    'ascensor-de-einstein': 'as-mass',
    'el-tiempo-tiene-altura': 'al-height',
    'orbita-que-no-se-cierra': 'or-e',
    'efecto-fotoelectrico': 'pe-frequency',
    entrelazados: 'quantum-theta',
    'espacio-con-frontera': 'corte',
    'dos-lenguajes': 'CFT',
    'frontera-caliente': 'btz-temperature',
    'curva-de-page': 'page-emitted',
    eratostenes: 'varilla',
  }
  for (const [route, control] of Object.entries(controls)) {
    const entry = helpForText(`/${route}/`, control)
    assert.ok(entry && entry.body.length > 80, `${route}: ${control}`)
  }
  for (const route of [
    'prisma',
    'doble-rendija',
    'hawking',
    'lente-gravitacional',
    'acrecion',
  ])
    assert.ok(helpForText(`/${route}/`, 'canvas'))
  assert.equal(helpForText('/curva-de-page/', 'something genuinely unrelated'), null)
})

test('explicit annotations and active subsection take priority over the hub route', () => {
  const explicit = {
    getAttribute: (key) =>
      ({
        'data-help-title': 'Eje horizontal',
        'data-help-body': '6 qubits, no segundos',
      })[key] ?? null,
  }
  assert.deepEqual(resolveHelp('/curva-de-page/', { closest: () => explicit }), {
    title: 'Eje horizontal',
    body: '6 qubits, no segundos',
  })
  const fake = {
    getAttribute: (key) => (key === 'data-help-scope' ? 'frontera-caliente' : null),
    closest(selector) {
      return selector === '[data-help-scope]' ? this : null
    },
    textContent: 'temperatura',
  }
  assert.match(resolveHelp('/holografia/', fake).body, /zₕ=1/)
})
