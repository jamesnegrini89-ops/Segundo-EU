## Alertas reais no celular (em preparacao)

O projeto agora inclui a estrutura de **Firebase Cloud Messaging e Cloud Functions** para lembretes com o site fechado. **Mesclar o pull request nao ativa o envio por si so:** e necessario gerar chave VAPID publica, autorizar o Android, ativar o faturamento Blaze conforme sua decisao e implantar as Functions e o indice do Firestore. Os detalhes estao em [docs/avisos-push.md](docs/avisos-push.md).

Avisos push podem ser atrasados pelo Android; nao sao equivalentes a alarmes nativos garantidos.

# Segundo Eu — Versão GitHub Pages (local)

Projeto PWA básico para uso pessoal: **Início, Agenda, Tarefas, Memórias, Apoio Policial e Mais**.
Usa HTML/CSS/JS sem build e pode ser publicado por GitHub Pages.

## Publicar no GitHub

1. Crie um **repositório novo** no GitHub (por exemplo `segundo-eu`).
2. Faça upload **dos arquivos e da pasta `icons` deste diretório**, preservando os nomes e estrutura. O arquivo inicial deve se chamar **`index.html`**.
3. Commit changes.
4. Entre em **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**; selecione **main** e **/(root)**; clique **Save**.
5. Abra o endereço mostrado no Pages quando a publicação estiver concluída. Exemplo: `https://SEU-USUARIO.github.io/segundo-eu/`.

### IMPORTANTE — migração dos seus registros anteriores

Se você já cadastrou tarefas e memórias no arquivo local anterior, **antes** de usar o site:
* Abra o Segundo Eu antigo no computador → **Mais → Baixar backup**.
* Abra o novo Segundo Eu no GitHub Pages → **Mais → Restaurar backup** e escolha esse JSON.
* O navegador trata `file:///...` e `https://...` como locais separados: dados antigos **não são migrados automaticamente**.
* Faça backups frequentes; o site ainda **não sincroniza entre aparelhos**.

## Módulo Apoio Policial

* O usuário pode **escrever ou ditar** o relato (Chrome com suporte a reconhecimento de fala e microfone autorizado).
* A ferramenta **organiza um rascunho textual**, com pontos para conferência. **Não usa IA online nesta versão** e não confirma fatos, tipificação ou legalidade.
* Os relatos **não são armazenados automaticamente** pelo aplicativo. O botão Baixar TXT salva localmente por ação do usuário.
* **Não inserir dados reais sigilosos** em serviços não autorizados; o reconhecimento de voz pode envolver processamento externo pelo navegador.
* A consulta automatizada ao POP, legislação e Gemini **não está pronta**. Exigirá backend privado, controle de acesso, fontes legais verificadas, tratamento adequado de dados e aprovação institucional.
* Nunca substituir a análise do policial responsável, as normas vigentes ou os sistemas oficiais.

## Restrições deliberadas de segurança

A coletânea do POP de abril de 2026 foi recebida para análise, mas a própria publicação indica público interno. **Nenhum texto do POP, PDF ou trechos internos está incluído aqui.** A referência ao documento não equivale a integração técnica.

Não coloque no repositório PDFs institucionais restritos, identificações pessoais, boletins verdadeiros, senhas nem chaves secretas do Gemini.
O GitHub Pages publica um **site estático**, portanto não protege uma base restrita nem executa a IA de servidor.

## Próxima etapa (separada): Firebase + Gemini

Adicionar autenticação, sincronização protegida e backend/API de IA autorizado, sem embutir chaves secretas nem material interno no frontend. A integração ainda não está disponível nesta entrega.

## Arquivos

- `index.html`: página inicial.
- `app.css`: visual e responsividade.
- `app.js`: funcionamento da versão local.
- `service-worker.js`: cache de arquivos públicos para PWA.
- `manifest.webmanifest`: metadados para instalação.
- `icons/icon.svg`: ícone.

Sem bibliotecas de execução obrigatórias. Abra `index.html` no computador ou use um servidor local para simular o GitHub Pages.
