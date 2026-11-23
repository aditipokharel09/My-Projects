import os
import json
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt

# ============================================================
# NeuroGesture | Premium Neural Network Demonstration UI
# ============================================================

st.set_page_config(
    page_title="NeuroGesture | Neural Gesture Lab",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "outputs"

# ---------- Theme ----------
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
    --bg: #07090f;
    --panel: #10131d;
    --panel2: #151925;
    --text: #f4f6fb;
    --muted: #9aa3b7;
    --line: rgba(255,255,255,.09);
    --pink: #ff4fd8;
    --violet: #8b5cf6;
    --cyan: #42d9ff;
    --green: #48e39b;
}

html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
}
.stApp {
    background:
        radial-gradient(circle at 85% 5%, rgba(139,92,246,.16), transparent 28%),
        radial-gradient(circle at 15% 0%, rgba(255,79,216,.10), transparent 25%),
        var(--bg);
    color: var(--text);
}
h1,h2,h3,h4 { font-family: 'Space Grotesk', sans-serif; letter-spacing: -.03em; }
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0d1018 0%, #090b11 100%);
    border-right: 1px solid var(--line);
}
.block-container { padding-top: 2rem; padding-bottom: 3rem; max-width: 1450px; }

.brand {
    padding: 8px 0 22px;
}
.brand-mark {
    width: 44px; height: 44px; border-radius: 14px;
    display:inline-flex; align-items:center; justify-content:center;
    background: linear-gradient(135deg, var(--pink), var(--violet));
    box-shadow: 0 10px 30px rgba(139,92,246,.25);
    font-size: 23px;
}
.brand-name { font-family:'Space Grotesk'; font-weight:700; font-size:22px; margin-left:10px; vertical-align:8px; }
.brand-sub { color:var(--muted); font-size:12px; margin-top:7px; }

.hero {
    padding: 34px 36px;
    border: 1px solid var(--line);
    border-radius: 26px;
    background:
      linear-gradient(135deg, rgba(255,79,216,.10), rgba(139,92,246,.08) 45%, rgba(66,217,255,.04)),
      rgba(16,19,29,.88);
    box-shadow: 0 25px 80px rgba(0,0,0,.24);
    margin-bottom: 24px;
}
.hero-kicker { color:#c7b8ff; text-transform:uppercase; letter-spacing:.15em; font-size:11px; font-weight:700; }
.hero-title { font-family:'Space Grotesk'; font-size:42px; line-height:1.05; font-weight:700; margin:10px 0 12px; }
.hero-copy { color:#aeb7ca; font-size:15px; max-width:800px; line-height:1.65; }
.pill {
    display:inline-block; padding:6px 10px; margin:3px 5px 0 0;
    border:1px solid var(--line); border-radius:999px; color:#d8dced; font-size:11px;
    background:rgba(255,255,255,.03);
}

.card {
    background: linear-gradient(145deg, rgba(21,25,37,.96), rgba(12,15,23,.96));
    border:1px solid var(--line); border-radius:20px; padding:20px;
    min-height:120px;
}
.card-label { color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
.card-value { font-family:'Space Grotesk'; font-size:28px; font-weight:700; margin-top:7px; }
.card-note { color:#7f8aa1; font-size:12px; margin-top:4px; }

.section-title { margin-top:24px; margin-bottom:5px; }
.section-copy { color:var(--muted); margin-bottom:18px; }

.model-card {
    border:1px solid var(--line); border-radius:20px; padding:22px;
    background:rgba(16,19,29,.88); height:100%;
}
.model-icon { font-size:28px; }
.model-name { font-family:'Space Grotesk'; font-size:21px; font-weight:700; margin-top:8px; }
.model-desc { color:var(--muted); font-size:13px; line-height:1.55; min-height:62px; }
.badge {
    display:inline-block; border-radius:999px; padding:5px 9px; font-size:10px; font-weight:700;
    margin-top:10px; background:rgba(72,227,155,.10); color:#75f0b4; border:1px solid rgba(72,227,155,.20);
}

.metric-box {
    border:1px solid var(--line); border-radius:18px; padding:17px 18px;
    background:rgba(255,255,255,.025);
}
.metric-big { font-family:'Space Grotesk'; font-size:25px; font-weight:700; }
.metric-small { color:var(--muted); font-size:11px; margin-top:3px; }

.explain {
    border-left:3px solid var(--violet); padding:14px 17px; background:rgba(139,92,246,.06);
    border-radius:0 14px 14px 0; color:#c5cbe0; line-height:1.6; font-size:13px;
}
.flow {
    text-align:center; padding:17px 10px; border:1px solid var(--line); border-radius:16px;
    background:rgba(255,255,255,.025); color:#d9dceb;
}
.flow strong { display:block; font-family:'Space Grotesk'; font-size:15px; }
.flow span { color:var(--muted); font-size:11px; }

div[data-testid="stMetric"] {
    background:rgba(255,255,255,.025);
    border:1px solid var(--line);
    padding:15px;
    border-radius:16px;
}
.stButton > button {
    border-radius:12px; border:1px solid rgba(255,255,255,.10);
    background:linear-gradient(135deg, rgba(139,92,246,.28), rgba(255,79,216,.16));
    color:white; font-weight:600;
}
.stButton > button:hover { border-color:rgba(255,255,255,.25); }
[data-testid="stFileUploader"] { border-radius:16px; }
hr { border-color:var(--line); }
</style>
""", unsafe_allow_html=True)

# ---------- Helpers ----------
def exists(name):
    return (OUT / name).exists()

def image(name, caption=None):
    p = OUT / name
    if p.exists():
        st.image(str(p), caption=caption, use_container_width=True)
        return True
    return False

def read_json(name):
    p = ROOT / name
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None

def metric_card(label, value, note=""):
    st.markdown(
        f'<div class="card"><div class="card-label">{label}</div>'
        f'<div class="card-value">{value}</div><div class="card-note">{note}</div></div>',
        unsafe_allow_html=True
    )

def discover_metrics():
    # Uses the results file when present, but never invents metrics.
    candidates = ["metrics.json", "results.json", "model_metrics.json"]
    for n in candidates:
        p = OUT / n
        if p.exists():
            try:
                return json.loads(p.read_text(encoding="utf-8"))
            except Exception:
                pass
    return {}

metrics = discover_metrics()

# ---------- Sidebar ----------
with st.sidebar:
    st.markdown("""
    <div class="brand">
      <span class="brand-mark">🧠</span><span class="brand-name">NeuroGesture</span>
      <div class="brand-sub">Neural Gesture Recognition Lab</div>
    </div>
    """, unsafe_allow_html=True)

    page = st.radio(
        "WORKSPACE",
        [
            "⌂  Command Center",
            "◎  Static Gesture • MLP",
            "↻  Dynamic Gesture • RNN",
            "◉  Perceptron Lab",
            "▦  Training Evidence",
            "✦  Neural Network Anatomy",
            "⚙  Live Camera",
        ],
        label_visibility="visible",
    )

    st.markdown("---")
    st.markdown("**MODEL STACK**")
    st.caption("Single-Layer Perceptron")
    st.caption("Multilayer Perceptron + Backprop")
    st.caption("Recurrent Neural Network + BPTT")
    st.markdown("---")
    st.caption("Built with Python • NumPy • Streamlit")
    st.caption("Educational prototype")

# ============================================================
# COMMAND CENTER
# ============================================================
if page == "⌂  Command Center":
    st.markdown("""
    <div class="hero">
      <div class="hero-kicker">Neural Network Demonstration</div>
      <div class="hero-title">Teach the machine<br>to understand a gesture.</div>
      <div class="hero-copy">
        NeuroGesture turns hand/gesture patterns into a compact neural-network
        learning pipeline. Static gestures are handled by feed-forward networks,
        while movement is treated as a time sequence and passed through a recurrent network.
      </div>
      <div style="margin-top:15px">
        <span class="pill">Perceptron</span>
        <span class="pill">MLP</span>
        <span class="pill">Backpropagation</span>
        <span class="pill">RNN</span>
        <span class="pill">BPTT</span>
        <span class="pill">Pattern Classification</span>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### The project in one picture")
    st.markdown('<div class="section-copy">Different neural architectures solve different kinds of gesture problems.</div>', unsafe_allow_html=True)

    cols = st.columns(5)
    flow = [
        ("👋", "Hand / Motion", "input pattern"),
        ("→", "Features", "landmarks / x,y"),
        ("🧠", "Neural Network", "learn weights"),
        ("→", "Prediction", "gesture class"),
        ("✓", "Feedback", "confidence / result"),
    ]
    for c, (ico, title, sub) in zip(cols, flow):
        with c:
            st.markdown(f'<div class="flow"><div style="font-size:22px">{ico}</div><strong>{title}</strong><span>{sub}</span></div>', unsafe_allow_html=True)

    st.markdown("### Three models, three jobs")
    a,b,c = st.columns(3)
    cards = [
        ("🟣", "Perceptron", "A simple binary classifier for a clean, linearly separable gesture pair.", "UNIT 2 • BASIC"),
        ("🧠", "MLP", "Learns nonlinear static gesture patterns using hidden neurons and backpropagation.", "UNIT 5 • FEED-FORWARD"),
        ("🔵", "RNN", "Reads a sequence over time and carries a hidden state through the gesture.", "UNIT 8 • RECURRENT"),
    ]
    for col, (ico, name, desc, badge) in zip((a,b,c), cards):
        with col:
            st.markdown(f'<div class="model-card"><div class="model-icon">{ico}</div><div class="model-name">{name}</div><div class="model-desc">{desc}</div><div class="badge">{badge}</div></div>', unsafe_allow_html=True)

    st.markdown("### What is actually happening?")
    st.markdown("""
    <div class="explain">
    <b>Static gesture:</b> the network receives one feature vector, performs a forward pass,
    compares its output with the target, then adjusts weights using backpropagation.<br><br>
    <b>Dynamic gesture:</b> the RNN receives one timestep after another. Its hidden state
    carries information forward, so the model can distinguish gestures by their movement pattern,
    not merely by one snapshot.
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### Project status")
    c1,c2,c3,c4 = st.columns(4)
    with c1: metric_card("MLP evidence", "READY" if exists("mlp_loss_curve.png") else "MISSING", "loss curve")
    with c2: metric_card("Confusion matrix", "READY" if exists("mlp_confusion_matrix.png") else "MISSING", "test-set evidence")
    with c3: metric_card("RNN evidence", "READY" if exists("rnn_loss_curve.png") else "MISSING", "BPTT loss curve")
    with c4: metric_card("Webcam weights", "READY" if exists("mlp_weights.npz") else "MISSING", "MLP inference")

# ============================================================
# STATIC MLP
# ============================================================
elif page == "◎  Static Gesture • MLP":
    st.markdown("## ◎ Static Gesture Recognition")
    st.markdown('<div class="section-copy">A feed-forward neural network sees a single gesture representation and maps it to a class.</div>', unsafe_allow_html=True)

    st.markdown("""
    <div class="hero" style="padding:24px 28px">
      <div class="hero-kicker">Forward propagation</div>
      <div class="hero-title" style="font-size:29px">Input → Hidden Layer → Output</div>
      <div class="hero-copy">The MLP uses learned weights, a nonlinear hidden layer, softmax output probabilities and cross-entropy loss.</div>
    </div>
    """, unsafe_allow_html=True)

    c1,c2,c3 = st.columns(3)
    with c1: metric_card("Architecture", "Input → 16 → Output", "from-scratch MLP")
    with c2: metric_card("Learning", "Backprop", "chain-rule gradients")
    with c3: metric_card("Loss", "Cross-entropy", "classification objective")

    st.markdown("### Training evidence")
    left,right = st.columns([1.25, .75])
    with left:
        if not image("mlp_loss_curve.png", "MLP training loss using backpropagation"):
            st.warning("mlp_loss_curve.png was not found in outputs/. Run the MLP training script first.")
    with right:
        if not image("mlp_confusion_matrix.png", "MLP confusion matrix on the test set"):
            st.warning("mlp_confusion_matrix.png was not found in outputs/.")

    st.markdown("### Why this model?")
    st.markdown("""
    <div class="explain">
    A perceptron has no hidden layer. The MLP adds a hidden layer with a nonlinear activation,
    giving the network a richer representation for multi-class static gesture recognition.
    During training, the prediction error is propagated backward and the weights are updated.
    </div>
    """, unsafe_allow_html=True)

# ============================================================
# RNN
# ============================================================
elif page == "↻  Dynamic Gesture • RNN":
    st.markdown("## ↻ Dynamic Gesture Recognition")
    st.markdown('<div class="section-copy">Movement is a sequence. The RNN remembers what happened earlier in the gesture.</div>', unsafe_allow_html=True)

    c1,c2,c3,c4 = st.columns(4)
    with c1: metric_card("Input", "20 × 2", "x,y centroid per timestep")
    with c2: metric_card("Hidden", "12", "recurrent neurons")
    with c3: metric_card("Training", "BPTT", "back through time")
    with c4: metric_card("Classes", "4", "swipe / circle / wave")

    st.markdown("### How the RNN reads a gesture")
    cols = st.columns(6)
    steps = [("t₁","start"),("t₂","move"),("t₃","move"),("…","context"),("t₂₀","finish"),("🧠","classify")]
    for col,(t,desc) in zip(cols,steps):
        with col:
            st.markdown(f'<div class="flow"><strong>{t}</strong><span>{desc}</span></div>', unsafe_allow_html=True)

    st.markdown("### BPTT training curve")
    if not image("rnn_loss_curve.png", "From-scratch RNN training loss using Backpropagation Through Time"):
        st.warning("rnn_loss_curve.png was not found in outputs/. Run rnn_dynamic_gesture.py first.")

    data = read_json("dynamic_gestures.json")
    if data:
        labels = [d.get("label") for d in data]
        counts = pd.Series(labels).value_counts()
        st.markdown("### Dynamic dataset")
        c1,c2 = st.columns([1,1])
        with c1:
            st.dataframe(counts.rename("Sequences").rename_axis("Gesture").reset_index(), use_container_width=True, hide_index=True)
        with c2:
            fig, ax = plt.subplots(figsize=(6,3.4))
            ax.bar(counts.index, counts.values)
            ax.set_ylabel("Sequences")
            ax.set_title("Sequence distribution")
            ax.tick_params(axis="x", rotation=20)
            fig.tight_layout()
            st.pyplot(fig, clear_figure=True)

    st.markdown("""
    <div class="explain">
    <b>Why not use a normal MLP here?</b> A single frame cannot fully describe a movement.
    The RNN maintains a hidden state, so information from earlier timesteps influences later decisions.
    The project implements the recurrence and BPTT directly with NumPy.
    </div>
    """, unsafe_allow_html=True)

# ============================================================
# PERCEPTRON
# ============================================================
elif page == "◉  Perceptron Lab":
    st.markdown("## ◉ Perceptron Lab")
    st.markdown('<div class="section-copy">The smallest network in the stack. One weighted decision boundary, one binary task.</div>', unsafe_allow_html=True)

    c1,c2,c3 = st.columns(3)
    with c1: metric_card("Network", "Single layer", "no hidden layer")
    with c2: metric_card("Task", "Binary", "fist vs open_palm")
    with c3: metric_card("Rule", "Threshold", "classic perceptron")

    st.markdown("### Why it matters")
    st.markdown("""
    <div class="explain">
    The perceptron is the foundation of the later networks. It computes a weighted sum,
    applies a decision function, compares the result with the target, and updates its weights
    when an error occurs. The MLP keeps the same basic idea of weighted computation but adds
    hidden layers and differentiable learning.
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### The progression")
    a,b,c = st.columns(3)
    with a: st.markdown('<div class="flow"><strong>Perceptron</strong><span>linear decision</span></div>', unsafe_allow_html=True)
    with b: st.markdown('<div class="flow"><strong>MLP</strong><span>nonlinear representation</span></div>', unsafe_allow_html=True)
    with c: st.markdown('<div class="flow"><strong>RNN</strong><span>nonlinear + temporal memory</span></div>', unsafe_allow_html=True)

# ============================================================
# TRAINING EVIDENCE
# ============================================================
elif page == "▦  Training Evidence":
    st.markdown("## ▦ Training Evidence")
    st.markdown('<div class="section-copy">The screenshots and curves are not decoration. They are evidence that the networks actually learned.</div>', unsafe_allow_html=True)

    items = [
        ("MLP loss", "mlp_loss_curve.png", "Cross-entropy loss should decrease as the network learns."),
        ("MLP confusion matrix", "mlp_confusion_matrix.png", "Shows correct and incorrect predictions by class."),
        ("RNN loss", "rnn_loss_curve.png", "Shows learning across recurrent training epochs."),
        ("Perceptron plot", "perceptron_errors.png", "Misclassifications across perceptron epochs, if generated."),
    ]
    for title, fname, desc in items:
        if exists(fname):
            st.markdown(f"### {title}")
            st.caption(desc)
            st.image(str(OUT / fname), use_container_width=True)
            st.divider()

# ============================================================
# ANATOMY
# ============================================================
elif page == "✦  Neural Network Anatomy":
    st.markdown("## ✦ Neural Network Anatomy")
    st.markdown('<div class="section-copy">A viva-friendly view of what each part of the system is doing.</div>', unsafe_allow_html=True)

    sections = [
        ("01", "Weighted Sum", "Each neuron combines its inputs using learned weights and a bias."),
        ("02", "Activation", "The activation function introduces nonlinearity so the network can represent more complex patterns."),
        ("03", "Forward Pass", "Input travels through the network to produce an output distribution."),
        ("04", "Loss", "The prediction is compared with the target using a classification loss."),
        ("05", "Backpropagation", "The error gradient is propagated backward using the chain rule."),
        ("06", "Gradient Descent", "Weights are adjusted in the direction that reduces the loss."),
        ("07", "Hidden State", "The RNN carries information from previous timesteps."),
        ("08", "BPTT", "RNN gradients are propagated backward across the sequence."),
    ]
    for i in range(0, len(sections), 2):
        a,b = st.columns(2)
        for col, (num,title,desc) in zip((a,b), sections[i:i+2]):
            with col:
                st.markdown(f"""
                <div class="card" style="margin-bottom:14px; min-height:145px">
                  <div class="card-label">{num}</div>
                  <div class="card-value" style="font-size:21px">{title}</div>
                  <div class="card-note" style="font-size:13px; line-height:1.55">{desc}</div>
                </div>
                """, unsafe_allow_html=True)

    st.markdown("### The complete learning loop")
    st.markdown("""
    <div class="flow">
      <strong>Input → Forward Propagation → Prediction → Loss → Backpropagation → Weight Update → Repeat</strong>
      <span>For an RNN, the recurrent hidden state and BPTT extend this loop across time.</span>
    </div>
    """, unsafe_allow_html=True)

# ============================================================
# LIVE CAMERA
# ============================================================
else:
    st.markdown("## ⚙ Live Camera")
    st.markdown('<div class="section-copy">Use the trained MLP weights for real hand inference. The original project uses OpenCV + MediaPipe for the live pipeline.</div>', unsafe_allow_html=True)

    if exists("mlp_weights.npz"):
        st.success("MLP weights found: outputs/mlp_weights.npz")
    else:
        st.warning("outputs/mlp_weights.npz was not found. Train the MLP first.")

    st.markdown("""
    <div class="hero" style="padding:24px 28px">
      <div class="hero-kicker">Real-time pipeline</div>
      <div class="hero-title" style="font-size:29px">Camera → Hand Landmarks → MLP → Gesture</div>
      <div class="hero-copy">
        The current live implementation uses MediaPipe to extract 21 hand landmarks,
        flattens their x/y coordinates, normalizes them with the training statistics,
        and feeds them into the trained MLP.
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### Launch the desktop camera")
    st.caption("This opens a native OpenCV window on your laptop. It is more suitable for continuous real-time video than a standard Streamlit camera widget.")

    if st.button("▶  Start Live Webcam", use_container_width=False):
        script = ROOT / "live_webcam_demo.py"
        if script.exists():
            try:
                subprocess.Popen(["python", str(script)], cwd=str(ROOT))
                st.success("Live webcam launched. A separate camera window should appear.")
            except Exception as e:
                st.error(f"Could not launch webcam: {e}")
        else:
            st.error("live_webcam_demo.py was not found in this project folder.")

    st.markdown("### Important limitation")
    st.markdown("""
    <div class="explain">
    The existing MLP was trained on synthetic landmark data. A real webcam is therefore a
    demonstration of the inference pipeline, not a guarantee of real-world accuracy.
    For a strong real-world demo, capture labeled landmarks from your own hand and retrain.
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### Required packages")
    st.code("pip install opencv-python mediapipe numpy", language="powershell")
