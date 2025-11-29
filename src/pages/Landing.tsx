import { Button } from "@/components/ui/button";
import { Shield, Lock, Users, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthReview</span>
          </div>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-hero px-4 py-2 rounded-full mb-6 animate-in fade-in duration-500">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Anonymous • Verified • Private</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-700">
            Trusted Healthcare Reviews,
            <br />
            Zero Identity Leakage
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom-5 duration-700 delay-150">
            Share honest experiences anonymously. Every review is cryptographically verified without revealing personal health data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link to="/providers">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                Browse Providers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contribute/verify">
              <Button size="lg" variant="outline">
                Leave a Review
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-12 w-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Zero-Knowledge Verification</h3>
            <p className="text-muted-foreground">
              Prove you're a real patient without revealing identity or health data through cryptographic verification.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-12 w-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy-First Design</h3>
            <p className="text-muted-foreground">
              Share sensitive experiences about mental health, chronic illness, or treatment without fear of identification.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="h-12 w-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Contribution-Based Access</h3>
            <p className="text-muted-foreground">
              Like Glassdoor: the more you contribute honest reviews, the more trusted data you unlock.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 border-t border-border bg-gradient-subtle">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Choose Verification Method</h3>
                <p className="text-muted-foreground">
                  Upload a redacted document (insurance EOB, appointment receipt) or verify through your insurer using zero-knowledge proof.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share Your Experience</h3>
                <p className="text-muted-foreground">
                  Rate billing transparency, responsiveness, claim process, and prior authorization speed. Add details anonymously.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Review Goes Live</h3>
                <p className="text-muted-foreground">
                  Your verified review is published anonymously. See aggregated insights from others who had similar experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Why This Platform is Different</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left mt-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">No Fake Reviews:</span> Every review is cryptographically verified against real patient-provider interactions.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Zero Data Leakage:</span> We never see your name, diagnosis, or health records. Only proof that you were a patient.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Tamper-Proof:</span> Reviews cannot be altered or deleted once verified and published to the blockchain.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Community-Powered:</span> More contributions unlock richer insights for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center bg-gradient-hero border border-border rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Better Healthcare Decisions?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join a community of patients sharing honest, verified feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/providers">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                Find a Provider
              </Button>
            </Link>
            <Link to="/contribute/verify">
              <Button size="lg" variant="outline">
                Share Your Experience
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 HealthReview. Privacy-first healthcare reviews.</p>
        </div>
      </footer>
    </div>
  );
}