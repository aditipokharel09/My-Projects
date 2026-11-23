"""01_perceptron.py - Single Layer Perceptron (Units 1-2)."""
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

OUT = Path("outputs"); OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(10)

# Two linearly separable Gaussian classes.
n = 120
c0 = rng.normal(size=(n, 2)) + np.array([-1.5, -1.0])
c1 = rng.normal(size=(n, 2)) + np.array([1.5, 1.0])
X = np.vstack([c0, c1])
y = np.r_[np.zeros(n, dtype=int), np.ones(n, dtype=int)]

Xb = np.c_[np.ones(len(X)), X]

def perceptron_train(Xb, y, lr=0.1, max_epochs=100):
    w = np.zeros(Xb.shape[1])
    errors = []
    for epoch in range(max_epochs):
        mistakes = 0
        for xi, target in zip(Xb, y):
            pred = 1 if np.dot(w, xi) >= 0 else 0
            update = lr * (target - pred)
            if update != 0:
                w += update * xi
                mistakes += 1
        errors.append(mistakes)
        if mistakes == 0:
            return w, errors, epoch + 1
    return w, errors, max_epochs

w, errors, epochs = perceptron_train(Xb, y)
pred = (Xb @ w >= 0).astype(int)
accuracy = np.mean(pred == y)

plt.figure(figsize=(8, 5))
plt.scatter(c0[:, 0], c0[:, 1], label="Class 0")
plt.scatter(c1[:, 0], c1[:, 1], label="Class 1")
xx = np.linspace(X[:, 0].min() - .5, X[:, 0].max() + .5, 200)
if abs(w[2]) > 1e-12:
    yy = -(w[0] + w[1] * xx) / w[2]
    plt.plot(xx, yy, label="Perceptron decision boundary")
plt.xlabel("x1"); plt.ylabel("x2")
plt.title("Single-Layer Perceptron: Linearly Separable Classification")
plt.legend(); plt.tight_layout()
plt.savefig(OUT / "perceptron_decision_boundary.png", dpi=160)
plt.close()

plt.figure(figsize=(7, 4))
plt.plot(np.arange(1, len(errors) + 1), errors, marker="o")
plt.xlabel("Epoch"); plt.ylabel("Number of misclassified samples")
plt.title("Perceptron Convergence")
plt.tight_layout()
plt.savefig(OUT / "perceptron_convergence.png", dpi=160)
plt.close()

# XOR demonstrates the limitation of a single linear decision surface.
xor = np.array([[0,0],[0,1],[1,0],[1,1]], float)
xor_y = np.array([0,1,1,0])
_, xor_errors, _ = perceptron_train(np.c_[np.ones(4), xor], xor_y, max_epochs=20)

print("Single-layer perceptron accuracy:", f"{accuracy:.3f}")
print("Converged in epochs:", epochs)
print("XOR mistakes per epoch (does not converge to zero):", xor_errors)
