import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function PublicScheduling() {
  const [step, setStep] = useState<"info" | "datetime" | "confirm">("info");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    appointmentType: "routine",
    modality: "presential",
    selectedDate: null as Date | null,
    selectedTime: "",
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mutation para criar agendamento pendente
  const createPendingAppointment = trpc.appointments.createPending.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setStep("info");
        setFormData({
          name: "",
          email: "",
          phone: "",
          appointmentType: "routine",
          modality: "presential",
          selectedDate: null,
          selectedTime: "",
        });
        setSubmitted(false);
      }, 3000);
    },
  });

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  // Horários disponíveis
  const availableTimes = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectDate = (date: Date) => {
    setFormData({
      ...formData,
      selectedDate: date,
      selectedTime: "",
    });
  };

  const handleSelectTime = (time: string) => {
    setFormData({
      ...formData,
      selectedTime: time,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedDate || !formData.selectedTime) {
      alert("Por favor, selecione data e horário");
      return;
    }

    setLoading(true);
    try {
      await createPendingAppointment.mutateAsync({
        patientName: formData.name,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        appointmentType: formData.appointmentType as any,
        modality: formData.modality as any,
        preferredDate: formData.selectedDate,
        preferredTime: formData.selectedTime,
      });
    } catch (error) {
      console.error("Erro ao agendar:", error);
      alert("Erro ao agendar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return false;
    return isDateInPast(date) || date.getDay() === 0 || date.getDay() === 6; // Desabilitar passado e fins de semana
  };

  const monthName = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const appointmentTypeLabels = {
    first: "Primeiro Atendimento",
    return: "Retorno",
    routine: "Rotina",
    evaluation: "Avaliação",
    follow_up: "Follow-up",
    emergency: "Emergência",
  };

  const modalityLabels = {
    online: "Online",
    presential: "Presencial",
    hybrid: "Híbrido",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Agende sua Consulta
          </h1>
          <p className="text-lg text-gray-600">
            Com a Dra. Daniela de Oliveira Coelho
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Psicóloga Clínica - CRP 06/123456-SP
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <Card className="mb-6 border-2 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Agendamento Solicitado com Sucesso!
                  </p>
                  <p className="text-sm text-green-800">
                    Você receberá um email de confirmação em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 1: Personal Information */}
        {step === "info" && (
          <Card className="border-2 border-green-500 border-dashed">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Preencha seus dados para agendar uma consulta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (formData.name && formData.email && formData.phone) {
                    setStep("datetime");
                  } else {
                    alert("Por favor, preencha todos os campos");
                  }
                }}
                className="space-y-6"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                    className="border-2 border-green-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu.email@exemplo.com"
                    required
                    className="border-2 border-green-200"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone/WhatsApp *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    required
                    className="border-2 border-green-200"
                  />
                </div>

                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Atendimento *
                  </label>
                  <Select
                    value={formData.appointmentType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, appointmentType: value })
                    }
                  >
                    <SelectTrigger className="border-2 border-green-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">Primeiro Atendimento</SelectItem>
                      <SelectItem value="return">Retorno</SelectItem>
                      <SelectItem value="routine">Rotina</SelectItem>
                      <SelectItem value="evaluation">Avaliação</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Modality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidade *
                  </label>
                  <Select
                    value={formData.modality}
                    onValueChange={(value) =>
                      setFormData({ ...formData, modality: value })
                    }
                  >
                    <SelectTrigger className="border-2 border-green-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presential">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
                >
                  Próximo: Escolher Data e Hora
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  * Campos obrigatórios
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Date and Time Selection */}
        {step === "datetime" && (
          <Card className="border-2 border-green-500 border-dashed">
            <CardHeader>
              <CardTitle>Escolha Data e Hora</CardTitle>
              <CardDescription>
                Clique no dia e depois no horário desejado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Calendar */}
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                      )
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, idx) => {
                    const isDisabled = isDateDisabled(date);
                    const isSelected =
                      formData.selectedDate &&
                      date &&
                      formData.selectedDate.toDateString() === date.toDateString();

                    return (
                      <button
                        key={idx}
                        onClick={() => date && !isDisabled && handleSelectDate(date)}
                        disabled={isDisabled}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${!date ? "bg-transparent" : ""}
                          ${isDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                          ${
                            isSelected
                              ? "bg-green-600 text-white"
                              : !isDisabled && date
                              ? "bg-green-100 text-gray-900 hover:bg-green-200"
                              : ""
                          }
                        `}
                      >
                        {date?.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {formData.selectedDate && (
                <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                  <h4 className="font-semibold mb-4">
                    Horários disponíveis para{" "}
                    {formData.selectedDate.toLocaleDateString("pt-BR")}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleSelectTime(time)}
                        className={`
                          py-2 px-3 rounded-lg font-medium transition-all
                          ${
                            formData.selectedTime === time
                              ? "bg-green-600 text-white"
                              : "bg-green-100 text-gray-900 hover:bg-green-200"
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold">Duração: 1 hora</p>
                    <p>
                      {formData.selectedDate && formData.selectedTime
                        ? `${formData.selectedDate.toLocaleDateString("pt-BR")} às ${formData.selectedTime}`
                        : "Selecione data e hora"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("info")}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!formData.selectedDate || !formData.selectedTime}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Confirmation */}
        {step === "confirm" && (
          <Card className="border-2 border-green-500 border-dashed">
            <CardHeader>
              <CardTitle>Confirme seus Dados</CardTitle>
              <CardDescription>
                Verifique as informações antes de confirmar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold">{formData.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{formData.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-semibold">{formData.phone}</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-semibold">
                      {appointmentTypeLabels[formData.appointmentType as keyof typeof appointmentTypeLabels]}
                    </p>
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Modalidade</p>
                    <p className="font-semibold">
                      {modalityLabels[formData.modality as keyof typeof modalityLabels]}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-600">Data e Hora</p>
                  <p className="font-semibold text-lg text-green-700">
                    {formData.selectedDate?.toLocaleDateString("pt-BR")} às{" "}
                    {formData.selectedTime}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || createPendingAppointment.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
                >
                  {loading || createPendingAppointment.isPending
                    ? "Agendando..."
                    : "Confirmar Agendamento"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("datetime")}
                  className="w-full"
                >
                  Voltar
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center">
                Ao confirmar, você concorda em receber notificações por email e WhatsApp
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Dúvidas? Entre em contato:</p>
          <p className="font-semibold text-gray-900">
            WhatsApp: (11) 99999-9999 | Email: dani@exemplo.com
          </p>
        </div>
      </div>
    </div>
  );
}
