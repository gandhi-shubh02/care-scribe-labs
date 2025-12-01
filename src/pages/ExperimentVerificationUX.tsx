import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Upload, CheckCircle2, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [uploading, setUploading] = useState(false);
  const [uploadedIdDoc, setUploadedIdDoc] = useState(false);
  const [uploadedMedicalBill, setUploadedMedicalBill] = useState(false);
  const [uploadedSelfie, setUploadedSelfie] = useState(false);

  // Initialize experiment session
  useEffect(() => {
    const now = new Date();
    setStartTime(now);
    setStep1Start(now);

    supabase.from("experiment_sessions").insert({
      id: sessionId,
      experiment_id: "exp2_verification",
      user_session_id: `ux_${Date.now()}`,
      status: "started",
    });
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
    const now = new Date();
    setStep1Complete(now);
    setStep2Start(now);
    setCurrentStep(2);
  };

  const handleStep2Complete = () => {
    setUploading(true);
    setTimeout(() => {
      const now = new Date();
      setStep2Complete(now);
      setStep3Start(now);
      setCurrentStep(3);
      setUploading(false);
    }, 1500);
  };

  const handleStep3Complete = async () => {
    const now = new Date();
    setStep3Complete(now);

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
            <Button onClick={handleStep1Complete} className="w-full">
              Continue to Next Step
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
            <Button onClick={handleStep2Complete} className="w-full" disabled={uploading}>
              {uploading ? "Uploading..." : "Continue to Next Step"}
            </Button>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-4">Step 3: Take a Quick Photo</h2>
            <p className="text-muted-foreground mb-6">
              Take a selfie holding your ID next to your face for verification.
            </p>
            <label className="border-2 border-border rounded-lg p-12 mb-6 bg-muted/30 text-center block cursor-pointer hover:border-primary transition-colors">
              <input 
                type="file" 
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => handleFileUpload(3, e)}
              />
              <div className={`h-48 w-48 mx-auto bg-background rounded-lg flex items-center justify-center border-2 border-dashed ${uploadedSelfie ? 'border-primary' : 'border-border'}`}>
                <p className="text-sm text-muted-foreground">
                  {uploadedSelfie ? "✓ Photo taken" : "Tap to take photo"}
                </p>
              </div>
            </label>
            <Button onClick={handleStep3Complete} className="w-full bg-gradient-primary">
              Complete Verification
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