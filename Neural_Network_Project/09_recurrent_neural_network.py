"""09_recurrent_neural_network.py - simple RNN sequence prediction (Unit 8)."""
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

OUT = Path("outputs"); OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(90)

# Predict the next sample of a smooth temporal signal from previous samples.
t = np.arange(700, dtype=float)
seq = np.sin(2*np.pi*0.015*t) + .35*np.sin(2*np.pi*0.041*t)
seq = (seq - seq.mean()) / seq.std()

lookback = 12
X = np.array([seq[i-lookback:i] for i in range(lookback, len(seq))])
Y = seq[lookback:, None]
split = 520
Xtr, Ytr = X[:split], Y[:split]
Xte, Yte = X[split:], Y[split:]

H = 16
Wxh = rng.normal(0,.25,(1,H))
Whh = rng.normal(0,.25,(H,H))
Why = rng.normal(0,.25,(H,1))
bh = np.zeros((1,H)); by = np.zeros((1,1))

def tanh(z): return np.tanh(z)

def forward(xseq):
    hs = [np.zeros((1,H))]
    for value in xseq:
        hs.append(tanh(np.array([[value]]) @ Wxh + hs[-1] @ Whh + bh))
    out = hs[-1] @ Why + by
    return out, hs

losses = []
lr = 0.004
for epoch in range(180):
    order = rng.permutation(len(Xtr))
    total = 0.0
    # Online BPTT for short sequences.
    for idx in order:
        xseq = Xtr[idx]
        target = Ytr[idx]
        out, hs = forward(xseq)
        e = out - target
        total += float(e*e)

        dWhy = hs[-1].T @ (2*e)
        dby = 2*e
        dh = (2*e) @ Why.T
        dWxh = np.zeros_like(Wxh)
        dWhh = np.zeros_like(Whh)
        dbh = np.zeros_like(bh)

        for k in range(lookback, 0, -1):
            h = hs[k]
            hprev = hs[k-1]
            dz = dh * (1-h*h)
            dWxh += np.array([[xseq[k-1]]]).T @ dz
            dWhh += hprev.T @ dz
            dbh += dz
            dh = dz @ Whh.T

        # Mild gradient clipping for stability.
        for g in (dWxh,dWhh,dWhy,dbh,dby):
            np.clip(g, -1.0, 1.0, out=g)
        Wxh[:] -= lr*dWxh
        Whh[:] -= lr*dWhh
        Why[:] -= lr*dWhy
        bh[:] -= lr*dbh
        by[:] -= lr*dby

    losses.append(total/len(Xtr))

def predict(Xset):
    return np.array([forward(row)[0].item() for row in Xset])

train_pred = predict(Xtr)
test_pred = predict(Xte)
test_mse = np.mean((test_pred - Yte.ravel())**2)

plt.figure(figsize=(8,4))
plt.plot(losses)
plt.xlabel("Epoch"); plt.ylabel("Training MSE")
plt.title("RNN Training with Backpropagation Through Time")
plt.tight_layout()
plt.savefig(OUT / "rnn_sequence_loss_curve.png", dpi=160)
plt.close()

plt.figure(figsize=(9,4))
k = min(180, len(Xte))
plt.plot(Yte[:k], label="Actual")
plt.plot(test_pred[:k], label="RNN prediction")
plt.xlabel("Test time step"); plt.ylabel("Normalized signal")
plt.title(f"RNN One-Step Sequence Prediction (test MSE = {test_mse:.4f})")
plt.legend(); plt.tight_layout()
plt.savefig(OUT / "rnn_sequence_prediction.png", dpi=160)
plt.close()

print("RNN hidden units:", H)
print("Sequence lookback:", lookback)
print("Test MSE:", f"{test_mse:.5f}")
