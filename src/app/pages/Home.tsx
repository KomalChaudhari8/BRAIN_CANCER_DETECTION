import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Brain, Upload, Activity, FileText, Hospital, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function Home() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an MRI scan file');
      return;
    }

    if (!patientName || !patientAge || !patientGender) {
      toast.error('Please fill in all patient information');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', `patient-${Date.now()}`);

      const response = await fetch(
        `https://tbxyjwpcrzbdtuuraowe.supabase.co/functions/v1/server/make-server-cfefc943/upload-mri`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Upload failed:', data);
        toast.error(data.error || 'Failed to upload MRI scan');
        return;
      }

      toast.success('MRI scan uploaded successfully!');
      
      // Navigate to analysis page with patient info
      navigate(`/analysis/${data.scanId}?name=${encodeURIComponent(patientName)}&age=${patientAge}&gender=${patientGender}`);
    } catch (error) {
      console.error('Error uploading MRI scan:', error);
      toast.error('Failed to upload MRI scan');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NeuroScan AI</h1>
              <p className="text-sm text-gray-600">Advanced Brain Tumor Detection System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Brain Tumor Analysis
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an MRI scan for comprehensive tumor detection, classification, and explainable AI insights
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Stage 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Tumor Detection</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Stage 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Tumor Classification</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">GradCAM</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Visual Explainability</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                <Hospital className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Nearby Treatment Centers</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form */}
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Upload MRI Scan</CardTitle>
            <CardDescription>
              Please provide patient information and upload the brain MRI scan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Information */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="45"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="mri-file">MRI Scan File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  id="mri-file"
                  type="file"
                  accept="image/*,.dcm,.nii"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="mri-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : 'Click to upload MRI scan'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Supported formats: JPEG, PNG, DICOM, NIfTI
                  </span>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="max-w-2xl mx-auto mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a prototype system for demonstration purposes. 
            Always consult with qualified medical professionals for diagnosis and treatment decisions.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2026 NeuroScan AI - Advanced Medical Imaging Analysis</p>
        </div>
      </footer>
    </div>
  );
}
