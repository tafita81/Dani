import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("09:50");
  const [newPatientId, setNewPatientId] = useState<string>("");

  const dateObj = useMemo(() => new Date(`${selectedDate}T00:00:00-03:00`), [selectedDate]);
  const startMs = dateObj.getTime();
  const endMs = startMs + 24 * 60 * 60 * 1000;

  const { data: appointments, isLoading, refetch } = trpc.appointments.list.useQuery({ startMs, endMs });
  const { data: patients } = trpc.patients.list.useQuery();
  const { data: freeSlots } = trpc.appointments.freeSlots.useQuery({ date: selectedDate });
  const createMutation = trpc.appointments.create.useMutation();
  const updateMutation = trpc.appointments.update.useMutation();
  const icsMutation = trpc.appointments.generateIcs.useMutation();

  const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

  const statusLabel: Record<string, { text: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    scheduled: { text: "Agendada", variant: "outline" },
    confirmed: { text: "Confirmada", variant: "default" },
    completed: { text: "Concluída", variant: "secondary" },
    cancelled: { text: "Cancelada", variant: "destructive" },
    no_show: { text: "Faltou", variant: "destructive" },
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast.error("Informe o título da consulta"); return; }
    const start = new Date(`${selectedDate}T${newStartTime}:00-03:00`).getTime();
    const end = new Date(`${selectedDate}T${newEndTime}:00-03:00`).getTime();
    if (end <= start) { toast.error("O horário final deve ser após o inicial"); return; }

    try {
      await createMutation.mutateAsync({
        title: newTitle,
        description: newDescription || undefined,
        startTime: start,
        endTime: end,
        patientId: newPatientId ? parseInt(newPatientId) : undefined,
      });
      toast.success("Consulta agendada com sucesso!");
      setShowNewDialog(false);
      setNewTitle(""); setNewDescription(""); setNewPatientId("");
      refetch();
    } catch (e) {
      toast.error("Erro ao criar consulta");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: status as any });
      toast.success("Status atualizado");
      refetch();
    } catch { toast.error("Erro ao atualizar status"); }
  };

  const handleDownloadIcs = async (id: number) => {
    try {
      const result = await icsMutation.mutateAsync({ appointmentId: id });
      window.open(result.url, "_blank");
      toast.success("Arquivo .ics gerado!");
    } catch { toast.error("Erro ao gerar arquivo de calendário"); }
  };

  const navigateDate = (delta: number) => {
    const d = new Date(dateObj.getTime() + delta * 24 * 60 * 60 * 1000);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const dayLabel = dateObj.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" });

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie suas consultas e horários</p>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Nova Consulta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Título</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Sessão de terapia" />
                </div>
                <div>
                  <Label>Paciente (opcional)</Label>
                  <Select value={newPatientId} onValueChange={setNewPatientId}>
                    <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
                    <SelectContent>
                      {patients?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Início</Label>
                    <Input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
                  </div>
                  <div>
                    <Label>Fim</Label>
                    <Input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Descrição (opcional)</Label>
                  <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Observações sobre a consulta..." rows={3} />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Agendando..." : "Agendar Consulta"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Date Navigation */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="text-center">
                  <p className="font-semibold capitalize">{dayLabel}</p>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-7 text-xs mt-1 w-auto border-0 bg-muted/50 text-center" />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Consultas do Dia</h2>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : !appointments?.length ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma consulta neste dia</p>
                </CardContent>
              </Card>
            ) : (
              appointments.map((appt) => {
                const patient = patients?.find((p) => p.id === appt.patientId);
                return (
                  <Card key={appt.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="text-center shrink-0 bg-primary/5 rounded-lg px-3 py-2">
                            <p className="text-lg font-bold text-primary tabular-nums">{formatTime(appt.startTime)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatTime(appt.endTime)}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{appt.title}</p>
                            {patient && <p className="text-xs text-muted-foreground mt-0.5">{patient.name}</p>}
                            {appt.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{appt.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={statusLabel[appt.status]?.variant || "outline"} className="text-[10px]">
                            {statusLabel[appt.status]?.text || appt.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Select value={appt.status} onValueChange={(v) => handleStatusChange(appt.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-auto"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Agendada</SelectItem>
                            <SelectItem value="confirmed">Confirmada</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                            <SelectItem value="no_show">Faltou</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleDownloadIcs(appt.id)}>
                          <Download className="h-3 w-3" /> .ics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Free Slots */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Horários Disponíveis</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                {!freeSlots?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum horário disponível</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {freeSlots.map((slot, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="h-auto py-2 text-xs flex-col gap-0.5"
                        onClick={() => {
                          const start = new Date(slot.start);
                          const end = new Date(slot.end);
                          setNewStartTime(`${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`);
                          setNewEndTime(`${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`);
                          setShowNewDialog(true);
                        }}
                      >
                        <Clock className="h-3 w-3 text-primary" />
                        <span>{formatTime(slot.start)}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
