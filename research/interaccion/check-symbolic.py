import json
from sympy import Rational, simplify, sqrt, symbols

# Optional research check; SymPy is not a web dependency or a CI requirement.
beta = Rational(4, 5)
gamma = 1 / sqrt(1 - beta**2)
mass, temp_constant, power_constant, area_constant = symbols('M a b d', positive=True)
temperature = temp_constant / mass
power = power_constant / mass**2
area = area_constant * mass**2
results = {
    'gamma_at_0_8c': str(gamma),
    'moving_clock_rate': str(simplify(1 / gamma)),
    'light_speed_invariant': str(simplify(beta**2 + 1 / gamma**2)),
    'double_mass_temperature': str(simplify(temperature.subs(mass, 2 * mass) / temperature)),
    'double_mass_power': str(simplify(power.subs(mass, 2 * mass) / power)),
    'double_mass_area': str(simplify(area.subs(mass, 2 * mass) / area)),
}
assert list(results.values()) == ['5/3', '3/5', '1', '1/2', '1/4', '4']
print(json.dumps(results, indent=2))
