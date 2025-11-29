import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Provider {
  id: string;
  name: string;
  specialty: string;
}

export default function ContributeReview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("provider");

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>(providerId || "");
  const [billingClarity, setBillingClarity] = useState(0);
  const [responsiveness, setResponsiveness] = useState(0);
  const [claimProcess, setClaimProcess] = useState(0);
  const [priorAuth, setPriorAuth] = useState(0);
  const [experience, setExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const { data } = await supabase.from("providers").select("id, name, specialty").order("name");
    if (data) setProviders(data);
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !billingClarity || !responsiveness || !claimProcess || !priorAuth) {
      toast({
        title: "Missing Information",
        description: "Please rate all categories before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      provider_id: selectedProvider,
      verification_method: "zkp_insurer",
      verification_hash: `zkp_${Date.now()}_${Math.random().toString(36)}`,
      billing_clarity: billingClarity,
      responsiveness: responsiveness,
      claim_process: claimProcess,
      prior_auth_rating: priorAuth,
      experience_text: experience,
      is_verified: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    } else {
      navigate("/contribute/success");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthReview</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/providers">
              <Button variant="ghost">Browse Providers</Button>
            </Link>
            <Link to="/experiments">
              <Button variant="ghost">Experiments</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8 border-b border-border">
        <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 opacity-40">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <span>Verify</span>
          </div>
          <div className="h-px w-12 bg-primary"></div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <span className="font-semibold">Review</span>
          </div>
          <div className="h-px w-12 bg-border"></div>
          <div className="flex items-center gap-2 opacity-40">
            <div className="h-10 w-10 border-2 border-border rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <span>Success</span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Share Your Experience</h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Your anonymous, verified review helps others make better healthcare decisions.
          </p>

          <Card className="p-8 border-border mb-8">
            {/* Provider Selection */}
            <div className="mb-8">
              <Label className="text-lg mb-3 block">Select Provider</Label>
              <select
                className="w-full p-3 border border-border rounded-lg bg-background"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="">-- Choose a provider --</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Categories */}
            <div className="space-y-8 mb-8">
              <RatingInput
                label="Billing Clarity"
                description="Were costs explained upfront? Any surprise bills?"
                value={billingClarity}
                onChange={setBillingClarity}
              />
              <RatingInput
                label="Responsiveness"
                description="How quickly did they respond to calls and messages?"
                value={responsiveness}
                onChange={setResponsiveness}
              />
              <RatingInput
                label="Claim Process"
                description="How smooth was the insurance claim handling?"
                value={claimProcess}
                onChange={setClaimProcess}
              />
              <RatingInput
                label="Prior Authorization"
                description="How fast were prior authorizations processed?"
                value={priorAuth}
                onChange={setPriorAuth}
              />
            </div>

            {/* Experience Text */}
            <div>
              <Label className="text-lg mb-3 block">Tell Us What Happened (Optional)</Label>
              <Textarea
                placeholder="Share your experience anonymously. This helps others understand what to expect."
                className="min-h-[150px] resize-none"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Anonymous Review"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function RatingInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <Label className="text-lg mb-2 block">{label}</Label>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-10 w-10 ${
                star <= value ? "text-primary fill-primary" : "text-muted"
              }`}
            />
          </button>
        ))}
        {value > 0 && <span className="ml-2 text-lg font-semibold self-center">{value}/5</span>}
      </div>
    </div>
  );
}