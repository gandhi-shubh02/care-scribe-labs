import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, MapPin, Phone, Mail, Star, Search, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const specialties = [
  "All",
  "Dermatology",
  "Cardiology",
  "Pediatrics",
  "Primary Care",
  "Psychiatry",
  "Orthopedics",
  "Oncology",
  "Neurology",
  "Endocrinology",
  "Gastroenterology",
];

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, selectedSpecialty, searchQuery]);

  const fetchProviders = async () => {
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .order("total_reviews", { ascending: false });

    if (error) {
      console.error("Error fetching providers:", error);
    } else {
      setProviders(data || []);
    }
    setLoading(false);
  };

  const filterProviders = () => {
    let filtered = providers;

    if (selectedSpecialty !== "All") {
      filtered = filtered.filter((p) => p.specialty === selectedSpecialty);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  };

  const getAverageRating = (provider: Provider) => {
    const avg =
      (provider.avg_billing_clarity +
        provider.avg_responsiveness +
        provider.avg_claim_process +
        provider.avg_prior_auth) /
      4;
    return avg.toFixed(1);
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
            <Link to="/admin">
              <Button variant="outline">Analytics</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border bg-gradient-subtle">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Find Healthcare Providers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse verified reviews from real patients. All reviews are cryptographically verified and anonymous.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="container mx-auto px-4 py-8 sticky top-[73px] bg-background/95 backdrop-blur-sm z-40 border-b border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by provider name or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty)}
                className="whitespace-nowrap"
              >
                {specialty}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {selectedSpecialty === "All" && !searchQuery && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending Providers</h2>
          </div>
          <div className="grid gap-4">
            {filteredProviders.slice(0, 3).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} getAverageRating={getAverageRating} />
            ))}
          </div>
        </section>
      )}

      {/* All Providers */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">
          {selectedSpecialty === "All" ? "All Providers" : selectedSpecialty}
          <span className="text-muted-foreground ml-2">({filteredProviders.length})</span>
        </h2>
        
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading providers...</div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No providers found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} getAverageRating={getAverageRating} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProviderCard({
  provider,
  getAverageRating,
}: {
  provider: Provider;
  getAverageRating: (p: Provider) => string;
}) {
  return (
    <Card className="p-6 hover:shadow-medium transition-all duration-300 border-border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold">{provider.name}</h3>
              <Badge variant="secondary" className="mt-2">
                {provider.specialty}
              </Badge>
            </div>
            {provider.total_reviews > 0 && (
              <div className="flex items-center gap-1 bg-gradient-hero px-3 py-1 rounded-lg">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <span className="font-bold text-lg">{getAverageRating(provider)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{provider.location}</span>
            </div>
            {provider.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{provider.phone}</span>
              </div>
            )}
            {provider.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{provider.email}</span>
              </div>
            )}
          </div>

          {provider.total_reviews > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Billing Clarity</div>
                <div className="font-semibold">{provider.avg_billing_clarity.toFixed(1)}/5</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Responsiveness</div>
                <div className="font-semibold">{provider.avg_responsiveness.toFixed(1)}/5</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Claim Process</div>
                <div className="font-semibold">{provider.avg_claim_process.toFixed(1)}/5</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Prior Auth</div>
                <div className="font-semibold">{provider.avg_prior_auth.toFixed(1)}/5</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <Link to={`/provider/${provider.id}`}>
            <Button className="w-full md:w-auto">
              View Profile
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            {provider.total_reviews} verified {provider.total_reviews === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
    </Card>
  );
}