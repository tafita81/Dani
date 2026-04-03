import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SidebarLayout from "./components/SidebarLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Pacientes from "./pages/Pacientes";
import Agendamentos from "./pages/Agendamentos";
import CRM from "./pages/CRM";
import ClinicalAssistant from "./pages/ClinicalAssistant";
import CarAssistant from "./pages/CarAssistant";

function Router() {
  return (
    <SidebarLayout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/pacientes"} component={Pacientes} />
        <Route path={"/agendamentos"} component={Agendamentos} />
        <Route path={"/crm"} component={CRM} />
        <Route path={"/assistente"} component={ClinicalAssistant} />
        <Route path={"/carro"} component={CarAssistant} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
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
