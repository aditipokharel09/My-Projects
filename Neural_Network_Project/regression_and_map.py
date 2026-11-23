"""
regression_and_map.py
------------------------
Unit 3 (Model Building through Regression): demonstrates
  - Linear Regression Model via the Normal Equations
  - Overfitting with polynomial features
  - Ridge Regression (L2-regularized least squares) as the
    Maximum a Posteriori (MAP) estimate of the parameter vector
    under a Gaussian prior -- the exact syllabus topics
    "Maximum a Posteriori Estimation of the Parameter Vector" and
    "Relationship Between Regularized Least-Squares Estimation and MAP".

Run: python3 regression_and_map.py
Outputs: outputs/overfitting_curve.png, outputs/map_regularization_effect.png
"""

import os
import numpy as np
import matplotlib.pyplot as plt

os.makedirs("outputs", exist_ok=True)
rng = np.random.default_rng(0)

# ---------------------------------------------------------------
# Synthetic dataset: a 1D "true" nonlinear relationship (e.g. house
# price vs size) plus noise, so we can visualize overfitting easily
# with polynomial features.
# ---------------------------------------------------------------
N = 25
x = np.sort(rng.uniform(-3, 3, N))
true_fn = lambda x: 0.5 * x**3 - 2 * x**2 + x + 5
y = true_fn(x) + rng.normal(0, 4, N)

x_test = np.sort(rng.uniform(-3, 3, 200))
y_test_true = true_fn(x_test)
y_test = y_test_true + rng.normal(0, 4, 200)

def poly_features(x, degree):
    """Build [1, x, x^2, ..., x^degree] design matrix."""
    return np.vstack([x**d for d in range(degree + 1)]).T

def standardize_columns(X):
    """Standardize columns (except the bias column) for numerical stability."""
    Xs = X.copy()
    mean = Xs[:, 1:].mean(axis=0)
    std = Xs[:, 1:].std(axis=0) + 1e-8
    Xs[:, 1:] = (Xs[:, 1:] - mean) / std
    return Xs, mean, std

def apply_standardize(X, mean, std):
    Xs = X.copy()
    Xs[:, 1:] = (Xs[:, 1:] - mean) / std
    return Xs

# ---------------------------------------------------------------
# 1) Ordinary Least Squares via Normal Equations:  w = (X^T X)^-1 X^T y
#    This is the plain "Linear Regression Model" from Unit 3.
# ---------------------------------------------------------------
def fit_ols(X, y):
    return np.linalg.solve(X.T @ X, X.T @ y)

# ---------------------------------------------------------------
# 2) Ridge Regression (L2-regularized least squares):
#       w = (X^T X + lambda * I)^-1 X^T y
#    This is EXACTLY the MAP estimate of w when we assume:
#       likelihood:  y | w ~ Normal(Xw, sigma^2 I)
#       prior:       w ~ Normal(0, tau^2 I)
#    with lambda = sigma^2 / tau^2. Larger lambda = stronger belief
#    that weights should be small (a stronger prior), which is why
#    regularization is often called "MAP estimation with a Gaussian
#    prior" in the syllabus.
# ---------------------------------------------------------------
def fit_ridge_map(X, y, lam):
    n_features = X.shape[1]
    I = np.eye(n_features)
    I[0, 0] = 0  # don't regularize the bias term
    return np.linalg.solve(X.T @ X + lam * I, X.T @ y)

def mse(y_true, y_pred):
    return np.mean((y_true - y_pred) ** 2)

# ---------------------------------------------------------------
# Experiment 1: overfitting as polynomial degree increases (OLS)
# ---------------------------------------------------------------
degrees = range(1, 16)
train_errors, test_errors = [], []

for d in degrees:
    X_train = poly_features(x, d)
    X_train_s, mean, std = standardize_columns(X_train)
    X_test_s = apply_standardize(poly_features(x_test, d), mean, std)

    w = fit_ols(X_train_s, y)
    train_errors.append(mse(y, X_train_s @ w))
    test_errors.append(mse(y_test, X_test_s @ w))

plt.figure(figsize=(7, 5))
plt.plot(list(degrees), train_errors, marker="o", label="Train MSE")
plt.plot(list(degrees), test_errors, marker="o", label="Test MSE")
plt.xlabel("Polynomial degree")
plt.ylabel("Mean squared error")
plt.title("Overfitting: Plain Least Squares (OLS)")
plt.legend()
plt.yscale("log")
plt.tight_layout()
plt.savefig("outputs/overfitting_curve.png", dpi=150)
plt.close()

best_ols_degree = int(np.array(degrees)[np.argmin(test_errors)])
print(f"OLS: best test MSE at degree {best_ols_degree}, "
      f"but train error keeps dropping past that point (overfitting)")
print(f"  Degree 11: train MSE={train_errors[-1]:.2f}, test MSE={test_errors[-1]:.2f}")

# ---------------------------------------------------------------
# Experiment 2: fix a high (overfitting-prone) degree, then show how
# increasing the regularization strength (lambda) fixes it -- this is
# the MAP story: stronger prior (bigger lambda) -> simpler, more
# generalizable model.
# ---------------------------------------------------------------
HIGH_DEGREE = 14
X_train = poly_features(x, HIGH_DEGREE)
X_train_s, mean, std = standardize_columns(X_train)
X_test_s = apply_standardize(poly_features(x_test, HIGH_DEGREE), mean, std)

lambdas = np.logspace(-3, 3, 30)
ridge_train_errors, ridge_test_errors, weight_norms = [], [], []

for lam in lambdas:
    w = fit_ridge_map(X_train_s, y, lam)
    ridge_train_errors.append(mse(y, X_train_s @ w))
    ridge_test_errors.append(mse(y_test, X_test_s @ w))
    weight_norms.append(np.linalg.norm(w))

best_lambda = lambdas[np.argmin(ridge_test_errors)]
print(f"\nRidge/MAP: best lambda = {best_lambda:.4f} "
      f"(test MSE = {min(ridge_test_errors):.2f}, "
      f"vs unregularized degree-{HIGH_DEGREE} OLS test MSE = {test_errors[HIGH_DEGREE-1]:.2f})")

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].plot(lambdas, ridge_train_errors, marker=".", label="Train MSE")
axes[0].plot(lambdas, ridge_test_errors, marker=".", label="Test MSE")
axes[0].axvline(best_lambda, color="gray", linestyle="--", label=f"best λ={best_lambda:.3f}")
axes[0].set_xscale("log")
axes[0].set_yscale("log")
axes[0].set_xlabel("Regularization strength λ (MAP prior precision)")
axes[0].set_ylabel("Mean squared error")
axes[0].set_title(f"Ridge/MAP Regression (degree {HIGH_DEGREE} polynomial)")
axes[0].legend()

axes[1].plot(lambdas, weight_norms, marker=".", color="purple")
axes[1].set_xscale("log")
axes[1].set_xlabel("Regularization strength λ")
axes[1].set_ylabel("||w|| (weight vector norm)")
axes[1].set_title("Larger λ = Stronger Gaussian Prior = Smaller Weights")

plt.tight_layout()
plt.savefig("outputs/map_regularization_effect.png", dpi=150)
plt.close()

print("\nSaved outputs/overfitting_curve.png and outputs/map_regularization_effect.png")
