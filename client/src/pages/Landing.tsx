import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Brain, Heart, Shield, Calendar, Star, ArrowRight, MessageSquare,
  Instagram, Send, Phone, Mail, MapPin, Clock, CheckCircle2, Sparkles,
  Youtube, Globe
} from "lucide-react";
import { useLocation } from "wouter";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

export default function Landing() {
  const [, setLocation] = useLocation();

  const approaches = [
    { icon: Brain, title: "Terapia Cognitivo-Comportamental", desc: "Reestruturação de pensamentos disfuncionais e mudança de padrões comportamentais." },
    { icon: Shield, title: "Terapia do Esquema", desc: "Identificação e transformação de esquemas emocionais desadaptativos desde a infância." },
    { icon: Heart, title: "Gestalt-Terapia", desc: "Consciência do aqui e agora, integração de experiências e crescimento pessoal." },
  ];

  const benefits = [
    "Atendimento personalizado e humanizado",
    "Abordagem integrativa baseada em evidências",
    "Ambiente seguro e acolhedor",
    "Flexibilidade de horários",
    "Atendimento presencial e online",
    "Sigilo profissional garantido",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-serif font-bold text-lg">Psi. Daniela Coelho</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
            <a href="#abordagens" className="text-muted-foreground hover:text-foreground transition-colors">Abordagens</a>
            <a href="#depoimentos" className="text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
            <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </div>
          <Button size="sm" disabled className="shadow-lg opacity-50 cursor-not-allowed">
            <Calendar className="h-4 w-4 mr-2" /> Agendamentos em Breve
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl orb" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary/8 blur-3xl orb orb-delay-1" />

        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} className="space-y-6">
              <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1">
                <Heart className="h-3 w-3 text-primary" /> Psicologia Clínica
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
                Cuide da sua <span className="text-primary">saúde mental</span> com quem entende
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Psicóloga clínica especializada em TCC, Terapia do Esquema e Gestalt-terapia.
                Um espaço seguro para seu autoconhecimento e transformação.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" disabled className="shadow-xl text-base opacity-50 cursor-not-allowed">
                  <Calendar className="h-5 w-5 mr-2" /> Agendamentos em Breve
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="gap-2">
                    <MessageSquare className="h-5 w-5" /> WhatsApp
                  </a>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground">Avaliação 5.0 no Google</p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl" />
                <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 to-accent overflow-hidden p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-32 w-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold">Psi. Daniela Coelho</h3>
                    <p className="text-sm text-muted-foreground">CRP XX/XXXXX</p>
                    <p className="text-sm text-muted-foreground">Psicóloga Clínica</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Approaches */}
      <section id="abordagens" className="py-20 bg-accent/30">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Abordagens Terapêuticas</Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">O melhor de cada abordagem</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Integração das técnicas mais eficazes da psicologia moderna, personalizadas para cada paciente.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {approaches.map((a, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full glass">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <a.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{a.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section id="sobre" className="py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} className="space-y-6">
              <Badge variant="outline">Por que me escolher?</Badge>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold">Compromisso com seu bem-estar</h2>
              <div className="space-y-3">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="border-0 shadow-lg glass p-8">
                <div className="space-y-6 text-center">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-bold">Tecnologia a serviço do cuidado</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Utilizo ferramentas modernas para otimizar seu atendimento: agendamento online,
                    acompanhamento de evolução, lembretes automáticos e comunicação facilitada.
                  </p>
                  <Button onClick={() => setLocation("/agendar")} className="w-full">
                    Agendar Agora <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">Pronta para dar o primeiro passo?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Agende sua consulta de forma rápida e prática. Escolha o melhor horário para você.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/agendar")} className="shadow-xl">
              <Calendar className="h-5 w-5 mr-2" /> Agendar Online
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-5 w-5 mr-2" /> Falar no WhatsApp
              </a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Contact & Social */}
      <section id="contato" className="py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold">Entre em Contato</h2>
            <p className="text-muted-foreground mt-2">Estou presente em todas as plataformas</p>
          </motion.div>
          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary/30 hover:bg-accent/50 transition-all">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"><MessageSquare className="h-5 w-5 text-green-600" /></div>
              <div><p className="font-medium text-sm">WhatsApp</p><p className="text-xs text-muted-foreground">Fale comigo</p></div>
            </a>
            <a href="https://instagram.com/psidanielacoelho" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary/30 hover:bg-accent/50 transition-all">
              <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center"><Instagram className="h-5 w-5 text-pink-600" /></div>
              <div><p className="font-medium text-sm">Instagram</p><p className="text-xs text-muted-foreground">@psidanielacoelho</p></div>
            </a>
            <a href="https://t.me/psidanielacoelho" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary/30 hover:bg-accent/50 transition-all">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><Send className="h-5 w-5 text-blue-600" /></div>
              <div><p className="font-medium text-sm">Telegram</p><p className="text-xs text-muted-foreground">Agendamentos em breve</p></div>
            </a>
            <a href="https://youtube.com/@psidanielacoelho" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary/30 hover:bg-accent/50 transition-all">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center"><Youtube className="h-5 w-5 text-red-600" /></div>
              <div><p className="font-medium text-sm">YouTube</p><p className="text-xs text-muted-foreground">Conteúdo gratuito</p></div>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-accent/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Psi. Daniela Coelho</span>
          </div>
          <p className="text-xs text-muted-foreground">
            CRP XX/XXXXX — Todos os direitos reservados
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:bg-green-600 transition-colors pulse-glow z-50">
        <MessageSquare className="h-6 w-6" />
      </a>
    </div>
  );
}
