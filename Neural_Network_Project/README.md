# Neural Network Syllabus Project — Complete Package

This package is organized around the supplied 8-unit Neural Networks syllabus and
the required laboratory topics.

## Project structure

- `01_perceptron.py` — Units 1–2: neuron/perceptron, convergence, XOR limitation.
- `02_mlp_xor.py` — Unit 5: multilayer perceptron, backpropagation, XOR.
- `regression_and_map.py` — Unit 3: OLS, polynomial overfitting, Ridge/MAP.
- `lms_adaptive_filter.py` — Unit 4: Wiener filter, LMS, learning-rate annealing,
  adaptive noise cancellation.
- `05_linear_prediction.py` — LMS linear prediction practical.
- `06_pattern_classification.py` — Gaussian/Bayes and perceptron classification.
- `07_kmeans_rbf.py` — Unit 6: K-means and RBF regression.
- `08_self_organizing_map.py` — Unit 7: SOM and U-matrix.
- `09_recurrent_neural_network.py` — Unit 8: RNN sequence prediction with BPTT.
- `outputs/` — generated experimental figures.
- `app.py`, `mlp_gesture_classifier.py`, `rnn_dynamic_gesture.py`,
  `live_webcam_demo.py`, `dynamic_gestures.json` — existing gesture-recognition
  application components.
- `requirements.txt` — Python dependencies for the existing application.

## How to run

From PowerShell in this folder:

```powershell
pip install -r requirements.txt
python 01_perceptron.py
python 02_mlp_xor.py
python regression_and_map.py
python lms_adaptive_filter.py
python 05_linear_prediction.py
python 06_pattern_classification.py
python 07_kmeans_rbf.py
python 08_self_organizing_map.py
python 09_recurrent_neural_network.py
```

For the Streamlit interface:

```powershell
streamlit run app.py
```

The standalone syllabus demonstrations use NumPy and Matplotlib and do not require
scikit-learn.

## Syllabus coverage

| Unit | Main coverage |
|---|---|
| Unit 1 | neuron model, learning/network concepts through implementations |
| Unit 2 | Rosenblatt perceptron, convergence, classification |
| Unit 3 | OLS, polynomial model building, MAP, Ridge regularization |
| Unit 4 | Wiener filter, LMS, deviation from Wiener, annealing, filtering |
| Unit 5 | MLP, XOR, backpropagation, optimization |
| Unit 6 | K-means, RBF/kernel-style regression |
| Unit 7 | Self-Organizing Map, feature map, U-matrix |
| Unit 8 | recurrent architecture, BPTT, sequence prediction |

## Laboratory coverage

- Single Layer Perceptron — `01_perceptron.py`
- Multilayer Perceptron — `02_mlp_xor.py`
- Supervised Learning — regression, LMS, classification
- Unsupervised Learning — K-means and SOM
- Recurrent Neural Network — `09_recurrent_neural_network.py`
- Linear Prediction — `05_linear_prediction.py`
- Pattern Classification — `06_pattern_classification.py`

## Notes

The project uses synthetic datasets where that makes the mathematical behavior
clear and reproducible. Fixed random seeds are used so the figures can be recreated.
