import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Phone, Mail, Star, CheckCircle2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Provider {
  id: string;
  name: string;
  specialty: string;
  location: string;
  phone: string | null;
  email: string | null;
  avg_billing_clarity: number;
  avg_responsiveness: number;
  avg_claim_process: number;
  avg_prior_auth: number;
  total_reviews: number;
}

interface Review {
  id: string;
  billing_clarity: number;
  responsiveness: number;
  claim_process: number;
  prior_auth_rating: number;
  experience_text: string;
  is_verified: boolean;
  created_at: string;
  verification_method: string;
}

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProviderData();
    }
  }, [id]);

  const fetchProviderData = async () => {
    const [providerRes, reviewsRes] = await Promise.all([
      supabase.from("providers").select("*").eq("id", id).single(),
      supabase.from("reviews").select("*").eq("provider_id", id).order("created_at", { ascending: false }),
    ]);

    if (providerRes.data) setProvider(providerRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);
    setLoading(false);
  };

  const getAverageRating = () => {
    if (!provider) return "0.0";
    const avg =
      (provider.avg_billing_clarity +
        provider.avg_responsiveness +
        provider.avg_claim_process +
        provider.avg_prior_auth) /
      4;
    return avg.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading provider...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Provider not found</p>
          <Link to="/providers">
            <Button>Back to Providers</Button>
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Provider Header */}
      <section className="container mx-auto px-4 py-12 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">{provider.name}</h1>
            <Badge variant="secondary" className="mb-4">
              {provider.specialty}
            </Badge>

            <div className="flex flex-col gap-3 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{provider.location}</span>
              </div>
              {provider.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <a href={`tel:${provider.phone}`} className="hover:text-primary">
                    {provider.phone}
                  </a>
                </div>
              )}
              {provider.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${provider.email}`} className="hover:text-primary">
                    {provider.email}
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {provider.phone && (
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
              {provider.email && (
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {provider.total_reviews > 0 && (
              <Card className="p-6 bg-gradient-hero border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-8 w-8 text-primary fill-primary" />
                  <span className="text-4xl font-bold">{getAverageRating()}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {provider.total_reviews} verified {provider.total_reviews === 1 ? "review" : "reviews"}
                </p>
              </Card>
            )}
            
            <Link to={`/contribute/verify?provider=${provider.id}`}>
              <Button className="w-full bg-gradient-primary hover:opacity-90">
                Add My Review
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rating Categories */}
      {provider.total_reviews > 0 && (
        <section className="container mx-auto px-4 py-12 border-b border-border">
          <h2 className="text-2xl font-bold mb-6">Average Ratings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RatingCard
              title="Billing Transparency"
              score={provider.avg_billing_clarity}
              description="Clear upfront costs, no surprise bills"
            />
            <RatingCard
              title="Responsiveness"
              score={provider.avg_responsiveness}
              description="Quick replies to calls and messages"
            />
            <RatingCard
              title="Claim Process"
              score={provider.avg_claim_process}
              description="Smooth insurance claim handling"
            />
            <RatingCard
              title="Prior Auth Speed"
              score={provider.avg_prior_auth}
              description="Fast prior authorization approvals"
            />
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Recent Verified Reviews</h2>
        
        {reviews.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this provider!</p>
            <Link to={`/contribute/verify?provider=${provider.id}`}>
              <Button>Leave a Review</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6 border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Verified Patient</span>
                    <Badge variant="outline" className="ml-2">
                      {review.verification_method === "zkp_insurer" ? "ZKP Verified" : "Document Verified"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Billing</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary fill-primary" />
                      <span className="font-semibold">{review.billing_clarity}/5</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Responsive</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary fill-primary" />
                      <span className="font-semibold">{review.responsiveness}/5</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Claims</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary fill-primary" />
                      <span className="font-semibold">{review.claim_process}/5</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Prior Auth</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary fill-primary" />
                      <span className="font-semibold">{review.prior_auth_rating}/5</span>
                    </div>
                  </div>
                </div>

                {review.experience_text && (
                  <p className="text-foreground leading-relaxed">{review.experience_text}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RatingCard({ title, score, description }: { title: string; score: number; description: string }) {
  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 text-primary fill-primary" />
          <span className="text-xl font-bold">{score.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}