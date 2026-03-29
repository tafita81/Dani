import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Users, UserPlus, Search, Phone, Mail, Calendar, Brain, Heart, Shield, Radio, Eye } from "lucide-react";

const approachIcons: Record<string, any> = { tcc: Brain, esquema: Shield, gestalt: Heart, integrativa: Radio };
const approachLabels: Record<string, string> = { tcc: "TCC", esquema: "Terapia do Esquema", gestalt: "Gestalt", integrativa: "Integrativa" };

export default function Patients() {
  const { data: patients, isLoading, refetch } = trpc.patients.list.useQuery();
  const createPatient = trpc.patients.create.useMutation({ onSuccess: () => { refetch(); toast.success("Paciente cadastrado!"); setShowNew(false); resetForm(); } });
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNew, setShowNew] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("outro");
  const [approach, setApproach] = useState("integrativa");
  const [source, setSource] = useState("site");
  const [notes, setNotes] = useState("");

  const resetForm = () => { setName(""); setEmail(""); setPhone(""); setCpf(""); setBirthDate(""); setGender("outro"); setApproach("integrativa"); setSource("site"); setNotes(""); };

  const filtered = useMemo(() => {
    if (!patients) return [];
    let list = patients;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p: any) => p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q));
    }
    if (filterStatus !== "all") list = list.filter((p: any) => p.status === filterStatus);
    return list;
  }, [patients, search, filterStatus]);

  const stats = useMemo(() => {
    if (!patients) return { total: 0, active: 0, inactive: 0 };
    return {
      total: patients.length,
      active: patients.filter((p: any) => p.status === "active").length,
      inactive: patients.filter((p: any) => p.status !== "active").length,
    };
  }, [patients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Pacientes
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seus pacientes e prontuários</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="h-4 w-4 mr-2" /> Novo Paciente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Cadastrar Paciente</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome Completo *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do paciente" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>E-mail</Label><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" /></div>
                <div className="space-y-2"><Label>Telefone/WhatsApp</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>CPF</Label><Input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" /></div>
                <div className="space-y-2"><Label>Data de Nascimento</Label><Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="nao_binario">Não-binário</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Abordagem Principal</Label>
                  <Select value={approach} onValueChange={setApproach}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tcc">TCC</SelectItem>
                      <SelectItem value="esquema">Terapia do Esquema</SelectItem>
                      <SelectItem value="gestalt">Gestalt-Terapia</SelectItem>
                      <SelectItem value="integrativa">Integrativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Observações Iniciais</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Queixa principal, observações..." /></div>
              <Button className="w-full" onClick={() => createPatient.mutate({
                name, email: email || undefined, phone: phone || undefined,
                dateOfBirth: birthDate || undefined,
                source: source as any, notes: notes || undefined,
              })} disabled={createPatient.isPending || !name}>
                {createPatient.isPending ? "Cadastrando..." : "Cadastrar Paciente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{stats.active}</p><p className="text-xs text-muted-foreground">Ativos</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{stats.inactive}</p><p className="text-xs text-muted-foreground">Inativos</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="discharged">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient List */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center"><Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" /><p className="text-muted-foreground">Nenhum paciente encontrado</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p: any) => {
            const ApproachIcon = approachIcons[p.primaryApproach] || Brain;
            return (
              <Card key={p.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/pacientes/${p.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{p.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {p.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
                          {p.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <ApproachIcon className="h-3 w-3" /> {approachLabels[p.primaryApproach] || p.primaryApproach}
                      </Badge>
                      <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {p.status === "active" ? "Ativo" : p.status === "inactive" ? "Inativo" : "Alta"}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
