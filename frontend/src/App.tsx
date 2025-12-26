import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InterviewAuthProvider } from "@/contexts/InterviewAuthContext";
import Index from "./pages/Index";
import LeaderboardPage from "./pages/LeaderboardPage";
import SpectatePage from "./pages/SpectatePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import InterviewAuthPage from "./pages/InterviewAuthPage";
import InterviewDashboard from "./pages/InterviewDashboard";
import InterviewSession from "./pages/InterviewSession";
import JoinSession from "./pages/JoinSession";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InterviewAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/spectate" element={<SpectatePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              {/* Interview Platform Routes */}
              <Route path="/interview" element={<InterviewDashboard />} />
              <Route path="/interview/auth" element={<InterviewAuthPage />} />
              <Route path="/interview/session/:sessionId" element={<InterviewSession />} />
              <Route path="/interview/join/:shareCode" element={<JoinSession />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </InterviewAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
