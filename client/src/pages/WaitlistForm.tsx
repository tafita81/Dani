import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Heart, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaitlistFormData {
  name: string;
  email: string;
  phone: string;
  interest: "consultas" | "informacoes" | "ambos";
}

const initialFormData: WaitlistFormData = {
  name: "",
  email: "",
  phone: "",
  interest: "ambos",
};

export function WaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatPhone(e.target.value);
    handleInputChange(e);
  };

  const validateForm = (): boolean => {
    if (!formData.name || formData.name.trim().length < 3) {
      toast({
        title: "Erro",
        description: "Nome deve ter pelo menos 3 caracteres",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envio de dados
      console.log("Dados da waitlist:", formData);

      // Aqui você faria a chamada ao tRPC para salvar os dados
      // await trpc.waitlist.subscribe.mutate(formData);

      setIsSuccess(true);
      setFormData(initialFormData);

      toast({
        title: "Sucesso!",
        description: "Você foi adicionado à lista de espera. Verifique seu email!",
      });

      // Resetar sucesso após 5 segundos
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar na lista de espera",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">Cadastro Confirmado!</h3>
          <p className="text-green-800 mb-4">
            Você foi adicionado à nossa lista de espera. Enviaremos um email de confirmação em
            breve.
          </p>
          <p className="text-sm text-green-700">
            Você receberá uma notificação assim que o sistema estiver disponível em 2027.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="waitlist-section" className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Fique na Lista de Espera
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Receba uma notificação assim que o sistema estiver disponível em 2027
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium mb-1">Telefone (opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Interesse */}
            <div>
              <label className="block text-sm font-medium mb-1">O que você está procurando? *</label>
              <select
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                required
              >
                <option value="ambos">
                  Ambos - Consultas + Informações Educativas
                </option>
                <option value="consultas">
                  Consultas - Agendamento de Sessões
                </option>
                <option value="informacoes">
                  Informações - Conteúdo Educativo
                </option>
              </select>
            </div>

            {/* Aviso */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                ✓ Você receberá um email de confirmação<br />
                ✓ Seus dados são confidenciais e não serão compartilhados<br />
                ✓ Pode desinscrever-se a qualquer momento
              </p>
            </div>

            {/* Botão */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Cadastrando..." : "Adicionar à Lista de Espera"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
