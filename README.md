# LINDA WATU: Frontend Prototype

*Protecting lives, connecting people.*

A frontend-only demo (HTML, CSS, JavaScript) of the Linda Watu patient and doctor portals. No server, no build step. It is a demonstration with synthetic data. It is **not** an official UNHCR or WHO product.

## Run it
Open `index.html` in a browser. To test both portals together, open two tabs (one patient, one doctor). Actions in one tab appear in the other, because both share `localStorage`.

## Demo logins
| Portal  | Email                    | Password     |
|---------|--------------------------|--------------|
| Patient | patient@lindawatu.demo   | Patient@123  |
| Doctor  | doctor@lindawatu.demo    | Doctor@123   |

The sign-in page also has a **Fill in demo credentials** button.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Sign-in page: choose portal, enter credentials, verify |
| `patient.html` | Patient portal |
| `doctor.html` | Doctor portal |
| `css/style.css` | Brand colours, buttons, layout, responsive rules |
| `js/common.js` | Shared helpers: storage, session guard, validation, translation, chat |
| `js/login.js` | Authentication steps |
| `js/patient.js` | Patient portal logic |
| `js/doctor.js` | Doctor portal logic |

## Authentication steps
1. Choose a portal (patient or doctor).
2. Enter email and password. Fields turn green or red as you type, with a message under each field.
3. The app shows a "Verifying" state, then checks the credentials **for the chosen role**. A doctor login will not open the patient portal.
4. On success it saves a session (`sessionStorage`) and opens the portal. Three wrong attempts lock the button for 10 seconds.
5. Each portal checks the session on load. Without it, you return to sign-in. **Log out** clears it.

## What works
**Patient portal**
- Book a clinic consultation or home visit (validated form). Status updates when the doctor responds.
- Talk to a doctor: language choice (English, Kiswahili, Arabic), quick phrases, microphone, and 🔊 playback.
- My medicines: **Taken**, **Remind me later**, **Missed** (never advises doubling a dose). History is recorded.
- Report misconduct or unauthorized payment, with a case number and status. Doctors cannot see these.
- Red **Emergency** button with warning signs, a reference number, and a reminder to call 112 or 999. If offline, it says "Not delivered yet".

**Doctor portal**
- Accept or decline requests, then move home visits through On the way, Arrived, Completed.
- Read patient messages translated, and reply by phrase, text or voice.
- Issue prescriptions, which appear in the patient's medicines.
- See emergency alerts and acknowledge them.

## Limits of this prototype
- Credentials are visible in the source and data lives in the browser. A real system needs server authentication, encryption, row-level security and audit logs (for example Supabase).
- Translation uses a small built-in phrase list. Anything else shows the original with a warning. A real build needs an approved translation service and human interpreters for high-risk cases.
- Voice input and playback depend on the browser (Chrome and Edge work best).
- Not yet built: registration and refugee verification, admin dashboard, outbreak monitoring, visitor and caregiver modules, maternal and mental health modules, health card, offline sync.
