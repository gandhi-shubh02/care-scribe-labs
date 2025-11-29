import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FlaskConical, Target, Clock, Users } from "lucide-react";

export default function Experiments() {
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
            <Link to="/admin">
              <Button variant="outline">Analytics</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border bg-gradient-subtle">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Research Experiments</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Help us understand user behavior and improve the platform by participating in our experiments.
            Your participation is anonymous and helps validate core product hypotheses.
          </p>
        </div>
      </section>

      {/* Experiments Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Experiment 1 */}
          <Card className="p-6 border-border hover:shadow-medium transition-all duration-300 flex flex-col">
            <Badge variant="secondary" className="mb-4 w-fit">
              Experiment 1
            </Badge>
            <h3 className="text-2xl font-bold mb-3">Anonymous Unverified Form</h3>
            <p className="text-muted-foreground mb-4 flex-1">
              Test willingness to share relevant information (cost, condition, wait time) without verification.
            </p>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-semibold">Hypothesis:</span>
              </div>
              <p className="text-muted-foreground pl-6">
                ≥20% will share at least one relevant piece of information
              </p>
            </div>

            <Link to="/experiments/anonymous-form">
              <Button className="w-full bg-gradient-primary hover:opacity-90">
                Participate
              </Button>
            </Link>
          </Card>

          {/* Experiment 2 */}
          <Card className="p-6 border-border hover:shadow-medium transition-all duration-300 flex flex-col">
            <Badge variant="secondary" className="mb-4 w-fit">
              Experiment 2
            </Badge>
            <h3 className="text-2xl font-bold mb-3">Verification UX Test</h3>
            <p className="text-muted-foreground mb-4 flex-1">
              Validate if users can complete the verification flow without frustration within 2 minutes.
            </p>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold">Hypothesis:</span>
              </div>
              <p className="text-muted-foreground pl-6">
                70% complete verification within 2 minutes
              </p>
            </div>

            <Link to="/experiments/verification-ux">
              <Button className="w-full bg-gradient-primary hover:opacity-90">
                Participate
              </Button>
            </Link>
          </Card>

          {/* Experiment 3 */}
          <Card className="p-6 border-border hover:shadow-medium transition-all duration-300 flex flex-col">
            <Badge variant="secondary" className="mb-4 w-fit">
              Experiment 3
            </Badge>
            <h3 className="text-2xl font-bold mb-3">Contribution Willingness</h3>
            <p className="text-muted-foreground mb-4 flex-1">
              Understand motivation to leave reviews after receiving service and impact of incentives.
            </p>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-semibold">Hypothesis:</span>
              </div>
              <p className="text-muted-foreground pl-6">
                Meaningful % will contribute, especially with incentive
              </p>
            </div>

            <Link to="/experiments/contribution-willingness">
              <Button className="w-full bg-gradient-primary hover:opacity-90">
                Participate
              </Button>
            </Link>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-12 p-8 bg-gradient-hero border-border max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-3">Why Participate?</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              • <span className="font-semibold text-foreground">Anonymous:</span> No personal data is collected
            </p>
            <p>
              • <span className="font-semibold text-foreground">Quick:</span> Each experiment takes 2-3 minutes
            </p>
            <p>
              • <span className="font-semibold text-foreground">Impactful:</span> Your feedback shapes product features
            </p>
            <p>
              • <span className="font-semibold text-foreground">Transparent:</span> View live analytics in the admin dashboard
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}