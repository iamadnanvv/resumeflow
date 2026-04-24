import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Builder from "./pages/Builder";
import CoverLetter from "./pages/CoverLetter";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import Admin from "./pages/Admin";
import { AuthProvider } from "./hooks/useAuth";
import { RequireAuth } from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/builder/:id" element={<RequireAuth><Builder /></RequireAuth>} />
            <Route path="/cover-letter/:id" element={<RequireAuth><CoverLetter /></RequireAuth>} />
            <Route path="/billing" element={<RequireAuth><Billing /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
