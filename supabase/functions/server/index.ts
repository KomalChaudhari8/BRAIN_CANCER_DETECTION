import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Create storage buckets on startup
const initializeStorage = async () => {
  const bucketName = 'make-cfefc943-mri-scans';
  const gradcamBucketName = 'make-cfefc943-gradcam';
  
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const mriBucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!mriBucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created bucket: ${bucketName}`);
    }
    
    const gradcamBucketExists = buckets?.some(bucket => bucket.name === gradcamBucketName);
    if (!gradcamBucketExists) {
      await supabase.storage.createBucket(gradcamBucketName, { public: false });
      console.log(`Created bucket: ${gradcamBucketName}`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize storage
initializeStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-cfefc943/health", (c) => {
  return c.json({ status: "ok" });
});

// Upload MRI scan
app.post("/make-server-cfefc943/upload-mri", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const fileName = `${patientId}-${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-cfefc943-mri-scans')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload MRI scan', details: uploadError.message }, 500);
    }
    
    // Generate signed URL (valid for 1 hour)
    const { data: urlData } = await supabase.storage
      .from('make-cfefc943-mri-scans')
      .createSignedUrl(fileName, 3600);
    
    // Store metadata in KV
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
    
    if (!scanId) {
      return c.json({ error: 'No scanId provided' }, 400);
    }
    
    // Simulate AI model prediction (replace with actual model API call)
    // In production, you'd call your ML model endpoint here
    const prediction = Math.random() > 0.3; // 70% chance of detecting tumor
    const confidence = 0.85 + Math.random() * 0.14; // 85-99% confidence
    
    const result = {
      scanId,
      tumorDetected: prediction,
      confidence: confidence.toFixed(2),
      timestamp: new Date().toISOString(),
      stage: 1
    };
    
    // Store result
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
    
    if (!scanId) {
      return c.json({ error: 'No scanId provided' }, 400);
    }
    
    // Check if tumor was detected in stage 1
    const detectionResult = await kv.get(`detection:${scanId}`);
    if (!detectionResult || !detectionResult.tumorDetected) {
      return c.json({ error: 'No tumor detected in Stage 1' }, 400);
    }
    
    // Simulate tumor classification (replace with actual model)
    const tumorTypes = ['Glioma', 'Meningioma', 'Pituitary', 'Astrocytoma'];
    const classIndex = Math.floor(Math.random() * tumorTypes.length);
    const confidence = 0.80 + Math.random() * 0.19; // 80-99% confidence
    
    const result = {
      scanId,
      tumorType: tumorTypes[classIndex],
      confidence: confidence.toFixed(2),
      severity: Math.random() > 0.5 ? 'Moderate' : 'High',
      timestamp: new Date().toISOString(),
      stage: 2
    };
    
    // Store result
    await kv.set(`classification:${scanId}`, result);
    
    return c.json(result);
  } catch (error) {
    console.error('Error classifying tumor:', error);
    return c.json({ error: 'Failed to classify tumor', details: String(error) }, 500);
  }
});

// Generate GradCAM visualization
app.post("/make-server-cfefc943/generate-gradcam", async (c) => {
  try {
    const { scanId, imageData } = await c.req.json();
    
    if (!scanId || !imageData) {
      return c.json({ error: 'Missing scanId or imageData' }, 400);
    }
    
    // In production, this would call your GradCAM generation service
    // For now, we'll store the provided GradCAM image
    const fileName = `gradcam-${scanId}.png`;
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-cfefc943-gradcam')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('GradCAM upload error:', uploadError);
      return c.json({ error: 'Failed to upload GradCAM', details: uploadError.message }, 500);
    }
    
    // Generate signed URL
    const { data: urlData } = await supabase.storage
      .from('make-cfefc943-gradcam')
      .createSignedUrl(fileName, 3600);
    
    const result = {
      scanId,
      gradcamUrl: urlData?.signedUrl || '',
      timestamp: new Date().toISOString()
    };
    
    await kv.set(`gradcam:${scanId}`, result);
    
    return c.json(result);
  } catch (error) {
    console.error('Error generating GradCAM:', error);
    return c.json({ error: 'Failed to generate GradCAM', details: String(error) }, 500);
  }
});

// Get nearby hospitals using external API
app.post("/make-server-cfefc943/nearby-hospitals", async (c) => {
  try {
    const { latitude, longitude } = await c.req.json();
    
    if (!latitude || !longitude) {
      return c.json({ error: 'Location coordinates required' }, 400);
    }
    
    // In production, use Google Places API or similar
    // For demo, return mock data
    const hospitals = [
      {
        id: 1,
        name: "City General Hospital",
        address: "123 Medical Center Dr",
        distance: "2.3 km",
        phone: "+1-555-0100",
        specialization: "Neurosurgery & Oncology",
        rating: 4.5
      },
      {
        id: 2,
        name: "St. Mary's Medical Center",
        address: "456 Healthcare Blvd",
        distance: "3.7 km",
        phone: "+1-555-0200",
        specialization: "Brain & Spine Institute",
        rating: 4.8
      },
      {
        id: 3,
        name: "Regional Cancer Institute",
        address: "789 Wellness Ave",
        distance: "5.1 km",
        phone: "+1-555-0300",
        specialization: "Radiation Oncology",
        rating: 4.6
      }
    ];
    
    return c.json({ hospitals });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return c.json({ error: 'Failed to fetch hospitals', details: String(error) }, 500);
  }
});

// Generate and store report
app.post("/make-server-cfefc943/generate-report", async (c) => {
  try {
    const { scanId, patientName, patientAge, patientGender } = await c.req.json();
    
    if (!scanId) {
      return c.json({ error: 'scanId required' }, 400);
    }
    
    // Fetch all analysis data
    const mriData = await kv.get(`mri:${scanId}`);
    const detectionData = await kv.get(`detection:${scanId}`);
    const classificationData = await kv.get(`classification:${scanId}`);
    const gradcamData = await kv.get(`gradcam:${scanId}`);
    
    const reportId = `report-${Date.now()}`;
    const report = {
      reportId,
      scanId,
      patientName,
      patientAge,
      patientGender,
      generatedAt: new Date().toISOString(),
      mriData,
      detectionData,
      classificationData,
      gradcamData
    };
    
    // Store report
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
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }
    
    return c.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return c.json({ error: 'Failed to fetch report', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);