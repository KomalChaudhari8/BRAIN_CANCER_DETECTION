# 🔄 Application Workflow Guide

## Visual Flow Overview

This document shows the complete user journey through the brain tumor detection system.

---

## 🎯 User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE (Home)                       │
│                                                              │
│  [NeuroScan AI Logo]                                        │
│  "AI-Powered Brain Tumor Analysis"                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Patient Information Form                            │  │
│  │  • Name: [____________]                              │  │
│  │  • Age:  [____]                                      │  │
│  │  • Gender: [▼]                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Upload MRI Scan                                     │  │
│  │  [📁 Click to upload or drag & drop]                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Start Analysis →]                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ANALYSIS PAGE                             │
│                                                              │
│  Progress: [█████░░░░░░░░░░░░] 33%                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Stage 1: Tumor Detection                        │  │
│  │  Result: Tumor Detected                              │  │
│  │  Confidence: 94%                                     │  │
│  │  [Proceed to Classification →]                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⏳ Stage 2: Classification (Loading...)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔒 GradCAM Analysis (Locked)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔒 Nearby Hospitals (Locked)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔒 Report Generation (Locked)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE ANALYSIS                         │
│                                                              │
│  Progress: [████████████████████] 100%                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Stage 1: Tumor Detected (94%)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Stage 2: Glioma - High Severity (87%)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ GradCAM: [Heatmap Image]                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Hospitals: 3 found nearby                       │  │
│  │  • City General Hospital (2.3 km)                   │  │
│  │  • St. Mary's Medical Center (3.7 km)              │  │
│  │  • Regional Cancer Institute (5.1 km)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📄 Complete Report                                 │  │
│  │  [Download PDF 📥]                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Detailed Stage Breakdown

### Stage 1️⃣: Tumor Detection

**Purpose**: Determine if a tumor is present

**Input**: MRI scan image

**Process**:
1. User uploads scan
2. Image stored in Supabase Storage
3. API calls detection model
4. Model returns binary classification

**Output**:
```json
{
  "tumorDetected": true,
  "confidence": 0.94,
  "timestamp": "2026-02-14T10:30:00.000Z"
}
```

**UI Display**:
- ✅ Green checkmark if no tumor
- ⚠️ Red alert icon if tumor detected
- Confidence percentage
- "Proceed to Classification" button (if tumor detected)

---

### Stage 2️⃣: Tumor Classification

**Purpose**: Identify the type of tumor

**Prerequisite**: Tumor must be detected in Stage 1

**Input**: Same MRI scan

**Process**:
1. User clicks "Proceed to Classification"
2. API calls classification model
3. Model returns tumor type and severity

**Output**:
```json
{
  "tumorType": "Glioma",
  "confidence": 0.87,
  "severity": "High"
}
```

**Tumor Types**:
- Glioma
- Meningioma
- Pituitary
- Astrocytoma

**UI Display**:
- Tumor type (large, prominent)
- Confidence percentage
- Severity badge (color-coded)
- "Generate GradCAM" button

---

### Stage 3️⃣: GradCAM Visualization

**Purpose**: Explain AI decision-making

**Input**: MRI scan + model weights

**Process**:
1. User clicks "Generate GradCAM Visualization"
2. System generates heatmap overlay
3. Image shows where model focused

**Output**:
- Heatmap image (base64 or URL)
- Stored in Supabase Storage

**UI Display**:
- Side-by-side or overlay visualization
- Color legend (red = high focus, blue = low focus)
- Explanation text for radiologists
- "Find Nearby Hospitals" button

**Interpretation**:
- **Red/Yellow areas**: High attention regions
- **Blue/Green areas**: Low attention regions
- Helps doctors verify AI reasoning

---

### Stage 4️⃣: Hospital Finder

**Purpose**: Locate nearby treatment centers

**Input**: User's geolocation (or default coordinates)

**Process**:
1. User clicks "Find Nearby Hospitals"
2. Browser requests location permission
3. API calls hospital finder service
4. Results sorted by distance

**Output**:
```json
{
  "hospitals": [
    {
      "name": "City General Hospital",
      "address": "123 Medical Center Dr",
      "distance": "2.3 km",
      "phone": "+1-555-0100",
      "specialization": "Neurosurgery & Oncology",
      "rating": 4.5
    }
  ]
}
```

**UI Display**:
- Card layout for each hospital
- Distance badge
- Contact information
- Specialization tags
- Rating stars
- "Generate Final Report" button

---

### Stage 5️⃣: Report Generation

**Purpose**: Create comprehensive medical report

**Input**: All previous stage results + patient info

**Process**:
1. User clicks "Generate Final Report"
2. System compiles all data
3. Creates formatted report
4. Stores in database

**Report Contents**:
- Patient demographics
- Stage 1 results
- Stage 2 classification
- GradCAM visualization
- Recommended hospitals
- Timestamp and ID
- Medical disclaimer

**UI Display**:
- Formatted report preview
- "Download PDF" button
- Print option
- Share functionality (future)

**PDF Generation**:
1. html2canvas captures report as image
2. jsPDF creates PDF document
3. Image embedded in PDF
4. File downloads to user's device

---

## 🔄 State Flow Diagram

```
Upload MRI
    ↓
scanId Generated
    ↓
Stage 1 Auto-Runs
    ↓
    ├─→ No Tumor Detected
    │       ↓
    │   Show Results
    │       ↓
    │   Skip to Hospitals
    │
    └─→ Tumor Detected
            ↓
        Enable Stage 2
            ↓
        User Clicks "Classify"
            ↓
        Classification Results
            ↓
        Enable GradCAM
            ↓
        User Clicks "Generate GradCAM"
            ↓
        Heatmap Display
            ↓
        Enable Hospital Finder
            ↓
        User Clicks "Find Hospitals"
            ↓
        Hospital List
            ↓
        Enable Report Generation
            ↓
        User Clicks "Generate Report"
            ↓
        Complete Report Display
            ↓
        User Clicks "Download PDF"
            ↓
        PDF Downloaded
```

---

## 📱 User Interactions

### Home Page Actions

| Action | Effect |
|--------|--------|
| Enter patient name | Validates non-empty |
| Enter age | Validates number, > 0 |
| Select gender | Dropdown selection |
| Click upload area | Opens file picker |
| Drag file onto upload | Accepts file |
| Click "Start Analysis" | Validates all fields, uploads file, navigates |

### Analysis Page Actions

| Action | Effect | Condition |
|--------|--------|-----------|
| Page loads | Auto-runs Stage 1 | Always |
| Click "Proceed to Classification" | Runs Stage 2 | Tumor detected |
| Click "Generate GradCAM" | Creates heatmap | Classification complete |
| Click "Find Hospitals" | Requests location, searches | GradCAM complete |
| Click "Generate Report" | Compiles all data | Hospitals loaded |
| Click "Download PDF" | Exports report | Report generated |
| Click "Home" | Returns to upload page | Always |

---

## 🎨 UI States

### Loading States

Each stage has a loading state:
```
⏳ Processing...
[Spinner Animation]
"Running Stage X: Description..."
```

### Success States

```
✅ Complete!
[Checkmark Icon]
"Stage completed successfully"
[Result Display]
[Next Action Button]
```

### Error States

```
❌ Error
[Error Icon]
"Failed to complete Stage X"
[Error Details]
[Retry Button]
```

---

## 🔔 Notifications (Toast Messages)

| Event | Message | Type |
|-------|---------|------|
| Upload starts | "Uploading MRI scan..." | Info |
| Upload succeeds | "MRI scan uploaded successfully!" | Success |
| Upload fails | "Failed to upload MRI scan" | Error |
| Detection starts | "Running Stage 1: Tumor Detection..." | Info |
| Tumor detected | "Tumor detected with 94% confidence" | Success |
| No tumor | "No tumor detected" | Success |
| Classification starts | "Running Stage 2: Tumor Classification..." | Info |
| Classification done | "Tumor classified as Glioma" | Success |
| GradCAM starts | "Generating GradCAM visualization..." | Info |
| GradCAM done | "GradCAM visualization generated" | Success |
| Hospitals starts | "Finding nearby hospitals..." | Info |
| Hospitals done | "Found 3 nearby hospitals" | Success |
| Location denied | "Unable to get location. Using default." | Warning |
| Report starts | "Generating comprehensive report..." | Info |
| Report done | "Report generated successfully!" | Success |
| PDF download starts | "Preparing PDF download..." | Info |
| PDF download done | "Report downloaded successfully!" | Success |

---

## 🎯 Decision Points

### Conditional Flow

```
Stage 1 Result?
│
├─→ No Tumor
│   └─→ Skip Stage 2
│       └─→ No GradCAM needed
│           └─→ Jump to Hospitals
│
└─→ Tumor Detected
    └─→ Enable Stage 2
        └─→ Run Classification
            └─→ Generate GradCAM
                └─→ Find Hospitals
                    └─→ Generate Report
```

### User Decisions

| Decision Point | Options | Result |
|----------------|---------|--------|
| After upload | Continue or cancel | Proceed to analysis or return home |
| After Stage 1 (no tumor) | Proceed to hospitals or exit | Get hospital info or end |
| After Stage 1 (tumor) | Classify or exit | Get full analysis or end |
| After classification | GradCAM or skip | Visual explanation or proceed |
| After hospitals | Generate report or exit | Get PDF or end |
| After report | Download or close | Save PDF or finish |

---

## 📊 Data Persistence

### What Gets Saved

| Stage | Key Pattern | Data Stored |
|-------|-------------|-------------|
| Upload | `mri:{scanId}` | File metadata, URL, patient ID |
| Stage 1 | `detection:{scanId}` | Tumor detected, confidence |
| Stage 2 | `classification:{scanId}` | Tumor type, severity, confidence |
| GradCAM | `gradcam:{scanId}` | Heatmap URL |
| Report | `report-{timestamp}` | Complete analysis data |

### Data Lifetime

- **MRI scans**: Stored until manually deleted
- **Analysis results**: Persist indefinitely
- **Reports**: Accessible by report ID
- **Signed URLs**: Valid for 1 hour (regenerate as needed)

---

## 🚀 Performance Expectations

| Operation | Expected Time |
|-----------|---------------|
| Upload MRI | 1-5 seconds (depends on file size) |
| Stage 1 Detection | 2-10 seconds (depends on model) |
| Stage 2 Classification | 2-10 seconds (depends on model) |
| GradCAM Generation | 2-5 seconds |
| Hospital Search | 1-3 seconds |
| Report Generation | 1-2 seconds |
| PDF Download | 2-4 seconds |
| **Total Workflow** | **15-45 seconds** |

---

## ✨ Best Practices

### For Users

1. **Prepare patient information** before starting
2. **Use high-quality MRI scans** (DICOM preferred)
3. **Complete all stages** for comprehensive analysis
4. **Download report** immediately (don't rely on browser session)
5. **Consult medical professionals** - this is a tool, not a diagnosis

### For Developers

1. **Handle errors gracefully** at each stage
2. **Provide clear feedback** on what's happening
3. **Log all operations** for debugging
4. **Validate inputs** before processing
5. **Cache results** to avoid re-processing

---

## 📖 Related Documentation

- **Architecture details**: `SETUP_GUIDE.md`
- **ML integration**: `ML_INTEGRATION_GUIDE.md`
- **API reference**: `API_TESTING.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

---

This workflow ensures a smooth, professional experience for medical professionals using the brain tumor detection system.
