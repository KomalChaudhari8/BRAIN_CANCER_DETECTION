# API Testing Guide

## Testing Your Brain Tumor Detection API Endpoints

This guide helps you test each backend endpoint to ensure everything is working correctly.

## 🔧 Setup

You'll need:
- The Supabase project URL and public anon key (already configured)
- A tool like **curl**, **Postman**, or **Thunder Client** (VS Code extension)
- Sample MRI images for testing

## 📍 Base URL

```
https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-cfefc943
```

Replace `[YOUR_PROJECT_ID]` with your actual Supabase project ID (found in `/utils/supabase/info.tsx`)

## 🧪 Testing Each Endpoint

### 1. Health Check

**Purpose**: Verify the server is running

```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/health
```

**Expected Response**:
```json
{
  "status": "ok"
}
```

---

### 2. Upload MRI Scan

**Purpose**: Upload an MRI image file

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/upload-mri \
  -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  -F "file=@/path/to/mri_scan.jpg" \
  -F "patientId=test-patient-001"
```

**Expected Response**:
```json
{
  "success": true,
  "scanId": "test-patient-001-1234567890-mri_scan.jpg",
  "url": "https://...signed_url..."
}
```

**Save the `scanId`** for next steps!

---

### 3. Detect Tumor (Stage 1)

**Purpose**: Run tumor detection on uploaded scan

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/detect-tumor \
  -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "YOUR_SCAN_ID_FROM_STEP_2"
  }'
```

**Expected Response**:
```json
{
  "scanId": "test-patient-001-1234567890-mri_scan.jpg",
  "tumorDetected": true,
  "confidence": "0.92",
  "timestamp": "2026-02-14T10:30:00.000Z",
  "stage": 1
}
```

---

### 4. Classify Tumor (Stage 2)

**Purpose**: Classify the type of detected tumor

**Note**: Only works if `tumorDetected: true` in Stage 1

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/classify-tumor \
  -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "YOUR_SCAN_ID"
  }'
```

**Expected Response**:
```json
{
  "scanId": "test-patient-001-1234567890-mri_scan.jpg",
  "tumorType": "Glioma",
  "confidence": "0.87",
  "severity": "High",
  "timestamp": "2026-02-14T10:31:00.000Z",
  "stage": 2
}
```

---

### 5. Generate GradCAM

**Purpose**: Create explainability visualization

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/generate-gradcam \
  -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "YOUR_SCAN_ID",
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }'
```

**Note**: The `imageData` should be a base64-encoded PNG image (GradCAM heatmap).

**Expected Response**:
```json
{
  "scanId": "test-patient-001-1234567890-mri_scan.jpg",
  "gradcamUrl": "https://...signed_url_to_gradcam_image...",
  "timestamp": "2026-02-14T10:32:00.000Z"
}
```

---

### 6. Find Nearby Hospitals

**Purpose**: Get list of nearby medical facilities

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/nearby-hospitals \
  -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Expected Response**:
```json
{
  "hospitals": [
    {
      "id": 1,
      "name": "City General Hospital",
      "address": "123 Medical Center Dr",
      "distance": "2.3 km",
      "phone": "+1-555-0100",
      "specialization": "Neurosurgery & Oncology",
      "rating": 4.5
    },
    ...
  ]
}
```

---

### 7. Generate Report

**Purpose**: Create comprehensive analysis report

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/generate-report \
  -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "YOUR_SCAN_ID",
    "patientName": "John Doe",
    "patientAge": "45",
    "patientGender": "Male"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "reportId": "report-1234567890",
  "report": {
    "reportId": "report-1234567890",
    "scanId": "...",
    "patientName": "John Doe",
    "patientAge": "45",
    "patientGender": "Male",
    "generatedAt": "2026-02-14T10:35:00.000Z",
    "mriData": { ... },
    "detectionData": { ... },
    "classificationData": { ... },
    "gradcamData": { ... }
  }
}
```

---

### 8. Retrieve Report

**Purpose**: Get a previously generated report

```bash
curl -X GET \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/reports/REPORT_ID \
  -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY"
```

**Expected Response**:
```json
{
  "reportId": "report-1234567890",
  "scanId": "...",
  "patientName": "John Doe",
  ...
}
```

---

## 🔍 Troubleshooting

### Common Errors

#### Error: "Unauthorized" (401)
- **Cause**: Missing or invalid Authorization header
- **Fix**: Ensure you're using `Bearer YOUR_PUBLIC_ANON_KEY`

#### Error: "No file provided" (400)
- **Cause**: File upload failed
- **Fix**: Check file path and ensure `-F "file=@path"` syntax is correct

#### Error: "No tumor detected in Stage 1" (400)
- **Cause**: Trying to classify when no tumor was detected
- **Fix**: Only proceed to Stage 2 if Stage 1 returns `tumorDetected: true`

#### Error: "Failed to upload MRI scan" (500)
- **Cause**: Storage bucket not initialized or file too large
- **Fix**: Check Supabase logs, verify bucket exists

#### Error: "Location coordinates required" (400)
- **Cause**: Missing latitude/longitude in hospital search
- **Fix**: Include both coordinates in request body

---

## 📊 Complete Test Workflow

Run these commands in order to test the full pipeline:

```bash
# 1. Health check
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/health

# 2. Upload MRI (save the scanId from response)
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/upload-mri \
  -H "Authorization: Bearer YOUR_KEY" \
  -F "file=@mri.jpg" \
  -F "patientId=test-001"

# 3. Detect tumor
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/detect-tumor \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scanId": "SCAN_ID_FROM_STEP_2"}'

# 4. Classify tumor (if detected)
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/classify-tumor \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scanId": "SCAN_ID"}'

# 5. Find hospitals
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/nearby-hospitals \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'

# 6. Generate report
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/generate-report \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "SCAN_ID",
    "patientName": "Test Patient",
    "patientAge": "45",
    "patientGender": "Male"
  }'
```

---

## 🧰 Using Postman

If you prefer a GUI:

1. **Create a new Collection** called "Brain Tumor API"
2. **Set Collection Variables**:
   - `baseUrl`: `https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943`
   - `authToken`: `YOUR_PUBLIC_ANON_KEY`
3. **Add Authorization** to Collection:
   - Type: Bearer Token
   - Token: `{{authToken}}`
4. **Create requests** for each endpoint using `{{baseUrl}}/endpoint-name`

---

## 📝 Sample Test Data

### Sample Patient Data
```json
{
  "patientName": "Jane Smith",
  "patientAge": "52",
  "patientGender": "Female"
}
```

### Sample Coordinates (New York)
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Sample Coordinates (Los Angeles)
```json
{
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

---

## 🎯 Testing Checklist

- [ ] Health endpoint returns OK
- [ ] File upload succeeds and returns scanId
- [ ] Detection runs and returns valid result
- [ ] Classification works (when tumor detected)
- [ ] GradCAM generation succeeds
- [ ] Hospital search returns results
- [ ] Report generation works
- [ ] Report retrieval works
- [ ] All responses have correct structure
- [ ] Error messages are helpful

---

## 📊 Monitoring

View real-time logs in Supabase Dashboard:

1. Go to **Edge Functions** tab
2. Select `make-server-cfefc943`
3. Click **Logs**
4. See all requests and errors

---

## 💡 Tips

- Use **jq** to format JSON responses: `curl ... | jq`
- Save scanId to environment variable: `SCAN_ID=$(curl ... | jq -r '.scanId')`
- Create a test script to run all endpoints sequentially
- Use Postman's **Tests** feature to automate validation

---

Happy testing! 🧪
