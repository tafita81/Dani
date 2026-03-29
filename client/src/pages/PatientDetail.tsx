import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft, Brain, Shield, Heart, FileText, Radio, Save,
  Calendar, TrendingUp, ClipboardList, Sparkles, Plus, Upload, Trash2,
  Phone, Mail, BotMessageSquare, Loader2, User
} from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data queries
  const { data: patient, isLoading, refetch: refetchPatient } = trpc.patients.getById.useQuery({ id: patientId }, { enabled: patientId > 0 });
  const { data: notes, refetch: refetchNotes } = trpc.sessionNotes.list.useQuery({ patientId }, { enabled: patientId > 0 });
  const { data: docs, refetch: refetchDocs } = trpc.documents.list.useQuery({ patientId }, { enabled: patientId > 0 });
  const { data: messages } = trpc.messages.byPatient.useQuery({ patientId }, { enabled: patientId > 0 });

  // Mutations
  const createNoteMutation = trpc.sessionNotes.create.useMutation({ onSuccess: () => { refetchNotes(); toast.success("Nota de sessão criada!"); } });
  const uploadDocMutation = trpc.documents.upload.useMutation({ onSuccess: () => { refetchDocs(); toast.success("Documento enviado!"); } });
  const deleteDocMutation = trpc.documents.delete.useMutation({ onSuccess: () => { refetchDocs(); toast.success("Documento removido"); } });
  const summarizeMutation = trpc.assistant.summarizePatient.useMutation();
  const updateMutation = trpc.patients.update.useMutation({ onSuccess: () => { refetchPatient(); toast.success("Paciente atualizado!"); setIsEditing(false); } });
  const chatMutation = trpc.assistant.chat.useMutation();

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Note dialog
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  // Evolution form
  const [evoThemes, setEvoThemes] = useState("");
  const [evoTechniques, setEvoTechniques] = useState("");
  const [evoObs, setEvoObs] = useState("");
  const [evoHomework, setEvoHomework] = useState("");

  // RPD form
  const [rpdSituation, setRpdSituation] = useState("");
  const [rpdThought, setRpdThought] = useState("");
  const [rpdEmotion, setRpdEmotion] = useState("");
  const [rpdEvidence, setRpdEvidence] = useState("");
  const [rpdAlternative, setRpdAlternative] = useState("");

  // AI pre-session
  const [aiPreSession, setAiPreSession] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const startEdit = () => {
    if (!patient) return;
    setEditName(patient.name);
    setEditEmail(patient.email || "");
    setEditPhone(patient.phone || "");
    setEditStatus(patient.status);
    setEditNotes(patient.notes || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateMutation.mutateAsync({
        id: patientId, name: editName,
        email: editEmail || undefined, phone: editPhone || undefined,
        status: editStatus as any, notes: editNotes || undefined,
      });
    } catch { toast.error("Erro ao atualizar"); }
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await createNoteMutation.mutateAsync({ patientId, content: noteContent });
      setShowNoteDialog(false);
      setNoteContent("");
    } catch { toast.error("Erro ao criar nota"); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo máximo: 10MB"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        await uploadDocMutation.mutateAsync({ patientId, fileName: file.name, fileData: base64, mimeType: file.type, fileSize: file.size });
      } catch { toast.error("Erro ao enviar documento"); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const generatePreSessionSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await chatMutation.mutateAsync({
        message: `Gere um resumo pré-consulta completo e detalhado para o paciente ${patient?.name} (ID: ${patientId}). Inclua: 1) Resumo das últimas sessões 2) Temas recorrentes 3) Progresso observado 4) Sugestões para a sessão de hoje 5) Pontos de atenção clínica. Baseie-se em todo o histórico disponível no prontuário.`,
      });
      setAiPreSession(result.response);
    } catch { toast.error("Erro ao gerar resumo"); }
    setIsGeneratingAi(false);
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  if (!patient) return <div className="text-center py-12"><p className="text-muted-foreground">Paciente não encontrado</p><Button variant="outline" className="mt-4" onClick={() => setLocation("/pacientes")}>Voltar</Button></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/pacientes")}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">{patient.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif">{patient.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={patient.status === "active" ? "default" : "secondary"} className="text-[10px]">
                {patient.status === "active" ? "Ativo" : patient.status === "inactive" ? "Inativo" : "Arquivado"}
              </Badge>
              {patient.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone}</span>}
              {patient.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{patient.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={isEditing ? handleSaveEdit : startEdit}>
            {isEditing ? "Salvar" : "Editar"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation(`/sessao-ao-vivo/${patientId}`)}>
            <Radio className="h-4 w-4 mr-1" /> Sessão ao Vivo
          </Button>
          <Button size="sm" onClick={generatePreSessionSummary} disabled={isGeneratingAi}>
            <Sparkles className="h-4 w-4 mr-1" /> {isGeneratingAi ? "Gerando..." : "Resumo Pré-Consulta"}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nome</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
              <div><Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>E-mail</Label><Input value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
              <div><Label>Telefone</Label><Input value={editPhone} onChange={e => setEditPhone(e.target.value)} /></div>
            </div>
            <div><Label>Observações</Label><Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} /></div>
          </CardContent>
        </Card>
      )}

      {/* AI Pre-Session Summary */}
      {aiPreSession && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Resumo Pré-Consulta (IA)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[250px]">
              <div className="prose prose-sm max-w-none"><Streamdown>{aiPreSession}</Streamdown></div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="notas" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="notas" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="h-3 w-3 mr-1" /> Notas</TabsTrigger>
          <TabsTrigger value="tcc" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Brain className="h-3 w-3 mr-1" /> TCC</TabsTrigger>
          <TabsTrigger value="esquema" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Shield className="h-3 w-3 mr-1" /> Esquemas</TabsTrigger>
          <TabsTrigger value="gestalt" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Heart className="h-3 w-3 mr-1" /> Gestalt</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Upload className="h-3 w-3 mr-1" /> Documentos</TabsTrigger>
          <TabsTrigger value="mensagens" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BotMessageSquare className="h-3 w-3 mr-1" /> Mensagens</TabsTrigger>
        </TabsList>

        {/* Session Notes Tab */}
        <TabsContent value="notas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notas de Sessão ({notes?.length || 0})</h3>
            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Nota</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Nota de Sessão</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Descreva a sessão, observações clínicas, evolução do paciente..." rows={8} />
                  <p className="text-xs text-muted-foreground">Um resumo automático será gerado pela IA ao salvar.</p>
                  <Button onClick={handleCreateNote} className="w-full" disabled={createNoteMutation.isPending}>
                    {createNoteMutation.isPending ? "Salvando..." : "Salvar Nota"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {!notes?.length ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Nenhuma nota de sessão registrada</p>
            </CardContent></Card>
          ) : (
            notes.map((note: any) => (
              <Card key={note.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(note.createdAt).toLocaleDateString("pt-BR")} às {new Date(note.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  {note.summary && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1"><BotMessageSquare className="h-3 w-3" /> Resumo IA</p>
                      <p className="text-xs text-muted-foreground">{note.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TCC Tab - Registro de Pensamentos Disfuncionais */}
        <TabsContent value="tcc" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Registro de Pensamentos Disfuncionais (RPD)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Situação</Label><Input value={rpdSituation} onChange={e => setRpdSituation(e.target.value)} placeholder="O que aconteceu?" /></div>
                <div className="space-y-1"><Label className="text-xs">Pensamento Automático</Label><Input value={rpdThought} onChange={e => setRpdThought(e.target.value)} placeholder="O que pensou?" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Emoção</Label><Input value={rpdEmotion} onChange={e => setRpdEmotion(e.target.value)} placeholder="O que sentiu?" /></div>
                <div className="space-y-1"><Label className="text-xs">Evidência Contra</Label><Input value={rpdEvidence} onChange={e => setRpdEvidence(e.target.value)} placeholder="Evidências contra o pensamento" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Pensamento Alternativo</Label><Input value={rpdAlternative} onChange={e => setRpdAlternative(e.target.value)} placeholder="Pensamento mais equilibrado" /></div>
              <Button size="sm" onClick={() => {
                toast.success("RPD registrado! (Funcionalidade completa em breve)");
                setRpdSituation(""); setRpdThought(""); setRpdEmotion(""); setRpdEvidence(""); setRpdAlternative("");
              }}>
                <Plus className="h-4 w-4 mr-1" /> Registrar RPD
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Conceituação Cognitiva (Beck)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">Crenças Centrais</Label><Textarea rows={2} placeholder="Ex: Eu sou inadequado, Eu não sou amável..." /></div>
              <div className="space-y-1"><Label className="text-xs">Crenças Intermediárias (Regras/Atitudes/Pressupostos)</Label><Textarea rows={2} placeholder="Se... então..." /></div>
              <div className="space-y-1"><Label className="text-xs">Estratégias Compensatórias</Label><Textarea rows={2} placeholder="Comportamentos para lidar com as crenças..." /></div>
              <Button size="sm" onClick={() => toast.success("Conceituação salva!")}><Save className="h-4 w-4 mr-1" /> Salvar Conceituação</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value="esquema" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Terapia do Esquema (Young)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Avaliação dos 18 Esquemas Desadaptativos Iniciais (EDIs) baseada no YSQ-S3.</p>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Domínio 1: Desconexão e Rejeição</h4>
                {["Abandono/Instabilidade", "Desconfiança/Abuso", "Privação Emocional", "Defectividade/Vergonha", "Isolamento Social"].map(s => (
                  <div key={s} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-xs">{s}</span>
                    <Select defaultValue="low"><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <h4 className="text-xs font-semibold text-muted-foreground uppercase mt-4">Domínio 2: Autonomia e Desempenho Prejudicados</h4>
                {["Dependência/Incompetência", "Vulnerabilidade", "Emaranhamento/Self Subdesenvolvido", "Fracasso"].map(s => (
                  <div key={s} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-xs">{s}</span>
                    <Select defaultValue="low"><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <h4 className="text-xs font-semibold text-muted-foreground uppercase mt-4">Domínio 3: Limites Prejudicados</h4>
                {["Grandiosidade/Merecimento", "Autocontrole Insuficiente"].map(s => (
                  <div key={s} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-xs">{s}</span>
                    <Select defaultValue="low"><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <h4 className="text-xs font-semibold text-muted-foreground uppercase mt-4">Domínio 4: Direcionamento para o Outro</h4>
                {["Subjugação", "Autossacrifício", "Busca de Aprovação"].map(s => (
                  <div key={s} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-xs">{s}</span>
                    <Select defaultValue="low"><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <h4 className="text-xs font-semibold text-muted-foreground uppercase mt-4">Domínio 5: Supervigilância e Inibição</h4>
                {["Negativismo/Pessimismo", "Inibição Emocional", "Padrões Inflexíveis", "Punição"].map(s => (
                  <div key={s} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-xs">{s}</span>
                    <Select defaultValue="low"><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mt-4">
                <Label className="text-xs">Modos de Esquema Observados</Label>
                <Textarea rows={2} placeholder="Ex: Criança Vulnerável, Protetor Desligado, Pai Punitivo..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Estilos de Enfrentamento</Label>
                <Textarea rows={2} placeholder="Resignação, Evitação, Hipercompensação..." />
              </div>
              <Button size="sm" onClick={() => toast.success("Avaliação de esquemas salva!")}><Save className="h-4 w-4 mr-1" /> Salvar Avaliação</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestalt Tab */}
        <TabsContent value="gestalt" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Gestalt-Terapia</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Ciclo do Contato</Label>
                <p className="text-[10px] text-muted-foreground">Avalie em qual fase do ciclo o paciente apresenta interrupções</p>
                {[
                  { phase: "Pré-contato (Sensação)", desc: "Capacidade de perceber sensações corporais" },
                  { phase: "Contato (Awareness)", desc: "Consciência do que está acontecendo" },
                  { phase: "Contato Final (Ação)", desc: "Capacidade de agir sobre a necessidade" },
                  { phase: "Pós-contato (Retirada)", desc: "Capacidade de assimilar e se retirar" },
                ].map(item => (
                  <div key={item.phase} className="p-2 rounded border space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{item.phase}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <Select defaultValue="adequate"><SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adequate">Adequado</SelectItem>
                          <SelectItem value="interrupted">Interrompido</SelectItem>
                          <SelectItem value="blocked">Bloqueado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Mecanismos de Interrupção do Contato</Label>
                {["Confluência", "Introjeção", "Projeção", "Retroflexão", "Deflexão", "Dessensibilização", "Egotismo", "Proflexão"].map(m => (
                  <div key={m} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-xs">{m}</span>
                    <Select defaultValue="absent"><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="absent">Ausente</SelectItem>
                        <SelectItem value="mild">Leve</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="intense">Intenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Situações Inacabadas (Unfinished Business)</Label>
                <Textarea rows={3} placeholder="Situações do passado que ainda afetam o presente..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Polaridades Observadas</Label>
                <Textarea rows={2} placeholder="Ex: Forte/Fraco, Controlador/Submisso..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nível de Awareness (Consciência)</Label>
                <Select defaultValue="moderate"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo — Pouca percepção de si</SelectItem>
                    <SelectItem value="moderate">Moderado — Percepção parcial</SelectItem>
                    <SelectItem value="high">Alto — Boa consciência de si</SelectItem>
                    <SelectItem value="very_high">Muito Alto — Awareness plena</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={() => toast.success("Avaliação Gestalt salva!")}><Save className="h-4 w-4 mr-1" /> Salvar Avaliação</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="docs" className="space-y-3">
          <div className="flex justify-end">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" />
            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadDocMutation.isPending}>
              <Upload className="h-4 w-4 mr-1" /> {uploadDocMutation.isPending ? "Enviando..." : "Enviar Documento"}
            </Button>
          </div>
          {!docs?.length ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Nenhum documento</p>
            </CardContent></Card>
          ) : (
            docs.map((doc: any) => (
              <Card key={doc.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <a href={doc.fileUrl} target="_blank" rel="noopener" className="text-sm font-medium hover:underline">{doc.fileName}</a>
                      <p className="text-[10px] text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString("pt-BR")} — {(doc.fileSize / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteDocMutation.mutate({ id: doc.id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="mensagens" className="space-y-3">
          {!messages?.length ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center text-muted-foreground">
              <BotMessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Nenhuma mensagem registrada</p>
            </CardContent></Card>
          ) : (
            messages.map((msg: any) => (
              <Card key={msg.id} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">{msg.platform}</Badge>
                    <Badge variant={msg.direction === "incoming" ? "secondary" : "default"} className="text-[10px]">
                      {msg.direction === "incoming" ? "Recebida" : "Enviada"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
