import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const [exp1Data, setExp1Data] = useState({ total: 0, withRPI: 0, percentage: 0 });
  const [exp2Data, setExp2Data] = useState({ total: 0, completed: 0, avgDuration: 0 });
  const [exp3Data, setExp3Data] = useState({ total: 0, yesCount: 0, incentiveCount: 0 });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: exp1 } = await supabase.from("exp1_responses").select("*");
    const { data: exp2 } = await supabase.from("exp2_verification_flow").select("*");
    const { data: exp3 } = await supabase.from("exp3_contribution").select("*");

    if (exp1) {
      const withRPI = exp1.filter((r) => r.rpi_count > 0).length;
      setExp1Data({ total: exp1.length, withRPI, percentage: exp1.length ? (withRPI / exp1.length) * 100 : 0 });
    }

    if (exp2) {
      const completed = exp2.filter((r) => r.completed_successfully).length;
      const avgDuration = exp2.reduce((sum, r) => sum + (r.total_duration_seconds || 0), 0) / exp2.length || 0;
      setExp2Data({ total: exp2.length, completed, avgDuration });
    }

    if (exp3) {
      const yesCount = exp3.filter((r) => r.initial_prompt_response === "yes" || r.final_contributed).length;
      const incentiveCount = exp3.filter((r) => r.incentive_shown && r.final_contributed).length;
      setExp3Data({ total: exp3.length, yesCount, incentiveCount });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthReview</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/providers"><Button variant="ghost">Providers</Button></Link>
            <Link to="/experiments"><Button variant="ghost">Experiments</Button></Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Experiment Analytics</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Exp 1: Anonymous Form</h3>
            <div className="space-y-3">
              <div><span className="text-muted-foreground">Total Responses:</span> <span className="font-bold">{exp1Data.total}</span></div>
              <div><span className="text-muted-foreground">With RPI:</span> <span className="font-bold">{exp1Data.withRPI}</span></div>
              <div className="pt-3 border-t">
                <div className="text-sm text-muted-foreground mb-1">RPI Share Rate</div>
                <div className="text-3xl font-bold text-primary">{exp1Data.percentage.toFixed(1)}%</div>
                {exp1Data.percentage >= 20 ? <CheckCircle2 className="h-5 w-5 text-primary mt-2" /> : null}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Exp 2: Verification UX</h3>
            <div className="space-y-3">
              <div><span className="text-muted-foreground">Total Started:</span> <span className="font-bold">{exp2Data.total}</span></div>
              <div><span className="text-muted-foreground">Completed:</span> <span className="font-bold">{exp2Data.completed}</span></div>
              <div className="pt-3 border-t">
                <div className="text-sm text-muted-foreground mb-1">Avg Duration</div>
                <div className="text-3xl font-bold text-primary">{exp2Data.avgDuration.toFixed(0)}s</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Exp 3: Contribution</h3>
            <div className="space-y-3">
              <div><span className="text-muted-foreground">Total Prompted:</span> <span className="font-bold">{exp3Data.total}</span></div>
              <div><span className="text-muted-foreground">Contributed:</span> <span className="font-bold">{exp3Data.yesCount}</span></div>
              <div className="pt-3 border-t">
                <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                <div className="text-3xl font-bold text-primary">
                  {exp3Data.total ? ((exp3Data.yesCount / exp3Data.total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}