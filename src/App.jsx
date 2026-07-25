import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LoginModal } from "./components/LoginModal";
import { ProjectView } from "./pages/ProjectView";
import { ProjectsDashboard } from "./pages/ProjectsDashboard";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { CommandPalette } from "./components/CommandPalette";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
const App = () => (<ErrorBoundary>
    
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <CommandPalette />
        <KeyboardShortcuts />
        <Routes>
          <Route path="/" element={<Index />}/>
          <Route path="/login" element={<LoginModal />}/>
          <Route path="/signup" element={<Signup />}/>
          <Route path="/forgot-password" element={<ForgotPassword />}/>
          <Route path="/reset-password" element={<ResetPassword />}/>
          <Route path="/projects" element={<ProjectsDashboard />}/>
          <Route path="/projects/:projectId" element={<ProjectView />}/>
          <Route path="/success" element={<Success />}/>
          <Route path="/success.html" element={<Success />}/>
          <Route path="/cancel" element={<Cancel />}/>
          <Route path="/cancel.html" element={<Cancel />}/>
          <Route path="/settings" element={<Settings />}/>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    
  </ErrorBoundary>);
export default App;
