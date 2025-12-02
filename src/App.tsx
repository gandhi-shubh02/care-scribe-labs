import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Providers from "./pages/Providers";
import ProviderProfile from "./pages/ProviderProfile";
import ContributeVerify from "./pages/ContributeVerify";
import ContributeReview from "./pages/ContributeReview";
import ContributeSuccess from "./pages/ContributeSuccess";
import Experiments from "./pages/Experiments";
import ExperimentAnonymousForm from "./pages/ExperimentAnonymousForm";
import ExperimentVerificationUX from "./pages/ExperimentVerificationUX";
import ExperimentContributionWillingness from "./pages/ExperimentContributionWillingness";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route path="/contribute/verify" element={<ContributeVerify />} />
            <Route path="/contribute/review" element={<ContributeReview />} />
            <Route path="/contribute/success" element={<ContributeSuccess />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/experiments/anonymous-form" element={<ExperimentAnonymousForm />} />
            <Route path="/experiments/verification-ux" element={<ExperimentVerificationUX />} />
            <Route path="/experiments/contribution-willingness" element={<ExperimentContributionWillingness />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
