import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Target, UserPlus, Phone, Mail, MessageSquare, Send, Instagram, ArrowRight, Search, TrendingUp } from "lucide-react";

const STAGES = [
  { key: "novo", label: "Novo Lead", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "contato", label: "Em Contato", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { key: "interesse", label: "Interessado", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { key: "agendamento", label: "Agendamento", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { key: "convertido", label: "Convertido", color: "bg-green-100 text-green-700 border-green-200" },
  { key: "perdido", label: "Perdido", color: "bg-red-100 text-red-700 border-red-200" },
];

const SOURCE_ICONS: Record<string, any> = {
  whatsapp: MessageSquare,
  telegram: Send,
  instagram: Instagram,
  website: Target,
  indicacao: UserPlus,
};

export default function LeadsCRM() {
  const { data: leads, isLoading, refetch } = trpc.leads.list.useQuery();
  const createLead = trpc.leads.create.useMutation({ onSuccess: () => { refetch(); toast.success("Lead criado!"); setShowNew(false); } });
  const updateLead = trpc.leads.update.useMutation({ onSuccess: () => { refetch(); toast.success("Lead atualizado!"); } });
  const convertLead = trpc.leads.convertToPatient.useMutation({ onSuccess: () => { refetch(); toast.success("Lead convertido em paciente!"); } });

  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSource, setNewSource] = useState("website");

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter((l: any) =>
      l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.email?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const leadsByStage = useMemo(() => {
    const map: Record<string, any[]> = {};
    STAGES.forEach(s => { map[s.key] = []; });
    filteredLeads.forEach((l: any) => {
      if (map[l.funnelStage]) map[l.funnelStage].push(l);
      else map["novo"]?.push(l);
    });
    return map;
  }, [filteredLeads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" /> CRM de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">Converta leads em consultas agendadas</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar leads..." className="pl-9 w-48" />
          </div>
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus className="h-4 w-4 mr-2" /> Novo Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nome</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome do lead" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Telefone</Label><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" /></div>
                  <div className="space-y-2"><Label>E-mail</Label><Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@exemplo.com" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Select value={newSource} onValueChange={setNewSource}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="website">Site</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createLead.mutate({ name: newName, phone: newPhone || undefined, email: newEmail || undefined, source: newSource as any })} disabled={createLead.isPending || !newName}>
                  {createLead.isPending ? "Criando..." : "Criar Lead"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STAGES.map(stage => (
          <Card key={stage.key} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{leadsByStage[stage.key]?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">{stage.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map(s => <Skeleton key={s.key} className="h-64 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
          {STAGES.map(stage => (
            <div key={stage.key} className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={`text-[10px] ${stage.color}`}>{stage.label}</Badge>
                <span className="text-xs text-muted-foreground">({leadsByStage[stage.key]?.length || 0})</span>
              </div>
              <div className="space-y-2">
                {leadsByStage[stage.key]?.map((lead: any) => {
                  const SourceIcon = SOURCE_ICONS[lead.source] || Target;
                  return (
                    <Card key={lead.id} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm truncate">{lead.name || "Sem nome"}</p>
                          <SourceIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </div>
                        {lead.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</p>}
                        {lead.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</p>}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[9px]">Score: {lead.score || 0}</Badge>
                          {stage.key !== "convertido" && stage.key !== "perdido" && (
                            <div className="flex gap-1">
                              {stage.key !== "agendamento" && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => {
                                  const nextStage = STAGES[STAGES.findIndex(s => s.key === stage.key) + 1];
                                  if (nextStage) updateLead.mutate({ id: lead.id, funnelStage: nextStage.key as any });
                                }}>
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              )}
                              {stage.key === "agendamento" && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-emerald-600" onClick={() => convertLead.mutate({ leadId: lead.id })}>
                                  Converter
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {(!leadsByStage[stage.key] || leadsByStage[stage.key].length === 0) && (
                  <div className="text-center py-6 text-xs text-muted-foreground">Nenhum lead</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
