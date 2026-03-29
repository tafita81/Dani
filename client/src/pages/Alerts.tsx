
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, Calendar, XCircle, MessageSquare, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const { data: alerts, isLoading, refetch } = trpc.alerts.list.useQuery();
  const markReadMutation = trpc.alerts.markRead.useMutation();
  const markAllReadMutation = trpc.alerts.markAllRead.useMutation();

  const unreadCount = alerts?.filter((a) => !a.isRead).length || 0;

  const handleMarkRead = async (id: number) => {
    try {
      await markReadMutation.mutateAsync({ id });
      refetch();
    } catch {
      toast.error("Erro ao marcar como lido");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("Todos os alertas marcados como lidos");
      refetch();
    } catch {
      toast.error("Erro ao marcar todos como lidos");
    }
  };

  const typeIcons: Record<string, React.ReactNode> = {
    new_appointment: <Calendar className="h-4 w-4 text-primary" />,
    cancellation: <XCircle className="h-4 w-4 text-destructive" />,
    urgent_message: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    reminder: <Bell className="h-4 w-4 text-blue-500" />,
    system: <Info className="h-4 w-4 text-muted-foreground" />,
  };

  const typeLabels: Record<string, string> = {
    new_appointment: "Novo Agendamento",
    cancellation: "Cancelamento",
    urgent_message: "Mensagem Urgente",
    reminder: "Lembrete",
    system: "Sistema",
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {unreadCount > 0
                ? `${unreadCount} alerta${unreadCount > 1 ? "s" : ""} não lido${unreadCount > 1 ? "s" : ""}`
                : "Todos os alertas lidos"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todos como lidos
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !alerts?.length ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum alerta</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-0 shadow-sm transition-all ${!alert.isRead ? "bg-primary/[0.02] ring-1 ring-primary/10" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      {typeIcons[alert.type] || <Bell className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold">{alert.title}</p>
                        {!alert.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {typeLabels[alert.type] || alert.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => handleMarkRead(alert.id)}
                      >
                        Marcar lido
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
