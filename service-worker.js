/* Segundo Eu: cache somente de arquivos publicos e recebimento FCM no Android. */
const CACHE='segundo-eu-public-v3';
const ASSETS=['./','./index.html','./app.js','./app.css','./manifest.webmanifest','./icons/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){let copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request)))});
// Firebase usa este service worker inclusive quando o aplicativo estiver fechado.
// Nunca inserir chave de servidor, conta de servico, nem dados particulares aqui.
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: 'AIzaSyDonQTEVSM3WQ8-phAUXAPWRFjg9N7GdTY',
  authDomain: 'gen-lang-client-0470777351.firebaseapp.com',
  projectId: 'gen-lang-client-0470777351',
  appId: '1:837190433007:web:cc0f86c22c954b7381431a',
  messagingSenderId: '837190433007'
});
firebase.messaging(); // payload de notification do servidor e exibido em segundo plano.
