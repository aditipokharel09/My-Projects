"""
lms_adaptive_filter.py
-------------------------
Unit 4 (The Least-Mean-Square Algorithm): demonstrates
  - The closed-form Wiener Filter solution (optimal fixed filter)
  - The LMS algorithm, updating filter weights sample-by-sample,
    and converging TOWARD the Wiener solution over time -- this is
    exactly the syllabus topic "Markov Model Portraying the Deviation
    of the LMS Algorithm from the Wiener Filter"
  - Learning-Rate Annealing Schedules and their effect on convergence
  - A practical application: Adaptive Noise Cancellation

Run: python3 lms_adaptive_filter.py
Outputs: outputs/lms_weight_convergence.png,
         outputs/lms_learning_rate_comparison.png,
         outputs/noise_cancellation_result.png
"""

import os
import numpy as np
import matplotlib.pyplot as plt

os.makedirs("outputs", exist_ok=True)
rng = np.random.default_rng(1)

# ---------------------------------------------------------------
# Problem setup: classic Adaptive Noise Cancellation.
#   - clean_signal: the signal we actually want (e.g. a sensor
#     reading, a voice signal, a heartbeat)
#   - noise_source: an independent noise process
#   - primary signal d[n] = clean_signal[n] + noise_source[n]  (what
#     we observe / measure -- contaminated)
#   - reference signal x[n] = a filtered/delayed version of
#     noise_source (e.g. a second microphone picking up mostly noise)
#     that is CORRELATED with the noise in d[n] but not with the
#     clean signal.
# The adaptive filter's job: learn to predict the noise component in
# d[n] from x[n], so it can be subtracted out.
# ---------------------------------------------------------------
n_samples = 3000
t = np.arange(n_samples)

clean_signal = 2.0 * np.sin(2 * np.pi * 0.01 * t)
noise_source = rng.normal(0, 1, n_samples)

# reference signal: noise passed through a small unknown FIR filter
# (this is what the adaptive filter must learn to reverse-engineer).
# Built manually (rather than np.convolve) to keep sample alignment
# exact: reference[n] = true_filter . [noise[n], noise[n-1], ...].
true_filter = np.array([0.6, 0.3, -0.2, 0.1])
FILTER_LEN = len(true_filter)

def build_input_matrix(x, filter_len):
    """Each row = [x[n], x[n-1], ..., x[n-filter_len+1]]."""
    n = len(x)
    X = np.zeros((n, filter_len))
    for i in range(filter_len):
        X[i:, i] = x[:n - i]
    return X

X_noise = build_input_matrix(noise_source, FILTER_LEN)
reference = X_noise @ true_filter

primary = clean_signal + reference  # what we actually observe (noisy)

# ---------------------------------------------------------------
# 1) Closed-form Wiener Filter (Unit 4: "The Wiener Filter")
#    w_opt = R^-1 p
#    where R = autocorrelation matrix of the input (noise_source),
#          p = cross-correlation between input and desired signal.
#    Here the "desired" signal for the filter to predict is the
#    reference/noise component itself (primary - clean, which in a
#    real system we don't know -- but we CAN compute the Wiener
#    solution here since we generated the data, to use as ground
#    truth to compare LMS against).
# ---------------------------------------------------------------
R = X_noise.T @ X_noise / n_samples
p = X_noise.T @ reference / n_samples
w_wiener = np.linalg.solve(R, p)
print(f"True filter:    {true_filter}")
print(f"Wiener solution: {np.round(w_wiener, 3)}  (should closely match true filter)")

# ---------------------------------------------------------------
# 2) LMS Algorithm (Unit 4: "The Least-Mean-Square Algorithm")
#    w[n+1] = w[n] + mu * e[n] * x[n]
#    where e[n] = d[n] - w[n]^T x[n] is the prediction error.
#    Here: input = noise_source (what the reference mic picks up
#    before the unknown filter), desired = reference (the noise
#    component actually present in the primary signal).
# ---------------------------------------------------------------
def run_lms(x, d, filter_len, mu, mu_schedule=None):
    """
    mu: fixed learning rate (used if mu_schedule is None)
    mu_schedule: optional function(n) -> learning rate at step n
                 (for learning-rate annealing)
    Returns weight history and error history.
    """
    n = len(x)
    w = np.zeros(filter_len)
    x_buffer = np.zeros(filter_len)
    weight_history = np.zeros((n, filter_len))
    error_history = np.zeros(n)

    for i in range(n):
        x_buffer = np.roll(x_buffer, 1)
        x_buffer[0] = x[i]

        d_pred = w @ x_buffer
        error = d[i] - d_pred

        step = mu_schedule(i) if mu_schedule else mu
        w = w + step * error * x_buffer

        weight_history[i] = w
        error_history[i] = error

    return w, weight_history, error_history

MU = 0.01
w_lms, weight_history, error_history = run_lms(noise_source, reference, FILTER_LEN, MU)
print(f"LMS final weights (mu={MU}): {np.round(w_lms, 3)}")

# Plot: LMS weights converging toward the Wiener solution over time
plt.figure(figsize=(8, 5))
for i in range(FILTER_LEN):
    plt.plot(weight_history[:, i], label=f"w{i} (LMS)")
    plt.axhline(w_wiener[i], color="gray", linestyle="--", alpha=0.6)
plt.xlabel("Sample (time step n)")
plt.ylabel("Filter weight value")
plt.title("LMS Weight Convergence Toward the Wiener Filter Solution\n(dashed lines = Wiener/optimal weights)")
plt.legend(loc="lower right", fontsize=8)
plt.tight_layout()
plt.savefig("outputs/lms_weight_convergence.png", dpi=150)
plt.close()
print("Saved outputs/lms_weight_convergence.png")

# ---------------------------------------------------------------
# 3) Compare fixed learning rates vs an annealing schedule
#    (Unit 4: "Learning-Rate Annealing Schedules")
#
#    NOTE: for this comparison we add a bit of sensor/measurement
#    noise to the signals. Without any noise, LMS can drive error to
#    exactly zero regardless of mu, which hides the real tradeoff.
#    With realistic noise, a larger mu reaches a lower error faster
#    but settles at a higher *steady-state* error floor (misadjustment)
#    -- this is the actual tradeoff the syllabus's LMS theory describes.
# ---------------------------------------------------------------
sensor_noise_std = 0.4
noise_source_noisy = noise_source + rng.normal(0, sensor_noise_std, n_samples)
reference_noisy = reference + rng.normal(0, sensor_noise_std, n_samples)

learning_rates = [0.002, 0.01, 0.05]
plt.figure(figsize=(8, 5))

for mu in learning_rates:
    _, _, err_hist = run_lms(noise_source_noisy, reference_noisy, FILTER_LEN, mu)
    smoothed = np.convolve(err_hist**2, np.ones(50)/50, mode="valid")
    plt.plot(smoothed, label=f"fixed μ={mu}")

# Annealing schedule: start high (fast initial convergence), decay
# over time (low steady-state error / less noisy weights at convergence)
def annealing_schedule(n, mu0=0.05, decay=0.003):
    return mu0 / (1 + decay * n)

_, _, err_hist_anneal = run_lms(noise_source_noisy, reference_noisy, FILTER_LEN, mu=None,
                                  mu_schedule=annealing_schedule)
smoothed_anneal = np.convolve(err_hist_anneal**2, np.ones(50)/50, mode="valid")
plt.plot(smoothed_anneal, label="annealed μ (0.05 → decaying)", linewidth=2, color="black")

plt.xlabel("Sample (time step n)")
plt.ylabel("Squared error (50-sample moving average)")
plt.title("Effect of Learning Rate on LMS Convergence\n(with sensor/measurement noise)")
plt.yscale("log")
plt.legend()
plt.tight_layout()
plt.savefig("outputs/lms_learning_rate_comparison.png", dpi=150)
plt.close()
print("Saved outputs/lms_learning_rate_comparison.png")

steady_state = {mu: np.mean(run_lms(noise_source_noisy, reference_noisy, FILTER_LEN, mu)[2][-500:] ** 2)
                 for mu in learning_rates}
print("\nSteady-state error (last 500 samples) per learning rate:")
for mu, err in steady_state.items():
    print(f"  μ={mu}: {err:.4f}")

print("\nLearning rate tradeoff observed (see steady-state numbers above):")
print("  - Small fixed μ: slow to converge, but low final steady-state error (stable)")
print("  - Large fixed μ: fast initial convergence, but noisier/higher final error (misadjustment)")
print("  - Annealed μ: gets the fast start of a large μ AND the low steady-state")
print("    error of a small μ -- this is exactly why annealing schedules are used.")

# ---------------------------------------------------------------
# 4) Apply the trained LMS filter: subtract predicted noise from the
#    primary (contaminated) signal to recover the clean signal.
# ---------------------------------------------------------------
x_buffer = np.zeros(FILTER_LEN)
predicted_noise = np.zeros(n_samples)
for i in range(n_samples):
    x_buffer = np.roll(x_buffer, 1)
    x_buffer[0] = noise_source[i]
    predicted_noise[i] = w_lms @ x_buffer

recovered_signal = primary - predicted_noise

mse_before = np.mean((primary - clean_signal) ** 2)
mse_after = np.mean((recovered_signal - clean_signal) ** 2)
print(f"\nMSE vs true clean signal -- before filtering: {mse_before:.3f}, "
      f"after LMS noise cancellation: {mse_after:.3f}")

fig, axes = plt.subplots(3, 1, figsize=(10, 8), sharex=True)
window = slice(0, 400)  # zoom in on first 400 samples for clarity
axes[0].plot(t[window], primary[window], color="tab:red")
axes[0].set_title("Primary Signal (clean + noise) -- what we observe")
axes[1].plot(t[window], clean_signal[window], color="tab:green")
axes[1].set_title("True Clean Signal (ground truth, unknown in real applications)")
axes[2].plot(t[window], recovered_signal[window], color="tab:blue")
axes[2].set_title(f"Recovered Signal after LMS Adaptive Noise Cancellation (MSE {mse_before:.2f} → {mse_after:.2f})")
axes[2].set_xlabel("Sample")
plt.tight_layout()
plt.savefig("outputs/noise_cancellation_result.png", dpi=150)
plt.close()
print("Saved outputs/noise_cancellation_result.png")
