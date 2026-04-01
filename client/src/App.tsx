import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ClinicalAssistant from "./pages/ClinicalAssistant";
import CarAssistant from "./pages/CarAssistant";
import PatientRegistration from "./pages/PatientRegistration";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/patients"} component={PatientRegistration} />
      <Route path={"/patients/register"} component={PatientRegistration} />
      <Route path={"/appointments"} component={Home} />
      <Route path={"/crm"} component={Home} />
      <Route path={"/assistente-clinico"} component={ClinicalAssistant} />
      <Route path={"/assistente-carro"} component={CarAssistant} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
