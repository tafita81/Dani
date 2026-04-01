import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, TrendingUp, MessageSquare, Loader2, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch dashboard data
  const patientsQuery = trpc.patients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const appointmentsQuery = trpc.appointments.upcoming.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  const leadsQuery = trpc.leads.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const sessionsQuery = trpc.sessions.recent.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Dani - Assistente Clínico IA
            </h1>
            <p className="text-lg text-muted-foreground">
              Plataforma completa de gestão clínica para psicólogos com inteligência artificial, agenda integrada e assistentes de voz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 my-8">
            <Card className="border-2">
              <CardHeader>
                <Users className="w-6 h-6 text-primary mb-2" />
                <CardTitle>Gestão de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Prontuário eletrônico, histórico de sessões e dados clínicos completos
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Calendar className="w-6 h-6 text-primary mb-2" />
                <CardTitle>Agenda Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Agendamento online e presencial com sincronização de calendário
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <MessageSquare className="w-6 h-6 text-primary mb-2" />
                <CardTitle>Assistentes com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Transcrição em tempo real, sugestões de intervenções e notas automáticas
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <CardTitle>CRM de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gestão de leads, funil de conversão e análise de oportunidades
                </p>
              </CardContent>
            </Card>
          </div>

          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Entrar com Manus
          </Button>

          <p className="text-xs text-muted-foreground">
            Faça login para acessar a plataforma completa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dani</h1>
            <p className="text-sm text-muted-foreground">Assistente Clínico IA</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="appointments">Agenda</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="assistants">Assistentes</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Pacientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {patientsQuery.data?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Próximas Consultas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointmentsQuery.data?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Leads Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadsQuery.data?.filter(l => l.stage !== 'converted' && l.stage !== 'lost').length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sessões Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessionsQuery.data?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Consultas</CardTitle>
                  <CardDescription>Próximos 5 agendamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointmentsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : appointmentsQuery.data?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma consulta agendada</p>
                  ) : (
                    <div className="space-y-4">
                      {appointmentsQuery.data?.map((apt) => (
                        <div key={apt.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                          <div>
                            <p className="font-medium text-sm">{apt.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(apt.startTime).toLocaleDateString('pt-BR', {
                                weekday: 'short',
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sessões Recentes</CardTitle>
                  <CardDescription>Últimas 5 sessões registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : sessionsQuery.data?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma sessão registrada</p>
                  ) : (
                    <div className="space-y-4">
                      {sessionsQuery.data?.map((session) => (
                        <div key={session.id} className="border-b pb-3 last:border-0">
                          <p className="font-medium text-sm">Sessão #{session.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                          {session.summary && (
                            <p className="text-xs text-foreground mt-1 line-clamp-2">
                              {session.summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pacientes</CardTitle>
                <CardDescription>Visualize e gerencie todos os seus pacientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Módulo de pacientes em desenvolvimento
                  </p>
                  <Button onClick={() => setLocation('/patients')}>
                    Acessar Pacientes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Agenda</CardTitle>
                <CardDescription>Gerencie suas consultas e agendamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Módulo de agenda em desenvolvimento
                  </p>
                  <Button onClick={() => setLocation('/appointments')}>
                    Acessar Agenda
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm">
            <Card>
              <CardHeader>
                <CardTitle>CRM de Vendas</CardTitle>
                <CardDescription>Gerencie leads e oportunidades de negócio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Módulo de CRM em desenvolvimento
                  </p>
                  <Button onClick={() => setLocation('/crm')}>
                    Acessar CRM
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assistants Tab */}
          <TabsContent value="assistants">
            <Card>
              <CardHeader>
                <CardTitle>Assistentes com IA</CardTitle>
                <CardDescription>Acesse os assistentes clínicos e de carro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4"
                    onClick={() => setLocation('/assistente-clinico')}
                  >
                    <MessageSquare className="w-6 h-6 mb-2" />
                    <span className="font-semibold">Assistente Clínico</span>
                    <span className="text-xs text-muted-foreground">
                      Transcrição, sugestões e notas automáticas
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4"
                    onClick={() => setLocation('/assistente-carro')}
                  >
                    <MessageSquare className="w-6 h-6 mb-2" />
                    <span className="font-semibold">Assistente de Carro</span>
                    <span className="text-xs text-muted-foreground">
                      Modo mãos-livres com reconhecimento de voz
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
