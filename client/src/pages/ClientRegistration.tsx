import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Save, X, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientFormData {
  // Informações Pessoais
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";

  // Documentação
  cpf: string;
  rg: string;
  rgIssuer: string;

  // Endereço
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;

  // Informações de Contato Adicional
  emergencyContact: string;
  emergencyPhone: string;
  relationship: string;

  // Informações Clínicas
  mainComplaint: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;

  // Documentos
  documents: {
    cpfFile?: File;
    rgFile?: File;
    addressProofFile?: File;
  };
}

const initialFormData: ClientFormData = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "prefer_not_to_say",
  cpf: "",
  rg: "",
  rgIssuer: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  emergencyContact: "",
  emergencyPhone: "",
  relationship: "",
  mainComplaint: "",
  medicalHistory: "",
  currentMedications: "",
  allergies: "",
  documents: {},
};

export function ClientRegistration() {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo não pode exceder 5MB",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [fieldName]: file,
        },
      }));

      setUploadedFiles((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const formatZipCode = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatCPF(e.target.value);
    handleInputChange(e);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatPhone(e.target.value);
    handleInputChange(e);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatZipCode(e.target.value);
    handleInputChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos obrigatórios
      if (!formData.fullName || !formData.email || !formData.cpf) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // Aqui você faria a chamada ao tRPC para salvar os dados
      console.log("Dados do cliente:", formData);
      console.log("Arquivos:", uploadedFiles);

      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso!",
      });

      // Resetar formulário
      setFormData(initialFormData);
      setUploadedFiles({});
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cadastro de Cliente</h1>
        <p className="text-muted-foreground mt-2">
          Preencha todas as informações para criar um novo perfil de cliente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="joao@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone *</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                <Input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gênero</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="prefer_not_to_say">Prefiro não informar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Documentação */}
        <Card>
          <CardHeader>
            <CardTitle>Documentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CPF *</label>
                <Input
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">RG</label>
                <Input
                  name="rg"
                  value={formData.rg}
                  onChange={handleInputChange}
                  placeholder="0000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Órgão Emissor RG</label>
                <Input
                  name="rgIssuer"
                  value={formData.rgIssuer}
                  onChange={handleInputChange}
                  placeholder="SSP"
                />
              </div>
            </div>

            {/* Upload de Documentos */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-medium">Upload de Documentos</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "cpfFile")}
                    className="hidden"
                    id="cpf-upload"
                  />
                  <label htmlFor="cpf-upload" className="cursor-pointer">
                    <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">CPF</p>
                    {uploadedFiles.cpfFile && (
                      <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles.cpfFile}</p>
                    )}
                  </label>
                </div>

                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "rgFile")}
                    className="hidden"
                    id="rg-upload"
                  />
                  <label htmlFor="rg-upload" className="cursor-pointer">
                    <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">RG</p>
                    {uploadedFiles.rgFile && (
                      <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles.rgFile}</p>
                    )}
                  </label>
                </div>

                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "addressProofFile")}
                    className="hidden"
                    id="address-upload"
                  />
                  <label htmlFor="address-upload" className="cursor-pointer">
                    <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Comprovante Endereço</p>
                    {uploadedFiles.addressProofFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {uploadedFiles.addressProofFile}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Rua *</label>
                <Input
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Rua das Flores"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número *</label>
                <Input
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Complemento</label>
              <Input
                name="complement"
                value={formData.complement}
                onChange={handleInputChange}
                placeholder="Apto 42"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bairro *</label>
                <Input
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Centro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CEP *</label>
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleZipCodeChange}
                  placeholder="00000-000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cidade *</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado *</label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 4: Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contato de Emergência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Maria Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Relação</label>
                <Input
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  placeholder="Mãe"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 5: Informações Clínicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Clínicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Queixa Principal</label>
              <textarea
                name="mainComplaint"
                value={formData.mainComplaint}
                onChange={handleInputChange}
                placeholder="Descreva o motivo principal da consulta"
                className="w-full px-3 py-2 border border-input rounded-md min-h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Histórico Médico</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                placeholder="Descreva doenças, cirurgias e condições prévias"
                className="w-full px-3 py-2 border border-input rounded-md min-h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Medicamentos Atuais</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
                placeholder="Liste os medicamentos em uso"
                className="w-full px-3 py-2 border border-input rounded-md min-h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alergias</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="Descreva alergias conhecidas"
                className="w-full px-3 py-2 border border-input rounded-md min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Salvando..." : "Salvar Cliente"}
          </Button>
          <Button type="button" variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
