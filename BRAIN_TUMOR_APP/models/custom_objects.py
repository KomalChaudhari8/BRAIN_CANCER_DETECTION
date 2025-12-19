import tensorflow as tf
from keras.saving import register_keras_serializable
from tensorflow.keras.layers import (
    GlobalAveragePooling2D,
    GlobalMaxPooling2D,
    Dense,
    Reshape,
    Multiply,
    Concatenate
)

@register_keras_serializable(package="Custom")
def attention_block(inputs):
    channel = inputs.shape[-1]

    avg_pool = GlobalAveragePooling2D()(inputs)
    max_pool = GlobalMaxPooling2D()(inputs)

    concat = Concatenate()([avg_pool, max_pool])
    dense = Dense(channel, activation="sigmoid")(concat)

    scale = Reshape((1, 1, channel))(dense)
    return Multiply()([inputs, scale])
