# =======================================================
# app.py — Brain Tumor Detection Web App
# =======================================================

import streamlit as st
import numpy as np
import cv2
import os
import tensorflow as tf
from PIL import Image

# -----------------------------
# Custom imports
# -----------------------------
from losses.focal_loss import focal_loss
from models.model_loader import load_trained_model
from utils.gradcam_utils import make_gradcam_heatmap
from utils.pdf_generator import generate_report

# -----------------------------
# Page config
# -----------------------------
st.set_page_config(
    page_title="Brain Tumor Detection",
    page_icon="🧠",
    layout="wide"
)

# -----------------------------
# Load CSS (Bootstrap + Custom)
# -----------------------------
with open("assets/style.html") as f:
    st.markdown(f.read(), unsafe_allow_html=True)

# -----------------------------
# Constants
# -----------------------------
IMG_SIZE = (224, 224)
CLASS_NAMES = ['glioma', 'meningioma', 'pituitary', 'no_tumor']

# -----------------------------
# Sidebar
# -----------------------------
st.sidebar.title("🧠 Brain Tumor AI")
st.sidebar.markdown("""
**Deep Learning based MRI Analysis**
- EfficientNetB3
- Attention Mechanism
- Grad-CAM Explainability
""")

# -----------------------------
# Load Model (Cached)
# -----------------------------
@st.cache_resource(show_spinner="🔄 Loading trained model...")
def get_model():
    return load_trained_model({
        "focal_loss_fixed": focal_loss(),
        "attention_block": attention_block
    })

model = load_trained_model()

# -----------------------------
# Main UI
# -----------------------------
st.markdown(
    "<h1 class='text-center'>Brain Tumor Detection from MRI</h1>",
    unsafe_allow_html=True
)

st.markdown(
    "<p class='text-center text-muted'>Upload an MRI image to analyze tumor presence</p>",
    unsafe_allow_html=True
)

uploaded_file = st.file_uploader(
    "📤 Upload Brain MRI Image",
    type=["jpg", "jpeg", "png"]
)

# -----------------------------
# Image Processing & Prediction
# -----------------------------
if uploaded_file:
    col1, col2 = st.columns(2)

    # Load image
    image = Image.open(uploaded_file).convert("RGB")
    image_resized = image.resize(IMG_SIZE)

    img_array = np.array(image_resized) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Display original image
    with col1:
        st.subheader("🖼 Uploaded MRI")
        st.image(image, use_column_width=True)

    # Prediction
    preds = model.predict(img_array)
    class_idx = np.argmax(preds)
    confidence = float(preds[0][class_idx]) * 100
    predicted_class = CLASS_NAMES[class_idx]

    # Display prediction
    with col2:
        st.subheader("📊 Prediction Result")
        st.markdown(f"""
        <div class="alert alert-info">
        <b>Predicted Class:</b> {predicted_class.upper()}<br>
        <b>Confidence:</b> {confidence:.2f}%
        </div>
        """, unsafe_allow_html=True)

    # -----------------------------
    # Grad-CAM
    # -----------------------------
    st.subheader("🔥 Grad-CAM Visualization")

    heatmap = make_gradcam_heatmap(
        img_array,
        model,
        last_conv_layer_name="top_conv"
    )

    heatmap = cv2.resize(heatmap, IMG_SIZE)
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    original = np.uint8(img_array[0] * 255)
    superimposed = cv2.addWeighted(original, 0.6, heatmap, 0.4, 0)

    st.image(
        superimposed,
        caption="Grad-CAM: Model Attention Regions",
        use_column_width=True
    )

    # Save images temporarily
    os.makedirs("temp", exist_ok=True)
    input_img_path = "temp/input.png"
    gradcam_img_path = "temp/gradcam.png"

    cv2.imwrite(input_img_path, cv2.cvtColor(original, cv2.COLOR_RGB2BGR))
    cv2.imwrite(gradcam_img_path, superimposed)

    # -----------------------------
    # PDF Report
    # -----------------------------
    st.subheader("📄 Medical Report")

    if st.button("📥 Generate PDF Report"):
        pdf_path = generate_report(
            input_img_path,
            predicted_class,
            confidence,
            gradcam_img_path
        )

        with open(pdf_path, "rb") as f:
            st.download_button(
                label="Download Medical Report (PDF)",
                data=f,
                file_name="Brain_MRI_Report.pdf",
                mime="application/pdf"
            )

# -----------------------------
# Footer
# -----------------------------
st.markdown(
    """
    <hr>
    <p class="text-center text-muted">
    ⚠ This tool is for educational & research purposes only.<br>
    Not a replacement for professional medical diagnosis.
    </p>
    """,
    unsafe_allow_html=True
)
