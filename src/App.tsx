import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingStateManager } from "@/components/animations/LoadingStateManager";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardOverviewPage from "./pages/DashboardOverviewPage";
import AgentsPage from "./pages/AgentsPage";
import ChatPage from "./pages/ChatPage";
import TasksPage from "./pages/TasksPage";
import SettingsPage from "./pages/SettingsPage";
import { DeepBookingPage } from "./pages/DeepBookingPage";
import { ShortFormFactoryPage } from "./pages/ShortFormFactoryPage";
import { AutomationPage } from "./pages/AutomationPage";
import { RecordingsPage } from "./pages/RecordingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <LoadingStateManager showIntro={true} skipIntroOnRepeat={true}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardOverviewPage />} />
                <Route path="/short-form-factory" element={<ShortFormFactoryPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/booky" element={<DeepBookingPage />} />
                <Route path="/automation" element={<AutomationPage />} />
                <Route path="/recordings" element={<RecordingsPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LoadingStateManager>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
