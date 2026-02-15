import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Enable CORS
app.use("*", cors());

// Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Simple in-memory KV (replace with Deno KV if needed)
const kv = new Map();

// ==============================
// Upload MRI
// ==============================
app.post("/make-server-cfefc943/upload-mri", async (c) => {
  try {
    const { fileName, base64Image } = await c.req.json();
    if (!fileName || !base64Image) {
      return c.json({ error: "Missing fileName or base64Image" }, 400);
    }

    const buffer = Uint8Array.from(
      atob(base64Image.split(",")[1]),
      (c) => c.charCodeAt(0)
    );

    const { data, error } = await supabase.storage
      .from("mri-scans")
      .upload(`scans/${Date.now()}-${fileName}`, buffer, {
        contentType: "image/png",
      });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    const { data: signedUrlData } = await supabase.storage
      .from("mri-scans")
      .createSignedUrl(data.path, 60 * 60);

    const scanId = crypto.randomUUID();

    kv.set(`mri:${scanId}`, {
      path: data.path,
      url: signedUrlData?.signedUrl,
    });

    return c.json({
      scanId,
      path: data.path,
      url: signedUrlData?.signedUrl,
      stage: 0,
    });
  } catch (error) {
    return c.json({ error: "Upload failed", details: String(error) }, 500);
  }
});

// ==============================
// Detect Tumor (REAL AI)
// ==============================
app.post("/make-server-cfefc943/detect-tumor", async (c) => {
  try {
    const { scanId } = await c.req.json();
    if (!scanId) return c.json({ error: "No scanId provided" }, 400);

    const mriData = kv.get(`mri:${scanId}`);
    if (!mriData) return c.json({ error: "MRI not found" }, 404);

    // Fetch image
    const imageResponse = await fetch(mriData.url);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Convert to base64
    const base64Image =
      "data:image/png;base64," +
      btoa(
        new Uint8Array(imageBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

    // Call Hugging Face model
    const hfResponse = await fetch(
      "https://komal890-brain-tumor-detection-api.hf.space/run/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [base64Image],
        }),
      }
    );

    const hfResult = await hfResponse.json();
    const prediction = hfResult?.data?.[0] || "Unknown";

    const result = {
      scanId,
      prediction,
      timestamp: new Date().toISOString(),
      stage: 1,
    };

    kv.set(`detection:${scanId}`, result);

    return c.json(result);
  } catch (error) {
    console.error("Detection error:", error);
    return c.json({ error: "Detection failed", details: String(error) }, 500);
  }
});

// ==============================
// Generate Grad-CAM (Placeholder)
// ==============================
app.post("/make-server-cfefc943/generate-gradcam", async (c) => {
  try {
    const { scanId } = await c.req.json();
    if (!scanId) return c.json({ error: "No scanId provided" }, 400);

    const gradcamResult = {
      scanId,
      heatmapUrl: "https://dummyimage.com/600x400/ff0000/ffffff.png&text=GradCAM",
      stage: 2,
    };

    kv.set(`gradcam:${scanId}`, gradcamResult);

    return c.json(gradcamResult);
  } catch (error) {
    return c.json({ error: "GradCAM failed" }, 500);
  }
});

// ==============================
// Generate Report
// ==============================
app.post("/make-server-cfefc943/generate-report", async (c) => {
  try {
    const { scanId } = await c.req.json();
    if (!scanId) return c.json({ error: "No scanId provided" }, 400);

    const detection = kv.get(`detection:${scanId}`);
    const gradcam = kv.get(`gradcam:${scanId}`);

    const report = {
      scanId,
      prediction: detection?.prediction || "N/A",
      heatmap: gradcam?.heatmapUrl || "N/A",
      generatedAt: new Date().toISOString(),
      stage: 3,
    };

    return c.json(report);
  } catch (error) {
    return c.json({ error: "Report generation failed" }, 500);
  }
});

// Health check
app.get("/", (c) => {
  return c.json({ status: "Brain Tumor Detection API Running 🚀" });
});

serve(app.fetch);
