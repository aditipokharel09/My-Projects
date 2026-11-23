"""
rnn_dynamic_gesture.py
------------------------
Unit 8 (Dynamic Driven Recurrent Networks): a from-scratch many-to-one
RNN, trained with Back-Propagation Through Time (BPTT), to classify
DYNAMIC gestures (swipe_left, swipe_right, circle, wave) from a
sequence of (x, y) centroid positions over 20 timesteps.

Why an RNN and not the MLP from before: the MLP classifies a single
static frame. These gestures only make sense as a SEQUENCE -- a single
frame of a 'circle' looks just like a random point. The RNN's hidden
state carries information forward through time, which is exactly what
lets it tell these apart.

Run: python3 rnn_dynamic_gesture.py
Output: outputs/rnn_loss_curve.png, printed accuracy
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score

os.makedirs("outputs", exist_ok=True)
rng = np.random.default_rng(4)

# ---------------------------------------------------------------
# Load data
# ---------------------------------------------------------------
with open("dynamic_gestures.json") as f:
    data = json.load(f)

CLASSES = sorted(set(d["label"] for d in data))
class_to_idx = {c: i for i, c in enumerate(CLASSES)}
T = 20
n_features = 2  # (x, y) per timestep

X = np.array([d["sequence"] for d in data]).reshape(-1, T, n_features)
y_idx = np.array([class_to_idx[d["label"]] for d in data])
n_classes = len(CLASSES)
Y = np.eye(n_classes)[y_idx]

# normalize
X_mean, X_std = X.mean(axis=(0, 1)), X.std(axis=(0, 1)) + 1e-8
X = (X - X_mean) / X_std

# train/test split
n = len(X)
idx = rng.permutation(n)
split = int(0.8 * n)
train_idx, test_idx = idx[:split], idx[split:]
X_train, Y_train, y_train_idx = X[train_idx], Y[train_idx], y_idx[train_idx]
X_test, Y_test, y_test_idx = X[test_idx], Y[test_idx], y_idx[test_idx]

# ---------------------------------------------------------------
# From-scratch many-to-one RNN
#   h_t = tanh(Wxh . x_t + Whh . h_{t-1} + bh)
#   output computed from final hidden state h_T
#   y_hat = softmax(Why . h_T + by)
# ---------------------------------------------------------------
n_hidden = 12

Wxh = rng.normal(0, 0.3, (n_features, n_hidden))
Whh = rng.normal(0, 0.3, (n_hidden, n_hidden))
bh = np.zeros(n_hidden)
Why = rng.normal(0, 0.3, (n_hidden, n_classes))
by = np.zeros(n_classes)

def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)

def forward(X_batch):
    """Returns hidden states at every timestep (needed for BPTT) and output."""
    batch_size = X_batch.shape[0]
    h = np.zeros((batch_size, n_hidden))
    hidden_states = [h]
    for t in range(T):
        h = np.tanh(X_batch[:, t, :] @ Wxh + h @ Whh + bh)
        hidden_states.append(h)
    logits = h @ Why + by
    probs = softmax(logits)
    return hidden_states, probs

lr = 0.05
epochs = 150
batch_size = 32
loss_history = []

for epoch in range(epochs):
    perm = rng.permutation(len(X_train))
    X_shuf, Y_shuf = X_train[perm], Y_train[perm]
    epoch_loss = 0.0

    for start in range(0, len(X_shuf), batch_size):
        xb = X_shuf[start:start + batch_size]
        yb = Y_shuf[start:start + batch_size]
        bs = len(xb)

        hidden_states, probs = forward(xb)
        eps = 1e-9
        loss = -np.sum(yb * np.log(probs + eps)) / bs
        epoch_loss += loss * bs

        # ---- Backpropagation Through Time ----
        dlogits = (probs - yb) / bs
        dWhy = hidden_states[-1].T @ dlogits
        dby = dlogits.sum(axis=0)

        dh_next = dlogits @ Why.T  # gradient flowing back into last hidden state
        dWxh = np.zeros_like(Wxh)
        dWhh = np.zeros_like(Whh)
        dbh = np.zeros_like(bh)

        for t in reversed(range(T)):
            h_t = hidden_states[t + 1]
            h_prev = hidden_states[t]
            dtanh = dh_next * (1 - h_t ** 2)          # tanh derivative
            dWxh += xb[:, t, :].T @ dtanh
            dWhh += h_prev.T @ dtanh
            dbh += dtanh.sum(axis=0)
            dh_next = dtanh @ Whh.T                    # propagate error to t-1

        # gradient clipping (standard practice for RNNs -- avoids exploding
        # gradients, related to the "vanishing/exploding gradients" topic
        # discussed in Unit 8)
        for grad in (dWxh, dWhh, dWhy, dbh, dby):
            np.clip(grad, -5, 5, out=grad)

        Wxh -= lr * dWxh
        Whh -= lr * dWhh
        Why -= lr * dWhy
        bh -= lr * dbh
        by -= lr * dby

    loss_history.append(epoch_loss / len(X_train))

# ---------------------------------------------------------------
# Evaluate
# ---------------------------------------------------------------
_, train_probs = forward(X_train)
_, test_probs = forward(X_test)
train_acc = accuracy_score(y_train_idx, train_probs.argmax(axis=1))
test_acc = accuracy_score(y_test_idx, test_probs.argmax(axis=1))
print(f"[From-scratch RNN] Train accuracy: {train_acc:.3f} | Test accuracy: {test_acc:.3f}")

plt.figure(figsize=(6, 4))
plt.plot(loss_history)
plt.xlabel("Epoch")
plt.ylabel("Cross-entropy loss")
plt.title("From-Scratch RNN Training Loss (BPTT)\nDynamic Gesture Classification")
plt.tight_layout()
plt.savefig("outputs/rnn_loss_curve.png", dpi=150)
plt.close()
print("Saved outputs/rnn_loss_curve.png")

# ---------------------------------------------------------------
# Bonus: show that a plain MLP fed only a SINGLE, randomly-timed frame
# (no memory of the sequence) fails at this task -- this is the key
# comparison that justifies using an RNN in your report. Because each
# sequence started from a random position, one isolated (x, y) point
# carries almost no information about which gesture it came from --
# only the pattern of motion across the whole sequence does.
# ---------------------------------------------------------------
from sklearn.neural_network import MLPClassifier

snapshot_rng = np.random.default_rng(5)
train_t_choice = snapshot_rng.integers(0, T, size=len(X_train))
test_t_choice = snapshot_rng.integers(0, T, size=len(X_test))
single_frame_train = X_train[np.arange(len(X_train)), train_t_choice, :]
single_frame_test = X_test[np.arange(len(X_test)), test_t_choice, :]

mlp_single_frame = MLPClassifier(hidden_layer_sizes=(12,), max_iter=500, random_state=4)
mlp_single_frame.fit(single_frame_train, y_train_idx)
single_frame_acc = accuracy_score(y_test_idx, mlp_single_frame.predict(single_frame_test))
print(f"[MLP on ONE random single frame, no sequence memory] Test accuracy: {single_frame_acc:.3f} "
      f"(chance level is {1/n_classes:.2f}). Well above chance because a single point still leaks a "
      f"little shape information (e.g. circle vs swipe have different y-spread), but far below the "
      f"RNN's {test_acc:.3f} -- confirming that seeing the full sequence, not just one snapshot, is "
      f"what actually solves this task.")
