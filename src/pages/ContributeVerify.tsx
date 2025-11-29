import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Upload, Lock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContributeVerify() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDocumentUpload = () => {
    setUploading(true);
    // Simulate document upload
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "Document Verified",
        description: "Your redacted document has been verified successfully.",
      });
      navigate("/contribute/review");
    }, 1500);
  };

  const handleZKPVerify = () => {
    setUploading(true);
    // Simulate ZKP verification
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "Verification Complete",
        description: "Zero-knowledge proof verification successful.",
      });
      navigate("/contribute/review");
    }, 2000);
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
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <span className="font-semibold">Verify</span>
          </div>
          <div className="h-px w-12 bg-border"></div>
          <div className="flex items-center gap-2 opacity-40">
            <div className="h-10 w-10 border-2 border-border rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <span>Review</span>
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

      {/* Verification Methods */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Choose Verification Method</h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            We need to verify you're a real patient without revealing your identity.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Document Upload */}
            <Card
              className={`p-8 cursor-pointer transition-all duration-300 border-2 ${
                selectedMethod === "document"
                  ? "border-primary bg-gradient-hero shadow-glow"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedMethod("document")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Redacted Document</h3>
                <p className="text-muted-foreground mb-4">
                  Upload an insurance EOB, appointment receipt, or bill with personal info redacted.
                </p>
                {selectedMethod === "document" && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </div>
            </Card>

            {/* ZKP Verification */}
            <Card
              className={`p-8 cursor-pointer transition-all duration-300 border-2 ${
                selectedMethod === "zkp"
                  ? "border-primary bg-gradient-hero shadow-glow"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedMethod("zkp")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verify Through Insurer</h3>
                <p className="text-muted-foreground mb-4">
                  Zero-knowledge proof verification without sharing any personal data.
                </p>
                {selectedMethod === "zkp" && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </div>
            </Card>
          </div>

          {/* Disabled Staff Option */}
          <Card className="p-6 border-dashed border-border opacity-50 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">I'm a staff member</h3>
                <p className="text-sm text-muted-foreground">
                  Staff verification coming soon
                </p>
              </div>
              <Button disabled variant="outline">
                Coming Soon
              </Button>
            </div>
          </Card>

          {/* Action Button */}
          <div className="flex justify-center">
            {selectedMethod === "document" && (
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90"
                onClick={handleDocumentUpload}
                disabled={uploading}
              >
                {uploading ? "Verifying..." : "Upload Document"}
              </Button>
            )}
            {selectedMethod === "zkp" && (
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90"
                onClick={handleZKPVerify}
                disabled={uploading}
              >
                {uploading ? "Verifying..." : "Verify with Insurer"}
              </Button>
            )}
            {!selectedMethod && (
              <Button size="lg" disabled>
                Select a Verification Method
              </Button>
            )}
          </div>

          {/* Privacy Note */}
          <Card className="mt-12 p-6 bg-gradient-hero border-border">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Your Privacy is Protected</h4>
                <p className="text-sm text-muted-foreground">
                  We never see your name, diagnosis, or health records. We only verify that you had a real
                  interaction with a healthcare provider. All reviews are anonymous and cryptographically secured.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}