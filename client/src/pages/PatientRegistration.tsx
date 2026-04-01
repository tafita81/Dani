import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PatientRegistration() {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "M" as "M" | "F" | "other",
    occupation: "",
    origin: "indication" as "instagram" | "whatsapp" | "telegram" | "site" | "indication" | "other",
    status: "active" as "active" | "inactive" | "waitlist",
    notes: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const createPatientMutation = trpc.patients.create.useMutation();
  const patientsQuery = trpc.patients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPatientMutation.mutateAsync({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        occupation: formData.occupation || undefined,
        origin: formData.origin,
        status: formData.status,
        notes: formData.notes || undefined,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        } : undefined,
      });

      if (result && result.id) {
        toast.success(`Paciente cadastrado com sucesso! ID: ${result.id}`);
      } else {
        toast.success("Paciente cadastrado com sucesso!");
      }
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "M",
        occupation: "",
        origin: "indication",
        status: "active",
        notes: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
      });

      // Refresh patient list
      await patientsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao cadastrar paciente");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Faça login para cadastrar pacientes</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Cadastro de Pacientes</h1>
          <p className="text-sm text-muted-foreground">
            Registre novos pacientes com ID automático
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Paciente</CardTitle>
                <CardDescription>
                  Preencha as informações básicas do paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nome completo do paciente"
                      required
                    />
                  </div>

                  {/* Email e Telefone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  {/* Data de Nascimento e Gênero */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Ocupação */}
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Ocupação</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="Ex: Engenheiro, Professor, etc."
                    />
                  </div>

                  {/* Origem e Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origem</Label>
                      <Select value={formData.origin} onValueChange={(value) => handleSelectChange("origin", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="telegram">Telegram</SelectItem>
                          <SelectItem value="site">Site</SelectItem>
                          <SelectItem value="indication">Indicação</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="waitlist">Fila de Espera</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notas */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Observações adicionais sobre o paciente..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Contato de Emergência */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Contato de Emergência</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Nome</Label>
                        <Input
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          placeholder="Nome do contato"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactPhone">Telefone</Label>
                          <Input
                            id="emergencyContactPhone"
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleInputChange}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactRelation">Relação</Label>
                          <Input
                            id="emergencyContactRelation"
                            name="emergencyContactRelation"
                            value={formData.emergencyContactRelation}
                            onChange={handleInputChange}
                            placeholder="Ex: Mãe, Cônjuge, etc."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Cadastrar Paciente
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Patient List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pacientes Cadastrados</CardTitle>
                <CardDescription>
                  Total: {patientsQuery.data?.length || 0}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {patientsQuery.data && patientsQuery.data.length > 0 ? (
                    patientsQuery.data.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {patient.id}</p>
                            {patient.phone && (
                              <p className="text-xs text-muted-foreground">{patient.phone}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {patient.status === "active" && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" title="Ativo" />
                            )}
                            {patient.status === "inactive" && (
                              <div className="w-2 h-2 bg-gray-500 rounded-full" title="Inativo" />
                            )}
                            {patient.status === "waitlist" && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Fila de Espera" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum paciente cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
