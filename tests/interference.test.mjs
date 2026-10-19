import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_CONFIG, normalizeConfig, slitCenters, intensityAt,
  buildDistribution, sampleImpact, fringeSpacing, DISTRIBUTION_BINS,
} from '../src/physics/interference.ts'

function close(actual, expected, tolerance = 1e-11) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`)
}

function sincSquared(value) {
  return Math.abs(value) < 1e-12 ? 1 : (Math.sin(value) / value) ** 2
}

// Independent closed-form grating result, rather than the implementation's
// explicit complex-amplitude sum. Used away from the removable singularities.
function analyticIntensity(z, config) {
  const beta = Math.PI * config.slitWidth * z / (config.wavelength * config.screenDistance)
  const alpha = Math.PI * config.slitSeparation * z / (config.wavelength * config.screenDistance)
  const arrayFactor = Math.abs(Math.sin(alpha)) < 1e-10
    ? config.slitCount
    : Math.sin(config.slitCount * alpha) ** 2 / (config.slitCount * Math.sin(alpha) ** 2)
  return sincSquared(beta) * ((1 - config.detectorStrength) * arrayFactor + config.detectorStrength)
}

test('controls reject nonfinite input, enforce limits and keep apertures disjoint', () => {
  const defaultsBefore = { ...DEFAULT_CONFIG }
  const config = normalizeConfig({
    slitCount: 100, slitWidth: 0.8, slitSeparation: -1, wavelength: NaN,
    screenDistance: Infinity, detectorStrength: -1, particleType: 'toString',
  })
  assert.equal(config.slitCount, 5)
  assert.equal(config.slitSeparation, 0.16)
  assert.ok(config.slitWidth <= config.slitSeparation - 0.02)
  assert.equal(config.wavelength, DEFAULT_CONFIG.wavelength)
  assert.equal(config.screenDistance, DEFAULT_CONFIG.screenDistance)
  assert.equal(config.detectorStrength, 0)
  assert.equal(config.particleType, 'electron')
  assert.equal(normalizeConfig({ slitCount: 2.6 }).slitCount, 3)
  assert.deepEqual(DEFAULT_CONFIG, defaultsBefore)
  const custom = normalizeConfig({ wavelength: 0.08 })
  assert.equal(normalizeConfig({ wavelength: NaN }, custom).wavelength, 0.08)
})

test('one through five slits are centred, equally separated and nonoverlapping', () => {
  for (let count = 1; count <= 5; count++) {
    const config = normalizeConfig({ slitCount: count })
    const centers = slitCenters(config)
    assert.equal(centers.length, count)
    close(centers.reduce((sum, value) => sum + value, 0), 0)
    centers.forEach((center, index) => {
      close(center, -centers[count - 1 - index])
      if (index) {
        close(center - centers[index - 1], config.slitSeparation)
        assert.ok(center - centers[index - 1] > config.slitWidth)
      }
    })
  }
})

test('central intensity and single-slit diffraction have the analytic limits', () => {
  for (let count = 1; count <= 5; count++) {
    const coherent = normalizeConfig({ slitCount: count })
    close(intensityAt(0, coherent), count)
    close(intensityAt(0, { ...coherent, detectorStrength: 1 }), 1)
    const firstEnvelopeZero = coherent.wavelength * coherent.screenDistance / coherent.slitWidth
    assert.ok(intensityAt(firstEnvelopeZero, coherent) < 1e-25)
  }
  const single = normalizeConfig({ slitCount: 1 })
  for (const z of [0, 0.1, 0.4, 1.3, 2.5]) {
    close(intensityAt(z, single), sincSquared(Math.PI * single.slitWidth * z / (single.wavelength * single.screenDistance)))
    close(intensityAt(z, single), intensityAt(z, { ...single, detectorStrength: 1 }))
  }
})

test('double-slit minima and principal orders agree with the fringe-spacing relation', () => {
  const config = normalizeConfig({ slitCount: 2 })
  const spacing = config.wavelength * config.screenDistance / config.slitSeparation
  close(fringeSpacing(config), spacing)
  for (let order = -3; order <= 3; order++) {
    const minimum = (order + 0.5) * spacing
    assert.ok(intensityAt(minimum, config) < 1e-25)
    const maximum = order * spacing
    close(intensityAt(maximum, config), 2 * sincSquared(Math.PI * config.slitWidth * maximum / (config.wavelength * config.screenDistance)))
  }
})

test('three through five slits match the closed-form grating factor and its extra zeros', () => {
  for (const count of [3, 4, 5]) {
    const config = normalizeConfig({ slitCount: count })
    for (const z of [-2.7, -1.13, -0.19, 0.12, 0.41, 0.91, 2.1]) {
      close(intensityAt(z, config), analyticIntensity(z, config))
    }
    // Between two principal orders N−1 minima are required. cos² raised
    // to an arbitrary power, used by the old implementation, cannot do this.
    for (let index = 1; index < count; index++) {
      const z = fringeSpacing(config) * index / count
      assert.ok(intensityAt(z, config) < 1e-25)
    }
  }
})

test('detector mixture removes cross terms while preserving the single-slit envelope', () => {
  for (const count of [2, 3, 5]) {
    const config = normalizeConfig({ slitCount: count })
    for (const z of [0, 0.12, 0.29, 0.63, 1.37]) {
      const coherent = intensityAt(z, config)
      const marked = intensityAt(z, { ...config, detectorStrength: 1 })
      close(marked, sincSquared(Math.PI * config.slitWidth * z / (config.wavelength * config.screenDistance)))
      close(intensityAt(z, { ...config, detectorStrength: 0.35 }), 0.65 * coherent + 0.35 * marked)
    }
  }
})

test('wider slits narrow the envelope, and wavelength and distance expand fringes', () => {
  const config = normalizeConfig({ slitCount: 1, slitWidth: 0.06 })
  const wider = normalizeConfig({ slitWidth: 0.12 }, config)
  const wideZero = wider.wavelength * wider.screenDistance / wider.slitWidth
  assert.ok(intensityAt(wideZero, wider) < 1e-25)
  assert.ok(intensityAt(wideZero, config) > 0.4)
  close(fringeSpacing({ ...DEFAULT_CONFIG, wavelength: 0.1 }), 2 * fringeSpacing(DEFAULT_CONFIG))
  close(fringeSpacing({ ...DEFAULT_CONFIG, screenDistance: 5.25 }), 1.5 * fringeSpacing(DEFAULT_CONFIG))
  close(fringeSpacing({ ...DEFAULT_CONFIG, slitSeparation: 0.6 }), 0.5 * fringeSpacing(DEFAULT_CONFIG))
})

test('patterns are symmetric, finite and species independent at a fixed wavelength', () => {
  for (const count of [1, 2, 5]) {
    const config = normalizeConfig({ slitCount: count, detectorStrength: 0.2 })
    for (let index = 0; index < 100; index++) {
      const z = index * 0.031
      const value = intensityAt(z, config)
      assert.ok(Number.isFinite(value) && value >= 0)
      close(value, intensityAt(-z, config))
      close(value, intensityAt(z, { ...config, particleType: 'photon' }))
      close(value, intensityAt(z, { ...config, particleType: 'neutron' }))
    }
  }
  assert.equal(intensityAt(NaN, DEFAULT_CONFIG), 0)
  assert.equal(intensityAt(Infinity, DEFAULT_CONFIG), 0)
})

test('finite-screen distributions are normalized and monotone across control extremes', () => {
  const configs = [
    DEFAULT_CONFIG,
    normalizeConfig({ slitCount: 1, slitWidth: 0.025, wavelength: 0.1, screenDistance: 6 }),
    normalizeConfig({ slitCount: 5, slitWidth: 0.16, slitSeparation: 0.6, wavelength: 0.025, screenDistance: 2 }),
    normalizeConfig({ slitCount: 5, detectorStrength: 1 }),
  ]
  for (const config of configs) {
    const distribution = buildDistribution(config)
    assert.equal(distribution.positions.length, DISTRIBUTION_BINS)
    close(distribution.probabilities.reduce((sum, value) => sum + value, 0), 1)
    assert.equal(distribution.cdf.at(-1), 1)
    distribution.cdf.forEach((value, index) => {
      assert.ok(value >= (index ? distribution.cdf[index - 1] : 0) && value <= 1)
      assert.ok(distribution.probabilities[index] >= 0)
      close(distribution.probabilities[index], distribution.probabilities[DISTRIBUTION_BINS - 1 - index])
    })
  }
})

test('inverse-CDF sampling is continuous, bounded and reaches the chosen probability quantile', () => {
  const distribution = buildDistribution(DEFAULT_CONFIG)
  for (const quantile of [0, 0.0001, 0.05, 0.25, 0.5, 0.92, 0.9999, 1]) {
    const z = sampleImpact(distribution, () => quantile)
    assert.ok(z >= -3 && z <= 3)
    const index = Math.min(distribution.cdf.length - 1, Math.floor((z + 3) / distribution.binWidth))
    const left = -3 + index * distribution.binWidth
    const recovered = (index ? distribution.cdf[index - 1] : 0)
      + (z - left) / distribution.binWidth * distribution.probabilities[index]
    close(recovered, quantile)
  }
  assert.equal(sampleImpact(distribution, () => -1), sampleImpact(distribution, () => 0))
  close(sampleImpact(distribution, () => NaN), sampleImpact(distribution, () => 0.5))
})

test('fine physical CDF resolves narrow five-slit peaks independently of the 256-bin histogram', () => {
  const config = normalizeConfig({ slitCount: 5, slitWidth: 0.16, slitSeparation: 0.6, wavelength: 0.025, screenDistance: 2 })
  const distribution = buildDistribution(config)
  const reference = distribution.positions.map((z) => {
    let integral = 0
    for (let index = 0; index < 64; index++) {
      integral += analyticIntensity(z - distribution.binWidth / 2 + (index + 0.5) * distribution.binWidth / 64, config)
    }
    return integral / 64
  })
  const total = reference.reduce((sum, value) => sum + value, 0)
  const variation = reference.reduce((sum, value, index) => sum + Math.abs(distribution.probabilities[index] - value / total), 0)
  assert.ok(variation < 0.01, `L1 distribution error ${variation} exceeds 1%`)
  reference.forEach((value, index) => close(distribution.probabilities[index], value / total, 0.00002))
})

test('sampled detections converge to an independent integration of the analytic distribution', () => {
  const config = normalizeConfig({ slitCount: 3, detectorStrength: 0.3 })
  const distribution = buildDistribution(config, 2048)
  const groups = 16
  const sampleCount = 32768
  const observed = new Array(groups).fill(0)
  for (let index = 0; index < sampleCount; index++) {
    const z = sampleImpact(distribution, () => (index + 0.5) / sampleCount)
    observed[Math.min(groups - 1, Math.floor((z + 3) / 6 * groups))]++
  }
  const integrated = new Array(groups).fill(0)
  const integrationSteps = 65536
  for (let index = 0; index < integrationSteps; index++) {
    const z = -3 + (index + 0.5) * 6 / integrationSteps
    integrated[Math.floor(index / integrationSteps * groups)] += analyticIntensity(z, config)
  }
  const total = integrated.reduce((sum, value) => sum + value, 0)
  observed.forEach((count, index) => close(count / sampleCount, integrated[index] / total, 0.00008))
})
