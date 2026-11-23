"""Run all standalone syllabus experiments in sequence."""
import subprocess, sys
scripts = [
    "01_perceptron.py", "02_mlp_xor.py", "regression_and_map.py",
    "lms_adaptive_filter.py", "05_linear_prediction.py",
    "06_pattern_classification.py", "07_kmeans_rbf.py",
    "08_self_organizing_map.py", "09_recurrent_neural_network.py"
]
for script in scripts:
    print("\n" + "="*70)
    print("RUNNING", script)
    print("="*70)
    subprocess.run([sys.executable, script], check=True)
print("\nAll standalone experiments completed. See outputs/.")
