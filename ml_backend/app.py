from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io

app = Flask(__name__)

model1 = load_model("stage1.keras", compile=False)
model2 = load_model("stage2.keras", compile=False)

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["file"]
    image = Image.open(file.stream).resize((224,224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)

    prediction1 = model1.predict(image)[0][0]

    if prediction1 > 0.5:
        prediction2 = model2.predict(image)
        class_index = np.argmax(prediction2)
        classes = ["glioma", "meningioma", "pituitary"]
        tumor_type = classes[class_index]
    else:
        tumor_type = "No Tumor"

    return jsonify({
        "tumorDetected": bool(prediction1 > 0.5),
        "tumorType": tumor_type,
        "confidence": float(prediction1)
    })

if __name__ == "__main__":
    app.run()
