import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPrismVertices,
  DEFAULT_CONFIG,
  MAX_INTERNAL_REFLECTIONS,
  refractiveIndex,
  reflectDirection,
  refractDirection,
  traceExperiment,
  wavelengthToColor,
} from '../src/prisma/physics/optics.ts'

const radians = degrees => degrees * Math.PI / 180
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`)
const central = result => result.rays.filter(ray => ray.offset === 0)
const reference = result => central(result).find(ray => ray.wavelength === 550)
const vectorLength = vector => Math.hypot(vector.x, vector.z)

test('Snell: air to n=1.5 at 30° gives 19.4712°, and the path is reversible', () => {
  const incident = { x: 0.5, z: -Math.sqrt(3) / 2 }
  const transmitted = refractDirection(incident, { x: 0, z: 1 }, 1, 1.5)
  assert.ok(transmitted)
  close(transmitted.x, 1 / 3)
  close(Math.acos(-transmitted.z) * 180 / Math.PI, 19.47122063449069)
  close(vectorLength(transmitted), 1)
  const reversed = refractDirection({ x: -transmitted.x, z: -transmitted.z }, { x: 0, z: -1 }, 1.5, 1)
  close(reversed.x, -incident.x)
  close(reversed.z, -incident.z)
})

test('normal incidence has no angular deviation for either medium transition', () => {
  for (const [n1, n2] of [[1, 1.52], [1.52, 1]]) {
    const transmitted = refractDirection({ x: 1, z: 0 }, { x: -1, z: 0 }, n1, n2)
    close(transmitted.x, 1); close(transmitted.z, 0)
  }
})

test('critical angle is tangent; incidence beyond it causes total internal reflection', () => {
  const critical = Math.asin(1 / 1.5)
  const tangent = refractDirection({ x: Math.sin(critical), z: -Math.cos(critical) }, { x: 0, z: 1 }, 1.5, 1)
  assert.ok(tangent)
  close(tangent.x, 1); close(tangent.z, 0, 2e-8)
  const incident = { x: Math.sin(radians(50)), z: -Math.cos(radians(50)) }
  assert.equal(refractDirection(incident, { x: 0, z: 1 }, 1.5, 1), null)
  const reflected = reflectDirection(incident, { x: 0, z: 1 })
  close(reflected.x, incident.x); close(reflected.z, -incident.z)
  close(vectorLength(reflected), 1)
})

test('legacy Cauchy coefficients are retained and normal dispersion is monotone', () => {
  close(refractiveIndex(550, 'glass'), 1.5173040502697903)
  for (const material of ['glass', 'quartz', 'acrylic']) {
    let previous = Infinity
    for (let wavelength = 380; wavelength <= 700; wavelength += 10) {
      const index = refractiveIndex(wavelength, material)
      assert.ok(index > 1 && index < previous)
      previous = index
    }
  }
  assert.ok(refractiveIndex(550, 'glass') > refractiveIndex(550, 'acrylic'))
  assert.ok(refractiveIndex(550, 'acrylic') > refractiveIndex(550, 'quartz'))
})

test('triangle is centered, counterclockwise and has the requested apex after rotation', () => {
  for (const apex of [30, 60, 85]) for (const rotation of [-90, 0, 55]) {
    const [tip, right, left] = createPrismVertices(apex, rotation)
    close(tip.x + right.x + left.x, 0); close(tip.z + right.z + left.z, 0)
    const a = { x: right.x - tip.x, z: right.z - tip.z }
    const b = { x: left.x - tip.x, z: left.z - tip.z }
    assert.ok(a.x * b.z - a.z * b.x > 0)
    const apexMeasured = Math.acos((a.x * b.x + a.z * b.z) / (vectorLength(a) * vectorLength(b))) * 180 / Math.PI
    close(apexMeasured, apex)
  }
})

test('default experiment intersects both prism faces and separates violet beyond red', () => {
  const result = traceExperiment(Object.freeze({ ...DEFAULT_CONFIG }))
  assert.equal(result.rays.length, 99)
  assert.equal(result.metrics.screenHits, 99)
  assert.equal(result.metrics.totalInternalReflections, 0)
  close(result.metrics.incidenceAngle, 50)
  const rays = central(result)
  const violet = rays.find(ray => ray.wavelength === 380)
  const red = rays.find(ray => ray.wavelength === 700)
  assert.ok(violet.deviationAngle > red.deviationAngle)
  assert.ok(violet.screenHit.z > red.screenHit.z)
  close(result.metrics.spectralSpread, violet.screenHit.z - red.screenHit.z)
  for (const ray of result.rays) {
    assert.equal(ray.status, 'screen')
    assert.deepEqual(ray.segments.map(segment => segment.medium), ['air', 'prism', 'air'])
    assert.equal(ray.points.length, 4)
    close(ray.screenHit.x, result.screenX)
    assert.ok(ray.transmission > 0 && ray.transmission < 1)
    // Check the conserved tangential optical component at both real faces.
    for (const event of ray.interactions) {
      close(event.fromIndex * Math.sin(radians(event.incidenceAngle)), event.toIndex * Math.sin(radians(event.refractionAngle)))
      close(vectorLength(event.incident), 1); close(vectorLength(event.outgoing), 1)
    }
  }
})

test('minimum deviation matches the independent analytic prism equation', () => {
  const n = refractiveIndex(550, 'glass')
  const minimumIncidence = Math.asin(n * Math.sin(radians(30))) * 180 / Math.PI
  const rotation = minimumIncidence - 50
  const expectedDeviation = 2 * minimumIncidence - 60
  const result = traceExperiment({ ...DEFAULT_CONFIG, prismAngle: rotation, lightWidth: 0 })
  close(reference(result).deviationAngle, expectedDeviation)
  const [entry, exit] = reference(result).interactions
  close(entry.refractionAngle, 30)
  close(exit.incidenceAngle, 30)
  for (const delta of [-2, 2]) {
    const changed = traceExperiment({ ...DEFAULT_CONFIG, prismAngle: rotation + delta, lightWidth: 0 })
    assert.ok(reference(changed).deviationAngle > expectedDeviation)
  }
})

test('screen displacement changes only the final propagation, and increases separation', () => {
  const near = traceExperiment({ ...DEFAULT_CONFIG, screenDistance: 2, lightWidth: 0 })
  const far = traceExperiment({ ...DEFAULT_CONFIG, screenDistance: 6, lightWidth: 0 })
  assert.ok(far.metrics.spectralSpread > near.metrics.spectralSpread)
  near.rays.forEach((ray, index) => {
    const distant = far.rays[index]
    assert.deepEqual(ray.points.slice(0, -1), distant.points.slice(0, -1))
    close(ray.deviationAngle, distant.deviationAngle)
    close(distant.screenHit.z - ray.screenHit.z, 4 * Math.tan(radians(ray.deviationAngle)))
  })
})

test('a beam missing the prism stays straight, with no spectral separation reported', () => {
  const result = traceExperiment({ ...DEFAULT_CONFIG, lightOffset: 2, lightWidth: 0 })
  assert.equal(result.metrics.incidenceAngle, null)
  assert.equal(result.metrics.spectralSpread, null)
  assert.equal(result.metrics.screenHits, 0)
  for (const ray of result.rays) {
    assert.equal(ray.status, 'missed')
    assert.equal(ray.interactions.length, 0)
    assert.deepEqual(ray.segments.map(segment => segment.medium), ['air'])
    close(ray.screenHit.z, 2)
  }
})

test('total reflection follows another prism face; backward exits do not hit the screen', () => {
  const result = traceExperiment({ ...DEFAULT_CONFIG, prismAngle: -30, lightWidth: 0 })
  assert.equal(result.metrics.screenHits, 0)
  assert.equal(result.metrics.spectralSpread, null)
  for (const ray of result.rays) {
    assert.equal(ray.status, 'escaped')
    assert.equal(ray.screenHit, null)
    assert.equal(ray.internalReflections, 1)
    assert.deepEqual(ray.interactions.map(event => event.type), ['refraction', 'internal-reflection', 'refraction'])
    const bounce = ray.interactions[1]
    assert.ok(bounce.incidenceAngle > Math.asin(1 / ray.refractiveIndex) * 180 / Math.PI)
    close(vectorLength(bounce.outgoing), 1)
  }
})

test('beam aperture changes coverage without changing the central physical measurement', () => {
  const pencil = traceExperiment({ ...DEFAULT_CONFIG, lightWidth: 0 })
  const wide = traceExperiment({ ...DEFAULT_CONFIG, lightWidth: 0.2 })
  assert.equal(pencil.rays.length, 33)
  assert.equal(wide.rays.length, 99)
  close(pencil.metrics.spectralSpread, wide.metrics.spectralSpread)
  const greenHits = wide.rays.filter(ray => ray.wavelength === 550).map(ray => ray.screenHit.z)
  assert.ok(Math.max(...greenHits) - Math.min(...greenHits) > 0.2)
})

test('representative rotations, shapes and materials remain finite with bounded work', () => {
  for (const material of ['glass', 'quartz', 'acrylic'])
    for (const prismAngle of [-60, -30, 0, 30, 60])
      for (const apexAngle of [30, 60, 85])
        for (const lightAngle of [-12, 0, 12]) {
          const result = traceExperiment({ ...DEFAULT_CONFIG, material, prismAngle, apexAngle, lightAngle })
          for (const ray of result.rays) {
            assert.ok(ray.internalReflections <= MAX_INTERNAL_REFLECTIONS)
            assert.ok(ray.points.length <= MAX_INTERNAL_REFLECTIONS + 4)
            assert.ok(Number.isFinite(ray.transmission) && ray.transmission >= 0 && ray.transmission <= 1)
            for (const point of ray.points) assert.ok(Number.isFinite(point.x) && Number.isFinite(point.z))
          }
        }
})

test('invalid inputs fail explicitly instead of leaking NaNs into WebGL', () => {
  for (const change of [
    { prismAngle: NaN }, { lightOffset: Infinity }, { apexAngle: 0 },
    { material: 'unknown' }, { material: '__proto__' }, { lightWidth: -1 },
    { lightWidth: 1 }, { screenDistance: 0 }, { screenDistance: 9 }, { lightAngle: 90 },
  ]) assert.throws(() => traceExperiment({ ...DEFAULT_CONFIG, ...change }), RangeError)
  assert.throws(() => refractiveIndex(0, 'glass'), RangeError)
  assert.throws(() => refractiveIndex(780, 'glass'), RangeError)
  assert.throws(() => refractDirection({ x: 0, z: 0 }, { x: 1, z: 0 }, 1, 1.5), RangeError)
  assert.throws(() => refractDirection({ x: 1, z: 0 }, { x: -1, z: 0 }, 0, 1.5), RangeError)
})

test('spectral display maps blue/green/red correctly and does not affect physics', () => {
  assert.equal(wavelengthToColor(440), '#0000ff')
  assert.equal(wavelengthToColor(510), '#00ff00')
  assert.equal(wavelengthToColor(700), '#ff0000')
  assert.equal(wavelengthToColor(800), '#000000')
})
