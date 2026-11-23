"""06_pattern_classification.py - Gaussian/Bayes + perceptron classification."""
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

OUT = Path("outputs"); OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(60)
n = 250
means = [np.array([-1.2, -0.8]), np.array([1.2, 0.9])]
cov = np.array([[1.0, .25],[.25, .8]])
X0 = rng.multivariate_normal(means[0], cov, n)
X1 = rng.multivariate_normal(means[1], cov, n)
X = np.vstack([X0, X1]); y = np.r_[np.zeros(n,dtype=int), np.ones(n,dtype=int)]

# Perceptron.
Xb = np.c_[np.ones(len(X)), X]
w = np.zeros(3)
for _ in range(100):
    mistakes = 0
    for xi, target in zip(Xb, y):
        p = int(w @ xi >= 0)
        if p != target:
            w += .03 * (target - p) * xi
            mistakes += 1
    if mistakes == 0:
        break
perc = (Xb @ w >= 0).astype(int)

# Equal-covariance Gaussian Bayes classifier (linear discriminant).
inv = np.linalg.inv(cov)
mu0, mu1 = means
def bayes_score(z, mu):
    return -0.5*((z-mu) @ inv * (z-mu)).sum(axis=1) - 0.5*np.log(np.linalg.det(cov))
s0, s1 = bayes_score(X, mu0), bayes_score(X, mu1)
bayes = (s1 > s0).astype(int)

perc_acc = np.mean(perc == y)
bayes_acc = np.mean(bayes == y)

gx = np.linspace(X[:,0].min()-1, X[:,0].max()+1, 250)
gy = np.linspace(X[:,1].min()-1, X[:,1].max()+1, 250)
xx, yy = np.meshgrid(gx, gy)
G = np.c_[xx.ravel(), yy.ravel()]
GB = np.c_[np.ones(len(G)), G]
bp = (GB @ w >= 0).astype(int).reshape(xx.shape)
bs = (bayes_score(G, mu1) > bayes_score(G, mu0)).astype(int).reshape(xx.shape)

for name, surface, acc in [("perceptron", bp, perc_acc), ("bayes", bs, bayes_acc)]:
    plt.figure(figsize=(7,5))
    plt.contourf(xx, yy, surface, levels=[-.5,.5,1.5], alpha=.25)
    plt.scatter(X0[:,0], X0[:,1], label="Class 0")
    plt.scatter(X1[:,0], X1[:,1], label="Class 1")
    plt.xlabel("x1"); plt.ylabel("x2")
    plt.title(f"{name.title()} Pattern Classification (accuracy = {acc:.3f})")
    plt.legend(); plt.tight_layout()
    plt.savefig(OUT / f"{name}_classification.png", dpi=160)
    plt.close()

cm = np.array([
    [np.sum((y==0)&(bayes==0)), np.sum((y==0)&(bayes==1))],
    [np.sum((y==1)&(bayes==0)), np.sum((y==1)&(bayes==1))]
])
print("Perceptron accuracy:", f"{perc_acc:.3f}")
print("Gaussian Bayes accuracy:", f"{bayes_acc:.3f}")
print("Bayes confusion matrix:")
print(cm)
