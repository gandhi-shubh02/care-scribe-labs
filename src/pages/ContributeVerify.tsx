import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Upload, CheckCircle2, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3;

export default function ContributeVerify() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("provider");
  
  const [sessionId] = useState(crypto.randomUUID());
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [step1Start, setStep1Start] = useState<Date | null>(null);
  const [step1Complete, setStep1Complete] = useState<Date | null>(null);
  const [step2Start, setStep2Start] = useState<Date | null>(null);
  const [step2Complete, setStep2Complete] = useState<Date | null>(null);
  const [step3Start, setStep3Start] = useState<Date | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [uploadedIdDoc, setUploadedIdDoc] = useState(false);
  const [uploadedMedicalBill, setUploadedMedicalBill] = useState(false);
  const [uploadedSelfie, setUploadedSelfie] = useState(false);
  
  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please allow camera permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      // Use actual video dimensions, fallback to display dimensions
      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        setUploadedSelfie(true);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setUploadedSelfie(false);
    startCamera();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize session
  useEffect(() => {
    const now = new Date();
    setStartTime(now);
    setStep1Start(now);

    const initSession = async () => {
      await supabase.from("experiment_sessions").insert({
        id: sessionId,
        experiment_id: "exp2_verification",
        user_session_id: `verify_${Date.now()}`,
        status: "started",
      });
    };
    initSession();
  }, [sessionId]);

  const handleFileUpload = (step: 1 | 2 | 3, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      if (step === 1) setUploadedIdDoc(true);
      if (step === 2) setUploadedMedicalBill(true);
      if (step === 3) setUploadedSelfie(true);
    }
  };

  const handleStep1Complete = () => {
    setProcessing(true);
    setProcessingMessage("Verifying ID document...");
    setTimeout(() => {
      const now = new Date();
      setStep1Complete(now);
      setStep2Start(now);
      setCurrentStep(2);
      setProcessing(false);
      setProcessingMessage("");
    }, 7000);
  };

  const handleStep2Complete = () => {
    setProcessing(true);
    setProcessingMessage("Processing medical bill...");
    setTimeout(() => {
      const now = new Date();
      setStep2Complete(now);
      setStep3Start(now);
      setCurrentStep(3);
      setProcessing(false);
      setProcessingMessage("");
    }, 7000);
  };

  const handleStep3Complete = () => {
    setProcessing(true);
    setProcessingMessage("Verifying selfie match...");
    
    setTimeout(async () => {
      const now = new Date();
      const totalDuration = Math.floor((now.getTime() - startTime!.getTime()) / 1000);

      await supabase.from("experiment_sessions").update({
        status: "completed",
        completed_at: now.toISOString(),
      }).eq("id", sessionId);

      await supabase.from("exp2_verification_flow").insert({
        session_id: sessionId,
        step_1_start: step1Start?.toISOString(),
        step_1_complete: step1Complete?.toISOString(),
        step_2_start: step2Start?.toISOString(),
        step_2_complete: step2Complete?.toISOString(),
        step_3_start: step3Start?.toISOString(),
        step_3_complete: now.toISOString(),
        total_duration_seconds: totalDuration,
        completed_successfully: true,
        drop_off_step: null,
        uploaded_id_document: uploadedIdDoc,
        uploaded_medical_bill: uploadedMedicalBill,
        uploaded_selfie: uploadedSelfie,
      });

      setProcessing(false);
      setProcessingMessage("");
      
      toast({
        title: "Verification Complete",
        description: "You can now submit your review.",
      });

      // Navigate to review page with provider
      const reviewUrl = providerId 
        ? `/contribute/review?provider=${providerId}` 
        : "/contribute/review";
      navigate(reviewUrl);
    }, 7000);
  };

  const handleAbandon = async () => {
    const totalDuration = startTime 
      ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) 
      : 0;
    
    await supabase.from("experiment_sessions").update({
      status: "abandoned",
    }).eq("id", sessionId);

    const dropOffStep = `step_${currentStep}`;
    await supabase.from("exp2_verification_flow").insert({
      session_id: sessionId,
      step_1_start: step1Start?.toISOString(),
      step_1_complete: step1Complete?.toISOString(),
      step_2_start: step2Start?.toISOString(),
      step_2_complete: step2Complete?.toISOString(),
      step_3_start: step3Start?.toISOString(),
      step_3_complete: null,
      total_duration_seconds: totalDuration,
      completed_successfully: false,
      drop_off_step: dropOffStep,
      uploaded_id_document: uploadedIdDoc,
      uploaded_medical_bill: uploadedMedicalBill,
      uploaded_selfie: uploadedSelfie,
    });

    navigate("/contribute/verification-failed");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthReview</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleAbandon}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
        <p className="text-muted-foreground mb-8">
          Complete these steps to verify you're a real patient. Your documents are processed securely and not stored.
        </p>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step === currentStep
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "border-2 border-border"
                }`}
              >
                {step < currentStep ? "✓" : step}
              </div>
              {step < 3 && <div className="h-px w-12 bg-border"></div>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-4">Step 1: Upload Your ID</h2>
            <p className="text-muted-foreground mb-6">
              Please upload a government-issued ID (driver's license, passport, state ID)
            </p>
            <label className="border-2 border-dashed border-border rounded-lg p-12 mb-6 text-center hover:border-primary transition-colors cursor-pointer block">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(1, e)}
              />
              <Upload className={`h-12 w-12 mx-auto mb-3 ${uploadedIdDoc ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm text-muted-foreground">
                {uploadedIdDoc ? "✓ File selected" : "Click or drag file to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, PDF (max 5MB)</p>
            </label>
            <Button onClick={handleStep1Complete} className="w-full" disabled={processing}>
              {processing ? processingMessage : "Continue to Next Step"}
            </Button>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-4">Step 2: Upload Medical Bill</h2>
            <p className="text-muted-foreground mb-6">
              Upload your insurance EOB or medical bill. You can redact personal information.
            </p>
            <label className="border-2 border-dashed border-border rounded-lg p-12 mb-6 text-center hover:border-primary transition-colors cursor-pointer block">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(2, e)}
              />
              <Upload className={`h-12 w-12 mx-auto mb-3 ${uploadedMedicalBill ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm text-muted-foreground">
                {uploadedMedicalBill ? "✓ File selected" : "Click or drag file to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Accepted: JPG, PNG, PDF (max 10MB)</p>
            </label>
            <Button onClick={handleStep2Complete} className="w-full" disabled={processing}>
              {processing ? processingMessage : "Continue to Next Step"}
            </Button>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-4">Step 3: Take a Quick Photo</h2>
            <p className="text-muted-foreground mb-6">
              Take a selfie holding your ID next to your face for verification.
            </p>
            <div className="border-2 border-border rounded-lg p-4 mb-6 bg-muted/30">
              {/* Camera preview or captured image */}
              <div className="relative aspect-video max-w-md mx-auto bg-background rounded-lg overflow-hidden mb-4">
                {cameraActive && !capturedImage && (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                {capturedImage && (
                  <img src={capturedImage} alt="Captured selfie" className="w-full h-full object-cover" />
                )}
                {!cameraActive && !capturedImage && (
                  <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border">
                    <Camera className="h-12 w-12 mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera preview</p>
                  </div>
                )}
              </div>
              
              {/* Camera controls */}
              <div className="flex gap-3 justify-center">
                {!cameraActive && !capturedImage && (
                  <Button type="button" onClick={startCamera} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                )}
                {cameraActive && !capturedImage && (
                  <>
                    <Button type="button" onClick={capturePhoto} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button type="button" variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </>
                )}
                {capturedImage && (
                  <Button type="button" variant="outline" onClick={retakePhoto} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Retake Photo
                  </Button>
                )}
              </div>
            </div>
            <Button onClick={handleStep3Complete} className="w-full bg-gradient-primary" disabled={processing || !uploadedSelfie}>
              {processing ? processingMessage : "Complete Verification"}
            </Button>
          </Card>
        )}

        {/* Privacy Note */}
        <Card className="mt-6 p-4 bg-gradient-hero border-border">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Your privacy is protected.</strong> Documents are processed securely and not stored. 
              We only verify that you had a real interaction with a healthcare provider.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}