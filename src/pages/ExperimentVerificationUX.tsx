import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Upload, CheckCircle2, Clock, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Step = 1 | 2 | 3;

export default function ExperimentVerificationUX() {
  const { toast } = useToast();
  const [sessionId] = useState(crypto.randomUUID());
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [step1Start, setStep1Start] = useState<Date | null>(null);
  const [step1Complete, setStep1Complete] = useState<Date | null>(null);
  const [step2Start, setStep2Start] = useState<Date | null>(null);
  const [step2Complete, setStep2Complete] = useState<Date | null>(null);
  const [step3Start, setStep3Start] = useState<Date | null>(null);
  const [step3Complete, setStep3Complete] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showMaxTimeQuestion, setShowMaxTimeQuestion] = useState(false);
  const [maxTimeWilling, setMaxTimeWilling] = useState<string>("");
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
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      setUploadedSelfie(true);
      stopCamera();
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

  // Initialize experiment session
  useEffect(() => {
    const now = new Date();
    setStartTime(now);
    setStep1Start(now);

    const initSession = async () => {
      const { error } = await supabase.from("experiment_sessions").insert({
        id: sessionId,
        experiment_id: "exp2_verification",
        user_session_id: `ux_${Date.now()}`,
        status: "started",
      });
      if (error) console.error("Failed to create exp2 session:", error);
      else console.log("Exp2 session created:", sessionId);
    };
    initSession();
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!startTime || submitted) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, submitted]);

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
    }, 2000);
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
    }, 2500);
  };

  const handleStep3Complete = () => {
    setProcessing(true);
    setProcessingMessage("Verifying selfie match...");
    
    setTimeout(async () => {
      const now = new Date();
      setStep3Complete(now);
      setProcessing(false);
      setProcessingMessage("");
      setShowMaxTimeQuestion(true);
    }, 1800);
  };

  const handleFinalSubmit = async () => {
    const now = new Date();
    const totalDuration = Math.floor((now.getTime() - startTime!.getTime()) / 1000);

    const { error: sessionError } = await supabase.from("experiment_sessions").update({
      status: "completed",
      completed_at: now.toISOString(),
    }).eq("id", sessionId);
    if (sessionError) console.error("Failed to update exp2 session:", sessionError);

    const { error: flowError } = await supabase.from("exp2_verification_flow").insert({
      session_id: sessionId,
      step_1_start: step1Start?.toISOString(),
      step_1_complete: step1Complete?.toISOString(),
      step_2_start: step2Start?.toISOString(),
      step_2_complete: step2Complete?.toISOString(),
      step_3_start: step3Start?.toISOString(),
      step_3_complete: step3Complete?.toISOString(),
      total_duration_seconds: totalDuration,
      completed_successfully: true,
      drop_off_step: null,
      uploaded_id_document: uploadedIdDoc,
      uploaded_medical_bill: uploadedMedicalBill,
      uploaded_selfie: uploadedSelfie,
      max_time_willing_minutes: maxTimeWilling ? parseInt(maxTimeWilling) : null,
    });
    if (flowError) console.error("Failed to insert exp2 flow:", flowError);
    else console.log("Exp2 flow recorded successfully");

    setSubmitted(true);
    toast({
      title: "Experiment Complete!",
      description: `Completed in ${totalDuration} seconds`,
    });
  };

  const handleAbandon = async () => {
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
      total_duration_seconds: elapsedSeconds,
      completed_successfully: false,
      drop_off_step: dropOffStep,
    });

    toast({ title: "Session Abandoned", description: "Your data has been recorded." });
    setSubmitted(true);
  };

  if (showMaxTimeQuestion && !submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-center">Almost Done!</h2>
          <p className="text-muted-foreground mb-2 text-center">Time: {elapsedSeconds} seconds</p>
          <p className="text-sm text-muted-foreground mb-6 text-center">One quick question before we finish:</p>
          
          <div className="space-y-4">
            <label className="text-sm font-medium">What's the maximum time you'd spend on a verification flow like this before giving up?</label>
            <Select value={maxTimeWilling} onValueChange={setMaxTimeWilling}>
              <SelectTrigger>
                <SelectValue placeholder="Select time..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Less than 1 minute</SelectItem>
                <SelectItem value="2">1-2 minutes</SelectItem>
                <SelectItem value="5">3-5 minutes</SelectItem>
                <SelectItem value="10">5-10 minutes</SelectItem>
                <SelectItem value="15">10-15 minutes</SelectItem>
                <SelectItem value="0">I would give up immediately</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleFinalSubmit} className="w-full" disabled={!maxTimeWilling}>
              Complete Experiment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-2">Time: {elapsedSeconds} seconds</p>
          <p className="text-sm text-muted-foreground mb-6">Your interaction data has been recorded.</p>
          <Link to="/experiments">
            <Button>Back to Experiments</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
            Exit Experiment
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Timer */}
        <Card className="p-4 mb-6 bg-gradient-hero border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold">Time Elapsed</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </Card>

        <h1 className="text-3xl font-bold mb-2">Experiment 2: Verification UX</h1>
        <p className="text-muted-foreground mb-6">Complete the verification flow as quickly as you can.</p>

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

        {/* Instructions */}
        <Card className="mt-6 p-4 bg-gradient-hero border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a simulated flow. No files are actually uploaded. We're measuring how
            long it takes to complete the process.
          </p>
        </Card>
      </div>
    </div>
  );
}