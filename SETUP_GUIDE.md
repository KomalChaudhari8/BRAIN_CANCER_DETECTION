# Brain Tumor Detection System - Setup Guide

## 🧠 Overview

NeuroScan AI is a comprehensive fullstack web application for brain tumor detection and analysis. It provides a complete workflow from MRI scan upload to detailed medical reports.

## ✨ Features

### 1. **Stage 1: Tumor Detection**
- Upload MRI scans (JPEG, PNG, DICOM, NIfTI formats)
- AI-powered tumor presence detection
- Confidence scoring for predictions

### 2. **Stage 2: Tumor Classification**
- Classifies detected tumors into types:
  - Glioma
  - Meningioma
  - Pituitary
  - Astrocytoma
- Severity assessment (Moderate/High)
- Confidence metrics

### 3. **GradCAM Visualization**
- Explainable AI heatmap overlay
- Shows model's focus areas
- Helps radiologists understand AI reasoning
- Visual representation of decision-making process

### 4. **Hospital Locator**
- Geolocation-based hospital search
- Displays nearby specialized treatment centers
- Includes:
  - Distance information
  - Contact details
  - Specialization areas
  - Ratings

### 5. **Report Generation**
- Comprehensive PDF report with:
  - Patient information
  - All detection and classification results
  - GradCAM visualizations
  - Recommended hospitals
  - Professional medical formatting
- Downloadable for patient records

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **React Router** for multi-page navigation
- **Tailwind CSS v4** for styling
- **shadcn/ui** components
- **jsPDF + html2canvas** for report generation

### Backend
- **Supabase Edge Functions** (Deno runtime)
- **Hono** web framework
- **Supabase Storage** for MRI images and GradCAM outputs
- **Key-Value Store** for metadata and results

### Database Schema
The system uses Supabase's built-in KV store with the following key patterns:
- `mri:{scanId}` - MRI scan metadata
- `detection:{scanId}` - Stage 1 detection results
- `classification:{scanId}` - Stage 2 classification results
- `gradcam:{scanId}` - GradCAM visualization data
- `report-{timestamp}` - Generated reports

## 🚀 Getting Started

### Prerequisites
- Supabase account (already connected)
- Modern web browser with JavaScript enabled
- Geolocation permissions (for hospital finder)

### Application Flow

1. **Home Page** (`/`)
   - Enter patient information (Name, Age, Gender)
   - Upload MRI scan file
   - Click "Start Analysis"

2. **Analysis Page** (`/analysis/:scanId`)
   - Automatic Stage 1 detection
   - Progress through all stages
   - View results in real-time
   - Generate and download report

## 🔧 Integration with Your ML Models

### Current Implementation
The application currently uses **simulated AI predictions** for demonstration. To integrate your actual ML models:

### Option 1: External API Integration

Replace the model endpoints in `/supabase/functions/server/index.tsx`:

```typescript
// Stage 1: Tumor Detection
app.post("/make-server-cfefc943/detect-tumor", async (c) => {
  const { scanId } = await c.req.json();
  
  // Get the MRI image URL from storage
  const mriData = await kv.get(`mri:${scanId}`);
  
  // Call your ML model API
  const response = await fetch('YOUR_MODEL_API_ENDPOINT/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      imageUrl: mriData.url 
    })
  });
  
  const prediction = await response.json();
  // prediction should have: { tumorDetected: boolean, confidence: number }
  
  // Store and return result
  await kv.set(`detection:${scanId}`, prediction);
  return c.json(prediction);
});
```

### Option 2: Direct Model Deployment

If your model is deployed on a cloud service (AWS SageMaker, Google AI Platform, Azure ML):

1. Get your model endpoint URL
2. Add authentication keys as environment variables
3. Update the server code to call your endpoint

### Option 3: Python Backend Integration

If you have a Python-based model (TensorFlow, PyTorch):

1. Deploy your Python API (Flask/FastAPI) separately
2. Make HTTP calls from the Supabase Edge Function
3. Pass image URLs or base64 data to your Python service

### GradCAM Integration

For real GradCAM generation, modify the `/generate-gradcam` endpoint:

```typescript
app.post("/make-server-cfefc943/generate-gradcam", async (c) => {
  const { scanId } = await c.req.json();
  
  // Get original MRI
  const mriData = await kv.get(`mri:${scanId}`);
  
  // Call your GradCAM generation service
  const response = await fetch('YOUR_GRADCAM_API/generate', {
    method: 'POST',
    body: JSON.stringify({ 
      imageUrl: mriData.url,
      modelType: 'classification' 
    })
  });
  
  const { gradcamImageBase64 } = await response.json();
  
  // Store in Supabase Storage
  // ... (existing storage code)
});
```

## 🗺️ Hospital API Integration

### Current: Mock Data
The app uses mock hospital data. For production:

### Google Places API Integration

1. Get a Google Places API key
2. Add it as a Supabase secret (environment variable)
3. Update the `/nearby-hospitals` endpoint:

```typescript
app.post("/make-server-cfefc943/nearby-hospitals", async (c) => {
  const { latitude, longitude } = await c.req.json();
  
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  const radius = 10000; // 10km
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
    `location=${latitude},${longitude}&radius=${radius}&type=hospital&` +
    `keyword=neurology+brain+tumor&key=${apiKey}`
  );
  
  const data = await response.json();
  
  // Transform Google Places results to your format
  const hospitals = data.results.map(place => ({
    name: place.name,
    address: place.vicinity,
    rating: place.rating,
    // ... other fields
  }));
  
  return c.json({ hospitals });
});
```

### Alternative: Bing Maps, Mapbox, or OpenStreetMap
Similar integration pattern with their respective APIs.

## 📋 API Endpoints Reference

### `/upload-mri` (POST)
Uploads an MRI scan to storage
- **Body**: FormData with `file` and `patientId`
- **Returns**: `{ scanId, url }`

### `/detect-tumor` (POST)
Stage 1: Detects tumor presence
- **Body**: `{ scanId }`
- **Returns**: `{ tumorDetected, confidence, timestamp }`

### `/classify-tumor` (POST)
Stage 2: Classifies tumor type
- **Body**: `{ scanId }`
- **Returns**: `{ tumorType, confidence, severity }`

### `/generate-gradcam` (POST)
Generates GradCAM visualization
- **Body**: `{ scanId, imageData }`
- **Returns**: `{ gradcamUrl }`

### `/nearby-hospitals` (POST)
Finds nearby hospitals
- **Body**: `{ latitude, longitude }`
- **Returns**: `{ hospitals: [...] }`

### `/generate-report` (POST)
Creates comprehensive report
- **Body**: `{ scanId, patientName, patientAge, patientGender }`
- **Returns**: `{ reportId, report }`

## 🎨 UI Customization

### Color Scheme
The app uses a medical-grade color palette:
- **Blue** (#3B82F6): Primary actions, trust
- **Purple** (#9333EA): Classification stage
- **Green** (#16A34A): Success, GradCAM
- **Orange** (#EA580C): Hospitals, warnings
- **Red** (#DC2626): Critical alerts, reports

### Modifying Styles
Edit `/src/styles/theme.css` for global theme changes.

## 🔒 Security & Privacy

### Important Notes
- **NOT HIPAA COMPLIANT** in current form
- Suitable for prototyping and demos only
- For production medical use:
  - Implement proper authentication
  - Add encryption at rest and in transit
  - Set up audit logging
  - Ensure HIPAA compliance
  - Get medical device certification if required

### Recommended Enhancements
1. Add user authentication (Supabase Auth)
2. Implement role-based access control
3. Encrypt sensitive data
4. Add comprehensive audit trails
5. Set up HTTPS-only access
6. Implement data retention policies

## 📊 Data Flow

```
User Upload MRI
    ↓
Supabase Storage (MRI Bucket)
    ↓
Stage 1: Detection API → KV Store
    ↓
Stage 2: Classification API → KV Store
    ↓
GradCAM Generation → Storage + KV Store
    ↓
Geolocation → Hospital API
    ↓
Report Generation → KV Store
    ↓
PDF Download
```

## 🐛 Debugging

### Enable Console Logging
The server logs all requests. Check the Supabase Edge Function logs:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select "make-server-cfefc943"
4. View logs in real-time

### Common Issues

**Issue**: "Failed to upload MRI scan"
- **Solution**: Check file size limits (Supabase has limits)

**Issue**: "No location available"
- **Solution**: Enable browser geolocation permissions

**Issue**: "Model prediction failed"
- **Solution**: Verify your ML API endpoint is accessible

## 📱 Responsive Design

The UI is fully responsive:
- **Desktop**: Full multi-column layout
- **Tablet**: Optimized 2-column grids
- **Mobile**: Single-column stacked layout

## 🔄 Future Enhancements

Potential features to add:
1. **Multi-slice Analysis**: Support for 3D MRI volumes
2. **Historical Comparisons**: Track tumor changes over time
3. **Radiologist Review**: Add approval workflow
4. **DICOM Viewer**: Advanced medical image viewer
5. **Appointment Booking**: Direct hospital integration
6. **Multi-language Support**: Internationalization
7. **Voice Reports**: Text-to-speech for accessibility

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com

## ⚠️ Disclaimer

This application is a prototype for demonstration and educational purposes. It is NOT intended for actual medical diagnosis or treatment. Always consult qualified medical professionals for health-related decisions.

## 📄 License

This is a demonstration project created with Figma Make.

---

**Built with ❤️ using Figma Make, React, Supabase, and modern web technologies**
