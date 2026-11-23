"""07_kmeans_rbf.py - K-means clustering and RBF regression (Unit 6)."""
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

OUT = Path("outputs"); OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(70)

# Unsupervised clustering data.
centers_true = np.array([[-2,-1],[0,2],[2,-1]], float)
X = np.vstack([c + rng.normal(0,.45,(80,2)) for c in centers_true])

k = 3
centers = X[rng.choice(len(X), k, replace=False)].copy()
for _ in range(50):
    d = ((X[:,None,:]-centers[None,:,:])**2).sum(axis=2)
    labels = d.argmin(axis=1)
    new_centers = np.array([X[labels==j].mean(axis=0) if np.any(labels==j) else centers[j] for j in range(k)])
    if np.allclose(new_centers, centers):
        break
    centers = new_centers

plt.figure(figsize=(7,5))
for j in range(k):
    plt.scatter(X[labels==j,0], X[labels==j,1], label=f"Cluster {j+1}")
plt.scatter(centers[:,0], centers[:,1], marker="X", s=160, label="Centroids")
plt.xlabel("x1"); plt.ylabel("x2"); plt.title("K-Means Clustering")
plt.legend(); plt.tight_layout()
plt.savefig(OUT / "kmeans_clusters.png", dpi=160)
plt.close()

# RBF regression: centers from 1D K-means, Gaussian bases, linear output weights.
xr = np.linspace(-3,3,220)
yr = np.sin(1.4*xr) + .15*rng.normal(size=len(xr))
c = np.linspace(-3,3,18)
sigma = .55
Phi = np.exp(-((xr[:,None]-c[None,:])**2)/(2*sigma**2))
Phi_b = np.c_[np.ones(len(xr)), Phi]
wr = np.linalg.solve(Phi_b.T @ Phi_b + 1e-4 * np.eye(Phi_b.shape[1]), Phi_b.T@yr)
fit = Phi_b @ wr

plt.figure(figsize=(8,5))
plt.scatter(xr, yr, s=12, label="Noisy samples")
plt.plot(xr, np.sin(1.4*xr), label="True function")
plt.plot(xr, fit, label="RBF regression")
plt.xlabel("x"); plt.ylabel("y"); plt.title("Radial-Basis-Function Regression")
plt.legend(); plt.tight_layout()
plt.savefig(OUT / "rbf_regression.png", dpi=160)
plt.close()

print("K-means converged centroids:")
print(np.round(centers, 3))
print("RBF basis count:", len(c))
print("RBF training MSE:", f"{np.mean((yr-fit)**2):.5f}")
