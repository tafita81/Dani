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
const CarAssistant = lazy(() => import("./pages/CarAssistant"));
const CarAnalyticsDashboard = lazy(() => import("./pages/CarAnalyticsDashboard"));
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const LGPDComplianceDashboard = lazy(() => import("./pages/LGPDComplianceDashboard"));
const MetricsDashboard = lazy(() => import("./pages/MetricsDashboard"));
const AIAutoScheduling = lazy(() => import("./pages/AIAutoScheduling"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const FunnelAnalyticsDashboard = lazy(() => import("./pages/FunnelAnalyticsDashboard"));
const SalesDashboard = lazy(() => import("./pages/SalesDashboard"));
const SocialMediaDashboard = lazy(() => import("./pages/SocialMediaDashboard"));
const ExponentialGrowthDashboard = lazy(() => import("./pages/ExponentialGrowthDashboard"));
const PricingManagement = lazy(() => import("./pages/PricingManagement"));
const LinktreeSetup = lazy(() => import("./pages/LinktreeSetup"));
const InstagramCredentialsSetup = lazy(() => import("./pages/InstagramCredentialsSetup"));
const InstagramRealTimeAnalytics = lazy(() => import("./pages/InstagramRealTimeAnalytics"));
const SecretsConfiguration = lazy(() => import("./pages/SecretsConfiguration"));
const AutomationPerformanceDashboard = lazy(() => import("./pages/AutomationPerformanceDashboard"));

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
          <Route path="/app" component={Home} />

          <Route path="/app/agenda" component={Agenda} />
          <Route path="/app/pacientes" component={Patients} />
          <Route path="/app/pacientes/:id" component={PatientDetail} />
          <Route path="/app/assistente" component={Assistant} />
          <Route path="/app/mensagens" component={Messages} />
          <Route path="/app/documentos" component={Documents} />
          <Route path="/app/alertas" component={Alerts} />
          <Route path="/app/configuracoes" component={Settings} />
          <Route path="/app/crm" component={LeadsCRM} />
          <Route path="/app/instagram" component={InstagramManager} />
          <Route path="/app/sessao-ao-vivo/:patientId" component={LiveSession} />
          <Route path="/app/assistente-carro" component={CarAssistant} />
          <Route path="/app/analytics" component={CarAnalyticsDashboard} />
          <Route path="/app/portal-paciente" component={PatientPortal} />
          <Route path="/app/conformidade-lgpd" component={LGPDComplianceDashboard} />
          <Route path="/app/metricas" component={MetricsDashboard} />
          <Route path="/app/agendamento-ia" component={AIAutoScheduling} />
          <Route path="/app/notificacoes" component={NotificationSettings} />
          <Route path="/app/analytics-funil" component={FunnelAnalyticsDashboard} />
          <Route path="/app/vendas" component={SalesDashboard} />
          <Route path="/app/redes-sociais" component={SocialMediaDashboard} />
          <Route path="/app/crescimento-exponencial" component={ExponentialGrowthDashboard} />
          <Route path="/app/gestao-precos" component={PricingManagement} />
        <Route path="/app/linktree" component={LinktreeSetup} />
          <Route path="/app/instagram-credenciais" component={InstagramCredentialsSetup} />
          <Route path="/app/instagram-analytics" component={InstagramRealTimeAnalytics} />
          <Route path="/app/segredos" component={SecretsConfiguration} />
          <Route path="/app/performance-automacao" component={AutomationPerformanceDashboard} />
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
      {/* Exclusive AI Assistant routes */}
      <Route path="/assistente-ia">
        <Suspense fallback={<LoadingFallback />}><Assistant /></Suspense>
      </Route>
      {/* Car Assistant - Public route */}
      <Route path="/assistente-carro-publico">
        <Suspense fallback={<LoadingFallback />}><CarAssistant /></Suspense>
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
