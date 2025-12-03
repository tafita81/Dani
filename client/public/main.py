"""
main.py
=======

Este é o ponto de entrada para executar a automação de publicações em redes sociais.
Ao rodar este arquivo em um ambiente como o Replit, o agendador será iniciado
em segundo plano e fará publicações automáticas nas plataformas configuradas.

Pré‑requisitos:

1. Defina as variáveis de ambiente no painel de "Secrets" do Replit (ou em um
   arquivo `.env`) com as credenciais de cada plataforma:
   - `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ID`
   - `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_PAGE_ID`
   - `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR_URN`
   - `YOUTUBE_CREDENTIALS_JSON` (caminho para credenciais de serviço)
   - `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_ID`
   - `SLACK_WEBHOOK_URL` (opcional, para logs)

2. Crie um diretório `conteudos/` com subpastas. Cada subpasta deve conter
   um arquivo `metadata.json` com campos `title`, `caption`, `description` e
   opcionalmente `link`, além de um arquivo de mídia (`.jpg`, `.png` ou
   `.mp4`) chamado `media.jpg`, `media.png` ou `video.mp4`. O script seleciona
   aleatoriamente uma destas pastas a cada post.

3. Defina `SCHEDULE_CONFIG` como JSON em uma variável de ambiente. Esse
   dicionário mapeia o nome da plataforma para uma expressão CRON (seguindo
   formato Unix). Por exemplo:

   ```json
   {
       "instagram": "0 8 * * *",   // 08:00 todos os dias
       "facebook":  "30 8 * * *",   // 08:30 todos os dias
       "linkedin":  "0 9 * * 1-5", // 09:00 de segunda a sexta
       "pinterest": "0 10 * * *",  // 10:00 todos os dias
       "youtube":   "0 12 * * 3"   // 12:00 nas quartas-feiras
   }
   ```

4. Instale as dependências listadas em `requirements.txt` (APScheduler,
   requests e, opcionalmente, google-api-python-client para YouTube).

5. Execute `python main.py`. O processo fica em loop infinito e só pode ser
   encerrado com Ctrl+C. Em produção, recomendamos usar o Replit sempre
   ligado ou um servidor.

Para ajustar comportamentos específicos (como upload no TikTok ou novas
plataformas), estenda a classe `SocialPoster` conforme mostrado no
`automacao_social.py`.
"""

from automacao_social import SocialScheduler


def main() -> None:
    """Inicializa e inicia o agendador de postagens."""
    scheduler = SocialScheduler()
    scheduler.start()


if __name__ == "__main__":
    main()
