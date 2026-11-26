// DEMO ONLY: credentials are in the page source. A real system verifies on a server (e.g. Supabase Auth).
const USERS={patient:{email:"patient@lindawatu.demo",pw:"Patient@123",name:"Demo Patient"},doctor:{email:"doctor@lindawatu.demo",pw:"Doctor@123",name:"Demo Doctor"}};
let role=null,fails=0;
const u0=user();if(u0)location.replace(u0.role+".html");

const step=n=>{$$(".step").forEach((s,i)=>s.classList.toggle("on",i===n-1));$$(".steps li").forEach((l,i)=>l.classList.toggle("on",i<n))};
function mark(id,ok,msg,force){const i=$("#"+id),show=!ok&&(force||i.value!=="");i.classList.toggle("ok",ok);i.classList.toggle("bad",show);$("#"+id+"E").textContent=show?msg:""}
function chk(force){const e=/^\S+@\S+\.\S+$/.test($("#email").value.trim()),p=$("#pw").value.length>=8;
 mark("email",e,"Enter a valid email address, for example name@example.com",force);mark("pw",p,"Password must have at least 8 characters",force);return e&&p}

$$(".role").forEach(b=>b.onclick=()=>{role=b.dataset.r;$("#rl").textContent=role==="doctor"?"Doctor":"Patient";step(2);$("#email").focus()});
$("#back").onclick=()=>step(1);
$("#eye").onclick=e=>{const p=$("#pw"),h=p.type==="password";p.type=h?"text":"password";e.target.textContent=h?"Hide":"Show"};
$("#demo").onclick=()=>{$("#email").value=USERS[role].email;$("#pw").value=USERS[role].pw;$("#fe").textContent="";chk(true);toast("Demo credentials filled in")};
["email","pw"].forEach(id=>$("#"+id).oninput=()=>{chk(false);$("#fe").textContent=""});

function lock(s){const b=$("#go");b.disabled=true;const t=setInterval(()=>{b.textContent="Wait "+s+" seconds";if(--s<0){clearInterval(t);b.disabled=false;b.textContent="Sign in";fails=0;$("#fe").textContent=""}},1000)}

$("#s2").onsubmit=e=>{e.preventDefault();if(!chk(true))return;
 step(3);$("#vm").textContent="Verifying your account…";$("#sp").style.display="block";
 setTimeout(()=>{const a=USERS[role];
  if($("#email").value.trim().toLowerCase()===a.email&&$("#pw").value===a.pw){
   sessionStorage.setItem("lw_user",JSON.stringify({role,name:a.name,email:a.email}));
   $("#sp").style.display="none";$("#vm").textContent="✔ Signed in as "+a.name+". Opening your portal…";setTimeout(()=>location.href=role+".html",800)}
  else{fails++;step(2);$("#fe").textContent="Wrong email or password for the "+role+" portal. Check the demo logins below.";if(fails>=3){$("#fe").textContent="Too many attempts. Please wait.";lock(10)}}},900)};
