# Troubleshooting Guide

## 🐛 Common Issues and Solutions

### Frontend Issues

#### 1. "Failed to upload MRI scan"

**Symptoms**: Upload fails immediately after clicking "Start Analysis"

**Possible Causes**:
- File too large (Supabase has size limits)
- Network connectivity issues
- CORS problems
- Storage bucket not created

**Solutions**:
```bash
# Check Supabase storage limits (default 50MB)
# Resize image before upload if needed

# Verify backend is running:
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/health

# Check browser console for detailed error messages
```

**Code Fix** (if needed):
```typescript
// Add file size validation in Home.tsx
if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
  toast.error('File too large. Please select an image under 10MB');
  return;
}
```

---

#### 2. Blank or White Screen

**Symptoms**: App doesn't load, shows white screen

**Possible Causes**:
- JavaScript error during rendering
- Missing dependencies
- Route configuration issue

**Solutions**:
```bash
# 1. Check browser console for errors
# Open DevTools (F12) → Console tab

# 2. Verify all packages are installed
# The app should auto-install, but you can verify

# 3. Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

#### 3. "No tumor detected" Every Time

**Symptoms**: Stage 1 always returns negative result

**Possible Causes**:
- Model integration issue (currently using random simulation)
- Need to connect real ML model

**Solutions**:
See `ML_INTEGRATION_GUIDE.md` to connect your actual detection model.

**Temporary Workaround** (force detection for testing):
```typescript
// In /supabase/functions/server/index.tsx
// Line ~120 in detect-tumor endpoint
const prediction = true; // Force tumor detection for testing
```

---

#### 4. GradCAM Not Showing

**Symptoms**: GradCAM section appears but no image

**Possible Causes**:
- Canvas rendering issue
- Storage upload failed
- Browser doesn't support canvas

**Solutions**:
```typescript
// Check browser console for canvas errors
// Verify browser supports HTML5 Canvas
// Try a different browser (Chrome, Firefox, Edge)
```

---

#### 5. Hospital Finder Not Working

**Symptoms**: "Unable to get location" error

**Possible Causes**:
- Geolocation permission denied
- Using HTTP instead of HTTPS
- Browser doesn't support geolocation

**Solutions**:
```bash
# 1. Check browser permissions
# Look for location icon in address bar
# Click and allow location access

# 2. Test with manual coordinates
# The app has fallback coordinates built-in
# Should work even without geolocation
```

---

#### 6. PDF Download Fails

**Symptoms**: "Failed to download report" error

**Possible Causes**:
- html2canvas rendering issue
- Browser popup blocker
- Large report size

**Solutions**:
```typescript
// Check browser console for errors
// Disable popup blocker
// Try different browser

// Alternative: Take screenshot manually
// Or save report content as text
```

---

### Backend Issues

#### 7. "CORS Error"

**Symptoms**: Network requests fail with CORS error in console

**Possible Causes**:
- CORS not properly configured
- Wrong headers

**Solutions**:
Already handled in the code, but verify:
```typescript
// In /supabase/functions/server/index.tsx
// CORS should be configured at line ~10
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
```

---

#### 8. "Bucket Not Found" Error

**Symptoms**: Upload fails with storage bucket error

**Possible Causes**:
- Storage buckets not initialized
- Server startup issue

**Solutions**:
```bash
# 1. Check Supabase Dashboard → Storage
# Verify buckets exist:
# - make-cfefc943-mri-scans
# - make-cfefc943-gradcam

# 2. If buckets don't exist, they should auto-create on server startup
# Try restarting the Edge Function

# 3. Manual creation (if needed):
# Go to Storage → Create Bucket
# Name: make-cfefc943-mri-scans
# Public: No (private)
# Repeat for gradcam bucket
```

---

#### 9. "Internal Server Error" (500)

**Symptoms**: API returns 500 status code

**Possible Causes**:
- Uncaught exception in server code
- Database connection issue
- Missing environment variables

**Solutions**:
```bash
# 1. Check Edge Function logs
# Supabase Dashboard → Edge Functions → Logs

# 2. Look for error stack traces
# The server logs all errors with console.error

# 3. Test individual endpoints
# See API_TESTING.md for curl commands

# 4. Verify environment variables
# Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
```

---

#### 10. Slow Performance

**Symptoms**: Each stage takes a long time (>10 seconds)

**Possible Causes**:
- Cold start (Edge Function not warmed up)
- Large image files
- Network latency

**Solutions**:
```typescript
// 1. Image optimization - resize before upload
// Add to Home.tsx before upload:

const optimizeImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        const ratio = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Use before upload:
const optimizedFile = await optimizeImage(selectedFile);
formData.append('file', optimizedFile);
```

```typescript
// 2. Add loading states and progress indicators
// Already implemented in the UI

// 3. Cache results to avoid re-processing
// Already implemented in backend with KV store
```

---

### Data Issues

#### 11. Patient Information Not Showing in Report

**Symptoms**: Report has "Unknown Patient" or missing data

**Possible Causes**:
- URL parameters not passed correctly
- Navigation issue

**Solutions**:
```typescript
// Verify navigation in Home.tsx passes parameters:
navigate(`/analysis/${data.scanId}?name=${encodeURIComponent(patientName)}&age=${patientAge}&gender=${patientGender}`);

// Check Analysis.tsx reads them:
const patientName = searchParams.get('name') || 'Unknown Patient';
```

---

#### 12. Data Not Persisting

**Symptoms**: Refreshing page loses all data

**Possible Causes**:
- Data stored in component state, not backend
- KV store not saving properly

**Solutions**:
```bash
# Data should persist in Supabase KV store
# Verify by checking KV entries:

# In Supabase SQL Editor:
# SELECT * FROM kv_store_cfefc943;

# Should see entries like:
# - mri:{scanId}
# - detection:{scanId}
# - classification:{scanId}
```

---

### Integration Issues

#### 13. Real ML Model Not Being Called

**Symptoms**: Getting random predictions instead of real model results

**Possible Causes**:
- Model endpoints not configured
- Still using demo/mock mode

**Solutions**:
See `ML_INTEGRATION_GUIDE.md` for detailed integration steps.

Quick check:
```typescript
// In /supabase/functions/server/index.tsx
// Look for these lines in detect-tumor endpoint:
const prediction = Math.random() > 0.3; // THIS IS MOCK DATA

// Replace with actual API call:
const response = await fetch('YOUR_MODEL_API/detect', ...);
```

---

#### 14. API Keys Not Working

**Symptoms**: "Unauthorized" errors when calling external APIs

**Possible Causes**:
- API key not set in environment
- Wrong variable name
- Key expired or invalid

**Solutions**:
```bash
# 1. Set in Supabase Dashboard
# Project Settings → Edge Functions → Add Variable
# Name: HUGGINGFACE_API_KEY (or your service)
# Value: your-api-key-here

# 2. Access in code:
const apiKey = Deno.env.get('HUGGINGFACE_API_KEY');
if (!apiKey) {
  console.error('API key not found!');
  return c.json({ error: 'Configuration error' }, 500);
}

# 3. Test API key separately
curl -H "Authorization: Bearer YOUR_KEY" https://api.example.com/test
```

---

## 🔍 Debugging Tools

### Browser DevTools
```bash
# Open DevTools: F12 or Right-click → Inspect

# Console Tab: View errors and logs
# Network Tab: See all API requests
# Application Tab: View local storage
# Sources Tab: Debug with breakpoints
```

### Supabase Logs
```bash
# Real-time Edge Function logs:
# Dashboard → Edge Functions → select function → Logs

# Storage logs:
# Dashboard → Storage → select bucket → Usage

# Database logs:
# Dashboard → Database → Logs
```

### Network Inspection
```bash
# In browser DevTools → Network tab
# Filter by: Fetch/XHR
# Click on request to see:
# - Headers
# - Request payload
# - Response data
# - Timing information
```

---

## 📊 Performance Monitoring

### Check Metrics

```typescript
// Add timing logs to track performance:
console.time('Stage 1 Detection');
// ... run detection
console.timeEnd('Stage 1 Detection');

// Expected times:
// - Upload: 1-3 seconds
// - Detection: 2-5 seconds (mock) or 5-15 seconds (real model)
// - Classification: 2-5 seconds (mock) or 5-15 seconds (real model)
// - GradCAM: 2-4 seconds
// - Hospital search: 1-2 seconds
```

---

## 🆘 Getting Help

### Information to Gather

When reporting issues, include:

1. **Browser and version** (e.g., Chrome 120)
2. **Error messages** (from console)
3. **Network requests** (failed API calls)
4. **Steps to reproduce**
5. **Expected vs actual behavior**
6. **Screenshots** if UI issue

### Check Logs

```bash
# Browser Console
# Copy all error messages

# Supabase Edge Function Logs
# Copy relevant error stack traces

# Network Tab
# Export HAR file if needed
```

---

## ✅ Health Check Script

Run this to verify everything is working:

```bash
# 1. Frontend accessible
curl http://localhost:5173/  # or your dev URL

# 2. Backend health
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/health

# 3. Storage buckets exist
# Check in Supabase Dashboard → Storage

# 4. Can upload file
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/upload-mri \
  -H "Authorization: Bearer YOUR_KEY" \
  -F "file=@test.jpg" \
  -F "patientId=health-check"

# Expected: Success response with scanId
```

---

## 🚀 Quick Fixes

### Reset Everything

If all else fails:

```bash
# 1. Clear browser data
# Settings → Privacy → Clear browsing data
# Select: Cached images, Cookies, Site data

# 2. Hard refresh
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 3. Check for updates
# Ensure you have the latest code

# 4. Restart Edge Function
# Supabase Dashboard → Edge Functions → Redeploy
```

---

## 📞 Still Stuck?

If none of these solutions work:

1. **Re-read the guides**:
   - SETUP_GUIDE.md
   - ML_INTEGRATION_GUIDE.md
   - API_TESTING.md

2. **Check example implementations** in the code comments

3. **Test each component separately** to isolate the issue

4. **Verify prerequisites** are met (Supabase connected, packages installed)

---

Good luck! 🍀
