import os
import gdown
import tensorflow as tf

MODEL_PATH = "models/model.keras"

def load_trained_model(custom_objects):

    if not os.path.exists(MODEL_PATH):
        os.makedirs("models", exist_ok=True)

        file_id = "1fTzNS1Mxo30Mc5X7RsUCxPtMQeZCSYcf"  # 🔴 replace with YOUR file ID
        url = f"https://drive.google.com/uc?id={file_id}"

        gdown.download(url, MODEL_PATH, quiet=False)

    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects=custom_objects,
        compile=False  # 🔥 IMPORTANT: avoids optimizer/loss mismatch
    )

    return model
