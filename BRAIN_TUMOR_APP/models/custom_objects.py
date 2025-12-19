import tensorflow as tf
from keras.saving import register_keras_serializable
from tensorflow.keras.layers import GlobalAveragePooling2D, GlobalMaxPooling2D

# ---------------------------
# Global Pooling Functions
# ---------------------------
@register_keras_serializable(package="Custom")
def global_avg_pool(x):
    return tf.reduce_mean(x, axis=[1, 2])

@register_keras_serializable(package="Custom")
def global_max_pool(x):
    return tf.reduce_max(x, axis=[1, 2])

# ---------------------------
# Attention Block
# ---------------------------
@register_keras_serializable(package="Custom")
def attention_block(inputs):
    avg_pool = global_avg_pool(inputs)
    max_pool = global_max_pool(inputs)

    concat = tf.keras.layers.Concatenate()([avg_pool, max_pool])
    dense = tf.keras.layers.Dense(inputs.shape[-1], activation="sigmoid")(concat)
    scale = tf.keras.layers.Reshape((1, 1, inputs.shape[-1]))(dense)

    return tf.keras.layers.Multiply()([inputs, scale])
