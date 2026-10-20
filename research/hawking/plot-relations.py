"""Optional figure generation. Requires matplotlib and numpy, not browser dependencies."""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

folder = Path(__file__).resolve().parent
reference = json.loads((folder / "reference-results.json").read_text(encoding="utf-8-sig"))
constants = reference["constants"]
mass = np.logspace(9, 40, 600)
temperature = constants["hbar"] * constants["c"] ** 3 / (8 * np.pi * constants["G"] * mass * constants["k"])
radius = 2 * constants["G"] * mass / constants["c"] ** 2
power = constants["sigma"] * 4 * np.pi * radius ** 2 * temperature ** 4

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "svg.fonttype": "none", "svg.hashsalt": "hawking-relations-v1"})
fig, axes = plt.subplots(1, 2, figsize=(11.5, 5.4), constrained_layout=True)
fig.patch.set_facecolor("#f5f6f1")
fig.suptitle("Radiación de Hawking: menos masa, mayor temperatura", fontsize=17, color="#243d37")
for axis in axes:
    axis.set_facecolor("#fcfdf8")
    axis.set_xscale("log")
    axis.set_yscale("log")
    axis.set_xlim(1e9, 1e40)
    axis.set_xlabel("Masa M (kg)")
    axis.grid(True, which="major", alpha=0.22)
    axis.spines[["top", "right"]].set_visible(False)

axes[0].plot(mass, temperature, color="#626ca8", linewidth=2.4)
axes[0].set_ylabel("Temperatura de Hawking (K)")
axes[0].set_title("Schwarzschild: T ∝ 1/M", pad=16)
axes[0].axhline(constants["cmbTemperature"], color="#9a7543", linestyle="--", linewidth=1.3, label="CMB de referencia: 2,7255 K")
for case_index, text, offset in [(0, "1 masa solar\n6,17 × 10⁻⁸ K", (-95, -36)), (2, "Hipotético: 10¹² kg\n1,23 × 10¹¹ K", (12, 13))]:
    case = reference["cases"][case_index]
    axes[0].scatter(case["massKg"], case["temperatureK"], color="#263e38", zorder=4)
    axes[0].annotate(text, (case["massKg"], case["temperatureK"]), xytext=offset, textcoords="offset points", fontsize=9)
axes[0].legend(loc="lower left", frameon=False, fontsize=9)

axes[1].plot(mass, power, color="#5d7c55", linewidth=2.4)
axes[1].set_ylabel("Potencia ideal de fotones (W)")
axes[1].set_title("Aproximación: P = AσT⁴ ∝ 1/M²", pad=16)
axes[1].text(.04, .06, "Área del horizonte y fotones de cuerpo negro.\nSin factores de cuerpo gris ni otras especies.", transform=axes[1].transAxes, fontsize=9, color="#5c6954", linespacing=1.6)
fig.supxlabel("Cálculo teórico en SI con constantes NIST e IAU. No son detecciones. Modelo y fuentes en HAWKING_INVESTIGACION.md.", fontsize=9, color="#5c6954")
fig.savefig(folder / "relaciones-masa.png", dpi=160)
svg = folder / "relaciones-masa.svg"
fig.savefig(svg, metadata={"Date": None})
# Matplotlib emits spaces at path line ends; normalize without changing geometry.
svg.write_text("\n".join(line.rstrip() for line in svg.read_text(encoding="utf-8").splitlines()) + "\n", encoding="utf-8")
plt.close(fig)
print("Generated relaciones-masa.png and relaciones-masa.svg")
