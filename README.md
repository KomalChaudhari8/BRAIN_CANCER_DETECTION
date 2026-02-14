# 🧠 NeuroScan AI - Brain Tumor Detection System

<div align="center">

![NeuroScan AI](https://img.shields.io/badge/NeuroScan-AI%20Powered-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Connected-3ecf8e)

**A comprehensive fullstack web application for AI-powered brain tumor detection, classification, and analysis**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture) • [Integration](#-ml-integration)

</div>

---

## 🎯 Overview

NeuroScan AI is a professional medical imaging analysis platform that provides:

- **2-Stage AI Detection**: Tumor presence detection + Classification
- **GradCAM Explainability**: Visual heatmaps for model transparency
- **Hospital Locator**: Find nearby specialized treatment centers
- **Comprehensive Reports**: Downloadable PDF reports for patients

**⚠️ IMPORTANT**: This is a **prototype/demonstration application**. It is NOT intended for actual medical diagnosis or treatment. Always consult qualified medical professionals.

---

## ✨ Features

### 🔬 Complete Analysis Pipeline

1. **Stage 1: Tumor Detection**
   - Binary classification (tumor present/absent)
   - Confidence scoring (85-99%)
   - Real-time processing feedback

2. **Stage 2: Tumor Classification**
   - 4 tumor types: Glioma, Meningioma, Pituitary, Astrocytoma
   - Severity assessment (Moderate/High)
   - High-confidence predictions

3. **GradCAM Visualization**
   - Explainable AI heatmap overlays
   - Shows model's focus areas
   - Helps radiologists validate AI decisions

4. **Hospital Finder**
   - Geolocation-based search
   - Specialized neurosurgery centers
   - Distance, ratings, contact info

5. **Report Generation**
   - Professional PDF reports
   - Complete analysis summary
   - Patient information
   - Downloadable for records

### 🎨 User Interface

- **Intuitive Design**: Medical-grade professional interface
- **Step-by-step Workflow**: Clear progress indicators
- **Responsive**: Works on desktop, tablet, and mobile
- **Real-time Feedback**: Loading states and progress tracking
- **Accessibility**: WCAG-compliant design

### 🔧 Technical Features

- **Fullstack Architecture**: React + Supabase Edge Functions
- **File Storage**: Secure MRI scan storage
- **Data Persistence**: All results saved in database
- **API Integration Ready**: Connect your ML models easily
- **Error Handling**: Comprehensive error messages and logging

---

## 🚀 Quick Start

### Prerequisites

- ✅ Supabase account (already connected)
- ✅ Modern web browser with JavaScript
- ✅ Internet connection

### Usage

1. **Open the application** in your browser
   
2. **Enter patient information**:
   - Name, Age, Gender
   
3. **Upload MRI scan**:
   - Supported formats: JPEG, PNG, DICOM, NIfTI
   - Recommended size: < 10MB

4. **Click "Start Analysis"**:
   - System automatically processes through all stages
   
5. **View results**:
   - Detection status
   - Classification (if tumor detected)
   - GradCAM visualization
   - Nearby hospitals
   
6. **Generate & Download Report**:
   - Professional PDF report
   - Save for patient records

---

## 📚 Documentation

Comprehensive guides are available:

| Document | Description |
|----------|-------------|
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Complete setup instructions and architecture overview |
| **[ML_INTEGRATION_GUIDE.md](ML_INTEGRATION_GUIDE.md)** | Step-by-step ML model integration guide |
| **[API_TESTING.md](API_TESTING.md)** | API endpoint testing and examples |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Common issues and solutions |

### Key Sections

#### For Developers
- Backend API reference → `SETUP_GUIDE.md`
- Frontend components → `SETUP_GUIDE.md`
- Database schema → `SETUP_GUIDE.md`

#### For ML Engineers
- Model integration → `ML_INTEGRATION_GUIDE.md`
- Expected formats → `ML_INTEGRATION_GUIDE.md`
- GradCAM setup → `ML_INTEGRATION_GUIDE.md`

#### For Testing
- API endpoints → `API_TESTING.md`
- Sample requests → `API_TESTING.md`
- Postman collection → `API_TESTING.md`

#### For Troubleshooting
- Common errors → `TROUBLESHOOTING.md`
- Debug tools → `TROUBLESHOOTING.md`
- Performance tips → `TROUBLESHOOTING.md`

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18.3 with TypeScript
- React Router for navigation
- Tailwind CSS v4 for styling
- shadcn/ui component library
- jsPDF + html2canvas for reports

**Backend**
- Supabase Edge Functions (Deno runtime)
- Hono web framework
- Supabase Storage (private buckets)
- Key-Value store for data persistence

**Integration Points**
- External ML model APIs (your models)
- Hospital/location APIs (Google Places, etc.)
- File storage and signed URLs

### System Flow

```
┌─────────────┐
│   User UI   │
└─────┬───────┘
      │ Upload MRI
      ▼
┌─────────────────┐
│  Supabase       │
│  Storage        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐      ┌──────────────┐
│  Edge Function  │─────▶│  Your ML API │
│  (Hono Server)  │◀─────│  (External)  │
└─────┬───────────┘      └──────────────┘
      │
      ▼
┌─────────────────┐
│   KV Store      │
│  (Database)     │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Report + PDF   │
└─────────────────┘
```

### API Endpoints

All endpoints are prefixed with `/make-server-cfefc943/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Server health check |
| `/upload-mri` | POST | Upload MRI scan file |
| `/detect-tumor` | POST | Stage 1: Tumor detection |
| `/classify-tumor` | POST | Stage 2: Classification |
| `/generate-gradcam` | POST | Create GradCAM visualization |
| `/nearby-hospitals` | POST | Find hospitals by location |
| `/generate-report` | POST | Create analysis report |
| `/reports/:id` | GET | Retrieve saved report |

See `API_TESTING.md` for detailed usage.

---

## 🤖 ML Integration

### Current Status

The application currently uses **simulated predictions** for demonstration. To use your real ML models:

### Quick Integration Steps

1. **Deploy your model** to a cloud API service
   - Hugging Face Inference API
   - AWS SageMaker
   - Google Vertex AI
   - Custom Flask/FastAPI server

2. **Update backend endpoints** in `/supabase/functions/server/index.tsx`

3. **Add API keys** as Supabase environment variables

4. **Test integration** using `API_TESTING.md` guide

### Example Integration

```typescript
// Replace mock prediction in detect-tumor endpoint
app.post("/make-server-cfefc943/detect-tumor", async (c) => {
  const { scanId } = await c.req.json();
  
  // Get MRI from storage
  const { data: imageBlob } = await supabase.storage
    .from('make-cfefc943-mri-scans')
    .download(scanId);
  
  // Call your ML API
  const response = await fetch('YOUR_MODEL_API/detect', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('MODEL_API_KEY')}`,
    },
    body: await imageBlob.arrayBuffer()
  });
  
  const prediction = await response.json();
  
  // Store and return result
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

**Full details**: See `ML_INTEGRATION_GUIDE.md`

---

## 📊 Project Structure

```
├── src/
│   ├── app/
│   │   ├── App.tsx              # Main app component
│   │   ├── routes.ts            # Route configuration
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Landing + upload page
│   │   │   └── Analysis.tsx    # Multi-stage analysis page
│   │   └── components/
│   │       └── ui/              # shadcn/ui components
│   └── styles/
│       ├── theme.css            # Design tokens
│       └── tailwind.css         # Tailwind config
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx        # Edge Function API
│           └── kv_store.tsx     # Database utilities
├── SETUP_GUIDE.md               # Setup instructions
├── ML_INTEGRATION_GUIDE.md      # Model integration guide
├── API_TESTING.md               # API testing guide
├── TROUBLESHOOTING.md           # Common issues
└── README.md                    # This file
```

---

## 🔒 Security & Privacy

### ⚠️ IMPORTANT DISCLAIMERS

1. **NOT HIPAA COMPLIANT** in current form
2. **NOT FOR CLINICAL USE** - Prototype only
3. **NOT A MEDICAL DEVICE** - No FDA approval
4. **NO PHI PROTECTION** - Don't use with real patient data

### For Production Use

If you plan to use this in a real medical setting, you MUST:

- [ ] Implement proper authentication (Supabase Auth)
- [ ] Add role-based access control (RBAC)
- [ ] Encrypt all data at rest and in transit
- [ ] Set up comprehensive audit logging
- [ ] Ensure HIPAA compliance
- [ ] Get appropriate medical device certifications
- [ ] Conduct security audits
- [ ] Implement data retention policies
- [ ] Add user consent mechanisms
- [ ] Establish backup and disaster recovery

---

## 🎨 Customization

### Branding

Update branding in:
- `/src/app/pages/Home.tsx` - Header and title
- `/src/styles/theme.css` - Color scheme
- Icons and logos

### Workflow

Modify stages in:
- `/src/app/pages/Analysis.tsx` - Add/remove stages
- `/supabase/functions/server/index.tsx` - Backend logic

### UI Components

All UI components are in `/src/app/components/ui/`
- Built with shadcn/ui
- Fully customizable with Tailwind

---

## 📈 Roadmap

Potential future enhancements:

- [ ] 3D MRI volume visualization
- [ ] Multi-slice analysis
- [ ] Temporal comparison (track changes over time)
- [ ] Radiologist review workflow
- [ ] Advanced DICOM viewer
- [ ] Multi-language support
- [ ] Appointment booking integration
- [ ] Voice-enabled reports
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration features

---

## 🛠️ Development

### Running Locally

The application runs in your browser with Figma Make.

### Making Changes

1. **Frontend changes**: Edit files in `/src/app/`
2. **Backend changes**: Edit `/supabase/functions/server/index.tsx`
3. **Styling**: Modify `/src/styles/theme.css`

### Testing

Run tests using the guides:
- Unit tests: Individual components
- Integration tests: API endpoints (see `API_TESTING.md`)
- E2E tests: Full user workflow

---

## 📞 Support

### Getting Help

1. **Read the docs**: Check all `.md` files
2. **Troubleshooting**: See `TROUBLESHOOTING.md`
3. **API testing**: Use `API_TESTING.md`
4. **Check logs**: Supabase Dashboard → Edge Functions → Logs

### Reporting Issues

When reporting problems, include:
- Browser and version
- Error messages (console)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots

---

## 📝 License

This is a demonstration project created with Figma Make.

**Disclaimer**: This software is provided "as is" without warranty of any kind. Use at your own risk. Not intended for medical diagnosis or treatment.

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Figma Make](https://www.figma.com/)

---

## 📄 Quick Reference

### File Locations

| What | Where |
|------|-------|
| Upload page | `/src/app/pages/Home.tsx` |
| Analysis page | `/src/app/pages/Analysis.tsx` |
| Backend API | `/supabase/functions/server/index.tsx` |
| Routes | `/src/app/routes.ts` |
| Styling | `/src/styles/theme.css` |

### Key Variables

| Variable | Location |
|----------|----------|
| Project ID | `/utils/supabase/info.tsx` |
| API endpoint | `https://{projectId}.supabase.co/functions/v1/make-server-cfefc943` |
| Storage buckets | `make-cfefc943-mri-scans`, `make-cfefc943-gradcam` |

### Environment Variables (Supabase)

| Name | Purpose |
|------|---------|
| `SUPABASE_URL` | Auto-configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configured |
| `HUGGINGFACE_API_KEY` | Your ML API key (if using) |
| `GOOGLE_PLACES_API_KEY` | Hospital API key (if using) |

---

<div align="center">

**Built with ❤️ for advancing medical AI**

[Top](#-neuroscan-ai---brain-tumor-detection-system) • [Features](#-features) • [Documentation](#-documentation) • [Support](#-support)

</div>
