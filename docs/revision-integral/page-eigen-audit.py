"""Independent Schmidt/SVD oracle, separate from the app's real-block Jacobi solver.

Uses the existing analysis environment's NumPy; it is not an app dependency.
Run after page-audit.mjs, from repository root. All 0..N partitions are compared.
"""
import json
from pathlib import Path
import numpy as np

folder = Path('../qa-integral-retos-2026-11-02')
states = json.loads((folder / 'page-numpy-input.json').read_text(encoding='utf-8'))
tolerance = 1e-10  # absolute probability and bit tolerances, chosen before execution
max_spectrum_error = 0.0
max_entropy_error = 0.0
partitions = 0
for state in states:
    amplitude = np.asarray(state['real']) + 1j * np.asarray(state['imag'])
    for item in state['partitions']:
        k = item['k']
        coefficients = amplitude.reshape((2 ** k, 2 ** (state['n'] - k)))
        expected = np.sort(np.linalg.svd(coefficients, compute_uv=False) ** 2)
        actual = np.sort(np.asarray(item['spectrum']))
        positive = expected[expected > 0]
        entropy = float(-np.sum(positive * np.log2(positive)))
        spectral_error = float(np.max(np.abs(actual - expected)))
        entropy_error = abs(item['entropy'] - entropy)
        max_spectrum_error = max(max_spectrum_error, spectral_error)
        max_entropy_error = max(max_entropy_error, entropy_error)
        assert spectral_error < tolerance, (state['n'], state['seed'], k, spectral_error)
        assert entropy_error < tolerance, (state['n'], state['seed'], k, entropy_error)
        partitions += 1
report = {
    'oracle': 'complex Schmidt singular values via numpy.linalg.svd',
    'numpy': np.__version__,
    'states': len(states),
    'partitions': partitions,
    'absoluteTolerance': tolerance,
    'maxSpectrumError': max_spectrum_error,
    'maxEntropyErrorBits': max_entropy_error,
    'result': 'APROBADO',
}
(folder / 'page-numpy-result.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
