// Export actual amplitudes and results for comparison with an independent SVD.
// Run from the repository root. This never becomes a dependency of the app.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createState, reducedSpectrum, entropyAt } from '../../src/maldacena/page/physics.ts'

const output = path.resolve('../qa-integral-retos-2026-11-02/page-numpy-input.json')
const states = []
for (const n of [4, 5, 6, 7, 8]) {
  for (const seed of [1, 17, 99, 12345, 4294967295]) {
    const state = createState(n, seed)
    states.push({
      n,
      seed,
      real: [...state.real],
      imag: [...state.imag],
      partitions: Array.from({ length: n + 1 }, (_, k) => ({
        k,
        spectrum: reducedSpectrum(state, k),
        entropy: entropyAt(state, k),
      })),
    })
  }
}
await fs.mkdir(path.dirname(output), { recursive: true })
await fs.writeFile(output, JSON.stringify(states))
console.log(JSON.stringify({ states: states.length, partitions: states.reduce((s, v) => s + v.partitions.length, 0), output }))
