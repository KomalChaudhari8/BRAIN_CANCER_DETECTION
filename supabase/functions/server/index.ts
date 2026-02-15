import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx"; // make sure this exports async get/set
import { createClient } from "npm:@supabase/supabase-js@2";

// Initialize Hono app
const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize storage buckets
const initializeStorage = async () => {
  const bucketsToCreate = ['make-cfefc943-mri-scans', 'make-cfefc943-gradcam'];

  try {
    const { data: buckets } = await supabase.storage.listBuckets();

    for (const bucketName of bucketsToCreate) {
      const exists = buckets?.some(bucket => bucket.name === bucketName);
      if (!exists) {
        await supabase.storage.createBucket(bucketName, { public: false });
        console.log(`Created bucket: ${bucketName}`);
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize storage
initializeStorage();

// Logger middleware
app.use('*', logger(console.log));

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ---------------- ROUTES ---------------- //

// Health check
app.get("/make-server-cfefc943/health", (c) => {
  return c.json({ status: "ok" });
});

// Upload MRI scan
app.post("/make-server-cfefc943/upload-mri", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;

    if (!file) return c.json({ error: 'No file provided' }, 400);

    const fileName = `${patientId}-${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('make-cfefc943-mri-scans')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload MRI scan', details: uploadError.message }, 500);
    }

    // Generate signed URL (1 hour)
    const { data: urlData } = await supabase.storage
      .from('make-cfefc943-mri-scans')
      .createSignedUrl(fileName, 3600);

    const scanData = {
      scanId: fileName,
      patientId,
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
      fileSize: file.size,
      url: urlData?.signedUrl || ''
    };

    await kv.set(`mri:${fileName}`, scanData);

    return c.json({ success: true, scanId: fileName, url: urlData?.signedUrl });
  } catch (error) {
    console.error('Error uploading MRI:', error);
    return c.json({ error: 'Internal server error during upload', details: String(error) }, 500);
  }
});

// Stage 1: Detect tumor presence
app.post("/make-server-cfefc943/detect-tumor", async (c) => {
  try {
    const { scanId } = await c.req.json();

    if (!scanId) return c.json({ error: 'No scanId provided' }, 400);

    const prediction = Math.random() > 0.3; // simulate tumor detection
    const confidence = 0.85 + Math.random() * 0.14;

    const result = {
      scanId,
      tumorDetected: prediction,
      confidence: confidence.toFixed(2),
      timestamp: new Date().toISOString(),
      stage: 1
    };

    await kv.set(`detection:${scanId}`, result);
    return c.json(result);
  } catch (error) {
    console.error('Error detecting tumor:', error);
    return c.json({ error: 'Failed to detect tumor', details: String(error) }, 500);
  }
});

// Stage 2: Classify tumor type
app.post("/make-server-cfefc943/classify-tumor", async (c) => {
  try {
    const { scanId } = await c.req.json();
    if (!scanId) return c.json({ error: 'No scanId provided' }, 400);

    const detectionResult = await kv.get(`detection:${scanId}`);
    if (!detectionResult || !detectionResult.tumorDetected) {
      return c.json({ error: 'No tumor detected in Stage 1' }, 400);
    }

    const tumorTypes = ['Glioma', 'Meningioma', 'Pituitary', 'Astrocytoma'];
    const classIndex = Math.floor(Math.random() * tumorTypes.length);
    const confidence = 0.80 + Math.random() * 0.19;

    const result = {
      scanId,
      tumorType: tumorTypes[classIndex],
      confidence: confidence.toFixed(2),
      severity: Math.random() > 0.5 ? 'Moderate' : 'High',
      timestamp: new Date().toISOString(),
      stage: 2
    };

    await kv.set(`classification:${scanId}`, result);
    return c.json(result);
  } catch (error) {
    console.error('Error classifying tumor:', error);
    return c.json({ error: 'Failed to classify tumor', details: String(error) }, 500);
  }
});

// Generate GradCAM
app.post("/make-server-cfefc943/generate-gradcam", async (c) => {
  try {
    const { scanId, imageData } = await c.req.json();
    if (!scanId || !imageData) return c.json({ error: 'Missing scanId or imageData' }, 400);

    const fileName = `gradcam-${scanId}.png`;
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from('make-cfefc943-gradcam')
      .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

    if (uploadError) return c.json({ error: 'Failed to upload GradCAM', details: uploadError.message }, 500);

    const { data: urlData } = await supabase.storage
      .from('make-cfefc943-gradcam')
      .createSignedUrl(fileName, 3600);

    const result = { scanId, gradcamUrl: urlData?.signedUrl || '', timestamp: new Date().toISOString() };
    await kv.set(`gradcam:${scanId}`, result);

    return c.json(result);
  } catch (error) {
    console.error('Error generating GradCAM:', error);
    return c.json({ error: 'Failed to generate GradCAM', details: String(error) }, 500);
  }
});

// Nearby hospitals (mock)
app.post("/make-server-cfefc943/nearby-hospitals", async (c) => {
  try {
    const { latitude, longitude } = await c.req.json();
    if (!latitude || !longitude) return c.json({ error: 'Location coordinates required' }, 400);

    const hospitals = [
      { id: 1, name: "City General Hospital", address: "123 Medical Center Dr", distance: "2.3 km", phone: "+1-555-0100", specialization: "Neurosurgery & Oncology", rating: 4.5 },
      { id: 2, name: "St. Mary's Medical Center", address: "456 Healthcare Blvd", distance: "3.7 km", phone: "+1-555-0200", specialization: "Brain & Spine Institute", rating: 4.8 },
      { id: 3, name: "Regional Cancer Institute", address: "789 Wellness Ave", distance: "5.1 km", phone: "+1-555-0300", specialization: "Radiation Oncology", rating: 4.6 }
    ];

    return c.json({ hospitals });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return c.json({ error: 'Failed to fetch hospitals', details: String(error) }, 500);
  }
});

// Generate report
app.post("/make-server-cfefc943/generate-report", async (c) => {
  try {
    const { scanId, patientName, patientAge, patientGender } = await c.req.json();
    if (!scanId) return c.json({ error: 'scanId required' }, 400);

    const reportId = `report-${Date.now()}`;
    const report = {
      reportId,
      scanId,
      patientName,
      patientAge,
      patientGender,
      generatedAt: new Date().toISOString(),
      mriData: await kv.get(`mri:${scanId}`),
      detectionData: await kv.get(`detection:${scanId}`),
      classificationData: await kv.get(`classification:${scanId}`),
      gradcamData: await kv.get(`gradcam:${scanId}`)
    };

    await kv.set(reportId, report);
    return c.json({ success: true, reportId, report });
  } catch (error) {
    console.error('Error generating report:', error);
    return c.json({ error: 'Failed to generate report', details: String(error) }, 500);
  }
});

// Get report by ID
app.get("/make-server-cfefc943/reports/:reportId", async (c) => {
  try {
    const reportId = c.req.param('reportId');
    const report = await kv.get(reportId);
    if (!report) return c.json({ error: 'Report not found' }, 404);

    return c.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return c.json({ error: 'Failed to fetch report', details: String(error) }, 500);
  }
});

// Serve the app
Deno.serve(app.fetch);
