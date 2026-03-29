import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("./pages/Home"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientDetail = lazy(() => import("./pages/PatientDetail"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Messages = lazy(() => import("./pages/Messages"));
const Documents = lazy(() => import("./pages/Documents"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Settings = lazy(() => import("./pages/Settings"));
const LeadsCRM = lazy(() => import("./pages/LeadsCRM"));
const LiveSession = lazy(() => import("./pages/LiveSession"));
const InstagramManager = lazy(() => import("./pages/InstagramManager"));
const Landing = lazy(() => import("./pages/Landing"));
const BookingPublic = lazy(() => import("./pages/BookingPublic"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/agenda" component={Agenda} />
          <Route path="/pacientes" component={Patients} />
          <Route path="/pacientes/:id" component={PatientDetail} />
          <Route path="/assistente" component={Assistant} />
          <Route path="/mensagens" component={Messages} />
          <Route path="/documentos" component={Documents} />
          <Route path="/alertas" component={Alerts} />
          <Route path="/configuracoes" component={Settings} />
          <Route path="/crm" component={LeadsCRM} />
          <Route path="/instagram" component={InstagramManager} />
          <Route path="/sessao-ao-vivo/:patientId" component={LiveSession} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        <Suspense fallback={<LoadingFallback />}><Landing /></Suspense>
      </Route>
      <Route path="/site">
        <Suspense fallback={<LoadingFallback />}><Landing /></Suspense>
      </Route>
      <Route path="/agendar">
        <Suspense fallback={<LoadingFallback />}><BookingPublic /></Suspense>
      </Route>
      {/* Dashboard routes */}
      <Route path="/app/:rest*" component={DashboardRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
