import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, CheckCircle2, Users, TrendingUp } from "lucide-react";

export default function ContributeSuccess() {
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
          <div className="flex items-center gap-2 opacity-40">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <span>Review</span>
          </div>
          <div className="h-px w-12 bg-primary"></div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <span className="font-semibold">Success</span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex h-24 w-24 bg-gradient-primary rounded-full items-center justify-center mb-6 shadow-glow animate-in zoom-in duration-500">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4 animate-in slide-in-from-bottom-4 duration-700">
            Your Review is Live!
          </h1>
          <p className="text-lg text-muted-foreground mb-8 animate-in slide-in-from-bottom-5 duration-700 delay-150">
            Posted anonymously & cryptographically verified.
          </p>

          {/* Stats Card */}
          <Card className="p-8 bg-gradient-hero border-border mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">124 others</span>
            </div>
            <p className="text-muted-foreground">
              reported similar experiences with billing transparency at this provider
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-7 duration-700 delay-500">
            <Link to="/providers">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Other Reviews
              </Button>
            </Link>
            <Link to="/providers">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
                Find Highly Rated Providers
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <Card className="mt-12 p-6 bg-card border-border text-left">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Your review is now visible to all users browsing this provider</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Provider ratings are automatically updated with your feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Your identity remains completely anonymous and protected</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}