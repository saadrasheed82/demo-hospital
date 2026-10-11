# Software Requirements Specification (SRS)

## Hospital Appointment Booking System — Demo

**Document Version:** 1.0  
**Date:** 2026-10-11  
**Prepared for:** Saad Hospital Demo Presentation  
**Product Mode:** Token-based queuing system (single hospital, web app)  
**Delivery Target:** 1-week sprint (~7 days build)  

---

## 1. Introduction

### 1.1 Purpose
This document defines the requirements for a **demo hospital appointment booking system** intended to demonstrate to hospital stakeholders how a digital token-based queue and appointment system would look and function.

### 1.2 Product Vision
"Replace the physical token-dispensing system with a web-based, token-queuing, real-time appointment and arrival management system that serves Admin, Counter Staff, Patients, and Doctors in a single hospital."

### 1.3 Document Conventions
- **[REQ-X]** = Requirement ID referenced in features  
- **[NFR-X]** = Non-functional requirement  
- ✅ = Confirmed for demo scope  
- ⚪ = Deferred / optional

---

## 2. Overall Description

### 2.1 Product Scope
A single, responsive **web application** — React + Tailwind CSS frontend with Firebase backend (Auth, Firestore, Realtime Database for queue state). An optional Express + in-memory fallback backend is available for offline demo runs.

### 2.2 User Roles
| Role | Description |
|---|---|
| **Admin** | Hospital IT / management. Creates doctors, specialties, counter staff, sets scheduling rules. |
| **Counter Staff** | Hospital reception. Books/reschedules appointments, views live queue, handles no-shows. |
| **Doctor** | Medical staff. Views today's tokens, marks arrival, clicks "Next Patient", logs consult notes. |
| **Patient** | End-user. Searches doctors, books appointments, pays, tracks token and doctor ETA. |

### 2.3 Demo Delivery
- **Method:** Multi-tab browser demo — different tabs logged in as different roles simultaneously.  
- **Data:** Pre-seeded realistic demo data (doctors, patients, specialties, slots) with one-click reset.  
- **Timeline:** 1-week sprint (~7 days build).

---

## 3. Functional Requirements

### 3.1 Admin

| ID | Feature | Description |
|---|---|---|
| [REQ-A1] | Manage doctors & specialties | Admin can create, edit, delete doctor profiles. Each doctor has: name, photo, specialty (from predefined list), qualification, room number, consultation fee. ✅ |
| [REQ-A2] | Doctor specialty catalog | Predefined specialties: General Medicine, Pediatrics, Cardiology, Dermatology, Orthopedics, Gastroenterology, Ophthalmology, Dental. Can add new specialties. ✅ |
| [REQ-A3] | Manage counter staff | Admin creates staff accounts with name, employee ID, assigned counters/terminals. ✅ |
| [REQ-A4] | Doctor scheduling rules | Admin sets daily working hours per doctor (start/end time), max patients per slot, consultation duration per specialty. ✅ |
| [REQ-A5] | Analytics & reporting | Admin views daily appointment volume, doctor workload, no-show rate, revenue summary (demo data). ✅ |
| [REQ-A6] | System configuration | Set hospital name, logo, working days, colors, demo data reset button. ✅ |

### 3.2 Authentication

| ID | Feature | Description |
|---|---|---|
| [REQ-AUT1] | Password login + seeded demo creds | Each role has seeded demo credentials displayed on the login page footer: `admin@hospital.com` / `admin123`, `staff@hospital.com` / `staff123`, etc. ✅ |
| [REQ-AUT2] | Session persistence | Login persists across browser tabs (same role). |

### 3.3 Appointment & Queue System

| ID | Feature | Description |
|---|---|---|
| [REQ-Q1] | Token-based queuing only | No fixed time slots. Patients get the next sequential token number on booking. ✅ |
| [REQ-Q2] | Real-time token assignment | Each new booking gets the next token in sequence for that doctor's queue (e.g., 101, 102, 103...). |
| [REQ-Q3] | No-show → move to last token | When a patient doesn't show up, they're moved to the end of the current queue with the last token number. ✅ |
| [REQ-Q4] | Live queue updates (real-time) | All views (doctor, staff, patient) see queue status changes instantly via Firebase Realtime DB. ✅ |

### 3.4 Doctor Dashboard

| ID | Feature | Description |
|---|---|---|
| [REQ-D1] | Today's appointment list | Shows: token number, patient name, age, complaint, booking time, payment status. ✅ |
| [REQ-D2] | Live arrival status with ETA | Doctor can toggle status: "On my way", "Arriving in 5 min", "Arrived". Patients & staff see this in real-time. ✅ |
| [REQ-D3] | Next patient button | Click "Next Patient" to advance token. Current patient status → Completed. Next patient highlighted. ✅ |
| [REQ-D4] | Consult notes & completion status | After each consult, doctor can mark: Completed, Rescheduled, No-show. Add optional diagnosis notes. ✅ |

### 3.5 Counter Staff Dashboard

| ID | Feature | Description |
|---|---|---|
| [REQ-S1] | Book/manage appointments | Search patient by name/phone/PID. Create new appointment → auto-assign next token. Edit/reschedule/cancel appointments. ✅ |
| [REQ-S2] | View live queue & status | See all tokens in order: which patients arrived, which are no-shows, which are being seen. Color-coded status badges. ✅ |
| [REQ-S3] | Reorder no-show to last | One-click "Move to End" action on a no-show patient — they get the last token number. ✅ |

### 3.6 Patient Dashboard

| ID | Feature | Description |
|---|---|---|
| [REQ-P1] | Search & book appointments | Browse doctors by specialty → select doctor → see next available token → confirm booking. ✅ |
| [REQ-P2] | Track doctor ETA & queue position | Real-time display: "Your token: #104, 3 patients ahead, Dr. Smith arriving in ~5 mins". ✅ |
| [REQ-P3] | Online payment (demo) | Per-specialty fee displayed. Mock payment gateway (no real transactions). Receipt shown after "payment". ✅ |
| [REQ-P4] | Cancel/reschedule | Before consulting starts, patient can cancel. After token is called, reschedule to next available. |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| [NFR-1] | Performance | Queue updates propagate to all clients within 2 seconds. ✅ |
| [NFR-2] | Responsiveness | App fully functional on: 1920×1080 (admin/staff), 1366×768 (doctor), 375×667 (patient mobile). |
| [NFR-3] | Demo data | Pre-seeded: 5 doctors across 4 specialties, 12 sample patients, 1 counter staff, 1 admin. |
| [NFR-4] | Browser support | Chrome, Firefox, Edge (latest 2 versions). ✅ |
| [NFR-5] | Deployment | Deployable on Vercel / Netlify (frontend) + Firebase (backend). One-click demo reset. ✅ |

---

## 5. Demo Flow (End-to-End Scenario)

1. **Admin sets up hospital** — creates Dr. Ahmed (Cardiology, $50), Dr. Fatima (General Medicine, $20), assigns rooms, sets working hours. Views dashboard.

2. **Patient books and pays** — Patient Sarah searches "Cardiology" → selects Dr. Ahmed → gets token #101 → pays $50 (mock) → receives confirmation.

3. **Doctor works queue** — Dr. Ahmed logs in → sees Sarah (token 101) → marks "Arriving in 5 min" → clicks "Next Patient" → adds note "BP checked, normal" → marks Completed.

4. **Staff handles no-show** — Counter staff sees Patient Ali didn't arrive → clicks "Move to End" → Ali gets token #105 (last in queue) → Ali notified via dashboard.

---

## 6. Deferrals ⚪

| Item | Reason |
|---|---|
| SMS/email notifications | Requires SMS gateway integration; mock only in demo. |
| Insurance + discount coupons | Complex pricing rules; mock fixed fees only. |
| React Native mobile app | Scope creep; web app is responsive/mobile-ready. |
| Queue priority (elderly, disabled) | Nice-to-have; not in demo scope. |
| Multi-hospital support | Out of scope; single hospital demo. |

---

## 7. Seeded Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hospital.com` | `admin123` |
| Counter Staff | `staff@hospital.com` | `staff123` |
| Doctor | `doctor@hospital.com` | `doctor123` |
| Patient | `patient@hospital.com` | `patient123` |

*(Credentials also displayed on the login page footer for demo convenience.)*

---

## 8. Seed Data

### Doctors
| Name | Specialty | Fee | Room |
|---|---|---|---|
| Dr. Ahmed | Cardiology | $50 | Cardio-1 |
| Dr. Fatima | General Medicine | $20 | GM-3 |
| Dr. Khan | Pediatrics | $30 | Peds-2 |
| Dr. Ali | Dermatology | $40 | Derm-1 |
| Dr. Noor | Orthopedics | $60 | Ortho-1 |

### Patients (sample)
| Name | Age | Phone | Condition |
|---|---|---|---|
| Sarah Johnson | 34 | 555-0101 | Chest pain |
| Ali Hassan | 45 | 555-0102 | Routine checkup |
| Maria Garcia | 28 | 555-0103 | Skin rash |
| Omar Faruk | 67 | 555-0104 | Joint pain |
| Layla Ameen | 12 | 555-0105 | Fever |
| ... (+7 more) | | | |

---

*End of SRS Document*