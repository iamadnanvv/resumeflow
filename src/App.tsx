import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard";
import Builder from "./pages/Builder";
import CoverLetter from "./pages/CoverLetter";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import Admin from "./pages/Admin";
import AtsResume from "./pages/seo/AtsResume";
import ResumeBuilder from "./pages/seo/ResumeBuilder";
import CoverLetterGenerator from "./pages/seo/CoverLetterGenerator";
import SoftwareEngineerResume from "./pages/seo/SoftwareEngineerResume";
import ProductManagerResume from "./pages/seo/ProductManagerResume";
import DataScientistResume from "./pages/seo/DataScientistResume";
import DesignerResume from "./pages/seo/DesignerResume";
import MarketingResume from "./pages/seo/MarketingResume";
import SalesResume from "./pages/seo/SalesResume";
import NurseResume from "./pages/seo/NurseResume";
import TeacherResume from "./pages/seo/TeacherResume";
import Referrals from "./pages/Referrals";
import Showcase from "./pages/Showcase";
import ShowcaseDetail from "./pages/ShowcaseDetail";
import AdminAudit from "./pages/AdminAudit";
import AdminShowcase from "./pages/AdminShowcase";
import { AuthProvider } from "./hooks/useAuth";
import { ReferralCapture } from "./components/ReferralCapture";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ReferralCapture />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/ats-resume" element={<AtsResume />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/cover-letter-generator" element={<CoverLetterGenerator />} />
            <Route path="/software-engineer-resume" element={<SoftwareEngineerResume />} />
            <Route path="/product-manager-resume" element={<ProductManagerResume />} />
            <Route path="/data-scientist-resume" element={<DataScientistResume />} />
            <Route path="/designer-resume" element={<DesignerResume />} />
            <Route path="/marketing-resume" element={<MarketingResume />} />
            <Route path="/sales-resume" element={<SalesResume />} />
            <Route path="/nurse-resume" element={<NurseResume />} />
            <Route path="/teacher-resume" element={<TeacherResume />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/builder/:id" element={<Builder />} />
            <Route path="/cover-letter/:id" element={<CoverLetter />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/showcase/:id" element={<ShowcaseDetail />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/admin/showcase" element={<AdminShowcase />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
