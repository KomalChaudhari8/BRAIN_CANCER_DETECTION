import streamlit as st
import tensorflow as tf
import numpy as np
import cv2
import os
import gdown
import requests
from PIL import Image
from fpdf import FPDF
import matplotlib.pyplot as plt
from tensorflow.keras.applications.efficientnet import preprocess_input

# ===================== PAGE CONFIG =====================
st.set_page_config(
    page_title="Brain Tumor Detection System",
    page_icon="🧠",
    layout="wide"
)

# ===================== BOOTSTRAP STYLE =====================
st.markdown("""
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
body { background-color: #f8f9fa; }
.card { border-radius: 12px; padding: 20px; }
.title { font-weight: 700; color: #0d6efd; }
</style>
""", unsafe_allow_html=True)

# ===================== MODEL DOWNLOAD =====================
MODEL_DIR = "MODEL"
os.makedirs(MODEL_DIR, exist_ok=True)

STAGE1_ID = "1pGh_sA7m5BVXBZmqcXu8Hs91Z6XK5KGG"
STAGE2_ID = "1mjh7KbLgxeibUZQJ_J2zDW60V0fngxMm"

STAGE1_PATH = f"{MODEL_DIR}/stage1.keras"
STAGE2_PATH = f"{MODEL_DIR}/stage2.keras"

def download_model(file_id, path):
    if not os.path.exists(path):
        gdown.download(f"https://drive.google.com/uc?id={file_id}", path, quiet=False)

download_model(STAGE1_ID, STAGE1_PATH)
download_model(STAGE2_ID, STAGE2_PATH)

# ===================== LOAD MODELS =====================
@st.cache_resource
def load_models():
    m1 = tf.keras.models.load_model(STAGE1_PATH, compile=False)
    m2 = tf.keras.models.load_model(STAGE2_PATH, compile=False)
    return m1, m2

stage1_model, stage2_model = load_models()

CLASS_NAMES = ["glioma", "meningioma", "pituitary"]

# ===================== UTILS =====================
def preprocess(img):
    img = cv2.resize(img, (300,300))
    img = preprocess_input(img)
    return np.expand_dims(img, axis=0)

def gradcam(model, img_array, layer_name):
    grad_model = tf.keras.models.Model(
        [model.inputs], [model.get_layer(layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_out, preds = grad_model(img_array)
        loss = preds[:, np.argmax(preds[0])]
    grads = tape.gradient(loss, conv_out)
    pooled = tf.reduce_mean(grads, axis=(0,1,2))
    heatmap = tf.reduce_sum(tf.multiply(pooled, conv_out), axis=-1)
    heatmap = np.maximum(heatmap[0], 0)
    return heatmap / np.max(heatmap)

def find_hospitals(city):
    url = f"https://nominatim.openstreetmap.org/search?q=neurosurgery+hospital+{city}&format=json"
    res = requests.get(url, headers={"User-Agent":"Mozilla/5.0"}).json()
    return res[:5]

def generate_pdf(result, prob):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial","B",14)
    pdf.cell(0,10,"Brain Tumor Detection Report",ln=True)
    pdf.ln(5)
    pdf.set_font("Arial","",12)
    pdf.cell(0,10,f"Prediction: {result}",ln=True)
    pdf.cell(0,10,f"Confidence: {prob:.2f}%",ln=True)
    path = "report.pdf"
    pdf.output(path)
    return path

# ===================== UI =====================
st.markdown("<h1 class='title text-center'>🧠 Brain Tumor Detection & Analysis</h1>", unsafe_allow_html=True)
st.markdown("---")

col1, col2 = st.columns([1,1])

with col1:
    st.markdown("### 📤 Upload MRI Image")
    uploaded = st.file_uploader("", type=["jpg","png","jpeg"])

with col2:
    city = st.text_input("📍 Enter your city for nearby hospitals")

# ===================== PREDICTION =====================
if uploaded:
    image = Image.open(uploaded).convert("RGB")
    img_np = np.array(image)

    st.image(image, caption="Uploaded MRI", width=300)

    img_array = preprocess(img_np)

    stage1_pred = stage1_model.predict(img_array)[0][0]

    if stage1_pred < 0.5:
        st.success("✅ No Tumor Detected")
    else:
        st.warning("⚠ Tumor Detected")
        probs = stage2_model.predict(img_array)[0]
        idx = np.argmax(probs)

        st.markdown(f"### 🧪 Tumor Type: **{CLASS_NAMES[idx].upper()}**")
        st.progress(float(probs[idx]))

        # ===================== GRADCAM =====================
        heatmap = gradcam(stage2_model, img_array, stage2_model.layers[-6].name)
        heatmap = cv2.resize(heatmap, (img_np.shape[1], img_np.shape[0]))
        heatmap = cv2.applyColorMap(np.uint8(255*heatmap), cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(img_np, 0.6, heatmap, 0.4, 0)

        st.markdown("### 🔍 Model Explainability (Grad-CAM)")
        st.image(overlay, width=300)

        # ===================== HOSPITALS =====================
        if city:
            st.markdown("### 🏥 Nearby Hospitals")
            for h in find_hospitals(city):
                st.write("•", h.get("display_name",""))

        # ===================== PDF =====================
        pdf_path = generate_pdf(CLASS_NAMES[idx], probs[idx]*100)
        with open(pdf_path, "rb") as f:
            st.download_button("📄 Download Report", f, file_name="Brain_Tumor_Report.pdf")
