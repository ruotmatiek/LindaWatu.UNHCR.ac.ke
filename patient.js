const U=guard("patient");if(U){
initNav("home");live();$("#date").min=new Date().toISOString().slice(0,10);
const draw=chat("patient",$("#lang"));$("#lang").id="lang";

function apptView(){const a=db().appts.filter(x=>x.pt===U.name).reverse();
 $("#appts").innerHTML=a.length?a.map(x=>`<div class="card row"><div><b>${esc(x.type)}: ${esc(x.dept)}</b><br>${esc(x.date)} at ${esc(x.time)}<br><small>${esc(x.id)}</small></div><span class="badge ${x.status}">${esc(x.status)}</span></div>`).join(""):'<p class="muted">No requests yet. Fill in the form above.</p>'}
submit($("#bookF"),f=>{const d=db();d.appts.push({id:ref("APT"),type:f.type.value,dept:f.dept.value,date:f.date.value,time:f.time.value,reason:f.reason.value.trim(),status:"Requested",pt:U.name});save(d);f.reset();apptView();toast("Request sent to the doctor")});

function medView(){const m=db().meds;
 $("#medList").innerHTML=m.length?m.map((x,i)=>`<div class="card"><b>${esc(x.name)}</b>, ${esc(x.dose)}<br>${esc(x.freq)} at ${esc(x.time)} for ${esc(x.days)} days<br><small>${esc(x.note||"Follow your doctor’s instructions")} (${esc(x.doctor)})</small>
 <div class="acts"><button class="btn teal" data-m="${i}" data-a="Taken">✔ I have taken my medicine</button><button class="btn ghost" data-m="${i}" data-a="Remind later">⏰ Remind me later</button><button class="btn ghost" data-m="${i}" data-a="Missed">✖ I missed my medicine</button></div></div>`).join(""):'<p class="muted">No prescriptions yet. Your doctor will add them here.</p>';
 const h=db().log.slice().reverse();$("#hist").innerHTML=h.length?h.map(l=>`<p>${esc(l.t)}: ${esc(l.med)}, <b>${esc(l.a)}</b></p>`).join(""):'<p class="muted">Nothing recorded yet.</p>'}
$("#medList").onclick=e=>{const b=e.target.closest("button[data-m]");if(!b)return;const d=db(),m=d.meds[b.dataset.m],a=b.dataset.a;
 d.log.push({med:m.name,a,t:now()});save(d);medView();
 if(a==="Taken")toast("Recorded. Well done.");
 if(a==="Missed")toast("Do not take a double dose. Follow your doctor’s instructions or contact your clinic.",1);
 if(a==="Remind later"){toast("We will remind you in 10 seconds (demo)");setTimeout(()=>toast("⏰ Time to take "+m.name),10000)}};

submit($("#repF"),f=>{const d=db();d.cases.push({id:ref("CASE"),kind:f.kind.value,place:f.place.value,det:f.det.value,anon:f.anon.checked,status:"Report submitted",t:now()});save(d);f.reset();caseView();toast("Report submitted. Keep your case number.")});
function caseView(){const c=db().cases.slice().reverse();$("#cases").innerHTML=c.length?c.map(x=>`<div class="card row"><div><b>${esc(x.id)}</b><br>${esc(x.kind)}${x.anon?" (anonymous)":""}</div><span class="badge">${esc(x.status)}</span></div>`).join(""):'<p class="muted">No reports yet.</p>'}

const sos=$("#sos");$$(".sosOpen").forEach(b=>b.onclick=()=>{sos.classList.add("open");$("#sosR").textContent=""});$("#sosX").onclick=()=>sos.classList.remove("open");
$("#sosF").onsubmit=e=>{e.preventDefault();const signs=$$(".sign").filter(x=>x.checked).map(x=>x.parentElement.textContent),t=$("#sosT").value.trim();
 if(!signs.length&&!t)return toast("Tick a warning sign or describe the emergency",1);
 const id=ref("SOS"),ok=navigator.onLine,d=db();d.sos.push({id,signs,t,time:now(),status:ok?"Sent":"Queued",pt:U.name});save(d);
 $("#sosR").innerHTML=ok?`<b>Alert sent to the demo doctor portal.</b><br>Reference: ${id}. Call 112 or 999 if you can.`:`<b>Not delivered yet.</b> You are offline. Reference: ${id}. Call 112 or 999 now.`;e.target.reset()};

addEventListener("storage",()=>{apptView();medView();caseView();draw()});
apptView();medView();caseView()}
