// Segundo Eu - conexao segura com Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app-check.js';

let firebaseApp;
let auth;
let db;
let modeloGemini;
let appCheckConfigurado = false;

export function init(config, chavePublicaAppCheck = '') {
  if (firebaseApp) return;

  if (!config?.apiKey || !config?.projectId || !config?.appId) {
    throw new Error('Faltam dados da configuracao WEB do Firebase.');
  }

  firebaseApp = initializeApp(config);

  if (chavePublicaAppCheck) {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(chavePublicaAppCheck),
      isTokenAutoRefreshEnabled: true
    });

    appCheckConfigurado = true;
  }

  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
}

function exigirUsuario(uid) {
  if (!auth?.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Entre na sua conta para acessar seus dados.');
  }
}

export function observeAuth(aoMudar) {
  return onAuthStateChanged(auth, aoMudar);
}

export async function emailRegister(email, senha) {
  return createUserWithEmailAndPassword(auth, email, senha);
}

export async function emailLogin(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha);
}

export async function googleLogin() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function logout() {
  return signOut(auth);
}

export function watchItems(uid, aoReceber, aoErro) {
  exigirUsuario(uid);

  return onSnapshot(
    collection(db, 'users', uid, 'items'),
    (resultado) => {
      const itens = resultado.docs.map((registro) => ({
        ...registro.data(),
        id: registro.id
      }));

      aoReceber(itens);
    },
    aoErro
  );
}

export async function upsertItem(uid, item) {
  exigirUsuario(uid);

  if (typeof item?.id !== 'string' || !item.id || item.id.includes('/')) {
    throw new Error('Identificador de registro invalido.');
  }

  return setDoc(
    doc(db, 'users', uid, 'items', item.id),
    item
  );
}

export async function removeItem(uid, id) {
  exigirUsuario(uid);

  if (typeof id !== 'string' || !id || id.includes('/')) {
    throw new Error('Identificador de registro invalido.');
  }

  return deleteDoc(
    doc(db, 'users', uid, 'items', id)
  );
}

export async function askGemini(texto) {
  exigirUsuario(auth?.currentUser?.uid);

  if (!appCheckConfigurado) {
    throw new Error(
      'Configure o Firebase AI Logic e o App Check antes de usar o Gemini.'
    );
  }

  if (!modeloGemini) {
    const {
      getAI,
      getGenerativeModel,
      GoogleAIBackend
    } = await import(
      'https://www.gstatic.com/firebasejs/13.1.0/firebase-ai.js'
    );

    const ai = getAI(firebaseApp, {
      backend: new GoogleAIBackend()
    });

    modeloGemini = getGenerativeModel(ai, {
      model: 'gemini-3.8-flash'
    });
  }

  const resultado = await modeloGemini.generateContent(texto);

  return resultado.response.text() ||
    'O Gemini nao retornou uma resposta.';
}
