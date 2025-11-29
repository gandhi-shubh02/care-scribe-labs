import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Providers from "./pages/Providers";
import ProviderProfile from "./pages/ProviderProfile";
import ContributeVerify from "./pages/ContributeVerify";
import ContributeReview from "./pages/ContributeReview";
import ContributeSuccess from "./pages/ContributeSuccess";
import Experiments from "./pages/Experiments";
import ExperimentAnonymousForm from "./pages/ExperimentAnonymousForm";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
