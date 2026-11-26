/* ============================================================
   LINDA WATU · FULL APPLICATION LOGIC
   JSDoc-typed (TypeScript-ready, no build step required)
   ============================================================ */

/**
 * @typedef {'patient' | 'doctor' | 'nurse' | 'caregiver' | 'admin'} Portal
 * @typedef {'portal' | 'signin' | 'verify'} StepName
 * @typedef {Object} State
 * @property {Portal} portal
 * @property {boolean} signedIn
 * @property {StepName} step
 */

(function () {
  'use strict';

  /** @type {Record<Portal, {email:string,password:string}>} */
  const CREDENTIALS = {
    patient:   { email: 'patient@lindawatu.demo',   password: 'Patient@123' },
    doctor:    { email: 'doctor@lindawatu.demo',    password: 'Doctor@123' },
    nurse:     { email: 'nurse@lindawatu.demo',     password: 'Nurse@123' },
    caregiver: { email: 'caregiver@lindawatu.demo', password: 'Caregiver@123' },
    admin:     { email: 'admin@lindawatu.demo',     password: 'Admin@123' }
  };

  /** @type {State} */
  const state = { portal: 'patient', signedIn: false, step: 'portal' };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const steps        = $$('.step');
  const navSteps     = $$('.nav-step');
  const portalCards  = $$('.portal-card');
  const signinForm   = $('#signin-form');
  const emailInput   = $('#email');
  const passInput    = $('#password');
  const emailError   = $('#email-error');
  const passError    = $('#password-error');
  const togglePass   = $('#toggle-pass');
  const signinLabel  = $('#signin-portal-label');
  const verifyMsg    = $('#verify-message');
  const verifyBar    = $('#verify-bar');
  const verifyBtn    = $('#verify-continue-btn');
  const toastEl      = $('#toast');
  const offlineBadge = $('#offline-badge');

  /* ---------- TOAST ---------- */
  let toastTimer;
  function toast(msg, isError) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.toggle('error', !!isError);
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- STEP NAV ---------- */
  function goToStep(step) {
    if (step === 'verify' && !state.signedIn) { toast('Please sign in first.', true); return; }
    if ((step === 'portal' || step === 'signin') && state.signedIn) return;

    state.step = step;
    steps.forEach(s => s.classList.toggle('active', s.id === `step-${step}`));
    navSteps.forEach(n => n.classList.toggle('active', n.dataset.step === step));

    if (step === 'signin') {
      signinLabel.textContent = state.portal.charAt(0).toUpperCase() + state.portal.slice(1);
      const cred = CREDENTIALS[state.portal];
      emailInput.value = cred.email;
      passInput.value  = cred.password;
      emailError.textContent = '';
      passError.textContent = '';
      emailInput.classList.remove('invalid');
      passInput.classList.remove('invalid');
      setTimeout(() => emailInput.focus(), 200);
    }
    if (step === 'verify') runVerification();
  }

  /* ---------- PORTAL CARDS ---------- */
  portalCards.forEach(card => {
    card.addEventListener('click', () => {
      state.portal = /** @type {Portal} */ (card.dataset.portal);
      toast(`Continuing to ${state.portal} sign in…`);
      setTimeout(() => goToStep('signin'), 250);
    });
  });

  /* ---------- NAV BUTTONS ---------- */
  navSteps.forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.step;
      if (t === 'verify' && !state.signedIn) { toast('Please sign in first.', true); return; }
      if ((t === 'portal' || t === 'signin') && state.signedIn) { toast('Please log out first.', true); return; }
      goToStep(t);
    });
  });

  $$('[data-step]').forEach(btn => {
    if (btn.classList.contains('nav-step')) return;
    btn.addEventListener('click', () => goToStep(btn.dataset.step));
  });

  /* ---------- PASSWORD TOGGLE ---------- */
  togglePass.addEventListener('click', () => {
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    togglePass.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    togglePass.setAttribute('aria-label', isPass ? 'Hide password' : 'Show password');
  });

  /* ---------- SIGN IN ---------- */
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    emailError.textContent = ''; passError.textContent = '';
    emailInput.classList.remove('invalid'); passInput.classList.remove('invalid');

    const email = emailInput.value.trim().toLowerCase();
    const pass  = passInput.value;
    const cred  = CREDENTIALS[state.portal];
    let ok = true;

    if (!email) { emailError.textContent = 'Please enter your email.'; emailInput.classList.add('invalid'); ok = false; }
    else if (email !== cred.email) { emailError.textContent = 'Email does not match this portal.'; emailInput.classList.add('invalid'); ok = false; }
    if (!pass) { passError.textContent = 'Please enter your password.'; passInput.classList.add('invalid'); ok = false; }
    else if (pass !== cred.password) { passError.textContent = 'Incorrect password.'; passInput.classList.add('invalid'); ok = false; }

    if (!ok) { toast('Please check your credentials.', true); return; }

    state.signedIn = true;
    toast(`Welcome to the ${state.portal} portal!`);
    goToStep('verify');
  });

  /* ---------- VERIFICATION ---------- */
  function runVerification() {
    verifyMsg.textContent = 'Verifying your identity…';
    verifyBar.style.width = '0%';
    verifyBtn.disabled = true;
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      verifyBar.style.width = progress + '%';
      if (progress === 20) verifyMsg.textContent = 'Checking registration status…';
      if (progress === 60) verifyMsg.textContent = 'Confirming role and permissions…';
      if (progress === 80) verifyMsg.textContent = 'Almost ready…';
      if (progress >= 100) {
        clearInterval(interval);
        verifyMsg.textContent = '✅ Identity verified. Registration checks never delay emergency care.';
        verifyBtn.disabled = false;
      }
    }, 350);
  }

  verifyBtn.addEventListener('click', () => {
    if (!state.signedIn) { toast('Please sign in first.', true); return; }
    steps.forEach(s => s.classList.remove('active'));
    const map = {
      patient:   '#patient-dashboard',
      doctor:    '#doctor-dashboard',
      nurse:     '#nurse-dashboard',
      caregiver: '#caregiver-dashboard',
      admin:     '#admin-dashboard'
    };
    $$('.dashboard').forEach(d => { d.classList.remove('active'); d.setAttribute('aria-hidden', 'true'); });
    const target = $(map[state.portal]);
    if (target) { target.classList.add('active'); target.setAttribute('aria-hidden', 'false'); }
    toast(`Signed in as ${state.portal}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- LOGOUT ---------- */
  $$('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.signedIn = false;
      state.step = 'portal';
      $$('.dashboard').forEach(d => { d.classList.remove('active'); d.setAttribute('aria-hidden', 'true'); });
      goToStep('portal');
      toast('Logged out safely.');
    });
  });

  /* ---------- OFFLINE SIMULATION ---------- */
  function updateOnlineStatus() {
    const online = navigator.onLine;
    offlineBadge.classList.toggle('offline', !online);
    offlineBadge.innerHTML = online
      ? '<i class="fas fa-wifi"></i> Online'
      : '<i class="fas fa-wifi-slash"></i> Offline · queued';
  }
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  /* ============================================================
     PATIENT ACTIONS
     ============================================================ */

  /* Profile save */
  const profileForm = $('#profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      toast('Profile saved successfully.');
    });
  }

  /* Caretaker save */
  const caretakerForm = $('#caretaker-form');
  if (caretakerForm) {
    caretakerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      toast('Caretaker information saved.');
    });
  }

  /* Book a doctor */
  const bookForm = $('#book-form');
  const bookList = $('#book-list ul');
  if (bookForm && bookList) {
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type   = $('#book-type').value;
      const dept   = $('#book-dept').value;
      const date   = $('#book-date').value;
      const time   = $('#book-time').value;
      const reason = $('#book-reason').value.trim();
      if (!date || !time || !reason) { toast('Please complete date, time and problem.', true); return; }
      const li = document.createElement('li');
      li.innerHTML = `<strong>${type === 'home' ? 'Home visit' : 'Clinic'} · ${dept}</strong>
        <span>${date} at ${time}</span>
        <span>Status: <em>Requested</em></span>`;
      bookList.prepend(li);
      bookForm.reset();
      toast('Request sent. A doctor will respond soon.');
    });
  }

  /* Patient chat */
  const chatWindow = $('#chat-window');
  const chatInput  = $('#chat-input');
  const chatSend   = $('#chat-send');
  const talkLang   = $('#talk-lang');
  const talkTarget = $('#talk-target');
  const micBtn     = $('#mic-btn');
  const speakerBtn = $('#speaker-btn');

  function addChatMessage(kind, label, text) {
    if (!chatWindow) return;
    const div = document.createElement('div');
    div.className = `msg ${kind}`;
    div.innerHTML = `<span>${label}</span>${text}`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function sendPatientMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    const fromLang = talkLang.value;
    const toLang   = talkTarget.value;
    addChatMessage('patient', `You (${fromLang}):`, text);
    chatInput.value = '';
    setTimeout(() => {
      addChatMessage('ai', '<i class="fas fa-robot"></i> AI translation:', `"${text}" → ${toLang}.`);
    }, 400);
    setTimeout(() => {
      addChatMessage('doctor', `Doctor (${toLang}):`, 'Thank you, I have noted this. Please describe when it started.');
    }, 900);
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendPatientMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); sendPatientMessage(); }
    });
  }
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      const text = chatInput.value.trim();
      if (!text) { toast('Type a message first, then press the microphone to simulate voice.', true); return; }
      toast(`🎤 Voice captured in ${talkLang.value}. Translating to ${talkTarget.value}…`);
      setTimeout(() => addChatMessage('ai', '<i class="fas fa-robot"></i> Voice translation:',
        `"${text}" (${talkLang.value} → ${talkTarget.value}).`), 500);
    });
  }
  if (speakerBtn) {
    speakerBtn.addEventListener('click', () => {
      toast('🔊 Playing translation aloud (simulated).');
    });
  }

  /* Medicine */
  const medList    = $('#med-list');
  const medHistory = $('#med-history');
  if (medList && medHistory) {
    medList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-med]');
      if (!btn) return;
      const action = btn.dataset.med;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let label = '';
      if (action === 'taken')  label = '✅ Medicine taken';
      if (action === 'later')  label = '⏰ Reminder postponed';
      if (action === 'missed') label = '⚠️ Dose missed — contact your healthcare provider';
      const li = document.createElement('li');
      li.textContent = `${time} · ${label}`;
      medHistory.prepend(li);
      toast(label);
    });
  }

  /* Visitor management */
  const visitorForm = $('#visitor-form');
  const visitorList = $('#visitor-list');
  if (visitorForm && visitorList) {
    visitorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name  = $('#v-name').value.trim();
      const date  = $('#v-date').value;
      const time  = $('#v-time').value;
      if (!name || !date || !time) { toast('Please complete visitor name, date and time.', true); return; }
      const pass = 'VST-' + Math.floor(1000 + Math.random() * 9000);
      const li = document.createElement('li');
      li.innerHTML = `<span><strong>${name}</strong> · ${date} at ${time} · <em>${pass}</em></span>
        <span class="badge success">Approved</span>`;
      visitorList.prepend(li);
      visitorForm.reset();
      toast(`Visitor registered. Pass: ${pass}`);
    });
  }

  /* Report + UNHCR escalation */
  const reportForm = $('#report-form');
  const caseList   = $('#case-list ul');
  let lastCaseRef  = '';
  if (reportForm && caseList) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const what     = $('#report-what').value;
      const facility = $('#report-facility').value.trim();
      const details  = $('#report-details').value.trim();
      const anon     = $('#report-anon').checked;
      if (!details) { toast('Please describe what happened.', true); return; }

      lastCaseRef = 'CASE-' + Math.floor(100000 + Math.random() * 900000);
      const li = document.createElement('li');
      li.innerHTML = `<strong>${lastCaseRef}</strong> · ${what}
        <span>${facility || 'Facility not specified'}</span>
        <span>Status: <em>Submitted</em> · ${anon ? 'Anonymous' : 'Identified'}</span>`;
      caseList.prepend(li);
      reportForm.reset();
      toast(`Report submitted. Reference: ${lastCaseRef}`);
    });
  }
  const unhcrCopy = $('#unhcr-copy');
  if (unhcrCopy) {
    unhcrCopy.addEventListener('click', () => {
      const text = lastCaseRef || 'No case reference yet — please submit a report first.';
      navigator.clipboard?.writeText(text).then(
        () => toast(`Copied: ${text}`),
        () => toast(text)
      );
    });
  }

  /* Emergency */
  const emergencySend = $('#emergency-send');
  if (emergencySend) {
    emergencySend.addEventListener('click', () => {
      const signs = $$('.emergency-sign:checked').length;
      const desc  = $('#emergency-desc').value.trim();
      if (signs === 0 && !desc) { toast('Please select warning signs or describe the emergency.', true); return; }
      const ref = 'EMG-' + Math.floor(1000 + Math.random() * 9000);
      toast(`🚨 Emergency activated. Reference: ${ref}. Call 112 or 999 now.`, true);
      setTimeout(() => {
        alert('EMERGENCY ACTIVATED\n\nCall 112 or 999 immediately.\n\nReference: ' + ref +
          '\nNearest facility: Kakuma Main Hospital\nEmergency team notified (simulated).');
      }, 300);
    });
  }

  /* Maternal save */
  const matSave = $('#mat-save');
  if (matSave) matSave.addEventListener('click', () => toast('Pregnancy record saved.'));

  /* Mental health */
  const mentalRequest = $('#mental-request');
  if (mentalRequest) mentalRequest.addEventListener('click', () => toast('Mental health support requested. A counsellor will contact you.'));

  /* Education grid */
  const eduList = $('#edu-list ul');
  $$('.education-grid .grid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.dataset.edu;
      const lang  = $('#edu-lang')?.value || 'English';
      toast(`📚 Opening "${topic}" in ${lang}…`);
      if (eduList) {
        const li = document.createElement('li');
        li.textContent = `${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · ${topic} (${lang})`;
        eduList.prepend(li);
      }
    });
  });

  /* ============================================================
     DOCTOR ACTIONS
     ============================================================ */

  const requestList = $('#request-list');
  if (requestList) {
    requestList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-req]');
      if (!btn) return;
      const labels = {
        accept: '✅ Request accepted',
        reject: '❌ Request rejected',
        info:   'ℹ️ Additional information requested'
      };
      toast(labels[btn.dataset.req] || 'Action done');
    });
  }

  /* Doctor chat */
  const doctorChat    = $('#doctor-chat');
  const doctorInput   = $('#doctor-chat-input');
  const doctorSend    = $('#doctor-chat-send');
  const doctorMic     = $('#doctor-mic-btn');
  const doctorSpeaker = $('#doctor-speaker-btn');
  const doctorTarget  = $('#doctor-target');

  function addDoctorChat(kind, label, text) {
    if (!doctorChat) return;
    const div = document.createElement('div');
    div.className = `msg ${kind}`;
    div.innerHTML = `<span>${label}</span>${text}`;
    doctorChat.appendChild(div);
    doctorChat.scrollTop = doctorChat.scrollHeight;
  }

  function sendDoctorMessage() {
    const text = doctorInput.value.trim();
    if (!text) return;
    const toLang = doctorTarget?.value || 'English';
    addDoctorChat('doctor', 'You (English):', text);
    doctorInput.value = '';
    setTimeout(() => {
      addDoctorChat('ai', '<i class="fas fa-robot"></i> Translated to patient language:', `"${text}" → ${toLang}.`);
    }, 400);
  }
  if (doctorSend) doctorSend.addEventListener('click', sendDoctorMessage);
  if (doctorInput) {
    doctorInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); sendDoctorMessage(); }
    });
  }
  if (doctorMic) {
    doctorMic.addEventListener('click', () => {
      const text = doctorInput.value.trim();
      if (!text) { toast('Type a reply first, then press the microphone to simulate voice.', true); return; }
      toast(`🎤 Voice captured. Translating to ${doctorTarget?.value || 'English'}…`);
      setTimeout(() => addDoctorChat('ai', '<i class="fas fa-robot"></i> Voice translation:', `"${text}" (simulated).`), 500);
    });
  }
  if (doctorSpeaker) {
    doctorSpeaker.addEventListener('click', () => toast('🔊 Playing translation aloud (simulated).'));
  }

  /* Translation buttons */
  $$('[data-translate]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.translate;
      const sample = {
        English:   '"I feel pain in my chest." (English)',
        Kiswahili: '"Nahisi maumivu kifuani." (Kiswahili)',
        Arabic:    '"أشعر بألم في الصدر" (Arabic)',
        Somali:    '"Waxaan dareemayaa xanuun laabta." (Somali)',
        Turkana:   '"Akiyau ekisil." (Turkana, demo)',
        Nuer:      '"Tɛ̱ɛ̱r kä thïn." (Nuer, demo)',
        Dinka:     '"Yï röt nɔŋ." (Dinka, demo)',
        Other:     'Translation to selected language (simulated).'
      };
      addDoctorChat('ai', `<i class="fas fa-robot"></i> ${lang}:`, sample[lang] || sample.Other);
      toast(`Translated to ${lang}.`);
    });
  });

  /* Clinical actions */
  const clinicalLog = $('#clinical-log ul');
  $$('[data-clinical]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.clinical;
      toast(`📋 ${action} — action triggered.`);
      if (clinicalLog) {
        const li = document.createElement('li');
        li.textContent = `${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · ${action}`;
        clinicalLog.prepend(li);
      }
    });
  });

  /* Prescription */
  const rxForm   = $('#prescription-form');
  const rxIssued = $('#rx-issued ul');
  if (rxForm && rxIssued) {
    rxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const med   = $('#rx-medicine').value.trim();
      const dose  = $('#rx-dosage').value.trim();
      const freq  = $('#rx-frequency').value;
      const qty   = $('#rx-quantity').value;
      const first = $('#rx-first').value;
      const days  = $('#rx-duration').value;
      const doc   = $('#rx-doctor').value;
      const notes = $('#rx-notes').value.trim();
      if (!med || !dose || !first || !days) { toast('Please complete all required prescription fields.', true); return; }

      const li = document.createElement('li');
      li.innerHTML = `<strong>${med}</strong> · ${dose} · ${freq} · Qty ${qty}
        <span>First dose: ${first} · Duration: ${days} day(s)</span>
        <span>Prescribed by ${doc} · ${new Date().toLocaleDateString()}</span>
        ${notes ? `<span>Note: ${notes}</span>` : ''}
        <span>Status: <em>Issued</em></span>`;
      rxIssued.prepend(li);
      rxForm.reset();
      toast('Prescription issued successfully.');
    });
  }

  /* Outbreak alert */
  const outbreakBtn = $('#outbreak-alert-btn');
  if (outbreakBtn) {
    outbreakBtn.addEventListener('click', () => {
      toast('⚠️ Unusual increase flagged for review by public health professionals.', true);
    });
  }

  /* Emergency alert ack */
  const alertList = $('#alert-list');
  if (alertList) {
    alertList.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        toast('Emergency alert acknowledged.');
        const li = e.target.closest('li');
        if (li) li.style.opacity = '0.5';
        e.target.disabled = true;
        e.target.textContent = 'Acknowledged';
      }
    });
  }

  /* Nurse vitals */
  const nurseVitals = $('#nurse-vitals');
  if (nurseVitals) nurseVitals.addEventListener('click', () => toast('Vitals recorded (simulated).'));

  /* ---------- INIT ---------- */
  function init() {
    goToStep('portal');
    const today = new Date().toISOString().split('T')[0];
    const bookDate = $('#book-date');
    if (bookDate) bookDate.value = today;
    const visitorDate = $('#v-date');
    if (visitorDate) visitorDate.value = today;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();