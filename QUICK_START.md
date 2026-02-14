# ⚡ Quick Start Guide

## Get Started in 3 Minutes

### 🎯 What You Have

A fully functional brain tumor detection web application with:
- Patient intake and MRI upload
- 2-stage AI analysis (currently simulated)
- GradCAM explainability visualization
- Hospital locator
- PDF report generation

---

## 🚀 Immediate Next Steps

### 1️⃣ Try the Demo (Right Now!)

1. **Open the application** in your browser
2. **Fill in sample patient data**:
   - Name: "Test Patient"
   - Age: "45"
   - Gender: "Male"
3. **Upload any image file** (the system accepts any image for demo)
4. **Click "Start Analysis"**
5. **Watch the magic happen!** ✨

The app will:
- ✅ Upload your file
- ✅ Run Stage 1 detection (simulated with 70% chance of tumor)
- ✅ Run Stage 2 classification (if tumor detected)
- ✅ Generate GradCAM visualization
- ✅ Find nearby hospitals
- ✅ Create a downloadable PDF report

---

### 2️⃣ Understand the Current State

**What's Working Now:**
- ✅ Complete UI/UX workflow
- ✅ File upload and storage
- ✅ Multi-stage analysis pipeline
- ✅ Data persistence
- ✅ Report generation
- ✅ PDF download

**What's Simulated:**
- 🎲 Stage 1 detection (random 70% tumor detection)
- 🎲 Stage 2 classification (random tumor types)
- 🎲 Hospital data (mock hospitals)

**What You Need to Add:**
- 🔌 Your actual ML models
- 🔌 Real hospital API (optional)

---

### 3️⃣ Connect Your ML Models

**Choose your integration method:**

#### Option A: Cloud API (Easiest) ⭐

If your model is on Hugging Face, AWS, Google Cloud, etc.:

1. Get your API endpoint URL
2. Get your API key
3. Open `/supabase/functions/server/index.tsx`
4. Find the `detect-tumor` endpoint (around line 110)
5. Replace this:
   ```typescript
   const prediction = Math.random() > 0.3;
   const confidence = 0.85 + Math.random() * 0.14;
   ```
   With:
   ```typescript
   const response = await fetch('YOUR_API_URL', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${Deno.env.get('API_KEY')}` },
     body: // your image data
   });
   const prediction = await response.json();
   ```

**Full guide**: `ML_INTEGRATION_GUIDE.md`

#### Option B: Deploy Your Own API

Have a Python model? Deploy it:
- **Render** (free): https://render.com
- **Railway** (free): https://railway.app
- **Hugging Face Spaces** (free): https://huggingface.co/spaces

Then connect using Option A above.

#### Option C: Browser-Based (TensorFlow.js)

For small models, run in browser:
1. Convert model to TensorFlow.js
2. Load in frontend
3. Run predictions directly

**Full guide**: `ML_INTEGRATION_GUIDE.md`

---

## 📚 Documentation Map

### For Different Audiences

**👨‍💻 If you're a developer:**
→ Start with `SETUP_GUIDE.md` for architecture overview

**🤖 If you're integrating ML models:**
→ Go to `ML_INTEGRATION_GUIDE.md` for step-by-step instructions

**🧪 If you want to test the API:**
→ Use `API_TESTING.md` for curl commands and examples

**🐛 If something's not working:**
→ Check `TROUBLESHOOTING.md` for solutions

**🚀 If you're ready to deploy:**
→ Follow `DEPLOYMENT_CHECKLIST.md`

---

## 🎨 Customization Quick Tips

### Change Branding

Edit `/src/app/pages/Home.tsx`:
```typescript
<h1 className="text-2xl font-bold">NeuroScan AI</h1>
// Change to your app name
```

### Modify Colors

Edit `/src/styles/theme.css`:
```css
--color-primary: #3B82F6; /* Your primary color */
```

### Add/Remove Stages

Edit `/src/app/pages/Analysis.tsx`:
```typescript
const stages = [
  { id: 0, name: 'Stage 1: Tumor Detection', ... },
  { id: 1, name: 'Stage 2: Classification', ... },
  // Add your custom stages here
];
```

---

## 🧪 Test the API

Quick test from terminal:

```bash
# Replace YOUR_PROJECT with your Supabase project ID
# Replace YOUR_KEY with your public anon key

# 1. Health check
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/health

# 2. Upload test image
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/upload-mri \
  -H "Authorization: Bearer YOUR_KEY" \
  -F "file=@test.jpg" \
  -F "patientId=test-001"

# Save the scanId from response, then:

# 3. Test detection
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cfefc943/detect-tumor \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scanId": "PASTE_SCAN_ID_HERE"}'
```

**Full API reference**: `API_TESTING.md`

---

## 🎯 Common First Tasks

### Task 1: Test the Demo
**Time**: 2 minutes
**Goal**: See the full workflow in action
**Action**: Follow step 1️⃣ above

### Task 2: Understand the Code
**Time**: 15 minutes
**Goal**: Know where everything is
**Action**: Read `SETUP_GUIDE.md` sections 1-3

### Task 3: Test an API Endpoint
**Time**: 5 minutes
**Goal**: Verify backend is working
**Action**: Run health check curl command above

### Task 4: Plan ML Integration
**Time**: 30 minutes
**Goal**: Figure out your integration approach
**Action**: Read `ML_INTEGRATION_GUIDE.md`

### Task 5: Deploy First Change
**Time**: 10 minutes
**Goal**: Make your first customization
**Action**: Change app name in Home.tsx

---

## 💡 Pro Tips

1. **Start Simple**: Use the demo with simulated models first
2. **Test Often**: Use the curl commands to test each change
3. **Check Logs**: Supabase Dashboard → Edge Functions → Logs
4. **Read Errors**: Error messages have helpful details
5. **One Step at a Time**: Don't integrate everything at once

---

## 📊 Your Integration Roadmap

### Phase 1: Validation (Day 1)
- [ ] Test demo workflow end-to-end
- [ ] Verify all stages work
- [ ] Download a sample report
- [ ] Check Supabase logs

### Phase 2: Backend Setup (Day 2-3)
- [ ] Deploy your ML model API (or use existing)
- [ ] Get API credentials
- [ ] Test model API independently
- [ ] Add credentials to Supabase

### Phase 3: Integration (Day 4-5)
- [ ] Connect Stage 1 (detection)
- [ ] Test with real MRI scans
- [ ] Connect Stage 2 (classification)
- [ ] Verify GradCAM if applicable

### Phase 4: Enhancement (Week 2)
- [ ] Add real hospital API (optional)
- [ ] Customize branding
- [ ] Optimize performance
- [ ] Add any custom features

### Phase 5: Testing (Week 3)
- [ ] Full end-to-end testing
- [ ] Test edge cases
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 6: Launch (Week 4)
- [ ] Final checks (see `DEPLOYMENT_CHECKLIST.md`)
- [ ] Soft launch with limited users
- [ ] Monitor and iterate
- [ ] Full launch

---

## 🆘 Need Help?

### Common Issues

**"Upload failed"**
→ Check file size (must be < 50MB)
→ See `TROUBLESHOOTING.md` #1

**"Blank screen"**
→ Check browser console
→ See `TROUBLESHOOTING.md` #2

**"API not responding"**
→ Test health endpoint
→ See `TROUBLESHOOTING.md` #7

### Getting Support

1. **Read the docs** (you're doing it!)
2. **Check troubleshooting guide**: `TROUBLESHOOTING.md`
3. **Review API testing**: `API_TESTING.md`
4. **Check Supabase logs**: Dashboard → Logs

---

## ✅ Quick Win Checklist

Complete these to verify everything works:

- [ ] Open the app in browser
- [ ] Fill in patient info
- [ ] Upload an image file
- [ ] Complete the full workflow
- [ ] Download the PDF report
- [ ] Test the health endpoint with curl
- [ ] Review Supabase logs
- [ ] Read `ML_INTEGRATION_GUIDE.md`
- [ ] Star this project (kidding! 😄)

---

## 🎉 You're All Set!

You now have:
- ✅ Working prototype
- ✅ Complete documentation
- ✅ Integration guides
- ✅ Testing tools
- ✅ Troubleshooting help

### Next Actions:

1. **Try the demo** (if you haven't)
2. **Pick an integration method** (see `ML_INTEGRATION_GUIDE.md`)
3. **Start coding!** 🚀

---

## 📖 Documentation Index

| Document | When to Read |
|----------|--------------|
| `QUICK_START.md` | **Right now** (you're here!) |
| `README.md` | For overview and features |
| `SETUP_GUIDE.md` | To understand architecture |
| `ML_INTEGRATION_GUIDE.md` | When ready to connect models |
| `API_TESTING.md` | To test endpoints |
| `TROUBLESHOOTING.md` | When something breaks |
| `DEPLOYMENT_CHECKLIST.md` | Before going live |

---

**Happy Building! 🚀**

Questions? Issues? Check `TROUBLESHOOTING.md` first!

---

<div align="center">

**Built with Figma Make**

[Back to README](README.md) | [ML Integration](ML_INTEGRATION_GUIDE.md) | [Troubleshooting](TROUBLESHOOTING.md)

</div>
