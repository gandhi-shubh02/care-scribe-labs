import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, Users, CheckCircle2, Download, LogOut, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [exp1Data, setExp1Data] = useState({ total: 0, withRPI: 0, percentage: 0 });
  const [exp2Data, setExp2Data] = useState({ total: 0, completed: 0, avgDuration: 0 });
  const [exp3Data, setExp3Data] = useState({ total: 0, yesCount: 0, incentiveCount: 0 });
  const [exp1Responses, setExp1Responses] = useState<any[]>([]);
  const [exp2Responses, setExp2Responses] = useState<any[]>([]);
  const [exp3Responses, setExp3Responses] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({ title: "Error", description: "Please enter an email", variant: "destructive" });
      return;
    }
    
    setAddingAdmin(true);
    try {
      // First get the user ID from auth.users via a query to find if they exist
      const { data: userData, error: userError } = await supabase
        .from("user_roles")
        .select("user_id")
        .limit(1);
      
      // We need to use RPC or direct insert - let's try inserting with a subquery approach
      // Since we can't query auth.users directly, we'll use rpc or the admin will need to provide user_id
      // For now, let's show the user that they need to use the email of someone who has signed up
      
      const { error } = await supabase.rpc("add_admin_by_email" as any, { _email: newAdminEmail.trim() });
      
      if (error) {
        // If RPC doesn't exist, show helpful message
        toast({ 
          title: "Note", 
          description: "User must have signed up first. Ask them to create an account, then try again.",
          variant: "destructive"
        });
      } else {
        toast({ title: "Success", description: `Added ${newAdminEmail} as admin` });
        setNewAdminEmail("");
        setDialogOpen(false);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to add admin", variant: "destructive" });
    } finally {
      setAddingAdmin(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges to view this page.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Logged in as: {user?.email}
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Button variant="destructive" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const fetchAnalytics = async () => {
    const { data: exp1 } = await supabase.from("exp1_responses").select("*").order("submitted_at", { ascending: false });
    const { data: exp2 } = await supabase.from("exp2_verification_flow").select("*").order("submitted_at", { ascending: false });
    const { data: exp3 } = await supabase.from("exp3_contribution").select("*").order("submitted_at", { ascending: false });

    if (exp1) {
      const withRPI = exp1.filter((r) => r.rpi_count > 0).length;
      setExp1Data({ total: exp1.length, withRPI, percentage: exp1.length ? (withRPI / exp1.length) * 100 : 0 });
      setExp1Responses(exp1);
    }

    if (exp2) {
      const completed = exp2.filter((r) => r.completed_successfully).length;
      const completedWithinTarget = exp2.filter((r) => r.completed_successfully && (r.total_duration_seconds || 0) <= 120).length;
      const avgDuration = exp2.length > 0 
        ? exp2.reduce((sum, r) => sum + (r.total_duration_seconds || 0), 0) / exp2.length 
        : 0;
      setExp2Data({ 
        total: exp2.length, 
        completed: completedWithinTarget, 
        avgDuration 
      });
      setExp2Responses(exp2);
    }

    if (exp3) {
      const yesImmediately = exp3.filter((r) => r.initial_prompt_response === "yes").length;
      const yesAfterIncentive = exp3.filter((r) => r.incentive_shown && r.final_contributed).length;
      const totalYes = exp3.filter((r) => r.final_contributed).length;
      setExp3Data({ 
        total: exp3.length, 
        yesCount: totalYes, 
        incentiveCount: yesAfterIncentive 
      });
      setExp3Responses(exp3);
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
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Link to="/providers"><Button variant="ghost">Providers</Button></Link>
            <Link to="/experiments"><Button variant="ghost">Experiments</Button></Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Experiment Analytics</h1>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="user@example.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      User must have already signed up before being added as admin.
                    </p>
                  </div>
                  <Button onClick={handleAddAdmin} disabled={addingAdmin} className="w-full">
                    {addingAdmin ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={fetchAnalytics} variant="outline">
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="exp1">Exp 1 Responses</TabsTrigger>
            <TabsTrigger value="exp2">Exp 2 Responses</TabsTrigger>
            <TabsTrigger value="exp3">Exp 3 Responses</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="grid lg:grid-cols-3 gap-6">
          {/* Experiment 1 */}
          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Exp 1: Anonymous Form</h3>
              <Users className="h-5 w-5 text-primary" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Responses</span>
                <span className="text-2xl font-bold">{exp1Data.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shared RPI</span>
                <span className="text-2xl font-bold">{exp1Data.withRPI}</span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">RPI Share Rate</span>
                  {exp1Data.percentage >= 20 && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <div className="text-4xl font-bold text-primary mb-1">
                  {exp1Data.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: ≥20% {exp1Data.percentage >= 20 ? "✓ Met" : "Not met"}
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${Math.min(exp1Data.percentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border text-sm">
                <div className="text-muted-foreground mb-2">Hypothesis</div>
                <p className="text-sm">At least 20% will share ≥1 RPI (cost, condition, wait time)</p>
              </div>
            </div>
          </Card>

          {/* Experiment 2 */}
          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Exp 2: Verification UX</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Started</span>
                <span className="text-2xl font-bold">{exp2Data.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Within 2min</span>
                <span className="text-2xl font-bold">{exp2Data.completed}</span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  {exp2Data.total > 0 && (exp2Data.completed / exp2Data.total) * 100 >= 70 && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="text-4xl font-bold text-primary mb-1">
                  {exp2Data.total ? ((exp2Data.completed / exp2Data.total) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: ≥70% {exp2Data.total > 0 && (exp2Data.completed / exp2Data.total) * 100 >= 70 ? "✓ Met" : "Not met"}
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${exp2Data.total ? Math.min((exp2Data.completed / exp2Data.total) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-1">Avg Duration</div>
                <div className="text-2xl font-bold">{exp2Data.avgDuration.toFixed(1)}s</div>
              </div>

              <div className="pt-4 border-t border-border text-sm">
                <div className="text-muted-foreground mb-2">Hypothesis</div>
                <p className="text-sm">70% complete verification flow within 2 minutes</p>
              </div>
            </div>
          </Card>

          {/* Experiment 3 */}
          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Exp 3: Contribution</h3>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Prompted</span>
                <span className="text-2xl font-bold">{exp3Data.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Contributed</span>
                <span className="text-2xl font-bold">{exp3Data.yesCount}</span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                </div>
                <div className="text-4xl font-bold text-primary mb-1">
                  {exp3Data.total ? ((exp3Data.yesCount / exp3Data.total) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {exp3Data.yesCount} of {exp3Data.total} contributed
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${exp3Data.total ? Math.min((exp3Data.yesCount / exp3Data.total) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-1">After Incentive</div>
                <div className="text-2xl font-bold">{exp3Data.incentiveCount}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Converted after seeing unlock benefit
                </div>
              </div>

              <div className="pt-4 border-t border-border text-sm">
                <div className="text-muted-foreground mb-2">Hypothesis</div>
                <p className="text-sm">Meaningful % contribute, especially with incentive</p>
              </div>
            </div>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="exp1">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Experiment 1: Individual Responses</h2>
                <Button variant="outline" size="sm" onClick={() => downloadCSV(exp1Responses, "exp1_anonymous_form")}>
                  <Download className="h-4 w-4 mr-2" />Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>RPI Count</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Wait Time</TableHead>
                      <TableHead>Appt Type</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead>Accessibility</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exp1Responses.map((resp) => (
                      <TableRow key={resp.id}>
                        <TableCell className="text-xs">
                          {resp.submitted_at ? new Date(resp.submitted_at).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell>{resp.session_duration_seconds}s</TableCell>
                        <TableCell className="font-bold">{resp.rpi_count}</TableCell>
                        <TableCell>{resp.shared_cost ? "✓" : "✗"}</TableCell>
                        <TableCell>{resp.shared_condition ? "✓" : "✗"}</TableCell>
                        <TableCell>{resp.shared_wait_time ? "✓" : "✗"}</TableCell>
                        <TableCell>{resp.share_appointment_type ? "✓" : "✗"}</TableCell>
                        <TableCell>{resp.share_insurance_accepted ? "✓" : "✗"}</TableCell>
                        <TableCell>{resp.share_office_accessibility ? "✓" : "✗"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="exp2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Experiment 2: Individual Responses</h2>
                <Button variant="outline" size="sm" onClick={() => downloadCSV(exp2Responses, "exp2_verification_ux")}>
                  <Download className="h-4 w-4 mr-2" />Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Drop Off</TableHead>
                      <TableHead>ID Upload</TableHead>
                      <TableHead>Medical Bill</TableHead>
                      <TableHead>Selfie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exp2Responses.map((resp) => (
                      <TableRow key={resp.id}>
                        <TableCell className="text-xs">
                          {resp.submitted_at ? new Date(resp.submitted_at).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell>{resp.total_duration_seconds}s</TableCell>
                        <TableCell>{resp.completed_successfully ? "✓" : "✗"}</TableCell>
                        <TableCell className="text-xs">{resp.drop_off_step || "N/A"}</TableCell>
                        <TableCell>{resp.uploaded_id_document ? "Yes" : "No"}</TableCell>
                        <TableCell>{resp.uploaded_medical_bill ? "Yes" : "No"}</TableCell>
                        <TableCell>{resp.uploaded_selfie ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="exp3">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Experiment 3: Individual Responses</h2>
                <Button variant="outline" size="sm" onClick={() => downloadCSV(exp3Responses, "exp3_contribution")}>
                  <Download className="h-4 w-4 mr-2" />Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Initial</TableHead>
                      <TableHead>Incentive</TableHead>
                      <TableHead>Post-Incentive</TableHead>
                      <TableHead>Final</TableHead>
                      <TableHead>Review Text</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exp3Responses.map((resp) => (
                      <TableRow key={resp.id}>
                        <TableCell className="text-xs">
                          {resp.submitted_at ? new Date(resp.submitted_at).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell>{resp.total_duration_seconds}s</TableCell>
                        <TableCell>{resp.initial_prompt_response}</TableCell>
                        <TableCell>{resp.incentive_shown ? "Shown" : "Not shown"}</TableCell>
                        <TableCell>{resp.post_incentive_response || "N/A"}</TableCell>
                        <TableCell>{resp.final_contributed ? "✓" : "✗"}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {resp.review_text || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}