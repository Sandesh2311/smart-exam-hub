import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import PricingPage from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import MCQGeneratorPage from "./pages/dashboard/MCQGenerator";
import QuestionPaperPage from "./pages/dashboard/QuestionPaper";
import VoiceToNotesPage from "./pages/dashboard/VoiceToNotes";
import SavedContentPage from "./pages/dashboard/SavedContent";
import SubscriptionPage from "./pages/dashboard/Subscription";
import SettingsPage from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
            <Route path="/dashboard/mcq" element={<DashboardLayout><MCQGeneratorPage /></DashboardLayout>} />
            <Route path="/dashboard/paper" element={<DashboardLayout><QuestionPaperPage /></DashboardLayout>} />
            <Route path="/dashboard/voice" element={<DashboardLayout><VoiceToNotesPage /></DashboardLayout>} />
            <Route path="/dashboard/saved" element={<DashboardLayout><SavedContentPage /></DashboardLayout>} />
            <Route path="/dashboard/subscription" element={<DashboardLayout><SubscriptionPage /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
