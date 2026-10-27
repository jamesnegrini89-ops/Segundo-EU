/* Segundo Eu — versao local pessoal: agenda, tarefas, memorias, backup. */
(()=>{'use strict';
const $=s=>document.querySelector(s), app=$('#app');
const icons={home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',check:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="m7 12 3 3 6-6"/>',brain:'<path d="M12 18V6M8 5a4 4 0 0 0-7 3 4 4 0 0 0 1 7 5 5 0 0 0 6 5h4M16 5a4 4 0 0 1 7 3 4 4 0 0 1-1 7 5 5 0 0 1-6 5h-4M4 9c4 0 4 4 4 4m12-4c-4 0-4 4-4 4"/>',more:'<path d="M4 6h16M4 12h16M4 18h16"/>',plus:'<path d="M12 4v16M4 12h16"/>',mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0m-7 7v5m-4 0h8"/>',send:'<path d="m21 3-7 18-4-7-7-4zM10 14 21 3"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',close:'<path d="M4 4 20 20M20 4 4 20"/>',edit:'<path d="M12 20h9M4 17.5V21h3.5L19.8 8.7a2.5 2.5 0 0 0-3.5-3.5z"/>',trash:'<path d="M4 7h16M10 3h4m-8 4 1 14h10l1-14M10 11v7m4-7v7"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10M10 21h4"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M19.1 4.9 17 7m-10 10-2.1 2.1"/>',logout:'<path d="M10 3H4v18h6M16 17l5-5-5-5M21 12H9"/>',spark:'<path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',cloud:'<path d="M6 18a4 4 0 1 1 0-8 6 6 0 0 1 11.5-1.5A5 5 0 1 1 18 18z"/>',arrow:'<path d="m9 18 6-6-6-6"/>',download:'<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',volume:'<path d="M5 9v6h4l5 4V5L9 9H5m12 0a4 4 0 0 1 0 6"/>'};
icons.shield='<path d="M12 2 20 6v6c0 5-4 8-8 10-4-2-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/>';
const ic=(name,size=20)=>`<svg aria-hidden="true" class="svgicon" width="${size}" height="${size}" viewBox="0 0 24 24">${icons[name]||icons.spark}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const dateAdd=(date,days)=>{const [y,m,d]=date.split('-').map(Number);const dt=new Date(y,m-1,d+days);return [dt.getFullYear(),String(dt.getMonth()+1).padStart(2,'0'),String(dt.getDate()).padStart(2,'0')].join('-')};
const niceDate=(iso,options={weekday:'long',day:'numeric',month:'long'})=>new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR',options);
const uid=()=>crypto?.randomUUID?.()||'id-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const timeFmt=x=>x||'09:00';
const colorFor=i=>({trabalho:'#68adff',estudos:'#a479ff',pessoal:'#fb9f3f',familia:'#f66ca1',saude:'#36c58f'})[i]||'#67b0ff';
const toneFor=i=>({trabalho:'tone-blue',estudos:'tone-purple',pessoal:'tone-orange',familia:'tone-pink',saude:'tone-green'})[i]||'tone-blue';
const emFor=x=>({Ideias:'💡',Família:'👥',Saúde:'❤️',Finanças:'📊',Estudos:'📘',Viagens:'✈️',Pessoal:'✨',Trabalho:'💼'})[x]||'📝';
const tonFor=x=>({Ideias:'orange',Família:'purple',Saúde:'pink',Finanças:'green',Estudos:'blue',Viagens:'teal',Pessoal:'purple',Trabalho:'blue'})[x]||'purple';
let backend=null, unsubAuth=null, unsubItems=null, recog=null, toastTimer=null, appModal=null;
let state={logged:false,firebaseConfig:null,appCheckSiteKey:localStorage.getItem('segundo_eu_check_site')||'',checkingSession:false,online:false,remoteUser:null,items:[],view:'home',day:today(),filter:'Todas',memoryFilter:'Todas',memorySearch:'',chat:[{role:'ai',text:'Olá! Sou o Segundo Eu. Sua agenda, tarefas e memórias podem ser organizadas aqui. Digite, por exemplo: “Lembre-me de comprar pão amanhã”.'}],pending:null,busy:false,notice:false,voiceOn:localStorage.getItem('segundo_eu_voice')==='1'};
const demoSeed=()=>{const t=today();return [
{id:'d1',kind:'event',title:'Reunião de trabalho',date:t,time:'09:00',category:'trabalho',location:'Online',note:'Exemplo para conhecer a agenda'},
{id:'d2',kind:'event',title:'Estudo bíblico',date:t,time:'11:00',category:'estudos',location:'Em casa'},
{id:'d3',kind:'event',title:'Academia',date:t,time:'13:30',category:'pessoal',location:'Centro'},
{id:'d4',kind:'event',title:'Tempo com a família',date:t,time:'20:00',category:'familia',location:'Em casa'},
{id:'d5',kind:'task',title:'Estudar 1 Enoque',date:t,priority:'Alta',done:false},
{id:'d6',kind:'task',title:'Comprar mantimentos',date:t,priority:'Média',done:false},
{id:'d7',kind:'task',title:'Revisar projeto',date:dateAdd(t,1),priority:'Média',done:false},
{id:'d8',kind:'task',title:'Organizar documentos',date:dateAdd(t,2),priority:'Baixa',done:false},
{id:'d9',kind:'task',title:'Leitura diária',date:dateAdd(t,-1),priority:'Baixa',done:true},
{id:'d10',kind:'memory',title:'Ideias e projetos',content:'Anotações importantes e planos para consultar depois.',category:'Ideias'},
{id:'d11',kind:'memory',title:'Família',content:'Espaço para informações familiares importantes.',category:'Família'},
{id:'d12',kind:'memory',title:'Estudos',content:'Anotações e aprendizados.',category:'Estudos'},
];};
function loadDemo(){try{const a=JSON.parse(localStorage.getItem('segundo_eu_pessoal_items'));state.items=Array.isArray(a)?a:[]}catch{state.items=[]}}
function persistDemo(){localStorage.setItem('segundo_eu_pessoal_items',JSON.stringify(state.items))}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3800)}
function who(){return state.remoteUser?.displayName?.split(' ')[0]||state.remoteUser?.email?.split('@')[0]||'Você'}
function modeLabel(){return 'Uso local • GitHub Pages'}
function buttons(nav=false){return [['home','Início','home'],['agenda','Agenda','calendar'],['tarefas','Tarefas','check'],['memorias','Memórias','brain'],['policial','Apoio Policial','shield'],['mais','Mais','more']].map(([v,txt,icon])=>`<button type="button" class="${state.view===v?'active':''}" data-view="${v}" aria-label="${txt}" aria-current="${state.view===v?'page':'false'}">${ic(icon)}<span>${txt}</span></button>`).join('')}
function loginView(){return `<div class="login-wrap"><main class="login-card"><img class="login-logo" alt="Símbolo do Segundo Eu" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij4KPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCIgeDI9IjEiIHkxPSIxIiB5Mj0iMCI+PHN0b3Agc3RvcC1jb2xvcj0iIzgyNjlmYSIvPjxzdG9wIG9mZnNldD0iLjYiIHN0b3AtY29sb3I9IiM2NTVlZmEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NmM1ZjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIzMyIgZmlsbD0iI2Y1ZjRmZiIvPgo8cGF0aCBkPSJNNjcgMjljLTE2LTE2LTQwIDEtMzQgMjAtMTMgNy0xMSAyOSAzIDM2LTIgMTcgMjEgMjMgMjkgMTFWMzJjMC0zIDEtNCAyLTNaIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjYSkiIHN0cm9rZS13aWR0aD0iNyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik02NSAzMGMxNy0xNiA0MCAxIDM0IDE5IDExIDggMTAgMjQgMiAzMiAyIDEzLTExIDIyLTIzIDE2LTYtMi05LTctMTMtMTBWMzBaIiBmaWxsPSJ1cmwoI2EpIiBvcGFjaXR5PSIuOTIiLz4KPHBhdGggZD0iTTUwIDQyYy04LTEtMTMgNy0xMCAxNG0xMiAxNmMtNy0xLTExIDQtMTEgMTBtMzgtNDJjNy0yIDEyIDMgMTIgMTBNNzggNzVjOC0yIDE0IDMgMTQgMTAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9Ii45Ii8+Cjwvc3ZnPgo="><h1>Segundo Eu</h1><p>Sua vida mais organizada<br>com inteligência</p><form id="login-form"><div class="field"><label for="login-email">E-mail</label><input id="login-email" name="email" type="email" placeholder="voce@exemplo.com" autocomplete="username" required></div><div class="field"><label for="login-pass">Senha</label><input id="login-pass" name="password" type="password" placeholder="Sua senha" minlength="6" autocomplete="current-password" required></div><button class="primary wide" name="intent" value="login" type="submit">Entrar</button><button class="outline wide" name="intent" value="register" type="submit">Criar conta no Firebase</button></form><div class="divider">ou</div><button type="button" class="mini-btn wide" data-act="google-login">🌐 Continuar com Google</button><button type="button" class="outline wide" data-act="demo-login">Explorar demonstração sem conta</button><button type="button" class="link-btn" data-act="config">Configurar Firebase</button><p class="minor">A demonstração salva dados apenas neste navegador e não protege contas familiares.</p></main></div>`}
function render(){if(state.checkingSession&&!state.remoteUser){app.innerHTML='<div class="login-wrap"><main class="login-card"><h1>Segundo Eu</h1><p>Verificando sua conexão e seu login...</p></main></div>';return;}app.innerHTML=!(state.logged||state.remoteUser)?loginView():`<div class="shell"><aside class="sidebar"><div class="brand"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij4KPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCIgeDI9IjEiIHkxPSIxIiB5Mj0iMCI+PHN0b3Agc3RvcC1jb2xvcj0iIzgyNjlmYSIvPjxzdG9wIG9mZnNldD0iLjYiIHN0b3AtY29sb3I9IiM2NTVlZmEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NmM1ZjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIzMyIgZmlsbD0iI2Y1ZjRmZiIvPgo8cGF0aCBkPSJNNjcgMjljLTE2LTE2LTQwIDEtMzQgMjAtMTMgNy0xMSAyOSAzIDM2LTIgMTcgMjEgMjMgMjkgMTFWMzJjMC0zIDEtNCAyLTNaIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjYSkiIHN0cm9rZS13aWR0aD0iNyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik02NSAzMGMxNy0xNiA0MCAxIDM0IDE5IDExIDggMTAgMjQgMiAzMiAyIDEzLTExIDIyLTIzIDE2LTYtMi05LTctMTMtMTBWMzBaIiBmaWxsPSJ1cmwoI2EpIiBvcGFjaXR5PSIuOTIiLz4KPHBhdGggZD0iTTUwIDQyYy04LTEtMTMgNy0xMCAxNG0xMiAxNmMtNy0xLTExIDQtMTEgMTBtMzgtNDJjNy0yIDEyIDMgMTIgMTBNNzggNzVjOC0yIDE0IDMgMTQgMTAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9Ii45Ii8+Cjwvc3ZnPgo=" alt=""> Segundo Eu</div><nav aria-label="Menu principal" class="nav">${buttons()}</nav><div class="sidebar-foot"><strong>${ic('spark')} Assistente pessoal</strong>Organize compromissos, tarefas e memórias em um só lugar.<div style="margin-top:10px" class="softlabel">${esc(modeLabel())}</div></div></aside><main class="content-panel"><header class="topbar"><div class="mobile-brand"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij4KPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCIgeDI9IjEiIHkxPSIxIiB5Mj0iMCI+PHN0b3Agc3RvcC1jb2xvcj0iIzgyNjlmYSIvPjxzdG9wIG9mZnNldD0iLjYiIHN0b3AtY29sb3I9IiM2NTVlZmEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NmM1ZjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIzMyIgZmlsbD0iI2Y1ZjRmZiIvPgo8cGF0aCBkPSJNNjcgMjljLTE2LTE2LTQwIDEtMzQgMjAtMTMgNy0xMSAyOSAzIDM2LTIgMTcgMjEgMjMgMjkgMTFWMzJjMC0zIDEtNCAyLTNaIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjYSkiIHN0cm9rZS13aWR0aD0iNyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik02NSAzMGMxNy0xNiA0MCAxIDM0IDE5IDExIDggMTAgMjQgMiAzMiAyIDEzLTExIDIyLTIzIDE2LTYtMi05LTctMTMtMTBWMzBaIiBmaWxsPSJ1cmwoI2EpIiBvcGFjaXR5PSIuOTIiLz4KPHBhdGggZD0iTTUwIDQyYy04LTEtMTMgNy0xMCAxNG0xMiAxNmMtNy0xLTExIDQtMTEgMTBtMzgtNDJjNy0yIDEyIDMgMTIgMTBNNzggNzVjOC0yIDE0IDMgMTQgMTAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9Ii45Ii8+Cjwvc3ZnPgo=" alt="">Segundo Eu</div><div class="kicker desktop-top">Sua vida, mais leve.</div><div class="top-right"><span class="status">${esc(modeLabel())}</span><button class="avatar" type="button" aria-label="Configurações" data-view="mais">${esc(who().slice(0,2).toUpperCase())}</button></div></header><section class="view">${renderView()}</section></main><aside class="rightbar">${sidePanel()}</aside></div><nav class="bottom-nav" aria-label="Menu inferior">${buttons(true)}</nav>`;}
function renderView(){return ({home:homeView,agenda:agendaView,tarefas:tasksView,memorias:memoryView,assistente:assistantView,policial:policeView,mais:settingsView})[state.view]?.()||homeView()}
function sidePanel(){const upcoming=state.items.filter(i=>i.kind==='event'&&i.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,3);return `<h3>✦ O seu Segundo Eu</h3><div class="hint"><div class="sparkle">✨</div><strong>Um dia de cada vez.</strong><p>${state.items.some(i=>i.kind==='task'&&!i.done)?`Você tem ${state.items.filter(i=>i.kind==='task'&&!i.done).length} tarefas para acompanhar. Vamos organizar?`:'Seu dia está em ordem. Adicione um compromisso quando precisar.'}</p><button class="outline wide" style="margin-top:14px" data-act="organize">Organize minha vida</button></div><h3>Próximos compromissos</h3>${upcoming.length?upcoming.map(i=>`<div class="mini-event">${esc(niceDate(i.date,{day:'numeric',month:'short'}))} · ${esc(i.time)}<strong>${esc(i.title)}</strong></div>`).join(''):'<p class="small">Nenhum compromisso cadastrado.</p>'}<p class="muted-note" style="margin-top:22px">🔒 ${state.remoteUser?'Dados pessoais separados por conta':'Seus dados estão só neste navegador.'}</p>`}
function homeView(){const t=today(), evs=state.items.filter(i=>i.kind==='event'&&i.date===t).sort((a,b)=>a.time.localeCompare(b.time)),td=state.items.filter(i=>i.kind==='task'&&!i.done),memo=state.items.filter(i=>i.kind==='memory');const hour=new Date().getHours();const hi=hour<12?'Bom dia':hour<18?'Boa tarde':'Boa noite';return `<div class="hero"><h1>${hi}, ${esc(who())}!</h1><p>Aqui está o seu resumo de hoje.</p><span class="date-chip">${esc(niceDate(t))}</span></div><div class="stats"><div class="stat"><div class="stat-icon blue">${ic('calendar')}</div><strong>${evs.length}</strong><small>Compromissos de hoje</small></div><div class="stat"><div class="stat-icon orange">${ic('check')}</div><strong>${td.length}</strong><small>Tarefas pendentes</small></div><div class="stat"><div class="stat-icon green">${ic('brain')}</div><strong>${memo.length}</strong><small>Memórias salvas</small></div></div><div class="welcome-note"><p>✨ Seu espaço pessoal. Os registros são salvos neste navegador. Para não perder seus dados, use <b>Mais → Baixar backup</b> regularmente.</p></div><div class="section-row"><h3>Agenda de hoje</h3><button class="link-btn" data-view="agenda">Ver todos ${ic('arrow',14)}</button></div><div class="agenda-list">${evs.length?evs.map(i=>eventRow(i,false)).join(''):'<div class="empty"><strong>Sem compromissos hoje</strong><p>Comece adicionando o primeiro.</p></div>'}</div><button class="primary wide speak-cta" data-view="assistente">${ic('mic')} Falar com o Segundo Eu</button><div class="actioncards"><button class="actioncard" data-act="organize"><span style="font-size:25px">✨</span><b>Organize minha vida</b><p>Veja prioridades e próximos passos.</p></button><button class="actioncard" data-act="new-task"><span style="font-size:25px">✅</span><b>Nova tarefa</b><p>Anote algo para não esquecer.</p></button></div>`}
function eventRow(i,hasActions=true){return `<div class="event-row"><span class="event-time">${esc(i.time||'09:00')}</span><span class="event-color" style="background:${colorFor(i.category)}"></span><div class="event-info"><b>${esc(i.title)}</b><span>${esc(i.location||i.category||'Compromisso')}</span></div>${hasActions?`<button class="iconaction" data-edit="${esc(i.id)}" aria-label="Editar ${esc(i.title)}">${ic('edit',16)}</button><button class="iconaction" data-delete="${esc(i.id)}" aria-label="Excluir ${esc(i.title)}">${ic('trash',16)}</button>`:''}</div>`}
function agendaView(){const d=state.day, days=Array.from({length:7},(_,idx)=>dateAdd(today(),idx));const evs=state.items.filter(i=>i.kind==='event'&&i.date===d).sort((a,b)=>a.time.localeCompare(b.time));return `<div class="view-header"><h1>Agenda</h1><div class="toolbar"><button class="round-btn" data-act="go-today" aria-label="Voltar para hoje">${ic('calendar')}</button><button class="round-btn plus" data-act="new-event" aria-label="Novo compromisso">${ic('plus')}</button></div></div><div class="weekbar">${days.map(iso=>{const date=new Date(iso+'T12:00:00');return `<button type="button" data-day="${iso}" class="${d===iso?'active':''}">${esc(date.toLocaleDateString('pt-BR',{weekday:'short'}))}<b>${date.getDate()}</b></button>`}).join('')}</div><div class="section-row"><h3>${esc(niceDate(d))}</h3><span class="muted small">${evs.length} evento(s)</span></div><div class="timeline">${evs.length?evs.map(i=>`<div class="timeline-event"><div class="timecol">${esc(i.time||'09:00')}</div><div class="barcol" style="background:${colorFor(i.category)}"></div><div class="tline-card ${toneFor(i.category)}"><div><b>${esc(i.title)}</b><p>${esc(i.location||i.category||'Compromisso')}</p></div><div><button data-edit="${esc(i.id)}" aria-label="Editar compromisso">${ic('edit',16)}</button><button data-delete="${esc(i.id)}" aria-label="Excluir compromisso">${ic('trash',16)}</button></div></div></div>`).join(''):'<div class="empty"><strong>Dia tranquilo!</strong><p>Não há eventos para esta data.</p><button class="primary" data-act="new-event">+ Novo compromisso</button></div>'}</div><div class="section-row"><h3>Próximos dias</h3></div>${state.items.filter(i=>i.kind==='event'&&i.date>d).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4).map(i=>`<div class="small muted" style="margin:12px 0 4px">${esc(niceDate(i.date))}</div>${eventRow(i)}`).join('')||'<p class="small muted">Sem outros compromissos agendados.</p>'}`}
function tasksView(){const tasks=state.items.filter(i=>i.kind==='task').filter(i=>state.filter==='Todas'||(state.filter==='Hoje'&&i.date===today())||(state.filter==='Semana'&&i.date>=today()&&i.date<=dateAdd(today(),7))||(state.filter==='Concluídas'&&i.done)).sort((a,b)=>Number(a.done)-Number(b.done)||a.date.localeCompare(b.date));return `<div class="view-header"><h1>Tarefas</h1><div class="toolbar"><button class="round-btn plus" data-act="new-task" aria-label="Nova tarefa">${ic('plus')}</button></div></div><div class="filterbar">${['Todas','Hoje','Semana','Concluídas'].map(f=>`<button data-filter="${f}" class="${state.filter===f?'active':''}">${f}</button>`).join('')}</div><div class="task-list">${tasks.length?tasks.map(i=>`<div class="task-row ${i.done?'done':''}"><button class="checkbox ${i.done?'checked':''}" data-toggle="${esc(i.id)}" aria-label="${i.done?'Marcar pendente':'Concluir'}: ${esc(i.title)}">${i.done?ic('check',13):''}</button><div class="task-info"><b>${esc(i.title)}</b><small>▣ ${i.done?'Concluída':i.date===today()?'Hoje':niceDate(i.date,{day:'numeric',month:'short'})}</small></div>${!i.done?`<span class="priority ${i.priority.toLowerCase().replace('é','e')}">${esc(i.priority)}</span>`:''}<div class="row-actions"><button class="iconaction" data-edit="${esc(i.id)}" aria-label="Editar tarefa">${ic('edit',15)}</button><button class="iconaction" data-delete="${esc(i.id)}" aria-label="Excluir tarefa">${ic('trash',15)}</button></div></div>`).join(''):'<div class="empty"><strong>Nenhuma tarefa nesta categoria</strong><p>Você pode adicionar uma nova agora.</p><button data-act="new-task" class="primary">+ Nova tarefa</button></div>'}</div>`}
function memoryView(){const ms=state.items.filter(i=>i.kind==='memory').filter(i=>state.memoryFilter==='Todas'||i.category===state.memoryFilter).filter(i=>(i.title+' '+i.content).toLowerCase().includes(state.memorySearch.toLowerCase()));return `<div class="view-header"><h1>Memórias</h1><div class="toolbar"><button class="round-btn plus" data-act="new-memory" aria-label="Nova memória">${ic('plus')}</button></div></div><div class="field"><label for="memory-search">Buscar nas suas memórias</label><input id="memory-search" type="search" placeholder="Pesquisar título ou conteúdo..." value="${esc(state.memorySearch)}"></div><div class="filterbar">${['Todas','Pessoal','Família','Trabalho','Ideias','Saúde','Finanças','Estudos','Viagens'].map(f=>`<button class="${state.memoryFilter===f?'active':''}" data-mfilter="${f}">${f}</button>`).join('')}</div><div class="memory-list">${ms.length?ms.map(i=>`<div class="memory-item"><span class="memory-icon ${tonFor(i.category)}">${emFor(i.category)}</span><div style="flex:1;min-width:0"><b>${esc(i.title)}</b><p>${esc(i.content)}</p><span class="muted" style="font-size:10px">${esc(i.category)}</span></div><button class="iconaction" data-edit="${esc(i.id)}" aria-label="Editar memória">${ic('edit',15)}</button><button class="iconaction" data-delete="${esc(i.id)}" aria-label="Excluir memória">${ic('trash',15)}</button></div>`).join(''):'<div class="empty"><strong>Nenhuma memória encontrada</strong><p>Registre algo que seja útil recordar.</p><button data-act="new-memory" class="primary">+ Nova memória</button></div>'}</div><p class="muted-note" style="margin-top:18px">Suas memórias ficam somente neste navegador. Faça backups regularmente.</p>`}
function assistantView(){return `<div class="view-header"><div><h1>Seu assistente</h1><div class="kicker">Inteligência e organização para o seu dia</div></div><span class="softlabel">${state.firebaseConfig&&state.remoteUser?'Gemini conectado':'Assistente local'}</span></div><div class="actioncards"><button data-act="organize" class="actioncard">${ic('spark',25)}<b>Organize minha vida</b><p>Encontre o que merece atenção.</p></button><button data-act="mic" class="actioncard">${ic('mic',25)}<b>Comando por voz</b><p>Fale e converta em texto.</p></button></div><div class="chatlog" id="chatlog" role="log" aria-label="Conversa">${state.chat.map(m=>`<div class="msg ${m.role==='me'?'me':'ai'}">${esc(m.text)}</div>`).join('')}${state.busy?'<div class="msg ai" role="status">Gemini está preparando a resposta…</div>':''}</div>${state.pending?`<div class="approval" role="group" aria-label="Ação aguardando confirmação"><b>Confirme antes de executar</b><p>${esc(state.pending.description)}</p><p class="muted-note">Você também pode dizer ou escrever “sim” para salvar ou “não” para cancelar.</p><div class="buttons"><button class="primary" data-act="approve">${ic('check',16)} Confirmar</button><button class="mini-btn" data-act="reject">Cancelar</button></div></div>`:''}<form id="chat-form" class="composer"><input aria-label="Mensagem para o Segundo Eu" name="message" placeholder="O que posso fazer por você?" required maxlength="1200" autocomplete="off"><button class="round-btn" type="button" data-act="mic" title="Falar">${ic('mic')}</button><button class="round-btn plus" aria-label="Enviar" type="submit">${ic('send')}</button></form><div class="toggle-row" style="margin-top:16px"><span class="muted-note">${state.remoteUser?'Gemini pode responder quando estiver configurado.':'Comandos simples funcionam no computador. A IA online ainda não está integrada.'}</span><label class="small muted"><input type="checkbox" id="voice-switch" ${state.voiceOn?'checked':''}> Ler respostas</label></div>`}
function settingsView(){return `<div class="view-header"><h1>Mais</h1>${ic('settings')}</div><div class="configblock"><h3>💾 Seus dados e backup</h3><p>Seu Segundo Eu já pode ser usado aqui. Compromissos, tarefas e memórias são salvos <b>neste navegador e neste computador</b>. Eles não são enviados à nuvem.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="primary" data-act="export">${ic('download')} Baixar backup</button><button class="outline" data-act="import">Restaurar backup</button></div><input type="file" id="restore-file" accept=".json,application/json" hidden><p class="muted-note">Guarde o arquivo de backup em um lugar seguro. Limpar os dados do navegador, mudar de aparelho ou usar outro perfil pode apagar os dados locais. Restaurar substitui os registros atuais.</p></div><div class="configblock"><h3>✨ Assistente pessoal</h3><p>O assistente local pode organizar sua rotina, resumir compromissos e criar tarefas a partir de comandos simples, com sua confirmação.</p><button class="outline" data-view="assistente">Abrir assistente</button><p class="muted-note">Respostas livres de inteligência artificial (Gemini), login, sincronização entre aparelhos e lembretes com o navegador fechado ainda não estão habilitados. Essas funções exigem configuração de serviços online.</p></div><div class="configblock"><h3>🔊 Voz e avisos</h3><label class="toggle-row">Ler respostas do assistente <input id="voice-switch" type="checkbox" ${state.voiceOn?'checked':''}></label><hr class="dividerline"><button data-act="notifications" class="mini-btn">${ic('bell')} Permitir avisos enquanto o app está aberto</button><p class="muted-note">Microfone e avisos dependem das permissões e do suporte do navegador.</p></div><div class="configblock"><h3>🔎 Verificar este computador</h3><p>Verificação interna de armazenamento, navegação e recursos do navegador.</p><button class="outline" data-act="diagnostic">Verificar funções locais</button></div><p class="muted-note">Segundo Eu · versão pessoal local · aplicativo para uso neste computador, sem conta.</p>`}

// Apoio Policial — ferramenta local, sem consulta ao POP interno ou IA online.
// Dados da ocorrência NÃO são persistidos nem enviados pelo aplicativo.
let policeDraft={relato:'',historico:'',orientacoes:''};
let policeRecognizer=null;
function policeView(){
  return `<div class="view-header"><div><h1>Apoio Policial</h1><div class="kicker">Rascunho de histórico a partir do seu relato</div></div><span class="softlabel">Ferramenta local</span></div>
  <div class="configblock police-alert"><strong>🔒 Uso responsável</strong><p>Use apenas situações fictícias ou dados autorizados. O relato e o rascunho não são salvos automaticamente. No ditado, o navegador pode utilizar serviço externo de reconhecimento de voz. O PDF interno do POP não foi incluído neste site.</p></div>
  <div class="configblock"><h3>1. Relate o que aconteceu</h3><p class="muted-note">Escreva livremente ou dite pelo microfone. Revise cuidadosamente a transcrição antes de gerar o texto.</p>
  <label class="field" for="police-relato"><span>Descrição da ocorrência</span></label><textarea id="police-relato" class="police-textarea" maxlength="12000" placeholder="Exemplo fictício: A guarnição foi acionada às 14h para verificar um conflito...">${esc(policeDraft.relato)}</textarea>
  <div class="police-actions"><button type="button" class="outline" data-act="police-mic">${ic('mic')} Ditar ocorrência</button><button type="button" class="primary" data-act="police-generate">${ic('check')} Organizar histórico</button><button type="button" class="mini-btn" data-act="police-clear">Limpar</button></div>
  <p class="muted-note" id="police-voice-status">Microfone depende da permissão e do suporte do Chrome; também funciona escrevendo.</p></div>
  ${policeDraft.historico?`<div class="configblock"><h3>2. Histórico — rascunho para revisão</h3><p class="muted-note">Esta versão apenas organiza o relato, <b>sem Gemini</b>. Não corrige nem verifica fatos. O histórico oficial depende de sua conferência.</p><pre class="police-result" id="police-result">${esc(policeDraft.historico)}</pre><div class="police-actions"><button class="primary" data-act="police-copy">Copiar texto</button><button class="outline" data-act="police-download">Baixar TXT</button></div></div>`:''}
  <div class="configblock"><h3>3. Orientações e POP</h3><p>Para gerar orientações específicas sobre <b>o que fazer e evitar</b>, com citações verificáveis ao POP da Brigada Militar e às leis vigentes, será necessária uma integração <b>privada e autorizada</b>, com validação das fontes. Isso ainda <b>não está conectado</b>.</p><p class="muted-note">Antes de utilizar este rascunho, confira dados essenciais, preserve a distinção entre fatos observados e relatos de terceiros, siga o POP vigente e os canais oficiais, e não registre dados não confirmados como fatos.</p><p class="muted-note">Documento de referência identificado na conversa: coletânea POP, abril de 2026. O conteúdo interno não é publicado neste repositório.</p></div>`;
}
function policeReport(relato){
  const clean=String(relato||'').replace(/\r/g,'').replace(/[\t ]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
  if(clean.length<12)return '';
  const details=[];
  if(!/(?:\b\d{1,2}[h:]\d{0,2}\b|hor[aá]rio|por volta|manh[ãa]|tarde|noite)/i.test(clean))details.push('Horário dos fatos não informado.');
  if(!/(?:rua|avenida|bairro|estrada|rodovia|local|endere[cç]o|resid[eê]ncia|pra[cç]a)/i.test(clean))details.push('Local exato não informado.');
  if(!/(?:v[íi]tima|autor|suspeito|testemunha|envolvido|pessoa)/i.test(clean))details.push('Identificação ou qualificação dos envolvidos não informada.');
  if(!/(?:guarni[cç][aã]o|equipe|policiais|policial|viatura|provid[eê]ncia|encaminh)/i.test(clean))details.push('Providências adotadas pela guarnição não informadas.');
  const narrative=clean[0].toUpperCase()+clean.slice(1);
  return 'HISTÓRICO DA OCORRÊNCIA — RASCUNHO NÃO OFICIAL\n\n'+
    'RELATO INFORMADO\n'+narrative+(/[.!?]$/.test(narrative)?'':'.')+'\n\n'+
    'PONTOS A CONFERIR ANTES DO REGISTRO\n'+(details.length?details.map((x,i)=>`${i+1}. ${x}`).join('\n'):'Conferir todas as informações, a cronologia e a origem dos fatos relatados.')+'\n\n'+
    'OBSERVAÇÃO\nTexto organizado automaticamente a partir das informações fornecidas, sem análise de IA, sem verificação externa e sem conclusão jurídica. Revisar a precisão, as fontes das informações, a linguagem e as providências antes de utilizar em documento oficial.';
}
function policeDownload(){
 if(!policeDraft.historico){toast('Gere primeiro um histórico.');return}
 const blob=new Blob([policeDraft.historico],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='historico-ocorrencia-rascunho.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function policeMic(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){toast('Seu navegador não oferece ditado. Use o campo de texto.');return}
 try{
  if(policeRecognizer){policeRecognizer.stop();return}
  const r=new SR();policeRecognizer=r;r.lang='pt-BR';r.interimResults=false;r.continuous=false;r.maxAlternatives=1;
  r.onresult=e=>{const phrase=Array.from(e.results).map(x=>x[0].transcript).join(' ');const box=$('#police-relato');policeDraft.relato=((box?.value||policeDraft.relato)+' '+phrase).trim();if(box)box.value=policeDraft.relato;const status=$('#police-voice-status');if(status)status.textContent='Ditado incluído. Confira as palavras e repita se necessário.'};
  r.onerror=e=>toast('Ditado não disponível: '+e.error);
  r.onend=()=>{policeRecognizer=null};
  r.start();const status=$('#police-voice-status');if(status)status.textContent='Ouvindo... fale seu relato com clareza.';
 }catch(err){policeRecognizer=null;toast('Não foi possível ativar o microfone: '+err.message)}
}

// Interactions for the self-contained demo and optional Firebase integration.
function openModal(title,content){
  closeModal();
  appModal=document.createElement('div');appModal.className='modal-overlay';
  appModal.innerHTML=`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="dialog-header"><h3 id="modal-title">${esc(title)}</h3><button type="button" class="round-btn" data-act="close-modal" aria-label="Fechar">${ic('close')}</button></div>${content}</div>`;
  document.body.append(appModal);appModal.querySelector('input,textarea,select,button')?.focus();
}
function closeModal(){if(appModal){appModal.remove();appModal=null}}
function field(name,title,value='',type='text',required=true){
  if(type==='textarea')return `<div class="field"><label for="fld-${name}">${esc(title)}</label><textarea id="fld-${name}" name="${name}" ${required?'required':''}>${esc(value)}</textarea></div>`;
  return `<div class="field"><label for="fld-${name}">${esc(title)}</label><input id="fld-${name}" name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''}></div>`;
}
const modalButtons='<div class="dialog-actions"><button type="button" class="mini-btn" data-act="close-modal">Cancelar</button><button type="submit" class="primary">Salvar</button></div>';
function editItem(kind,id){
  const entry=state.items.find(i=>i.id===id)||{kind,date:today(),time:'09:00',priority:'Média',category:kind==='event'?'pessoal':'Pessoal'};
  const edit=Boolean(id),label={event:'compromisso',task:'tarefa',memory:'memória'}[kind];
  let inner=field('title','Título',entry.title||'','text');
  if(kind==='event'){
    inner+=field('date','Data',entry.date,'date')+field('time','Horário',entry.time,'time')+field('location','Local ou observação',entry.location||'','text',false);
    inner+=`<div class="field"><label for="fld-category">Categoria</label><select id="fld-category" name="category">${['pessoal','trabalho','estudos','familia','saude'].map(x=>`<option value="${x}" ${entry.category===x?'selected':''}>${x}</option>`).join('')}</select></div>`;
  }else if(kind==='task'){
    inner+=field('date','Prazo',entry.date,'date');
    inner+=`<div class="field"><label for="fld-priority">Prioridade</label><select id="fld-priority" name="priority">${['Baixa','Média','Alta'].map(x=>`<option ${entry.priority===x?'selected':''}>${x}</option>`).join('')}</select></div>`;
  }else{
    inner+=field('content','Informações',entry.content||'','textarea');
    inner+=`<div class="field"><label for="fld-category">Categoria</label><select id="fld-category" name="category">${['Pessoal','Família','Trabalho','Ideias','Saúde','Finanças','Estudos','Viagens'].map(x=>`<option ${entry.category===x?'selected':''}>${x}</option>`).join('')}</select></div>`;
  }
  openModal(`${edit?'Editar':'Adicionar'} ${label}`,`<form id="item-form" data-kind="${kind}" data-id="${esc(id||'')}">${inner}${modalButtons}</form>`);
}
async function saveItem(item){
  if(state.remoteUser&&backend){await backend.upsertItem(state.remoteUser.uid,item)}
  else{const index=state.items.findIndex(i=>i.id===item.id);if(index<0)state.items.push(item);else state.items[index]=item;persistDemo()}
  render();toast('Salvo com sucesso.');
}
async function deleteItem(id){
  const item=state.items.find(i=>i.id===id);if(!item)return;
  if(!window.confirm(`Excluir “${item.title}”?`))return;
  if(state.remoteUser&&backend)await backend.removeItem(state.remoteUser.uid,id);
  else{state.items=state.items.filter(i=>i.id!==id);persistDemo()}
  render();toast('Item excluído.');
}
function showConfig(){
  const c=state.firebaseConfig||{};
  openModal('Conectar Firebase',`<p class="muted-note">Copie a configuração WEB do seu projeto Firebase. A apiKey abaixo é a identificação pública do projeto Firebase, não sua chave secreta do Gemini.</p><form id="config-form">${field('apiKey','Firebase web apiKey',c.apiKey||'')}${field('authDomain','Auth domain',c.authDomain||'')}${field('projectId','Project ID',c.projectId||'')}${field('appId','App ID',c.appId||'')}${field('messagingSenderId','Messaging sender ID (opcional)',c.messagingSenderId||'','text',false)}${field('recaptchaSiteKey','App Check reCAPTCHA Enterprise (opcional)',state.appCheckSiteKey||'','text',false)}${modalButtons}</form><p class="muted-note">Ative Authentication, Firestore e Firebase AI Logic no console do Google. Para testes com IA, configure App Check e as permissões apropriadas.</p>`);
}
async function connectFirebase(){
  if(!state.firebaseConfig||backend)return;
  try{
    backend=await import('./firebase-bridge.js');
    backend.init(state.firebaseConfig,state.appCheckSiteKey);
    if(unsubAuth)unsubAuth();
    unsubAuth=backend.observeAuth(user=>{
      state.checkingSession=false;
      state.remoteUser=user||null;
      if(unsubItems){unsubItems();unsubItems=null}
      if(user){state.logged=false;localStorage.removeItem('segundo_eu_demo_logged');state.items=[];
        unsubItems=backend.watchItems(user.uid,items=>{state.items=items;render()},err=>toast('Falha na sincronização: '+err.message));
      }else if(!state.logged){state.items=[]}
      render();
    });
    toast('Firebase inicializado. Faça login para sincronizar.');
  }catch(err){backend=null;state.checkingSession=false;render();toast('Não foi possível conectar o Firebase: '+(err.message||err));}
}
function speak(text){
  if(!state.voiceOn||!('speechSynthesis' in window))return;
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=1;speechSynthesis.speak(u);
}
function aiReply(text){state.chat.push({role:'ai',text});render();speak(text)}
function parseLocalAction(message){
  const raw=message.trim();
  const match=raw.match(/^(?:lembre-me de|me lembra de|me lembre de|crie uma tarefa(?: para| de)?|criar tarefa(?: para| de)?|adicione uma tarefa(?: para| de)?|anote uma tarefa(?: para| de)?|anota(?: aí)?(?: que)?|preciso(?: de)?)\s+(.+)$/i);
  if(!match)return null;
  let title=match[1].replace(/[.!?]+$/,'').trim();const tomorrow=/(?:^|\s)amanh[ãa](?:\s|$)/i.test(title);
  title=title.replace(/(?:^|\s)amanh[ãa](?=\s|$)/ig,'').trim();
  if(!title)return null;
  return {description:`Criar tarefa “${title}” para ${tomorrow?'amanhã':'hoje'}?`,item:{id:uid(),kind:'task',title,date:dateAdd(today(),tomorrow?1:0),priority:'Média',done:false}};
}
async function confirmPendingAction(){
  const proposal=state.pending;
  if(!proposal)return;
  await saveItem(proposal.item);
  state.pending=null;
  aiReply('Tarefa salva na sua lista com sucesso.');
}
async function handleChat(msg){
  const message=msg.trim();if(!message)return;
  if(state.busy){toast('Aguarde a resposta do Gemini antes de enviar outra mensagem.');return}
  state.chat.push({role:'me',text:message});render();
  // Uma confirmação vale somente para a ação exibida, nunca para outra solicitação.
  if(state.pending){
    if(/^(?:sim|pode|pode (?:salvar|anotar|fazer|confirmar)(?: isso)?|confirmo|confirma|confirmar|claro|ok|isso(?: mesmo)?|salva|salvar|pode ser)[.!?\s]*$/i.test(message)){await confirmPendingAction();return}
    if(/^(?:n[aã]o|não quero|não salve|não salva|cancelar?|deixa|agora não)[.!?\s]*$/i.test(message)){state.pending=null;aiReply('Certo, não salvei a tarefa.');return}
    aiReply('Existe uma tarefa aguardando sua confirmação. Diga “sim” para salvar ou “não” para cancelar.');return;
  }
  const proposal=parseLocalAction(message);
  if(proposal){state.pending=proposal;aiReply('Entendi. Confira os detalhes abaixo e confirme por texto, voz ou botão antes de salvar.');return}
  if(/^(oi|olá|bom dia|boa tarde|boa noite)[.!?\s]*$/i.test(message)){aiReply('Olá! Posso organizar seus compromissos, tarefas e memórias.');return}
  if(/(resumo|organize|meu dia|minha vida)/i.test(message)){organize();return}
  if(state.remoteUser&&backend){
    state.busy=true;render();
    try{
      const prompt=`Você é o Segundo Eu, assistente pessoal conciso em português brasileiro. Explique que nenhuma tarefa externa é executada sem confirmação. Contexto atual em JSON: ${JSON.stringify(state.items.slice(0,60))}. Mensagem: ${message}. Se pedirem tarefas não disponíveis, seja transparente. Não invente compromissos, datas ou ações realizadas.`;
      const answer=await backend.askGemini(prompt);state.busy=false;aiReply(answer);
    }catch(err){state.busy=false;aiReply('Não consegui consultar o Gemini agora: '+(err.message||'erro na conexão'));}
  }else{aiReply('Posso criar tarefas, consultar seus compromissos e organizar seu dia. Para perguntas livres, a inteligência artificial online ainda precisa ser integrada.');}
}
function organize(){
  state.view='assistente';
  const next=state.items.filter(i=>i.kind==='event'&&i.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,2);
  const todo=state.items.filter(i=>i.kind==='task'&&!i.done);
  const summary=`Você tem ${todo.length} tarefa${todo.length===1?'':'s'} pendente${todo.length===1?'':'s'}. `+(next.length?'Seus próximos compromissos são: '+next.map(x=>`${x.title}, ${niceDate(x.date)} às ${x.time}`).join('; ')+'.':'Não há compromissos futuros registrados.')+(todo.length?' Eu começaria por: '+todo.slice(0,3).map(x=>x.title).join(', ')+'.':'');
  state.chat.push({role:'ai',text:summary});render();speak(summary);
}
function startVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast('Reconhecimento de voz indisponível neste navegador. Use o campo de texto.');return}
  try{
    recog=new SR();recog.lang='pt-BR';recog.interimResults=false;recog.maxAlternatives=1;
    recog.onresult=e=>{const transcript=e.results[0][0].transcript;state.view='assistente';handleChat(transcript)};
    recog.onerror=e=>toast('Não consegui ouvir: '+e.error);
    recog.start();toast('Estou ouvindo. Fale seu comando.');
  }catch(err){toast('Microfone não disponível: '+err.message)}
}
async function testAI(){
  if(!state.remoteUser||!backend){toast('Conecte o Firebase e entre na sua conta para testar o Gemini.');return}
  toast('Enviando teste real ao Gemini...');
  try{const result=await backend.askGemini('Responda em português apenas: Conexão com o Gemini funcionando.');toast(result.slice(0,180))}
  catch(err){toast('Teste falhou: '+(err.message||err))}
}
function runDiagnostics(){
  const checks=[];
  try{const key='segundo_eu_diagnostic';localStorage.setItem(key,'ok');checks.push(['Armazenamento local',localStorage.getItem(key)==='ok']);localStorage.removeItem(key)}catch{checks.push(['Armazenamento local',false])}
  checks.push(['Telas e navegação',Boolean($('#app')&&state.items&&Array.isArray(state.items))]);
  checks.push(['Instalação PWA',Boolean(window.isSecureContext && 'serviceWorker' in navigator)]);
  checks.push(['Entrada por voz',Boolean(window.SpeechRecognition||window.webkitSpeechRecognition)]);
  checks.push(['Salvamento em arquivo de backup',true]);
  const entries=checks.map(([name,ok])=>`<div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eee"><span>${esc(name)}</span><b>${ok?'Disponível':'Indisponível / não configurado'}</b></div>`).join('');
  openModal('Diagnóstico local',`<p class="muted-note">Resultados neste navegador. Indisponível não significa necessariamente defeito: alguns recursos dependem de permissão ou configuração.</p>${entries}<p class="muted-note" style="margin-top:18px">O Gemini, a sincronização online e os lembretes em segundo plano não estão disponíveis nesta versão local.</p><button type="button" class="primary wide" data-act="close-modal">Fechar</button>`);
}
function exportData(){
  const text=JSON.stringify({exportedAt:new Date().toISOString(),items:state.items},null,2);
  const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  link.download='Segundo-Eu-Backup.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}
async function importData(file){
  if(!file)return;
  if(file.size>5_000_000){toast('Arquivo muito grande para importar.');return}
  let imported;
  try{
    const parsed=JSON.parse(await file.text());
    if(!Array.isArray(parsed.items))throw Error('Formato de backup inválido.');
    if(parsed.items.length>5000)throw Error('Muitos registros no arquivo.');
    imported=parsed.items.map(i=>{
      if(!i||typeof i!=='object'||!['task','event','memory'].includes(i.kind)||typeof i.title!=='string'||i.title.length>300)throw Error('Registro inválido no backup.');
      const id=String(i.id||uid()).slice(0,150);
      const title=i.title.trim();if(!title)throw Error('Há registro sem título.');
      const common={id,kind:i.kind,title};
      if(i.kind==='task')return {...common,date:/^\d{4}-\d\d-\d\d$/.test(i.date)?i.date:today(),priority:['Alta','Média','Baixa'].includes(i.priority)?i.priority:'Média',done:Boolean(i.done)};
      if(i.kind==='event')return {...common,date:/^\d{4}-\d\d-\d\d$/.test(i.date)?i.date:today(),time:/^\d\d:\d\d$/.test(i.time)?i.time:'09:00',location:String(i.location||'').slice(0,500),category:['pessoal','trabalho','estudos','familia','saude'].includes(i.category)?i.category:'pessoal'};
      return {...common,content:String(i.content||'').slice(0,20000),category:['Pessoal','Família','Trabalho','Ideias','Saúde','Finanças','Estudos','Viagens'].includes(i.category)?i.category:'Pessoal'};
    });
    if(!confirm(`Restaurar ${imported.length} registros? Isso substitui seus ${state.items.length} registros atuais. Faça um backup antes se precisar.`))return;
    state.items=imported;persistDemo();render();toast(`${imported.length} registros restaurados.`);
  }catch(err){toast('Não foi possível restaurar: '+err.message)}
}
function demoLogin(){
  state.remoteUser=null;state.logged=true;localStorage.setItem('segundo_eu_demo_logged','1');loadDemo();render();toast('Demonstração iniciada.');
}
function setView(view){state.view=view;render();window.scrollTo({top:0,behavior:'auto'})}
function actError(err){toast('Não foi possível concluir: '+(err?.message||err))}

document.addEventListener('click',async e=>{
  const target=e.target.closest('button');if(!target)return;
  const modalAction=target.dataset.act;
  try{
    if(modalAction==='close-modal'){closeModal();return}
    if(target.dataset.view){setView(target.dataset.view);return}
    if(target.dataset.day){state.day=target.dataset.day;render();return}
    if(target.dataset.filter){state.filter=target.dataset.filter;render();return}
    if(target.dataset.mfilter){state.memoryFilter=target.dataset.mfilter;render();return}
    if(target.dataset.toggle){const item=state.items.find(i=>i.id===target.dataset.toggle);if(item)await saveItem({...item,done:!item.done});return}
    if(target.dataset.edit){const i=state.items.find(x=>x.id===target.dataset.edit);if(i)editItem(i.kind,i.id);return}
    if(target.dataset.delete){await deleteItem(target.dataset.delete);return}
    switch(modalAction){
      case 'demo-login':demoLogin();break;
      case 'config':showConfig();break;
      case 'new-task':editItem('task');break;
      case 'new-event':editItem('event');break;
      case 'new-memory':editItem('memory');break;
       case 'police-mic':policeMic();break;
       case 'police-generate':{policeDraft.relato=$('#police-relato')?.value||policeDraft.relato;policeDraft.historico=policeReport(policeDraft.relato);if(!policeDraft.historico){toast('Descreva o ocorrido com mais detalhes.');break}render();break;}
       case 'police-clear':{if(confirm('Apagar o texto de rascunho desta página?')){policeDraft={relato:'',historico:'',orientacoes:''};render()}break;}
       case 'police-copy':{if(!policeDraft.historico)break;try{await navigator.clipboard.writeText(policeDraft.historico);toast('Histórico copiado.')}catch{toast('Selecione o texto na tela para copiar.')}break;}
       case 'police-download':policeDownload();break;
      case 'leave-demo':state.logged=false;localStorage.removeItem('segundo_eu_demo_logged');render();break;
      case 'go-today':state.day=today();render();break;
      case 'organize':organize();break;
      case 'mic':startVoice();break;
      case 'test-ai':await testAI();break;
      case 'diagnostic':runDiagnostics();break;
      case 'approve':if(state.pending)await confirmPendingAction();break;
      case 'reject':state.pending=null;aiReply('Certo, não salvei a tarefa.');break;
      case 'logout':if(backend)await backend.logout();break;
      case 'google-login':if(!backend){showConfig();toast('Configure o Firebase primeiro.')}else await backend.googleLogin();break;
      case 'notifications':if('Notification' in window){let permission=await Notification.requestPermission();toast(permission==='granted'?'Avisos permitidos neste dispositivo.':'Avisos não autorizados.')}else toast('Notificações não suportadas neste navegador.');break;
      case 'export':exportData();break;
      case 'import':document.getElementById('restore-file')?.click();break;
    }
  }catch(err){actError(err)}
});
document.addEventListener('input',e=>{
  if(e.target.id==='police-relato'){policeDraft.relato=e.target.value;policeDraft.historico='';return;}
   if(e.target.id==='memory-search'){
    state.memorySearch=e.target.value;
    const start=e.target.selectionStart,end=e.target.selectionEnd;
    render();const input=$('#memory-search');input?.focus();input?.setSelectionRange(start,end);
  }
});
document.addEventListener('change',e=>{
  if(e.target.id==='restore-file'){importData(e.target.files?.[0]);e.target.value='';return;}
  if(e.target.id==='voice-switch'){
    state.voiceOn=e.target.checked;localStorage.setItem('segundo_eu_voice',String(state.voiceOn));
    if(!state.voiceOn&&'speechSynthesis' in window)speechSynthesis.cancel();render();
  }
});
document.addEventListener('submit',async e=>{
  if(!['item-form','config-form','login-form','chat-form'].includes(e.target.id))return;
  e.preventDefault();const form=e.target,fd=new FormData(form);
  try{
    if(form.id==='item-form'){
      const kind=form.dataset.kind,id=form.dataset.id||uid();
      const previous=state.items.find(i=>i.id===id)||{};
      const item={...previous,id,kind,title:String(fd.get('title')||'').trim()};
      if(!item.title){toast('Informe o título.');return}
      if(kind==='event'){Object.assign(item,{date:fd.get('date'),time:fd.get('time'),location:String(fd.get('location')||''),category:fd.get('category')})}
      if(kind==='task'){Object.assign(item,{date:fd.get('date'),priority:fd.get('priority'),done:previous.done||false})}
      if(kind==='memory'){Object.assign(item,{content:String(fd.get('content')||''),category:fd.get('category')})}
      await saveItem(item);closeModal();
    }else if(form.id==='config-form'){
      const config={apiKey:String(fd.get('apiKey')).trim(),authDomain:String(fd.get('authDomain')).trim(),projectId:String(fd.get('projectId')).trim(),appId:String(fd.get('appId')).trim(),messagingSenderId:String(fd.get('messagingSenderId')).trim()};
      if(!config.apiKey||!config.projectId||!config.appId){toast('Preencha os dados necessários do Firebase.');return}
      state.firebaseConfig=config;state.appCheckSiteKey=String(fd.get('recaptchaSiteKey')||'').trim();
      localStorage.setItem('segundo_eu_fb_cfg',JSON.stringify(config));localStorage.setItem('segundo_eu_check_site',state.appCheckSiteKey);
      closeModal();await connectFirebase();render();
    }else if(form.id==='login-form'){
      if(!backend){showConfig();toast('Conecte o Firebase para entrar. Ou use a demonstração.');return}
      const intent=e.submitter?.value||'login',email=String(fd.get('email')).trim(),password=String(fd.get('password'));
      if(intent==='register')await backend.emailRegister(email,password);else await backend.emailLogin(email,password);
    }else if(form.id==='chat-form'){
      const text=String(fd.get('message')||'');await handleChat(text);
    }
  }catch(err){actError(err)}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
// Recupera a configuracao web salva e reconecta ao Firebase apos atualizar a pagina.
try {
  const savedConfig = JSON.parse(localStorage.getItem('segundo_eu_fb_cfg') || 'null');
  if (savedConfig?.apiKey && savedConfig?.projectId && savedConfig?.appId) {
    state.firebaseConfig = savedConfig;
  }
} catch (err) {
  console.warn('Configuracao do Firebase salva nao pode ser lida.', err);
}
state.checkingSession=Boolean(state.firebaseConfig);
loadDemo();render();
if (state.firebaseConfig) void connectFirebase();

if('serviceWorker' in navigator && /^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();
