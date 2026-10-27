# Alertas com o Segundo Eu fechado (Android)

**Estado deste pacote:** codigo preparado; **nao basta mesclar o PR**. O GitHub Pages publica apenas o site. Antes de anunciar notificacoes ativas, e preciso implantar as Cloud Functions e o indice do Firestore no projeto Firebase, cadastrar VAPID, permitir notificacoes no Android e testar entrega real.

## Arquitetura
- O app PWA no Chrome Android pede permissao **so apos clique** em `Tarefas → Ativar avisos`.
- Firebase Cloud Messaging (FCM) fornece um token por dispositivo e usa o `service-worker.js` existente para receber push com o site fechado.
- Cloud Function HTTPS chamavel `registerReminderDevice` armazena o token em `users/{uid}/pushTokens/{sha256(token)}`, protegida por Firebase Authentication + App Check. Ha `unregisterReminderDevice` para desativacao.
- Ao salvar uma **tarefa futura com data e horario**, o aplicativo grava `reminderAtMs` (horario UTC calculado a partir do horario local do aparelho), `reminderStatus: pending`, e exige confirmacao.
- Cloud Function `sendDueTaskReminders` roda a cada minuto, busca tarefas vencidas e nao concluidas, verifica os tokens daquele usuario, envia notificação FCM generica e marca `sent`, `no_device` ou `failed`.
- Ao reabrir a conta, um dispositivo ja autorizado renova seu token.
- O Gemini e a base de tarefas anteriores nao foram alterados.

**Importante:** push Web **nao e alarme de exatidao garantida**; pode atrasar, ou nao chegar se a permissao for revogada, o celular estiver offline, o navegador restringir notificacoes ou o sistema suspender servicos. O Cloud Scheduler verifica aproximadamente uma vez por minuto, nao no segundo exato. Para alarme rigoroso de despertador, sera necessaria integracao Android nativa (Exact Alarm/AlarmManager, sujeita a regras do sistema).

## Ativacao guiada (requer o proprietario)
1. Acesse **Firebase Console → Gemini Project → Configuracoes → Cloud Messaging → Certificados de push da Web**. Crie o par VAPID e copie apenas a **chave publica**. Nunca copie ou divulgue a chave privada nem contas de servico.
2. Veja se **Cloud Messaging API** esta habilitada no projeto.
3. Para implantar Cloud Functions 2a geracao e Cloud Scheduler, confirme o plano **Blaze** (faturamento por uso), aceitando-o **somente se voce concordar com a cobranca potencial**. O Cloud Scheduler tem precos e credito de jobs; configure alertas de orcamento do Google Cloud. Alertas **nao interrompem cobrancas**.
4. Com o PR revisado, use um terminal com Git e Firebase CLI autenticados, ou Cloud Shell. Na pasta raiz deste repositorio:
   ```sh
   npm install --prefix functions
   firebase deploy --only functions --project gen-lang-client-0470777351
   ```
   Nao precisa publicar nenhum segredo no repositorio. Uma conta com permissoes de deploy e APIs ativadas e necessaria.
5. **Indice Firestore:** em Firebase Console → Firestore Database → Indexes, crie um indice composto de **escopo Collection group**, collection ID `items`, campos `reminderStatus` ASC e `reminderAtMs` ASC. Aguarde ate o status indicar que esta pronto.
   
   Alternativamente, `firestore.indexes.json` inclui o indice necessario. **Nao execute** `firebase deploy --only firestore:indexes` antes de conferir/importar os indices existentes no projeto; um deploy substitui a definicao do conjunto gerenciado e pode remover indices que ja existiam. Se preferir CLI, consolide o arquivo com `firebase firestore:indexes` primeiro e revise as diferencas.
6. Aguarde a conclusao de deploy das 3 Cloud Functions (2 chamaveis e 1 agendada). Consulte os logs e garanta que nao aparece `FAILED_PRECONDITION` (indice), `permission-denied` ou erros de faturamento/APIs.
7. Depois de publicar a mudanca do **GitHub Pages**, no Chrome Android abra **Segundo Eu → Tarefas → Ativar avisos**, cole a **chave VAPID PUBLICA** (nao e a chave 6L... do App Check) e permita as notificacoes no Android.
8. Confirme que a ativacao foi concluida; agende **uma tarefa de teste para 3 a 5 minutos no futuro** e salve. Deixe o site fechado. Confira a notificacao, o log da Cloud Function e o campo `reminderStatus` da tarefa. Verifique tambem o status de bateria, permissao de notificacoes e conectividade se ela nao chegar.
9. No futuro, a chave VAPID publica pode ser adicionada a `DEFAULT_VAPID_PUBLIC_KEY` no `app.js`, para que outros dispositivos nao precisem digitá-la. A chave do reCAPTCHA Enterprise continua separada.

## Seguranca e custos
- `firebase-bridge.js` e `service-worker.js` so contem configuracao **publica** do Firebase; a autenticacao para enviar push deve ocorrer exclusivamente nas Functions com Firebase Admin.
- As notificacoes exibem texto **generico**, sem nomes, compromissos, relatos policiais nem detalhes de saude.
- **Nunca** coloque chave privada VAPID, Service Account JSON, tokens do FCM ou credenciais de Admin no GitHub nem nas mensagens de chat.
- Cloud Functions/Cloud Scheduler exigem habilitacao do Blaze e podem gerar custos. O uso familiar tende a ser pequeno, mas nao existe promessa de custo zero. Confira as tabelas e configure orcamento.
- Nao sobrescrevemos as regras de seguranca Firestore atuais. Tokens sao escritos via Cloud Function (Admin), nao pelo navegador em `pushTokens`.

## Limitacoes atuais
- Os avisos sao para tarefas nao concluidas com horario futuro, nao agenda, memoria ou alarmes recorrentes.
- O app nao solicita automaticamente permissao nem altera tarefas ate voce optar por ativar.
- Se um alerta ja venceu sem celular registrado, recebe status `no_device`; crie novo aviso de teste.
- Entrega FCM e processamento no Android podem atrasar; ha tentativas de recuperacao apos falhas, mas nao garantia de entrega exatamente no horario.
- Nao foram feitos testes reais com FCM nem deploy de funcoes pelo GitHub Pages sozinho.
