import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular envio (em produção, isso seria uma chamada API real)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Aqui você poderia integrar com um serviço real como:
      // - Formspree (https://formspree.io)
      // - EmailJS (https://www.emailjs.com)
      // - Sua própria API backend

      console.log("Formulário enviado:", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });

      // Resetar mensagem após 5 segundos
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Contato</span>
          </a>
          <a href="/" className="text-foreground hover:text-primary transition">
            ← Voltar
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div>
            <h1 className="text-4xl font-bold text-primary mb-6">Entre em Contato</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Tem dúvidas sobre a estratégia ou o sistema de automação? Envie uma mensagem e entraremos em contato em breve.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">contato@autosocial.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Telefone</h3>
                  <p className="text-muted-foreground">+55 (11) 98765-4321</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Localização</h3>
                  <p className="text-muted-foreground">São Paulo, Brasil</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Tempo de Resposta</h3>
              <p className="text-sm text-muted-foreground">
                Respondemos todas as mensagens em até 24 horas durante dias úteis.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 border border-border">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">Mensagem Enviada!</h3>
                  <p className="text-muted-foreground mb-6">
                    Obrigado pelo contato. Entraremos em contato em breve.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Enviar Outra Mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white text-foreground"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white text-foreground"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white text-foreground"
                        placeholder="(11) 98765-4321"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Assunto *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white text-foreground"
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="duvida">Dúvida sobre a estratégia</option>
                        <option value="instalacao">Problema de instalação</option>
                        <option value="configuracao">Dúvida de configuração</option>
                        <option value="parceria">Proposta de parceria</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white text-foreground resize-none"
                      placeholder="Descreva sua dúvida ou mensagem aqui..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                    >
                      {loading ? "Enviando..." : "Enviar Mensagem"}
                      {!loading && <Send className="ml-2 w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ name: "", email: "", phone: "", subject: "", message: "" })}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      Limpar
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    * Campos obrigatórios. Seus dados serão tratados conforme nossa política de privacidade.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
