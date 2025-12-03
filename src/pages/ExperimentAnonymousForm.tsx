import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExperimentAnonymousForm() {
  const { toast } = useToast();
  const [shareCost, setShareCost] = useState(false);
  const [shareCondition, setShareCondition] = useState(false);
  const [shareWaitTime, setShareWaitTime] = useState(false);
  const [costValue, setCostValue] = useState("");
  const [conditionValue, setConditionValue] = useState("");
  const [waitTimeValue, setWaitTimeValue] = useState("");
  const [shareAppointmentType, setShareAppointmentType] = useState(false);
  const [appointmentTypeValue, setAppointmentTypeValue] = useState("");
  const [shareInsuranceAccepted, setShareInsuranceAccepted] = useState(false);
  const [insuranceAcceptedValue, setInsuranceAcceptedValue] = useState("");
  const [shareOfficeAccessibility, setShareOfficeAccessibility] = useState(false);
  const [officeAccessibilityValue, setOfficeAccessibilityValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showMaxTimeQuestion, setShowMaxTimeQuestion] = useState(false);
  const [maxTimeWilling, setMaxTimeWilling] = useState<string>("");
  const [startTime] = useState<Date>(new Date());

  useEffect(() => {
    // Track session start time in component mount
    console.log("Experiment 1 started at:", startTime.toISOString());
  }, [startTime]);

  const handleContinueToMaxTime = () => {
    setShowMaxTimeQuestion(true);
  };

  const handleSubmit = async () => {
    const sessionId = crypto.randomUUID();
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const rpiCount = (shareCost ? 1 : 0) + (shareCondition ? 1 : 0) + (shareWaitTime ? 1 : 0) + 
                     (shareAppointmentType ? 1 : 0) + (shareInsuranceAccepted ? 1 : 0) + (shareOfficeAccessibility ? 1 : 0);

    await supabase.from("experiment_sessions").insert({
      id: sessionId,
      experiment_id: "exp1_anonymous",
      user_session_id: `anon_${Date.now()}`,
      status: "completed",
      completed_at: endTime.toISOString(),
    });

    await supabase.from("exp1_responses").insert({
      session_id: sessionId,
      shared_cost: shareCost,
      shared_condition: shareCondition,
      shared_wait_time: shareWaitTime,
      cost_value: shareCost ? costValue : null,
      condition_value: shareCondition ? conditionValue : null,
      wait_time_value: shareWaitTime ? waitTimeValue : null,
      share_appointment_type: shareAppointmentType,
      appointment_type_value: shareAppointmentType ? appointmentTypeValue : null,
      share_insurance_accepted: shareInsuranceAccepted,
      insurance_accepted_value: shareInsuranceAccepted ? insuranceAcceptedValue : null,
      share_office_accessibility: shareOfficeAccessibility,
      office_accessibility_value: shareOfficeAccessibility ? officeAccessibilityValue : null,
      rpi_count: rpiCount,
      session_start_at: startTime.toISOString(),
      session_duration_seconds: durationSeconds,
      max_time_willing_minutes: maxTimeWilling ? parseInt(maxTimeWilling) : null,
    });

    console.log("Experiment 1 completed in", durationSeconds, "seconds");
    setSubmitted(true);
    toast({ title: "Response Submitted", description: "Thank you for participating!" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-6">Your response has been recorded.</p>
          <Link to="/experiments"><Button>Back to Experiments</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthReview</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Experiment 1: Anonymous Form</h1>
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={shareCost} onChange={(e) => setShareCost(e.target.checked)} />
                <Label>I'm willing to share cost information</Label>
              </div>
              {shareCost && <Input placeholder="e.g., $150" value={costValue} onChange={(e) => setCostValue(e.target.value)} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={shareCondition} onChange={(e) => setShareCondition(e.target.checked)} />
                <Label>I'm willing to share my condition</Label>
              </div>
              {shareCondition && <Input placeholder="e.g., Annual checkup" value={conditionValue} onChange={(e) => setConditionValue(e.target.value)} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={shareWaitTime} onChange={(e) => setShareWaitTime(e.target.checked)} />
                <Label>I'm willing to share wait time</Label>
              </div>
              {shareWaitTime && <Input placeholder="e.g., 20 minutes" value={waitTimeValue} onChange={(e) => setWaitTimeValue(e.target.value)} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={shareAppointmentType} onChange={(e) => setShareAppointmentType(e.target.checked)} />
                <Label>I'm willing to share appointment type</Label>
              </div>
              {shareAppointmentType && <Input placeholder="e.g., Initial consultation" value={appointmentTypeValue} onChange={(e) => setAppointmentTypeValue(e.target.value)} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={shareInsuranceAccepted} onChange={(e) => setShareInsuranceAccepted(e.target.checked)} />
                <Label>I'm willing to share if my insurance was accepted</Label>
              </div>
              {shareInsuranceAccepted && <Input placeholder="e.g., Blue Cross accepted" value={insuranceAcceptedValue} onChange={(e) => setInsuranceAcceptedValue(e.target.value)} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={shareOfficeAccessibility} onChange={(e) => setShareOfficeAccessibility(e.target.checked)} />
                <Label>I'm willing to share office accessibility info</Label>
              </div>
              {shareOfficeAccessibility && <Input placeholder="e.g., Wheelchair accessible, elevator available" value={officeAccessibilityValue} onChange={(e) => setOfficeAccessibilityValue(e.target.value)} />}
            </div>

            {!showMaxTimeQuestion ? (
              <Button onClick={handleContinueToMaxTime} className="w-full">Continue</Button>
            ) : (
              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-base font-semibold">What's the maximum time you'd spend on a form like this before giving up?</Label>
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
                <Button onClick={handleSubmit} className="w-full" disabled={!maxTimeWilling}>Submit Response</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}