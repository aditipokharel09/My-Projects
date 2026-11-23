"""05_linear_prediction.py - LMS linear prediction (Units 4 + practical)."""
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

OUT = Path("outputs"); OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(50)
n = 1200
t = np.arange(n)
clean = 1.5*np.sin(2*np.pi*0.012*t) + .5*np.sin(2*np.pi*0.031*t)
x = clean + rng.normal(0, .35, n)

order = 8
mu = 0.01
w = np.zeros(order)
pred = np.zeros(n)
err = np.zeros(n)
history = []

for i in range(order, n):
    u = x[i-order:i][::-1]
    pred[i] = w @ u
    err[i] = x[i] - pred[i]
    w += mu * err[i] * u
    if i % 2 == 0:
        history.append(w.copy())

history = np.asarray(history)
mse = np.mean(err[order:]**2)

plt.figure(figsize=(9, 4))
plt.plot(t[:500], x[:500], label="Observed signal")
plt.plot(t[:500], pred[:500], label="LMS linear prediction")
plt.xlabel("Sample"); plt.ylabel("Amplitude")
plt.title("Linear Prediction Using LMS")
plt.legend(); plt.tight_layout()
plt.savefig(OUT / "linear_prediction_result.png", dpi=160)
plt.close()

plt.figure(figsize=(8, 4))
plt.plot(t[order:], err[order:]**2)
plt.xlabel("Sample"); plt.ylabel("Squared prediction error")
plt.title(f"Linear Prediction Error (MSE = {mse:.4f})")
plt.tight_layout()
plt.savefig(OUT / "linear_prediction_error.png", dpi=160)
plt.close()

plt.figure(figsize=(8, 4))
for j in range(order):
    plt.plot(history[:, j], label=f"w{j}")
plt.xlabel("Update index"); plt.ylabel("Coefficient")
plt.title("LMS Linear-Prediction Coefficient Convergence")
plt.legend(ncol=2); plt.tight_layout()
plt.savefig(OUT / "linear_prediction_weights.png", dpi=160)
plt.close()

print("Linear prediction order:", order)
print("Prediction MSE:", f"{mse:.5f}")
print("Final coefficients:", np.round(w, 4))
