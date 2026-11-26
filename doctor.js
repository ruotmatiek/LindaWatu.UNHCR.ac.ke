const U=guard("doctor");if(U){
initNav("req");live();
const draw=chat("doctor",$("#lang"));
const flow=a=>a.type==="Home visit"?["Accepted","On the way","Arrived","Completed"]:["Accepted","Completed"];

function reqView(){const a=db().appts.slice().reverse();$("#cR").textContent=a.filter(x=>x.status==="Requested").length||"";
 $("#reqList").innerHTML=a.length?a.map(x=>{const f=flow(x),nx=f[f.indexOf(x.status)+1];
 return `<div class="card"><div class="row"><b>${esc(x.type)}: ${esc(x.dept)}</b><span class="badge ${x.status}">${esc(x.status)}</span></div>${esc(x.pt)}, ${esc(x.date)} at ${esc(x.time)}<br><small>${esc(x.reason)} (${esc(x.id)})</small>
 <div class="acts">${x.status==="Requested"?`<button class="btn teal" data-id="${x.id}" data-s="Accepted">Accept</button><button class="btn ghost" data-id="${x.id}" data-s="Declined">Decline</button>`:nx?`<button class="btn" data-id="${x.id}" data-s="${nx}">Mark: ${nx}</button>`:""}</div></div>`}).join(""):'<p class="muted">No requests yet. Ask the patient portal to send one.</p>'}
$("#reqList").onclick=e=>{const b=e.target.closest("button[data-id]");if(!b)return;const d=db();d.appts.find(x=>x.id===b.dataset.id).status=b.dataset.s;save(d);reqView();toast("Status: "+b.dataset.s)};

submit($("#rxF"),f=>{const d=db();d.meds.push({name:f.name.value.trim(),dose:f.dose.value.trim(),freq:f.freq.value,time:f.time.value,days:f.days.value,note:f.note.value.trim(),doctor:U.name,date:now()});save(d);f.reset();rxView();toast("Prescription sent to the patient")});
function rxView(){const m=db().meds.slice().reverse();$("#rxList").innerHTML=m.length?m.map(x=>`<div class="card"><b>${esc(x.name)}</b>, ${esc(x.dose)}, ${esc(x.freq)} for ${esc(x.days)} days<br><small>${esc(x.date)}</small></div>`).join(""):'<p class="muted">Nothing issued yet.</p>'}

function sosView(){const s=db().sos.slice().reverse();$("#cS").textContent=s.filter(x=>x.status!=="Acknowledged").length||"";
 $("#sosList").innerHTML=s.length?s.map(x=>`<div class="card alert"><div class="row"><b>${esc(x.id)}</b><span class="badge ${x.status}">${esc(x.status)}</span></div>${esc(x.pt)}, ${esc(x.time)}<br>${esc(x.signs.join(", "))}<br>${esc(x.t)}
 ${x.status==="Acknowledged"?"":`<div class="acts"><button class="btn red" data-sid="${x.id}">Acknowledge and respond</button></div>`}</div>`).join(""):'<p class="muted">No emergency alerts.</p>'}
$("#sosList").onclick=e=>{const b=e.target.closest("button[data-sid]");if(!b)return;const d=db();d.sos.find(x=>x.id===b.dataset.sid).status="Acknowledged";save(d);sosView();toast("Alert acknowledged")};

addEventListener("storage",()=>{reqView();rxView();sosView();draw()});
reqView();rxView();sosView()}
