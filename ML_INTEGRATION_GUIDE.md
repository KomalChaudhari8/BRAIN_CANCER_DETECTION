# Machine Learning Model Integration Guide

## 🤖 Integrating Your Brain Tumor Detection Models

This guide shows you how to connect your actual trained ML models to the NeuroScan AI application.

## 📋 Prerequisites

Before integrating, ensure your ML models can:
1. Accept image inputs (MRI scans)
2. Return predictions in JSON format
3. Be accessed via HTTP API (REST endpoint)

## 🔧 Integration Options

### Option 1: Cloud-Hosted Model API (Recommended)

If you've deployed your models on cloud platforms like:
- **Hugging Face Inference API**
- **AWS SageMaker**
- **Google Vertex AI**
- **Azure Machine Learning**
- **Replicate**

#### Step 1: Get Your API Endpoint

Example for Hugging Face:
```
https://api-inference.huggingface.co/models/YOUR_USERNAME/brain-tumor-detector
```

#### Step 2: Update Server Code

Edit `/supabase/functions/server/index.tsx`:

```typescript
// Stage 1: Tumor Detection
app.post("/make-server-cfefc943/detect-tumor", async (c) => {
  try {
    const { scanId } = await c.req.json();
    
    // Get MRI scan URL
    const mriData = await kv.get(`mri:${scanId}`);
    
    // Fetch the image from storage
    const { data: imageBlob, error } = await supabase.storage
      .from('make-cfefc943-mri-scans')
      .download(scanId);
    
    if (error) {
      return c.json({ error: 'Failed to fetch MRI scan' }, 500);
    }
    
    // Convert to base64 or form data for your API
    const imageBuffer = await imageBlob.arrayBuffer();
    
    // Call your detection model
    const API_KEY = Deno.env.get('HUGGINGFACE_API_KEY'); // Set this in Supabase secrets
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/YOUR_MODEL/detect',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/octet-stream'
        },
        body: imageBuffer
      }
    );
    
    const prediction = await response.json();
    
    // Transform prediction to expected format
    const result = {
      scanId,
      tumorDetected: prediction.label === 'tumor' || prediction.tumor_detected,
      confidence: prediction.score || prediction.confidence,
      timestamp: new Date().toISOString(),
      stage: 1
    };
    
    await kv.set(`detection:${scanId}`, result);
    return c.json(result);
    
  } catch (error) {
    console.error('Error detecting tumor:', error);
    return c.json({ error: 'Detection failed', details: String(error) }, 500);
  }
});
```

### Option 2: Custom Python API

If you have a Flask/FastAPI server running your models:

#### Your Python API (example with FastAPI):

```python
# model_api.py
from fastapi import FastAPI, File, UploadFile
import torch
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Load your trained models
detection_model = torch.load('stage1_detector.pth')
classification_model = torch.load('stage2_classifier.pth')

@app.post("/detect")
async def detect_tumor(file: UploadFile = File(...)):
    # Read and preprocess image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    image = preprocess_mri(image)  # Your preprocessing
    
    # Run inference
    with torch.no_grad():
        prediction = detection_model(image)
        tumor_detected = prediction.argmax() == 1
        confidence = float(prediction.softmax(dim=1).max())
    
    return {
        "tumor_detected": tumor_detected,
        "confidence": confidence
    }

@app.post("/classify")
async def classify_tumor(file: UploadFile = File(...)):
    # Similar to detect
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    image = preprocess_mri(image)
    
    with torch.no_grad():
        prediction = classification_model(image)
        tumor_types = ['Glioma', 'Meningioma', 'Pituitary', 'Astrocytoma']
        predicted_class = prediction.argmax().item()
        confidence = float(prediction.softmax(dim=0).max())
    
    return {
        "tumor_type": tumor_types[predicted_class],
        "confidence": confidence,
        "severity": "High" if confidence > 0.9 else "Moderate"
    }

@app.post("/gradcam")
async def generate_gradcam(file: UploadFile = File(...)):
    # Your GradCAM implementation
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    
    # Generate GradCAM heatmap
    heatmap = generate_gradcam_heatmap(image, classification_model)
    
    # Convert to base64
    buffer = io.BytesIO()
    heatmap.save(buffer, format='PNG')
    import base64
    gradcam_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return {
        "gradcam_image": f"data:image/png;base64,{gradcam_base64}"
    }
```

#### Deploy Your Python API

Option A: **Render** (Free tier available)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Deploy (get URL like `https://your-model.onrender.com`)

Option B: **Railway**
1. Similar to Render, easy deployment
2. Free tier available

Option C: **Google Cloud Run** / **AWS Lambda**
1. More scalable for production
2. May require containerization

#### Update Supabase Server to Call Your API

```typescript
// In /supabase/functions/server/index.tsx

const PYTHON_API_URL = 'https://your-model.onrender.com';

app.post("/make-server-cfefc943/detect-tumor", async (c) => {
  const { scanId } = await c.req.json();
  
  // Get image from storage
  const { data: imageBlob } = await supabase.storage
    .from('make-cfefc943-mri-scans')
    .download(scanId);
  
  // Create form data
  const formData = new FormData();
  formData.append('file', imageBlob, scanId);
  
  // Call your Python API
  const response = await fetch(`${PYTHON_API_URL}/detect`, {
    method: 'POST',
    body: formData
  });
  
  const prediction = await response.json();
  
  const result = {
    scanId,
    tumorDetected: prediction.tumor_detected,
    confidence: prediction.confidence.toFixed(2),
    timestamp: new Date().toISOString(),
    stage: 1
  };
  
  await kv.set(`detection:${scanId}`, result);
  return c.json(result);
});
```

### Option 3: TensorFlow.js (Browser-based)

If your model is small enough, run it directly in the browser:

#### Convert Your Model to TensorFlow.js

```bash
pip install tensorflowjs
tensorflowjs_converter --input_format keras model.h5 /path/to/web_model
```

#### Load in Frontend

```typescript
// In Analysis.tsx
import * as tf from '@tensorflow/tfjs';

const runStage1Detection = async () => {
  // Load model (do this once, maybe in useEffect)
  const model = await tf.loadLayersModel('/models/stage1/model.json');
  
  // Get image element
  const img = document.getElementById('mri-image') as HTMLImageElement;
  
  // Convert to tensor
  const tensor = tf.browser.fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255.0)
    .expandDims(0);
  
  // Predict
  const prediction = await model.predict(tensor) as tf.Tensor;
  const data = await prediction.data();
  
  const tumorDetected = data[1] > 0.5; // Assuming binary classification
  const confidence = data[1];
  
  setDetectionResult({
    scanId,
    tumorDetected,
    confidence: confidence.toFixed(2),
    timestamp: new Date().toISOString(),
    stage: 1
  });
};
```

**Note**: You'll need to install TensorFlow.js:
```bash
npm install @tensorflow/tfjs
```

## 🔑 Setting Up API Keys

If your ML API requires authentication:

### Step 1: Add Secret to Supabase

1. Go to Supabase Dashboard
2. Navigate to Project Settings → Edge Functions
3. Add environment variable:
   - Name: `HUGGINGFACE_API_KEY` (or your service)
   - Value: Your API key

### Step 2: Access in Server Code

```typescript
const API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

const response = await fetch(MODEL_ENDPOINT, {
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});
```

## 🎯 Expected Model Output Formats

### Detection Model (Stage 1)
Your API should return:
```json
{
  "tumor_detected": true,
  "confidence": 0.94
}
```

### Classification Model (Stage 2)
```json
{
  "tumor_type": "Glioma",
  "confidence": 0.89,
  "severity": "High"
}
```

### GradCAM
```json
{
  "gradcam_image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

## 🧪 Testing Your Integration

### 1. Test Model API Separately

```bash
curl -X POST https://your-api.com/detect \
  -H "Authorization: Bearer YOUR_KEY" \
  -F "file=@test_mri.jpg"
```

### 2. Test from Supabase Server

Add a test endpoint:

```typescript
app.get("/make-server-cfefc943/test-model", async (c) => {
  try {
    const response = await fetch('YOUR_MODEL_API/detect', {
      method: 'POST',
      // ... test with sample data
    });
    const result = await response.json();
    return c.json({ success: true, result });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
```

Visit: `https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/test-model`

### 3. Monitor Logs

Watch Supabase Edge Function logs for errors during testing.

## 📊 Performance Optimization

### Caching Results
```typescript
// Cache predictions to avoid re-running models
const cachedResult = await kv.get(`detection:${scanId}`);
if (cachedResult) {
  return c.json(cachedResult);
}
// Otherwise, run model...
```

### Parallel Processing
If Stage 1 and 2 can run independently:
```typescript
const [detection, classification] = await Promise.all([
  callDetectionModel(scanId),
  callClassificationModel(scanId)
]);
```

### Image Preprocessing
Resize images before sending to model:
```typescript
// In the frontend before upload
const resizeImage = (file: File, maxWidth: number) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
```

## 🐛 Troubleshooting

### Error: "Model API not responding"
- Check if your API is running
- Verify the endpoint URL
- Check API key authentication

### Error: "Image format not supported"
- Ensure image preprocessing matches model training
- Check if base64 encoding/decoding is correct

### Error: "CORS issues"
- Add CORS headers to your Python API
- For FastAPI: `app.add_middleware(CORSMiddleware, allow_origins=["*"])`

### Slow Performance
- Optimize model size (quantization, pruning)
- Use caching for repeat scans
- Consider batch processing for multiple images

## 📚 Additional Resources

- **TensorFlow Model Deployment**: https://www.tensorflow.org/tfx/guide/serving
- **PyTorch Serving**: https://pytorch.org/serve/
- **Hugging Face Inference**: https://huggingface.co/inference-api
- **FastAPI Docs**: https://fastapi.tiangolo.com/

## ✅ Checklist

Before going live with real models:

- [ ] Model API is deployed and accessible
- [ ] API keys are stored securely in environment variables
- [ ] Error handling is implemented
- [ ] Logging is configured for debugging
- [ ] Model outputs match expected format
- [ ] Performance is acceptable (< 5 seconds per prediction)
- [ ] Tested with various MRI scan formats
- [ ] Confidence thresholds are validated
- [ ] GradCAM visualization works correctly

---

Good luck with your integration! 🚀
