"""02_mlp_xor.py - Multilayer Perceptron + backpropagation (Unit 5)."""
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

OUT = Path("outputs"); OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(20)

X = np.array([[0.,0.],[0.,1.],[1.,0.],[1.,1.]])
y = np.array([[0.],[1.],[1.],[0.]])

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -50, 50)))

W1 = rng.normal(0, 1.0, (2, 4))
b1 = np.zeros((1, 4))
W2 = rng.normal(0, 1.0, (4, 1))
b2 = np.zeros((1, 1))

losses = []
lr = 1.2
for epoch in range(12000):
    z1 = X @ W1 + b1
    a1 = np.tanh(z1)
    z2 = a1 @ W2 + b2
    a2 = sigmoid(z2)

    loss = np.mean((a2 - y) ** 2)
    losses.append(loss)

    d2 = (2.0 / len(X)) * (a2 - y) * a2 * (1 - a2)
    dW2 = a1.T @ d2
    db2 = d2.sum(axis=0, keepdims=True)
    d1 = (d2 @ W2.T) * (1 - a1**2)
    dW1 = X.T @ d1
    db1 = d1.sum(axis=0, keepdims=True)

    W2 -= lr * dW2
    b2 -= lr * db2
    W1 -= lr * dW1
    b1 -= lr * db1

pred_prob = sigmoid(np.tanh(X @ W1 + b1) @ W2 + b2)
pred = (pred_prob >= .5).astype(int)
acc = np.mean(pred == y)

plt.figure(figsize=(7, 4))
plt.plot(losses)
plt.xlabel("Epoch"); plt.ylabel("Mean squared error")
plt.title("MLP Backpropagation on XOR")
plt.tight_layout()
plt.savefig(OUT / "mlp_xor_loss_curve.png", dpi=160)
plt.close()

# Decision surface.
gx = np.linspace(-0.25, 1.25, 250)
gy = np.linspace(-0.25, 1.25, 250)
xx, yy = np.meshgrid(gx, gy)
grid = np.c_[xx.ravel(), yy.ravel()]
probs = sigmoid(np.tanh(grid @ W1 + b1) @ W2 + b2).reshape(xx.shape)

plt.figure(figsize=(7, 5))
plt.contourf(xx, yy, probs, levels=20, alpha=.35)
plt.scatter(X[:,0], X[:,1], c=y.ravel(), s=80, edgecolors="black")
plt.xlabel("x1"); plt.ylabel("x2")
plt.title("MLP Decision Surface for XOR")
plt.tight_layout()
plt.savefig(OUT / "mlp_xor_decision_surface.png", dpi=160)
plt.close()

print("Final XOR probabilities:", np.round(pred_prob.ravel(), 4))
print("MLP XOR accuracy:", f"{acc:.3f}")
