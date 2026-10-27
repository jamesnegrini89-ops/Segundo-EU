'use strict';
// Segundo Eu — envio no servidor. Nunca colocar credenciais do Admin no GitHub Pages.
const crypto = require('node:crypto');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {getMessaging} = require('firebase-admin/messaging');
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {onSchedule} = require('firebase-functions/v2/scheduler');

initializeApp();
const db = getFirestore();
const REGION = 'us-central1';
const MAX_DEVICES = 8;
const MAX_ATTEMPTS = 4;
const tokenDocId = token => crypto.createHash('sha256').update(token).digest('hex');
const checkToken = data => {
  const token = data?.token;
  if (typeof token !== 'string' || token.length < 30 || token.length > 4096 || /\s/.test(token)) {
    throw new HttpsError('invalid-argument', 'Token FCM invalido.');
  }
  return token;
};

// A conta autenticada pode cadastrar apenas os proprios dispositivos.
// App Check validado pelo Firebase; cliente nao pode enviar notificacoes diretamente.
exports.registerReminderDevice = onCall(
  {region: REGION, enforceAppCheck: true, maxInstances: 4},
  async request => {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Entre na sua conta.');
    const token = checkToken(request.data);
    const ref = db.collection('users').doc(request.auth.uid).collection('pushTokens').doc(tokenDocId(token));
    const existing = await ref.get();
    if (!existing.exists) {
      const count = await ref.parent.limit(MAX_DEVICES).get();
      if (count.size >= MAX_DEVICES) throw new HttpsError('resource-exhausted', 'Limite de dispositivos da conta atingido.');
    }
    await ref.set({
      token,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : {createdAt: FieldValue.serverTimestamp()})
    }, {merge: true});
    return {enabled: true};
  }
);

exports.unregisterReminderDevice = onCall(
  {region: REGION, enforceAppCheck: true, maxInstances: 4},
  async request => {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Entre na sua conta.');
    const token = checkToken(request.data);
    await db.collection('users').doc(request.auth.uid).collection('pushTokens').doc(tokenDocId(token)).delete();
    return {enabled: false};
  }
);

// Executa a cada minuto — janela de entrega aproximada, nao alarme exato do Android.
// Firestore collectionGroup "items" indexado por status e reminderAtMs.
exports.sendDueTaskReminders = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Etc/UTC',
    region: REGION,
    memory: '256MiB',
    timeoutSeconds: 120,
    maxInstances: 1
  },
  async () => {
    const now = Date.now();
    const due = await db.collectionGroup('items')
      .where('reminderStatus', 'in', ['pending', 'sending'])
      .where('reminderAtMs', '<=', now)
      .orderBy('reminderAtMs')
      .limit(100)
      .get();

    for (const result of due.docs) {
      const taskRef = result.ref;
      const userRef = taskRef.parent.parent;
      if (!userRef || !/^users\/[^/]+$/.test(userRef.path)) continue;
      let claimed = false;
      try {
        claimed = await db.runTransaction(async tx => {
          const snap = await tx.get(taskRef);
          if (!snap.exists) return false;
          const t = snap.data();
          if (t.kind !== 'task' || t.done || !Number.isSafeInteger(t.reminderAtMs) ||
              t.reminderAtMs > Date.now() || !t.time) return false;
          const staleLease = t.reminderStatus === 'sending' &&
            Number(t.claimedAtMs || 0) < Date.now() - 180000;
          if (t.reminderStatus !== 'pending' && !staleLease) return false;
          if (Number(t.reminderAttempts || 0) >= MAX_ATTEMPTS) {
            tx.update(taskRef, {reminderStatus: 'failed'});
            return false;
          }
          tx.update(taskRef, {
            reminderStatus: 'sending',
            claimedAtMs: Date.now(),
            reminderAttempts: Number(t.reminderAttempts || 0) + 1
          });
          return true;
        });
        if (!claimed) continue;
        const fresh = await taskRef.get();
        if (!fresh.exists || fresh.data().done || fresh.data().reminderStatus !== 'sending') continue;
        const tokensSnapshot = await userRef.collection('pushTokens').limit(MAX_DEVICES).get();
        const tokens = tokensSnapshot.docs.map(d => d.data().token).filter(x => typeof x === 'string' && x.length >= 30);
        if (!tokens.length) {
          await taskRef.update({reminderStatus: 'no_device', reminderResultAt: FieldValue.serverTimestamp()});
          continue;
        }
        // Mensagem generica protege titulos e detalhes pessoais fora do Firestore.
        const results = await getMessaging().sendEachForMulticast({
          tokens,
          notification: {
            title: 'Segundo Eu · Hora da tarefa',
            body: 'Chegou o horario de uma tarefa. Abra o Segundo Eu para ver.'
          },
          webpush: {
            fcmOptions: {link: 'https://jamesnegrini89-ops.github.io/Segundo-EU/'},
            notification: {icon: 'https://jamesnegrini89-ops.github.io/Segundo-EU/icons/icon.svg'}
          }
        });
        const remove = [];
        results.responses.forEach((r, i) => {
          if (!r.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(r.error?.code)) {
            remove.push(userRef.collection('pushTokens').doc(tokenDocId(tokens[i])).delete());
          }
        });
        await Promise.all(remove);
        const attempts = Number(fresh.data().reminderAttempts || 1);
        await taskRef.update({
          reminderStatus: results.successCount ? 'sent' : attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
          reminderResultAt: FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.error('Falha ao processar lembrete', taskRef.path, err?.code || err?.message || err);
        if (claimed) {
          // Lease recupera a tarefa em uma execucao seguinte se o processo falhar.
          try {
            const latest = await taskRef.get();
            if (latest.exists && latest.data().reminderStatus === 'sending' &&
                Number(latest.data().reminderAttempts || 0) >= MAX_ATTEMPTS) {
              await taskRef.update({reminderStatus: 'failed'});
            }
          } catch (updateError) {
            console.error('Falha ao marcar lembrete', updateError?.message || updateError);
          }
        }
      }
    }
  }
);
