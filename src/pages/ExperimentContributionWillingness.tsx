import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, CheckCircle2, Gift, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Stage = "initial" | "incentive" | "final" | "complete";

export default function ExperimentContributionWillingness() {
  const { toast } = useToast();
  const [sessionId] = useState(crypto.randomUUID());
  const [stage, setStage] = useState<Stage>("initial");
  const [initialResponse, setInitialResponse] = useState<"yes" | "no" | null>(null);
  const [showedIncentive, setShowedIncentive] = useState(false);
  const [postIncentiveResponse, setPostIncentiveResponse] = useState<"yes" | "no" | null>(null);
  const [finalContributed, setFinalContributed] = useState(false);
  
  // Time tracking
  const [initialPromptTime] = useState<Date>(new Date());
  const [incentiveShownTime, setIncentiveShownTime] = useState<Date | null>(null);
  const [finalDecisionTime, setFinalDecisionTime] = useState<Date | null>(null);

  useEffect(() => {
    supabase.from("experiment_sessions").insert({
      id: sessionId,
      experiment_id: "exp3_contribution",
      user_session_id: `contrib_${Date.now()}`,
      status: "started",
    });
    console.log("Experiment 3 started at:", initialPromptTime.toISOString());
  }, [sessionId, initialPromptTime]);

  const handleInitialResponse = (response: "yes" | "no") => {
    setInitialResponse(response);
    const decisionTime = new Date();
    setFinalDecisionTime(decisionTime);

    if (response === "yes") {
      // User said yes immediately
      setFinalContributed(true);
      setStage("final");
      submitData(response, false, null, true, decisionTime);
    } else {
      // User said no, show incentive
      setShowedIncentive(true);
      const incentiveTime = new Date();
      setIncentiveShownTime(incentiveTime);
      setStage("incentive");
    }
  };

  const handlePostIncentiveResponse = (response: "yes" | "no") => {
    setPostIncentiveResponse(response);
    setFinalContributed(response === "yes");
    const decisionTime = new Date();
    setFinalDecisionTime(decisionTime);
    setStage("final");
    submitData(initialResponse!, true, response, response === "yes", decisionTime);
  };

  const submitData = async (
    initial: "yes" | "no",
    incentiveShown: boolean,
    postIncentive: "yes" | "no" | null,
    contributed: boolean,
    decisionTime: Date
  ) => {
    const totalDurationSeconds = Math.floor((decisionTime.getTime() - initialPromptTime.getTime()) / 1000);
    
    await supabase.from("experiment_sessions").update({
      status: "completed",
      completed_at: decisionTime.toISOString(),
    }).eq("id", sessionId);

    await supabase.from("exp3_contribution").insert({
      session_id: sessionId,
      initial_prompt_response: initial,
      incentive_shown: incentiveShown,
      post_incentive_response: postIncentive,
      final_contributed: contributed,
      initial_prompt_at: initialPromptTime.toISOString(),
      incentive_shown_at: incentiveShownTime?.toISOString(),
      final_decision_at: decisionTime.toISOString(),
      total_duration_seconds: totalDurationSeconds,
    });

    console.log("Experiment 3 completed in", totalDurationSeconds, "seconds");
    toast({ title: "Response Recorded", description: "Thank you for participating!" });
    setTimeout(() => setStage("complete"), 2000);
  };

  if (stage === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Experiment Complete!</h2>
          <p className="text-muted-foreground mb-6">Your contribution preferences have been recorded.</p>
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
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthReview</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Experiment 3: Contribution Willingness</h1>
        <p className="text-muted-foreground mb-8">
          Help us understand what motivates people to leave reviews.
        </p>

        {/* Initial Prompt */}
        {stage === "initial" && (
          <Card className="p-12 text-center animate-in fade-in duration-500">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Service Completed Successfully</h2>
            <p className="text-lg text-muted-foreground mb-8">
              You just had an appointment with Dr. Sarah Chen (Dermatology).
            </p>
            
            <div className="bg-gradient-hero border border-border rounded-lg p-6 mb-8">
              <p className="font-semibold mb-4">Would you like to leave an anonymous review?</p>
              <p className="text-sm text-muted-foreground">
                Your feedback helps other patients make better healthcare decisions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => handleInitialResponse("yes")}
              >
                Yes, I'll Leave a Review
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleInitialResponse("no")}
              >
                No Thanks
              </Button>
            </div>
          </Card>
        )}

        {/* Incentive Screen */}
        {stage === "incentive" && (
          <Card className="p-12 text-center animate-in fade-in duration-500">
            <Gift className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Unlock Provider Insights</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Leave a review to unlock detailed data about this provider:
            </p>

            <div className="bg-gradient-hero border border-border rounded-lg p-6 mb-8 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Average billing transparency from 127 verified patients</p>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Prior authorization success rate and average wait times</p>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Common patient experiences and detailed review breakdowns</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Your review remains completely anonymous and helps the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => handlePostIncentiveResponse("yes")}
              >
                Leave Review & Unlock
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handlePostIncentiveResponse("no")}
              >
                Skip for Now
              </Button>
            </div>
          </Card>
        )}

        {/* Final Thank You */}
        {stage === "final" && (
          <Card className="p-12 text-center animate-in fade-in duration-500">
            {finalContributed ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-3">Thank You for Contributing!</h2>
                <p className="text-muted-foreground mb-6">
                  Your review helps build a more transparent healthcare system.
                </p>
                {showedIncentive && (
                  <div className="bg-gradient-hero border border-border rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold">✓ Provider insights unlocked</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">👋</span>
                </div>
                <h2 className="text-2xl font-bold mb-3">No Problem!</h2>
                <p className="text-muted-foreground mb-6">
                  Thanks for your time. You can always leave a review later.
                </p>
              </>
            )}
          </Card>
        )}

        {/* Experiment Info */}
        <Card className="mt-8 p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Experiment Details:</strong> This simulates a post-service review prompt. We're measuring
            willingness to contribute with and without incentives.
          </p>
        </Card>
      </div>
    </div>
  );
}