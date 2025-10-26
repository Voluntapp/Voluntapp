// Reference: javascript_log_in_with_replit blueprint
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Discovery from "@/pages/Discovery";
import Profile from "@/pages/Profile";
import MyOpportunities from "@/pages/MyOpportunities";
import OrganizationManage from "@/pages/OrganizationManage";
import CreateOpportunity from "@/pages/CreateOpportunity";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show landing page while loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Check if user needs onboarding (no location or interests set)
  const interests = (user?.interests && Array.isArray(user.interests)) ? user.interests : [];
  const needsOnboarding = !user?.location || interests.length === 0;
  
  if (needsOnboarding) {
    return (
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route component={Onboarding} />
      </Switch>
    );
  }

  // Main authenticated routes
  return (
    <Switch>
      <Route path="/" component={Discovery} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-opportunities" component={MyOpportunities} />
      <Route path="/manage" component={OrganizationManage} />
      <Route path="/create" component={CreateOpportunity} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
