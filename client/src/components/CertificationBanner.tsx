import React from "react";
import { AlertCircle, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CertificationBanner() {
  const certificationDate = new Date("2027-01-01");
  const today = new Date();
  const daysRemaining = Math.ceil(
    (certificationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const monthsRemaining = Math.ceil(daysRemaining / 30);

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-md">
      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div className="flex-shrink-0 mt-1">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            🎓 Sistema em Processo de Certificação
          </h3>

          <p className="text-amber-800 mb-4">
            O sistema de agendamento e pagamento de consultas estará disponível a partir de{" "}
            <span className="font-bold">janeiro de 2027</span>, quando Psicóloga Daniela Coelho
            completar sua certificação junto ao Conselho Regional de Psicologia (CRP).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Informações de Certificação */}
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-900">Previsão de Ativação</span>
              </div>
              <p className="text-sm text-gray-600">
                {monthsRemaining > 0
                  ? `Aproximadamente ${monthsRemaining} mês(es) restante(s)`
                  : "Em breve!"}
              </p>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-amber-900">Status Atual</span>
              </div>
              <p className="text-sm text-gray-600">Em processo de certificação</p>
            </div>
          </div>

          {/* Funcionalidades Disponíveis */}
          <div className="bg-white rounded-lg p-4 border border-amber-200 mb-4">
            <h4 className="font-semibold text-amber-900 mb-2">✅ Funcionalidades Disponíveis Agora:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Conteúdo educativo sobre psicologia clínica</li>
              <li>• Informações sobre abordagens terapêuticas (TCC, TE, Gestalt)</li>
              <li>• Formulários de autoavaliação (PHQ-9, GAD-7)</li>
              <li>• Blog com artigos e insights</li>
              <li>• Contato direto via WhatsApp</li>
            </ul>
          </div>

          {/* Funcionalidades Futuras */}
          <div className="bg-white rounded-lg p-4 border border-amber-200 mb-4">
            <h4 className="font-semibold text-amber-900 mb-2">🚀 Funcionalidades em 2027:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Agendamento de consultas online</li>
              <li>• Planos de inscrição mensal</li>
              <li>• Pagamento seguro via Stripe</li>
              <li>• Portal do paciente com histórico</li>
              <li>• Relatórios de progresso clínico</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                const element = document.getElementById("waitlist-section");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              📬 Receber Notificação
            </Button>

            <Button
              variant="outline"
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
              onClick={() => {
                window.open("https://www.crp.org.br", "_blank");
              }}
            >
              📖 Saiba Mais sobre CRP
            </Button>
          </div>
        </div>

        {/* Fechar Banner (opcional) */}
        <button
          onClick={(e) => {
            const banner = (e.target as HTMLElement).closest(".bg-gradient-to-r");
            if (banner) {
              banner.style.display = "none";
              localStorage.setItem("hideCertificationBanner", "true");
            }
          }}
          className="text-amber-600 hover:text-amber-800 flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function CertificationBannerContainer() {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const hidden = localStorage.getItem("hideCertificationBanner");
    if (hidden === "true") {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return <CertificationBanner />;
}
