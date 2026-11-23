"""
mlp_gesture_classifier.py
----------------------------
Unit 5 (Multilayer Perceptron / Back-Propagation): a from-scratch MLP
(one hidden layer, sigmoid activations, manual forward pass and
backpropagation) trained to classify all 5 gestures:
fist, open_palm, thumbs_up, peace, pointing.

We also train scikit-learn's MLPClassifier on the same data as a
sanity check / comparison against a standard library implementation.

Run: python3 mlp_gesture_classifier.py
Outputs: outputs/mlp_loss_curve.png, outputs/mlp_confusion_matrix.png,
         outputs/mlp_weights.npz  (used by the live webcam demo)
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, accuracy_score
from sklearn.neural_network import MLPClassifier

os.makedirs("outputs", exist_ok=True)
rng = np.random.default_rng(2)

# ---------------------------------------------------------------
# Load & preprocess
# ---------------------------------------------------------------
df = pd.read_csv("gesture_landmarks.csv")
CLASSES = sorted(df["label"].unique())
class_to_idx = {c: i for i, c in enumerate(CLASSES)}

feature_cols = [c for c in df.columns if c != "label"]
X = df[feature_cols].values
y_idx = df["label"].map(class_to_idx).values

# one-hot encode targets for our from-scratch network
n_classes = len(CLASSES)
Y = np.eye(n_classes)[y_idx]

# normalize features
X_mean, X_std = X.mean(axis=0), X.std(axis=0) + 1e-8
X_norm = (X - X_mean) / X_std

# train/test split
n = len(X)
idx = rng.permutation(n)
split = int(0.8 * n)
train_idx, test_idx = idx[:split], idx[split:]
X_train, Y_train, y_train_idx = X_norm[train_idx], Y[train_idx], y_idx[train_idx]
X_test, Y_test, y_test_idx = X_norm[test_idx], Y[test_idx], y_idx[test_idx]

# ---------------------------------------------------------------
# From-scratch MLP: input(42) -> hidden(16, sigmoid) -> output(5, softmax)
# ---------------------------------------------------------------
n_input = X_train.shape[1]
n_hidden = 16
n_output = n_classes

W1 = rng.normal(0, 0.5, (n_input, n_hidden))
b1 = np.zeros(n_hidden)
W2 = rng.normal(0, 0.5, (n_hidden, n_output))
b2 = np.zeros(n_output)

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    exp = np.exp(z)
    return exp / exp.sum(axis=1, keepdims=True)

lr = 0.1
epochs = 300
batch_size = 32
loss_history = []

for epoch in range(epochs):
    perm = rng.permutation(len(X_train))
    X_shuf, Y_shuf = X_train[perm], Y_train[perm]
    epoch_loss = 0.0

    for start in range(0, len(X_shuf), batch_size):
        xb = X_shuf[start:start + batch_size]
        yb = Y_shuf[start:start + batch_size]

        # forward pass
        z1 = xb @ W1 + b1
        a1 = sigmoid(z1)
        z2 = a1 @ W2 + b2
        a2 = softmax(z2)

        # cross-entropy loss
        eps = 1e-9
        loss = -np.sum(yb * np.log(a2 + eps)) / len(xb)
        epoch_loss += loss * len(xb)

        # backward pass (backpropagation)
        dz2 = (a2 - yb) / len(xb)                 # softmax + cross-entropy grad
        dW2 = a1.T @ dz2
        db2 = dz2.sum(axis=0)

        da1 = dz2 @ W2.T
        dz1 = da1 * a1 * (1 - a1)                  # sigmoid derivative
        dW1 = xb.T @ dz1
        db1 = dz1.sum(axis=0)

        # gradient descent update
        W2 -= lr * dW2
        b2 -= lr * db2
        W1 -= lr * dW1
        b1 -= lr * db1

    loss_history.append(epoch_loss / len(X_train))

# evaluate from-scratch MLP
def predict(X):
    a1 = sigmoid(X @ W1 + b1)
    a2 = softmax(a1 @ W2 + b2)
    return a2.argmax(axis=1)

train_preds = predict(X_train)
test_preds = predict(X_test)
train_acc = np.mean(train_preds == y_train_idx)
test_acc = np.mean(test_preds == y_test_idx)
print(f"[From-scratch MLP] Train accuracy: {train_acc:.3f} | Test accuracy: {test_acc:.3f}")

plt.figure(figsize=(6, 4))
plt.plot(loss_history)
plt.xlabel("Epoch")
plt.ylabel("Cross-entropy loss")
plt.title("From-Scratch MLP Training Loss (Backpropagation)")
plt.tight_layout()
plt.savefig("outputs/mlp_loss_curve.png", dpi=150)
plt.close()

cm = confusion_matrix(y_test_idx, test_preds)
plt.figure(figsize=(6, 5))
plt.imshow(cm, cmap="Blues")
plt.colorbar()
plt.xticks(range(n_classes), CLASSES, rotation=45)
plt.yticks(range(n_classes), CLASSES)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix (From-Scratch MLP, test set)")
for i in range(n_classes):
    for j in range(n_classes):
        plt.text(j, i, cm[i, j], ha="center", va="center",
                  color="white" if cm[i, j] > cm.max() / 2 else "black")
plt.tight_layout()
plt.savefig("outputs/mlp_confusion_matrix.png", dpi=150)
plt.close()

# save trained weights + normalization stats for the live webcam demo
np.savez("outputs/mlp_weights.npz",
         W1=W1, b1=b1, W2=W2, b2=b2,
         X_mean=X_mean, X_std=X_std,
         classes=np.array(CLASSES))
print("Saved outputs/mlp_weights.npz (used by live_webcam_demo.py)")

# ---------------------------------------------------------------
# Sanity-check comparison against scikit-learn's MLPClassifier
# ---------------------------------------------------------------
sk_model = MLPClassifier(hidden_layer_sizes=(16,), max_iter=500, random_state=2)
sk_model.fit(X_train, y_train_idx)
sk_test_acc = accuracy_score(y_test_idx, sk_model.predict(X_test))
print(f"[sklearn MLPClassifier] Test accuracy: {sk_test_acc:.3f}")

print("\nDone. Outputs saved to ./outputs/")
