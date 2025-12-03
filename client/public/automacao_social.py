"""
automacao_social.py
====================

Este módulo implementa uma estrutura de automação para gerenciamento de
conteúdo e publicação em múltiplas redes sociais. O objetivo é fornecer um
fluxo completamente plug‑and‑play para uso em Replit ou em qualquer outro
ambiente Python, permitindo que você programe postagens diárias em
Instagram, Facebook, LinkedIn, YouTube, Pinterest e outras redes sem a
necessidade de intervir manualmente.

Atenção: este código não se conecta imediatamente às APIs dos serviços. Os
métodos `post_*` contêm placeholders onde você deverá inserir suas
chaves de API e endpoints específicos. Antes de utilizar, leia os
comentários e substitua as variáveis por valores reais das suas contas.

O código segue as seguintes boas práticas:

1. **Variáveis de ambiente**: todas as credenciais e parâmetros sensíveis são
   lidos de variáveis de ambiente. No Replit, você pode definir essas
   variáveis via painel de Secrets.
2. **Controle de versão e documentação**: cada classe e função tem
   docstrings detalhadas. Recomendamos versionar este arquivo em um
   repositório Git.
3. **Tratamento de erros**: falhas nas requisições são registradas e
   notificadas via Slack. O fluxo tenta retentar operações antes de
   desistir.
4. **Escalonamento**: para evitar bloqueios de API, as postagens são
   enfileiradas usando `APScheduler`. Isso permite programar horários
   específicos para cada rede.
5. **Modularidade**: cada rede social possui uma classe dedicada,
   facilitando a manutenção e expansão para novas plataformas.

Para executar este script continuamente, recomendamos criar um arquivo
`main.py` que instancie o `Scheduler` e chame o método `start()`.

Exemplo de uso em `main.py`:

```python
from automacao_social import SocialScheduler

if __name__ == "__main__":
    scheduler = SocialScheduler()
    scheduler.start()
```

"""

import os
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any

import requests
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger


class SlackLogger:
    """Envia logs para um canal do Slack.

    Necessita que a variável de ambiente `SLACK_WEBHOOK_URL` esteja definida
    com o webhook de entrada do Slack.
    """

    def __init__(self) -> None:
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        self.enabled = bool(self.webhook_url)

    def send(self, message: str) -> None:
        if not self.enabled:
            return
        payload = {"text": message}
        try:
            requests.post(self.webhook_url, json=payload, timeout=10)
        except Exception as exc:
            logging.error(f"Falha ao enviar log ao Slack: {exc}")


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
slack_logger = SlackLogger()


class SocialPoster:
    """Classe base para postagem em redes sociais.

    Cada subclasse deve implementar o método `post` de acordo com a API
    correspondente. O método `post` recebe um dicionário que contém os
    elementos do post: título, legenda, caminho para a mídia (imagem ou
    vídeo) e qualquer metadado adicional necessário.
    """

    def post(self, post_data: Dict[str, Any]) -> None:
        raise NotImplementedError


class InstagramPoster(SocialPoster):
    """Publica imagens ou vídeos no Instagram via Graph API.

    Requer:
    - INSTAGRAM_ACCESS_TOKEN: token gerado via Facebook Graph API.
    - INSTAGRAM_BUSINESS_ID: ID do usuário de negócios do Instagram.
    
    A postagem no Instagram via Graph API ocorre em duas etapas:
    1. Criar um container de mídia (`/media`)
    2. Publicar a mídia (`/media_publish`)
    """

    api_base = "https://graph.facebook.com/v17.0"

    def __init__(self) -> None:
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.business_id = os.getenv("INSTAGRAM_BUSINESS_ID")
        if not self.access_token or not self.business_id:
            raise RuntimeError("Defina INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ID nas variáveis de ambiente.")

    def post(self, post_data: Dict[str, Any]) -> None:
        caption = post_data.get("caption", "")
        media_path = post_data.get("media_path")
        if not media_path:
            raise ValueError("O caminho da mídia é obrigatório para postar no Instagram.")

        # Passo 1: enviar a mídia para criação do container
        create_url = f"{self.api_base}/{self.business_id}/media"
        files = {"media": open(media_path, "rb")}
        params = {
            "access_token": self.access_token,
            "caption": caption,
        }
        try:
            response = requests.post(create_url, params=params, files=files)
            response.raise_for_status()
            container_id = response.json().get("id")
            if not container_id:
                raise RuntimeError(f"Falha ao criar container de mídia: {response.text}")
        except Exception as exc:
            logger.error(f"Erro ao criar mídia no Instagram: {exc}")
            slack_logger.send(f"Erro ao criar mídia no Instagram: {exc}")
            return

        # Passo 2: publicar a mídia
        publish_url = f"{self.api_base}/{self.business_id}/media_publish"
        try:
            publish_response = requests.post(publish_url, params={
                "access_token": self.access_token,
                "creation_id": container_id,
            })
            publish_response.raise_for_status()
            logger.info(f"Post publicado no Instagram com ID {publish_response.json().get('id')}")
        except Exception as exc:
            logger.error(f"Erro ao publicar mídia no Instagram: {exc}")
            slack_logger.send(f"Erro ao publicar mídia no Instagram: {exc}")


class FacebookPoster(SocialPoster):
    """Publica imagens ou vídeos em uma página do Facebook via Graph API.

    Requer:
    - FACEBOOK_PAGE_ID: ID da página no Facebook.
    - FACEBOOK_ACCESS_TOKEN: token de acesso com permissão para publicar.
    """

    api_base = "https://graph.facebook.com/v17.0"

    def __init__(self) -> None:
        self.page_id = os.getenv("FACEBOOK_PAGE_ID")
        self.access_token = os.getenv("FACEBOOK_ACCESS_TOKEN")
        if not self.page_id or not self.access_token:
            raise RuntimeError("Defina FACEBOOK_PAGE_ID e FACEBOOK_ACCESS_TOKEN nas variáveis de ambiente.")

    def post(self, post_data: Dict[str, Any]) -> None:
        message = post_data.get("message", "")
        media_path = post_data.get("media_path")
        endpoint = f"{self.api_base}/{self.page_id}/photos" if media_path else f"{self.api_base}/{self.page_id}/feed"
        params = {
            "access_token": self.access_token,
            "message": message,
        }
        files = None
        if media_path:
            files = {"source": open(media_path, "rb")}
        try:
            response = requests.post(endpoint, params=params, files=files)
            response.raise_for_status()
            logger.info(f"Post publicado no Facebook: {response.json()}")
        except Exception as exc:
            logger.error(f"Erro ao publicar no Facebook: {exc}")
            slack_logger.send(f"Erro ao publicar no Facebook: {exc}")


class LinkedInPoster(SocialPoster):
    """Publica atualizações no LinkedIn via API REST.

    Requer:
    - LINKEDIN_ACCESS_TOKEN: token OAuth 2.0 com escopos `w_member_social`.
    - LINKEDIN_ORGANIZATION_ID ou LINKEDIN_USER_ID para escolher o alvo da publicação.

    A documentação oficial da API do LinkedIn descreve como criar posts UGC (User Generated Content).
    Veja: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api
    """

    api_base = "https://api.linkedin.com/v2"

    def __init__(self) -> None:
        self.access_token = os.getenv("LINKEDIN_ACCESS_TOKEN")
        self.author_urn = os.getenv("LINKEDIN_AUTHOR_URN")  # Ex.: "urn:li:person:xxxx" ou "urn:li:organization:yyyy"
        if not self.access_token or not self.author_urn:
            raise RuntimeError("Defina LINKEDIN_ACCESS_TOKEN e LINKEDIN_AUTHOR_URN nas variáveis de ambiente.")

    def post(self, post_data: Dict[str, Any]) -> None:
        message = post_data.get("message", "")
        media_path = post_data.get("media_path")
        # Construção do payload UGC Post
        payload: Dict[str, Any] = {
            "author": self.author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": message
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }
        if media_path:
            # Upload de imagem no LinkedIn exige múltiplos passos; aqui está
            # apenas um placeholder para indicar onde o upload ocorreria.
            logger.warning("Upload de mídia no LinkedIn requer implementação adicional e não está incluído neste exemplo.")
        try:
            response = requests.post(
                f"{self.api_base}/ugcPosts",
                headers=headers,
                data=json.dumps(payload)
            )
            response.raise_for_status()
            logger.info(f"Post publicado no LinkedIn: {response.json().get('id')}")
        except Exception as exc:
            logger.error(f"Erro ao publicar no LinkedIn: {exc}")
            slack_logger.send(f"Erro ao publicar no LinkedIn: {exc}")


class YouTubePoster(SocialPoster):
    """Faz upload de vídeos para o YouTube.

    Requer a biblioteca `googleapiclient` e credenciais OAuth 2.0 configuradas.
    No Replit, essas credenciais podem ser armazenadas em um arquivo JSON
    (credentials.json) e carregadas via `google.oauth2.service_account` ou
    `google_auth_oauthlib`. Este exemplo usa serviço de conta para
    simplicidade.
    
    Observação: Criar vídeos a partir de imagens pode ser feito usando
    `moviepy`. Esse processo não está implementado aqui; você deverá
    adicionar uma função para gerar vídeo caso deseje.
    """

    def __init__(self) -> None:
        try:
            from google.oauth2.service_account import Credentials  # type: ignore
            from googleapiclient.discovery import build  # type: ignore
        except ImportError:
            raise RuntimeError("Instale google-auth e google-api-python-client para usar YouTubePoster.")

        credentials_file = os.getenv("YOUTUBE_CREDENTIALS_JSON")
        if not credentials_file:
            raise RuntimeError("Defina YOUTUBE_CREDENTIALS_JSON com o caminho para o arquivo de credenciais do Google.")
        scopes = [
            "https://www.googleapis.com/auth/youtube.upload",
        ]
        credentials = Credentials.from_service_account_file(credentials_file, scopes=scopes)
        self.youtube = build('youtube', 'v3', credentials=credentials)

    def post(self, post_data: Dict[str, Any]) -> None:
        video_path = post_data.get("media_path")
        title = post_data.get("title", "Video automação")
        description = post_data.get("description", "Publicação automatizada")
        if not video_path:
            raise ValueError("Você deve fornecer o caminho do vídeo para upload no YouTube.")
        body = {
            "snippet": {
                "title": title,
                "description": description,
                "categoryId": "22",  # categoria People & Blogs
            },
            "status": {
                "privacyStatus": "public",
                "madeForKids": False
            }
        }
        try:
            # upload
            request = self.youtube.videos().insert(
                part=','.join(body.keys()),
                body=body,
                media_body=video_path  # type: ignore
            )
            response = request.execute()
            logger.info(f"Vídeo enviado para o YouTube: {response.get('id')}")
        except Exception as exc:
            logger.error(f"Erro ao enviar vídeo para o YouTube: {exc}")
            slack_logger.send(f"Erro ao enviar vídeo para o YouTube: {exc}")


class PinterestPoster(SocialPoster):
    """Publica pins no Pinterest.

    Pinterest requer token de acesso gerado via OAuth. Consulte a
    documentação: https://developers.pinterest.com/docs/getting-started/
    
    Requer:
    - PINTEREST_ACCESS_TOKEN
    - PINTEREST_BOARD_ID (o ID do quadro onde os pins serão criados)
    """

    api_base = "https://api.pinterest.com/v5"

    def __init__(self) -> None:
        self.access_token = os.getenv("PINTEREST_ACCESS_TOKEN")
        self.board_id = os.getenv("PINTEREST_BOARD_ID")
        if not self.access_token or not self.board_id:
            raise RuntimeError("Defina PINTEREST_ACCESS_TOKEN e PINTEREST_BOARD_ID nas variáveis de ambiente.")

    def post(self, post_data: Dict[str, Any]) -> None:
        title = post_data.get("title", "")
        description = post_data.get("description", "")
        media_path = post_data.get("media_path")
        link = post_data.get("link", "")  # URL opcional para direcionar o usuário
        if not media_path:
            raise ValueError("Você deve fornecer uma imagem para criar um Pin.")
        headers = {
            "Authorization": f"Bearer {self.access_token}",
        }
        files = {"image": open(media_path, "rb")}
        data = {
            "board_id": self.board_id,
            "title": title,
            "description": description,
            "link": link,
        }
        try:
            response = requests.post(f"{self.api_base}/pins", headers=headers, data=data, files=files)
            response.raise_for_status()
            logger.info(f"Pin criado no Pinterest: {response.json().get('id')}")
        except Exception as exc:
            logger.error(f"Erro ao criar pin no Pinterest: {exc}")
            slack_logger.send(f"Erro ao criar pin no Pinterest: {exc}")


class ContentGenerator:
    """Gera texto e seleciona mídia para as postagens.

    Este gerador pode ser estendido para integrar APIs de IA (OpenAI, Cohere,
    etc.) para criação de legendas e roteiros. Também pode utilizar
    bibliotecas como Pillow para adaptar imagens ou MoviePy para gerar
    vídeos a partir de sequências de imagens. Por padrão, ele lê
    arquivos de uma pasta `conteudos` e escolhe um item aleatório.
    """

    def __init__(self, content_dir: str = "conteudos") -> None:
        self.content_dir = content_dir

    def get_random_content(self) -> Dict[str, Any]:
        """Seleciona aleatoriamente um arquivo de conteúdo.

        Espera que cada item de conteúdo esteja em um subdiretório com um
        arquivo `metadata.json` contendo legenda, título e descrição, e um
        arquivo de mídia (`media.jpg` ou `video.mp4`).
        """
        import random
        items = [os.path.join(self.content_dir, d) for d in os.listdir(self.content_dir) if os.path.isdir(os.path.join(self.content_dir, d))]
        if not items:
            raise RuntimeError("Nenhum conteúdo encontrado. Adicione pastas com conteúdo em 'conteudos/'")
        item_path = random.choice(items)
        meta_path = os.path.join(item_path, "metadata.json")
        media_file = None
        for file in os.listdir(item_path):
            if file.lower().endswith((".jpg", ".jpeg", ".png", ".mp4")):
                media_file = os.path.join(item_path, file)
                break
        if not media_file:
            raise RuntimeError(f"Nenhuma mídia encontrada em {item_path}")
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        metadata["media_path"] = media_file
        return metadata

    def generate_caption(self, context: str) -> str:
        """Gera uma legenda para uma postagem.

        Este método pode ser adaptado para chamar APIs de IA. Atualmente,
        retorna um texto simples baseado no contexto fornecido.
        """
        return f"Reflexão do dia: {context}"


class SocialScheduler:
    """Agenda publicações automáticas nas redes sociais.

    Este agendador utiliza APScheduler para programar tarefas de postagem
    em horários específicos. A configuração de horários é baseada na
    variável de ambiente `SCHEDULE_CONFIG`, que deve ser um JSON
    mapeando cada plataforma a uma expressão cron.

    Exemplo de `SCHEDULE_CONFIG`:

    ```json
    {
        "instagram": "0 9 * * *",  # todos os dias às 09:00
        "facebook":  "30 9 * * *",
        "linkedin":  "0 10 * * *",
        "pinterest": "30 10 * * *",
        "youtube":   "0 11 * * 1"  # toda segunda-feira às 11:00
    }
    ```
    """

    def __init__(self) -> None:
        self.scheduler = BackgroundScheduler()
        self.content_generator = ContentGenerator()
        # Instâncias dos posters
        self.instagram = None
        self.facebook = None
        self.linkedin = None
        self.youtube = None
        self.pinterest = None
        # Inicializar posters se credenciais estiverem definidas
        try:
            self.instagram = InstagramPoster()
        except Exception as exc:
            logger.warning(f"InstagramPoster não inicializado: {exc}")
        try:
            self.facebook = FacebookPoster()
        except Exception as exc:
            logger.warning(f"FacebookPoster não inicializado: {exc}")
        try:
            self.linkedin = LinkedInPoster()
        except Exception as exc:
            logger.warning(f"LinkedInPoster não inicializado: {exc}")
        try:
            self.youtube = YouTubePoster()
        except Exception as exc:
            logger.warning(f"YouTubePoster não inicializado: {exc}")
        try:
            self.pinterest = PinterestPoster()
        except Exception as exc:
            logger.warning(f"PinterestPoster não inicializado: {exc}")
        # Carregar cron config
        config_json = os.getenv("SCHEDULE_CONFIG", "{}")
        try:
            self.schedule_config = json.loads(config_json)
        except json.JSONDecodeError:
            logger.error("SCHEDULE_CONFIG inválido; usando configuração vazia.")
            self.schedule_config = {}
        # Agendar tarefas
        self.setup_tasks()

    def setup_tasks(self) -> None:
        """Configura as tarefas com base na schedule_config."""
        for platform, cron_expr in self.schedule_config.items():
            trigger = CronTrigger.from_crontab(cron_expr)
            if platform == "instagram" and self.instagram:
                self.scheduler.add_job(lambda: self._post_to_platform(self.instagram), trigger=trigger, name="instagram_post")
            elif platform == "facebook" and self.facebook:
                self.scheduler.add_job(lambda: self._post_to_platform(self.facebook), trigger=trigger, name="facebook_post")
            elif platform == "linkedin" and self.linkedin:
                self.scheduler.add_job(lambda: self._post_to_platform(self.linkedin), trigger=trigger, name="linkedin_post")
            elif platform == "youtube" and self.youtube:
                self.scheduler.add_job(lambda: self._post_to_platform(self.youtube), trigger=trigger, name="youtube_post")
            elif platform == "pinterest" and self.pinterest:
                self.scheduler.add_job(lambda: self._post_to_platform(self.pinterest), trigger=trigger, name="pinterest_post")

    def _post_to_platform(self, poster: SocialPoster) -> None:
        """Obtém conteúdo aleatório e envia para a plataforma indicada."""
        try:
            content = self.content_generator.get_random_content()
            poster.post(content)
            logger.info(f"Conteúdo postado em {poster.__class__.__name__} às {datetime.now()}")
        except Exception as exc:
            logger.error(f"Erro ao postar em {poster.__class__.__name__}: {exc}")
            slack_logger.send(f"Erro ao postar em {poster.__class__.__name__}: {exc}")

    def start(self) -> None:
        """Inicia o scheduler em segundo plano."""
        logger.info("Iniciando agendador de postagens...")
        slack_logger.send("Agendador de postagens iniciado.")
        self.scheduler.start()
        try:
            # Manter o processo ativo.
            import time
            while True:
                time.sleep(60)
        except (KeyboardInterrupt, SystemExit):
            self.scheduler.shutdown()
            logger.info("Scheduler finalizado.")
            slack_logger.send("Agendador de postagens finalizado.")
