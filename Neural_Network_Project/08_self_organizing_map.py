"""08_self_organizing_map.py - small Self-Organizing Map (Unit 7)."""
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

OUT = Path("outputs"); OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(80)

# Four input groups; labels are deliberately unused during training.
groups = [
    np.array([-1.5,-1.2]), np.array([1.4,-1.0]),
    np.array([-1.0,1.4]), np.array([1.3,1.4])
]
X = np.vstack([g + rng.normal(0,.22,(100,2)) for g in groups])

rows, cols = 8, 8
W = rng.uniform(X.min(axis=0), X.max(axis=0), (rows, cols, 2))
rr, cc = np.meshgrid(np.arange(rows), np.arange(cols), indexing="ij")
grid = np.c_[rr.ravel(), cc.ravel()]

steps = 3500
for step in range(steps):
    x = X[rng.integers(len(X))]
    d = ((W-x)**2).sum(axis=2)
    br, bc = np.unravel_index(np.argmin(d), (rows, cols))
    frac = step / max(1, steps-1)
    lr = .5 * (1-frac) + .03
    radius = max(0.7, 3.5*(1-frac))
    dist2 = (grid[:,0]-br)**2 + (grid[:,1]-bc)**2
    influence = np.exp(-dist2/(2*radius**2)).reshape(rows, cols)
    W += lr * influence[...,None] * (x-W)

plt.figure(figsize=(7,6))
plt.scatter(X[:,0], X[:,1], s=10, alpha=.25, label="Input samples")
plt.scatter(W[:,:,0].ravel(), W[:,:,1].ravel(), s=55)
for r in range(rows):
    plt.plot(W[r,:,0], W[r,:,1], alpha=.6)
for c in range(cols):
    plt.plot(W[:,c,0], W[:,c,1], alpha=.6)
plt.xlabel("Feature 1"); plt.ylabel("Feature 2")
plt.title("Self-Organizing Map After Unsupervised Training")
plt.legend(); plt.tight_layout()
plt.savefig(OUT / "som_feature_map.png", dpi=160)
plt.close()

# U-matrix style visualization: mean neighbor distance.
U = np.zeros((rows, cols))
for r in range(rows):
    for c in range(cols):
        neigh = []
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            rr2, cc2 = r+dr, c+dc
            if 0 <= rr2 < rows and 0 <= cc2 < cols:
                neigh.append(np.linalg.norm(W[r,c]-W[rr2,cc2]))
        U[r,c] = np.mean(neigh)

plt.figure(figsize=(6,5))
plt.imshow(U, interpolation="nearest")
plt.colorbar(label="Mean neighbor distance")
plt.title("SOM U-Matrix")
plt.xlabel("Map column"); plt.ylabel("Map row")
plt.tight_layout()
plt.savefig(OUT / "som_u_matrix.png", dpi=160)
plt.close()

print("SOM grid:", f"{rows} x {cols}")
print("Training samples:", len(X))
