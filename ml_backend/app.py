import gradio as gr
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image

# Load models
model1 = load_model("stage1.keras", compile=False)
model2 = load_model("stage2.keras", compile=False)

def predict(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)

    stage1_pred = model1.predict(image)

    if stage1_pred[0][0] > 0.5:
        return "No Tumor Detected"

    stage2_pred = model2.predict(image)
    classes = ["Glioma", "Meningioma", "Pituitary"]

    return f"Tumor Type: {classes[np.argmax(stage2_pred)]}"

demo = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil"),
    outputs="text",
    title="Brain Tumor Detection",
    description="Upload an MRI image to detect tumor stage and type."
)

demo.launch()
