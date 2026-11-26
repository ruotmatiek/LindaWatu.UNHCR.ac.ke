const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const EMPTY=()=>({appts:[],msgs:[],meds:[],cases:[],sos:[],log:[]});
const db=()=>{try{return Object.assign(EMPTY(),JSON.parse(localStorage.getItem("lw_db")))}catch{return EMPTY()}};
const save=d=>localStorage.setItem("lw_db",JSON.stringify(d));
const user=()=>{try{return JSON.parse(sessionStorage.getItem("lw_user"))}catch{return null}};
const ref=p=>p+"-"+Math.random().toString(36).slice(2,8).toUpperCase();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const now=()=>new Date().toLocaleString();

function toast(m,bad){const t=$("#toast");t.textContent=m;t.className="toast show"+(bad?" bad":"");clearTimeout(t.h);t.h=setTimeout(()=>t.className="toast",3200)}

// Authentication guard: wrong or missing session sends you back to the login page
function guard(role){const u=user();if(!u||u.role!==role){location.replace("index.html");return null}
 $("#who").textContent=u.name;$("#out").onclick=()=>{sessionStorage.removeItem("lw_user");location.replace("index.html")};return u}

function show(id){$$("main section").forEach(s=>s.classList.toggle("on",s.id===id));$$("nav button").forEach(b=>b.classList.toggle("act",b.dataset.s===id));scrollTo(0,0)}
function initNav(first){$$("nav button,[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.s||b.dataset.go));show(first)}

// Live field feedback: green when valid, red when not
function live(){$$("input:not([type=checkbox]),select,textarea").forEach(i=>i.addEventListener("input",()=>{const v=i.checkValidity();i.classList.toggle("ok",v);i.classList.toggle("bad",!v)}))}
// Form helper: native validation, then a short "working" state on the button
function submit(form,fn){form.onsubmit=e=>{e.preventDefault();const b=$("button[type=submit]",form),old=b.textContent;b.disabled=true;b.textContent="Sending…";
 setTimeout(()=>{fn(form);b.disabled=false;b.textContent=old;$$(".ok,.bad",form).forEach(x=>x.classList.remove("ok","bad"))},600)}}

// Translation demo: a small phrase dictionary (English, Kiswahili, Arabic). A real build would call an approved translation service.
const LANGS={en:["English","en-US"],sw:["Kiswahili","sw-KE"],ar:["العربية","ar-SA"]},LI={en:0,sw:1,ar:2};
const PH=[["I have a fever","Nina homa","عندي حمى"],["I have pain","Nina maumivu","أشعر بألم"],["I cannot breathe well","Siwezi kupumua vizuri","لا أستطيع التنفس جيدا"],["I need medicine","Ninahitaji dawa","أحتاج إلى دواء"],["Take the medicine twice a day","Tumia dawa mara mbili kwa siku","تناول الدواء مرتين يوميا"],["Please come to the clinic","Tafadhali njoo kliniki","من فضلك تعال إلى العيادة"],["Do you understand?","Unaelewa?","هل تفهم؟"]];
const tr=(t,to)=>{const p=PH.find(r=>r.includes(t));return p?p[LI[to]]:null};
function speak(t,l){if(!window.speechSynthesis)return toast("Voice playback is not supported in this browser",1);const u=new SpeechSynthesisUtterance(t);u.lang=LANGS[l][1];speechSynthesis.cancel();speechSynthesis.speak(u)}
function listen(l,cb){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return toast("Speech input is not supported in this browser",1);const r=new R();r.lang=LANGS[l][1];r.onresult=e=>cb(e.results[0][0].transcript);r.onerror=()=>toast("Could not hear you. Try again.",1);r.start();toast("Listening…")}
document.addEventListener("click",e=>{const b=e.target.closest("[data-say]");if(b)speak(b.dataset.say,b.dataset.l)});

function msgHTML(m,L){const t=m.lang===L?m.text:tr(m.text,L);
 return `<div class="msg ${m.from}"><b>${m.from==="patient"?"Patient":"Doctor"}</b><p dir="auto">${esc(t||m.text)}</p>${t?"":'<small class="warn">Not in the demo dictionary, so the original is shown. Use a professional interpreter for important medical advice.</small><br>'}<button class="mini" data-say="${esc(t||m.text)}" data-l="${t?L:m.lang}" aria-label="Play message">🔊 Listen</button></div>`}

// Shared consultation chat used by both portals
function chat(role,sel){const L=()=>sel.value;
 sel.innerHTML=Object.entries(LANGS).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join("");
 const fill=()=>$("#ph").innerHTML='<option value="">Choose a quick phrase…</option>'+PH.map(p=>`<option>${esc(p[LI[L()]])}</option>`).join("");
 const draw=()=>{const c=$("#chat");c.innerHTML=db().msgs.map(m=>msgHTML(m,L())).join("")||'<p class="muted">No messages yet. Pick a phrase, type, or press the microphone.</p>';c.scrollTop=c.scrollHeight};
 sel.onchange=()=>{fill();draw()};$("#ph").onchange=e=>$("#txt").value=e.target.value;
 $("#mic").onclick=()=>listen(L(),t=>$("#txt").value=t);
 $("#send").onclick=()=>{const t=$("#txt").value.trim();if(!t)return toast("Type, speak or pick a phrase first",1);const d=db();d.msgs.push({from:role,text:t,lang:L(),t:Date.now()});save(d);$("#txt").value="";$("#ph").value="";draw();toast("Message sent")};
 fill();draw();return draw}
