import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Shield, CheckCircle2, Gift, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Stage = "initial" | "incentive" | "final" | "maxtime" | "complete";

export default function ExperimentContributionWillingness() {
  const { toast } = useToast();
  const [sessionId] = useState(crypto.randomUUID());
  const [stage, setStage] = useState<Stage>("initial");
  const [initialResponse, setInitialResponse] = useState<"yes" | "no" | null>(null);
  const [showedIncentive, setShowedIncentive] = useState(false);
  const [postIncentiveResponse, setPostIncentiveResponse] = useState<"yes" | "no" | null>(null);
  const [finalContributed, setFinalContributed] = useState(false);
  const [reviewText, setReviewText] = useState("");
  
  // Time tracking
  const [initialPromptTime] = useState<Date>(new Date());
  const [incentiveShownTime, setIncentiveShownTime] = useState<Date | null>(null);
  const [finalDecisionTime, setFinalDecisionTime] = useState<Date | null>(null);
  const [maxTimeWilling, setMaxTimeWilling] = useState<string>("");

  useEffect(() => {
    const initSession = async () => {
      const { error } = await supabase.from("experiment_sessions").insert({
        id: sessionId,
        experiment_id: "exp3_contribution",
        user_session_id: `contrib_${Date.now()}`,
        status: "started",
      });
      if (error) console.error("Failed to create exp3 session:", error);
      else console.log("Exp3 session created:", sessionId);
    };
    initSession();
  }, [sessionId]);

  const handleInitialResponse = (response: "yes" | "no") => {
    setInitialResponse(response);

    if (response === "no") {
      // User said no, show incentive
      setShowedIncentive(true);
      const incentiveTime = new Date();
      setIncentiveShownTime(incentiveTime);
      setStage("incentive");
    } else {
      // User said yes, collect review
      setFinalContributed(true);
      setStage("final");
    }
  };

  const handlePostIncentiveResponse = (response: "yes" | "no") => {
    setPostIncentiveResponse(response);
    setFinalContributed(response === "yes");
    setStage("final");
  };

  const handleReviewSubmit = () => {
    const decisionTime = new Date();
    setFinalDecisionTime(decisionTime);
    setStage("maxtime");
  };

  const handleMaxTimeSubmit = () => {
    submitData(initialResponse!, showedIncentive, postIncentiveResponse, finalContributed, finalDecisionTime || new Date());
  };

  const submitData = async (
    initial: "yes" | "no",
    incentiveShown: boolean,
    postIncentive: "yes" | "no" | null,
    contributed: boolean,
    decisionTime: Date
  ) => {
    const totalDurationSeconds = Math.floor((decisionTime.getTime() - initialPromptTime.getTime()) / 1000);
    
    const { error: sessionError } = await supabase.from("experiment_sessions").update({
      status: "completed",
      completed_at: decisionTime.toISOString(),
    }).eq("id", sessionId);
    if (sessionError) console.error("Failed to update exp3 session:", sessionError);

    const { error: contribError } = await supabase.from("exp3_contribution").insert({
      session_id: sessionId,
      initial_prompt_response: initial,
      incentive_shown: incentiveShown,
      post_incentive_response: postIncentive,
      final_contributed: contributed,
      review_text: contributed ? reviewText : null,
      initial_prompt_at: initialPromptTime.toISOString(),
      incentive_shown_at: incentiveShownTime?.toISOString(),
      final_decision_at: decisionTime.toISOString(),
      total_duration_seconds: totalDurationSeconds,
      max_time_willing_minutes: maxTimeWilling ? parseInt(maxTimeWilling) : null,
    });
    if (contribError) console.error("Failed to insert exp3 contribution:", contribError);
    else console.log("Exp3 contribution recorded successfully");

    toast({ title: "Response Recorded", description: "Thank you for participating!" });
    setStage("complete");
  };

  if (stage === "maxtime") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-center">One Last Question</h2>
          
          <div className="space-y-4">
            <label className="text-sm font-medium">What's the maximum time you'd spend on a review prompt like this before giving up?</label>
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
            <Button onClick={handleMaxTimeSubmit} className="w-full" disabled={!maxTimeWilling}>
              Complete Experiment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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

        {/* Final - Review Submission or Thank You */}
        {stage === "final" && (
          <Card className="p-12 text-center animate-in fade-in duration-500">
            {finalContributed ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-3 text-left">Share Your Experience</h2>
                <p className="text-muted-foreground mb-6 text-left">
                  Tell us about your visit with Dr. Sarah Chen.
                </p>
                
                <Textarea 
                  placeholder="Share details about your experience, wait time, staff helpfulness, or anything that would help other patients..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="min-h-[150px] mb-6"
                />
                
                {showedIncentive && (
                  <div className="bg-gradient-hero border border-border rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold">✓ Provider insights will be unlocked after submission</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleReviewSubmit} 
                  className="w-full bg-gradient-primary"
                  disabled={!reviewText.trim()}
                >
                  Submit Review
                </Button>
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
                <Button onClick={handleReviewSubmit} variant="outline">
                  Continue
                </Button>
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