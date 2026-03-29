import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Calendar, Clock, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, User, Phone, Mail, MessageSquare } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";

const AVAILABLE_HOURS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function BookingPublic() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const start = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter(d => d.getDay() !== 0 && d.getDay() !== 6 && d >= new Date());
  }, [weekOffset]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !name) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setIsSubmitting(true);
    // Simulate booking - in production this would call the public booking API
    await new Promise(r => setTimeout(r, 1500));
    setIsBooked(true);
    setIsSubmitting(false);
    toast.success("Consulta agendada com sucesso!");
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">Consulta Agendada!</h2>
              <p className="text-muted-foreground mt-2">
                {format(selectedDate!, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Você receberá uma confirmação por WhatsApp/Telegram com o link para adicionar ao seu calendário.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setLocation("/site")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao site
              </Button>
              <Button asChild>
                <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4 mr-2" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <div className="glass border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => setLocation("/site")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-serif font-bold">Psi. Daniela Coelho</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Date */}
        {step === 1 && (
          <Card className="border-0 shadow-sm max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-xl">Escolha a Data</CardTitle>
              <p className="text-sm text-muted-foreground">Selecione o dia da sua consulta</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {weekDays.length > 0 && format(weekDays[0], "MMMM yyyy", { locale: ptBR })}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset(weekOffset + 1)}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {weekDays.map(day => (
                  <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                    className={`p-3 rounded-xl text-center transition-all ${selectedDate && isSameDay(day, selectedDate) ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent border"}`}>
                    <p className="text-xs uppercase font-medium">{format(day, "EEE", { locale: ptBR })}</p>
                    <p className="text-lg font-bold mt-1">{format(day, "dd")}</p>
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={!selectedDate} onClick={() => setStep(2)}>
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && (
          <Card className="border-0 shadow-sm max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-xl">Escolha o Horário</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_HOURS.map(time => (
                  <button key={time} onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${selectedTime === time ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent border"}`}>
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{time}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Button>
                <Button className="flex-1" disabled={!selectedTime} onClick={() => setStep(3)}>
                  Continuar <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Personal Info */}
        {step === 3 && (
          <Card className="border-0 shadow-sm max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-xl">Seus Dados</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às {selectedTime}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Nome Completo *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> WhatsApp</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Algo que gostaria de compartilhar antes da consulta?" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Button>
                <Button className="flex-1" disabled={!name || isSubmitting} onClick={handleSubmit}>
                  {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
