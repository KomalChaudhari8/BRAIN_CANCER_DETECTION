import os
import gdown
import tensorflow as tf

MODEL_PATH = "models/model.keras"

def load_model(custom_objects):
    if not os.path.exists(MODEL_PATH):
        url = "https://drive.google.com/drive/folders/1bhDHSHJQmo4l_TiodOdw7JXHCnIi_5uk?usp=sharing"
        gdown.download(url, MODEL_PATH, quiet=False)

    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects=custom_objects
    )
    return model
