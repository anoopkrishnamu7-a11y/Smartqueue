# SmartQueue – Intelligent Digital Queue & Real-Time Notification System

> **"Your Time Matters. Join the Queue, Not the Crowd."**  
> *Secondary Tagline: "Book your token. Track your turn. Arrive at the right time."*

SmartQueue is a full-stack, enterprise-grade digital queue management and virtual waiting platform designed to eliminate physical waiting lines in government centers, hospitals, and high-volume retail hubs.

---

## 🌟 The 3 Featured Service Hubs

SmartQueue comes pre-configured with complete domain seed data, dedicated counters, and specialized workflows for three distinct public sectors:

1. **🏛️ Village Office (Perumbavoor Village Office)**
   * **Prefix:** `V` (e.g. `V101`, `V102`, `V105`)
   * **Services:** Certificate Application, Certificate Collection, Document Verification, Other Services
   * **Features:** Document checklist guidance, wheelchair accessibility counter, revenue patta desks.

2. **🏥 Hospital (SmartCare Hospital)**
   * **Prefix:** `H` (e.g. `H120`, `H121`, `H125`)
   * **Services:** Registration, Doctor Consultation, Laboratory, Pharmacy, Billing
   * **Features:** 💜 Priority Consultation Request with doctor room assignment, emergency triage warning disclaimer.

3. **🥤 Beverage Shop (FreshSip Beverage Shop)**
   * **Prefix:** `B` (e.g. `B101`, `B102`, `B205`)
   * **Services:** Order Counter, Beverage Pickup, Takeaway Collection
   * **Features:** Fast-moving pickup queues, order status tracking, express bar dispatch.

---

## ⭐ Core Signature Features

### 1. Two-Minute Turn Notification Engine (Section 13 & 14)
* **Real Queue-State Computation:** Does NOT use arbitrary timers. The system dynamically computes estimated wait time using:
  $$\text{Estimated Wait} = \text{People Ahead} \times \text{Average Service Duration}$$
* **Threshold Detection:** When $\text{Estimated Wait} \le \text{NOTIFICATION\_THRESHOLD\_MINUTES}$ (configurable, default 2 mins), SmartQueue triggers:
  1. **Native Browser Notification API** (with permission prompt and Service Worker fallback).
  2. **In-App Modal Alert:** *"🔔 Your turn is approaching! Your token: H125. Only a few customers are ahead of you. Estimated time: About 2 minutes. Please get ready to approach the service counter."*
  3. **Dual Audio Dispatch:** Web Audio chime synthesizer + Web Speech API voice alert (*"Token H125, your turn is approaching"*).
  4. **Duplicate Prevention:** State flags prevent redundant notifications for the same token.
* **Final Call Alert:** When staff calls the token to a counter, a secondary alert fires: *"🎉 It's Your Turn! Please proceed to Counter 2."*

### 2. 💜 Special Assistance & Priority Consultation Flow (Section 15, 16, 17)
* Dedicated entry point for **Senior Citizens (60+)**, **People with Disabilities**, **Mobility Assistance**, **Pregnancy Support**, and other accessibility needs.
* **Hospital Priority Review:** Users can check *"Request Priority Consultation"*. To maintain clinical integrity, the system explains: *Direct consultation is not automatically guaranteed and is subject to medical triage and staff approval.*
* **Staff Approval Workflow:** Hospital and Village Office staff can review incoming requests on their dashboard, assign a specific doctor or room (e.g., *Consultation Room 2*), and dispatch support staff.

### 3. 📺 Public TV Display Board (`/display`)
* High-contrast, large-typography signage board designed for waiting room TV monitors.
* Features **"NOW SERVING"** hero cards for Counter 1, Counter 2, and Counter 3 with glowing status badges.
* **"NEXT TOKENS"** column displaying upcoming visitors in line.
* Melodic chime audio toggle, live clock, and emergency ticker.

### 4. ⚡ Presentation Simulator & Demo Controls
* Sticky floating simulator widget available across all pages.
* **Multi-Hub Selector:** Test Hospital (`H125`), Village Office (`V105`), or Beverage Shop (`B205`).
* **Speed Multipliers:** Normal (1x), Fast (3x), or Presentation Mode (5x).
* **Step Next Button:** Progresses the queue one step, recalculating wait times in real-time.
* **1-Click Reset:** Instantly resets all queues and counters to pristine demo state.

### 5. 🧑‍💼 Staff Counter Console (`/staff`)
* Role-based login (`doctor`, `officer`, `barista`, `staff` with `password123`).
* 5 Metric cards: Total Served Today, Average Wait, Active in Line, Currently Serving, Special Assistance Pending.
* Real-time queue table with actions: **Call Next**, **Recall**, **Complete**, **Skip (No-show)**, **Put on Hold**, and **Transfer Service**.
* Special Assistance approval drawer with 1-click approve/reject and room assignment.

### 6. 🛡️ Administrator Analytics & Config (`/admin`)
* System login (`admin` / `password123`).
* Real-time metrics: Daily volume, active queues, completion rate, CSAT satisfaction rating (4.9/5).
* Hourly queue traffic chart and category share breakdown.
* Dynamic configuration: Notification threshold minutes, average service duration, token prefixes, sound toggles.

### 7. 🎫 My Token Tracker (`/my-token`)
* Search by Mobile Number or Token Number.
* Real-time stepper with **Your Token**, **Currently Serving**, **People Ahead**, and **Estimated Wait**.
* Live progress bar showing journey from In-Queue to In-Service.
* Options to Print Ticket Pass or Cancel Token.

---

## 🏗️ Architecture & Technology Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons, Canvas Confetti.
* **Client-Side Routing:** HTML5 History API (`pushState` + `popstate`) supporting `/services`, `/special-assistance`, `/my-token`, `/staff`, `/admin`, `/display`, `/how-it-works`.
* **Real-Time Sync:** Server-Sent Events (SSE) via `/api/events` with heartbeat ping.
* **Voice & Audio:** HTML5 Web Audio API (polyphonic chime synthesizer) and Web Speech API.
* **Backend:** Node.js, Express REST API, JSON-backed persistent store (`server/data/database.json`).
* **Zero Third-Party API Dependency:** Runs 100% locally out-of-the-box without requiring paid API keys (Twilio, Firebase, etc.).

---

## 🚀 Quick Start Guide

### 1. Launch the Application
Run from the project root:
```powershell
cd C:\Users\Student\.gemini\antigravity\scratch\smartqueue
npm start
```
The unified production server starts at:
👉 **`http://localhost:5000`**

### 2. Run in Development Mode (Optional)
If modifying code with Hot Module Replacement (HMR):
```powershell
npm run dev
```
Vite will start at `http://localhost:5173` and proxy API calls to port `5000`.

---

## 👥 Demo Credentials

| Role | Username | Password | Default Hub / Location |
| :--- | :--- | :--- | :--- |
| **Hospital Doctor** | `doctor` | `password123` | SmartCare Hospital (Consultation Room 1) |
| **OPD Staff** | `staff` | `password123` | SmartCare Hospital (Consultation Room 2) |
| **Village Revenue Officer** | `officer` | `password123` | Perumbavoor Village Office (Counter 1) |
| **Lead Barista** | `barista` | `password123` | FreshSip Beverage Shop (Pickup Desk) |
| **System Administrator** | `admin` | `password123` | System-wide Executive Dashboard |

*(Convenient 1-click demo login buttons are also embedded on the login screens for effortless presentation).*

---

## 🧪 Automated & Manual Verification Suite

To verify the entire system against Section 36 test requirements:

```powershell
node test-e2e.js
```

### Verified Test Cases:
1. **Frontend Delivery:** Static assets and SPA routing fallback for `/services`, `/staff`, `/admin`.
2. **Multi-Hub Bootstrapping:** Village Office, Hospital, Beverage Shop hubs, counters, and seed tokens loaded.
3. **Sequential Token Generation:** Prefix `H` for Hospital, `V` for Village Office, `B` for Beverage Shop.
4. **Duplicate Prevention:** Rejects duplicate active tokens for the same phone number and service.
5. **Real-time Queue Progression:** `peopleAhead` decreases on queue progression.
6. **Two-Minute Notification Trigger:** Calculates wait time $\le 2$ minutes and fires in-app alert + audio chime.
7. **Final Turn Notification:** Fires counter call alert when staff summons the token.
8. **Staff Counter Controls:** Call Next, Recall, Complete, Skip, and Put on Hold.
9. **Special Assistance Request:** Creates request with disability/senior citizen metadata.
10. **Special Assistance Approval:** Hospital staff assigns room and approves direct consultation.
11. **Admin Analytics & Settings:** Configurable notification thresholds and live traffic metrics.
12. **Presentation Reset:** 1-click simulation reset restores original demo tokens (`H125`, `V105`, `B205`).

---

## 📱 Navigation Links & Routes

* **Homepage:** `http://localhost:5000/`
* **Services Directory:** `http://localhost:5000/services`
* **Special Assistance Portal:** `http://localhost:5000/special-assistance`
* **My Token Tracker:** `http://localhost:5000/my-token`
* **How It Works:** `http://localhost:5000/how-it-works`
* **Public TV Signage Board:** `http://localhost:5000/display`
* **Staff Dashboard:** `http://localhost:5000/staff`
* **Admin Dashboard:** `http://localhost:5000/admin`
