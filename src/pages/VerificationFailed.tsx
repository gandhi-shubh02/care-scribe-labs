import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, XCircle, ArrowLeft } from "lucide-react";

export default function VerificationFailed() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthReview</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Verification Incomplete</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't complete your identity verification. This may happen if:
          </p>
          <ul className="text-left text-sm text-muted-foreground mb-8 space-y-2">
            <li>• The verification process was cancelled</li>
            <li>• Documents couldn't be verified</li>
            <li>• There was a technical issue</li>
          </ul>
          <p className="text-sm text-muted-foreground mb-6">
            You can try again anytime by selecting a provider and clicking "Add My Review".
          </p>
          <Link to="/providers">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Providers
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}