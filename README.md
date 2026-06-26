<div align="center">

<br />

```
██╗   ██╗ ██████╗ ██╗  ██╗ █████╗
██║   ██║██╔═══██╗╚██╗██╔╝██╔══██╗
██║   ██║██║   ██║ ╚███╔╝ ███████║
╚██╗ ██╔╝██║   ██║ ██╔██╗ ██╔══██║
 ╚████╔╝ ╚██████╔╝██╔╝ ██╗██║  ██║
  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

### **Vadodara's Civic Voice**
*Because silence never fixed a pothole.*

<br />

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-00D4FF?style=for-the-badge&logoColor=black)](https://voxa.vadodara.in)
[![Backend](https://img.shields.io/badge/API_DOCS-Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://api.voxa.vadodara.in/swagger-ui.html)
[![License](https://img.shields.io/badge/LICENSE-MIT-A78BFA?style=for-the-badge)](./LICENSE)
[![Made in Vadodara](https://img.shields.io/badge/MADE_IN-VADODARA_🇮🇳-FF6B35?style=for-the-badge)](https://en.wikipedia.org/wiki/Vadodara)

<br />

> **VOXA** is a full-stack AI-powered civic complaint platform built for Vadodara Municipal Corporation (VMC).  
> Citizens snap a photo → Gemini AI analyses it → VMC gets notified → Problem gets fixed.  
> Every step tracked. Fully bilingual. Zero bureaucracy.

<br />

![VOXA Hero Screenshot](assets/hero.png)

</div>

---

<br />

## ⚡ What Is VOXA?

Vadodara has potholes. Broken streetlights. Overflowing garbage. And citizens who had no easy way to report them — until now.

**VOXA** gives every citizen a 30-second reporting tool and gives VMC officers a real-time command center. An AI model reads every photo, classifies the issue, scores its severity from 1–10, drafts a formal complaint letter in English + Gujarati, and routes it to the correct department — automatically.

No forms. No phone calls. No waiting in queues.

<br />

## 🎬 Demo

| Public Citizen Flow | Officer Dashboard | Admin God View |
|---|---|---|
| ![Report Flow](assets/reportflow.webp) | ![Officer](assets/officer%20dashboard.png) | ![Admin](assets/admin%20dashboard.png) |

<br />

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CITIZEN (Browser)                        │
│              React + TanStack Router + Tailwind                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / JWT
┌────────────────────────────▼────────────────────────────────────┐
│                     SPRING BOOT API                             │
│          Auth · Complaints · Officer · Admin · Notifications    │
└──────┬──────────────┬──────────────┬───────────────┬───────────┘
       │              │              │               │
┌──────▼─────┐ ┌──────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐
│ PostgreSQL │ │  Cloudinary │ │ Gemini API │ │  Twilio    │
│  (main DB) │ │ (photo CDN) │ │ (AI vision)│ │  (SMS OTP) │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

<br />

---

## ✨ Feature Breakdown

### 🧠 AI-Powered Analysis
```
Photo Upload  →  Gemini 2.5 Flash  →  JSON Response
                      ↓ (503/429?)
               Gemini 2.0 Flash   →  fallback #1
                      ↓ (still down?)
               Gemini 1.5 Flash   →  fallback #2
```
- **Category** — POTHOLE / GARBAGE / STREETLIGHT / WATER / SEWAGE / ROAD\_DAMAGE
- **Severity** — 1–10 with LOW / MEDIUM / HIGH / CRITICAL label
- **Department** — Auto-routed to correct VMC department
- **Bilingual letters** — Full official complaint in English + Gujarati
- **Confidence score** — 0.0–1.0 model certainty

<br />

### 🗺️ Live City Map
- Real-time pins for all active complaints across 19 wards
- Color-coded by severity
- Filter by category, status, ward

<br />

### 👷 Ward Officer Dashboard
- JWT-protected — only accessible by assigned ward officer
- Real-time complaint list sorted by combined priority score
- One-click status update: Submitted → Assigned → In Progress → Resolved
- Notes to citizen sent with each update
- Escalate to department head with one tap
- Auto-refresh every 58 seconds

<br />

### 🏛️ Department Head Dashboard
- City-wide view filtered by department
- Reassign complaints across all 19 wards
- Escalate critical issues directly to Admin

<br />

### 👑 Admin God View
- City Health Score (0–100) calculated from resolution rate, response time, critical backlog
- KPI tiles: total complaints, resolved today, critical active, avg resolution time
- 3 live analytics charts: complaints over time, by ward, by department
- Full activity log with actor, action, timestamp
- Create new officer/dept head/admin accounts in-app

<br />

### 📱 Citizen Features
- **Report** — Photo + description + GPS. Done in 30 seconds.
- **Track** — Enter phone number → see full timeline of your complaint
- **Upvote** — Community upvoting boosts priority score
- **Comments** — Citizens can add follow-up context
- **SMS** — Twilio sends tracking ID on submission + status updates

<br />

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TanStack Router** | File-based routing with SSR |
| **TanStack Start** | Full-stack React meta-framework |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations |
| **Recharts** | Analytics charts |
| **Axios** | HTTP client with JWT interceptors |
| **Lucide React** | Icon system |

### Backend
| Technology | Purpose |
|---|---|
| **Spring Boot 3** | REST API framework |
| **Spring Security** | JWT authentication + role guards |
| **PostgreSQL** | Primary database |
| **JPA / Hibernate** | ORM |
| **Cloudinary** | Photo storage + CDN |
| **Google Gemini API** | AI photo analysis (3-model fallback chain) |
| **Twilio** | SMS notifications |
| **Swagger / OpenAPI** | API documentation |

<br />

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Java 21+
- PostgreSQL 15+
- A Google Gemini API key (free tier works)

<br />

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/voxa.git
cd voxa
```

### 2. Backend setup

```bash
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Fill in your `application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/voxa
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password

# JWT
jwt.secret=your_256_bit_secret_here
jwt.expiration=86400000

# Gemini AI (3-model fallback chain)
gemini.api.key=YOUR_GEMINI_API_KEY
gemini.api.base-url=https://generativelanguage.googleapis.com/v1beta/models

# Cloudinary
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# Twilio (optional)
twilio.account-sid=your_sid
twilio.auth-token=your_token
twilio.phone-number=+1XXXXXXXXXX
```

```bash
./mvnw spring-boot:run
# API live at http://localhost:8080
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env.local
```

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

```bash
npm install
npm run dev
# App live at http://localhost:3000
```

### 4. Seed test accounts

The backend auto-seeds these on first run:

| Role | Email | Password |
|---|---|---|
| Admin | admin@voxa.in | Test@1234 |
| Ward Officer | officer@voxa.in | Test@1234 |
| Dept Head | roads@voxa.in | Test@1234 |

<br />

---

## 📁 Project Structure

```
voxa/
├── frontend/
│   ├── src/
│   │   ├── routes/              # File-based pages
│   │   │   ├── index.tsx        # Landing page
│   │   │   ├── report.tsx       # Citizen report flow
│   │   │   ├── map.tsx          # Live complaint map
│   │   │   ├── track.tsx        # Complaint tracker
│   │   │   ├── login.tsx        # Authority login
│   │   │   ├── ward-officer.tsx # Officer dashboard
│   │   │   ├── department-head.tsx
│   │   │   └── admin.tsx        # Admin god view
│   │   ├── components/voxa/     # Shared UI components
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios instance + interceptors
│   │   │   ├── apiService.ts    # All API calls
│   │   │   ├── auth.ts          # JWT session helpers
│   │   │   ├── types.ts         # TypeScript interfaces
│   │   │   └── adapters.ts      # Backend → UI shape converters
│   │   └── styles/
│
└── backend/
    └── src/main/java/com/voxa/
        ├── controller/          # REST endpoints
        ├── service/
        │   ├── GeminiService.java   # AI with 3-model fallback
        │   ├── ComplaintService.java
        │   └── AuthService.java
        ├── entity/              # JPA entities
        ├── repository/          # Spring Data repos
        ├── dto/                 # Request/response DTOs
        └── security/            # JWT filter + config
```

<br />

---

## 🔌 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/analyse` | None | Analyse photo with Gemini AI |
| `POST` | `/api/complaints` | None | Submit a complaint |
| `GET` | `/api/complaints/track` | None | Track by phone/tracking ID |
| `GET` | `/api/map/pins` | None | Get all map pins |
| `GET` | `/api/stats/public` | None | Public city stats |
| `POST` | `/api/auth/login` | None | Login (returns JWT) |
| `GET` | `/api/officer/complaints` | WARD\_OFFICER | Officer's ward complaints |
| `PATCH` | `/api/officer/complaints/:id/status` | WARD\_OFFICER | Update status + note |
| `GET` | `/api/dept/complaints` | DEPT\_HEAD | Dept-wide complaints |
| `PATCH` | `/api/dept/complaints/:id/reassign` | DEPT\_HEAD | Reassign to another ward |
| `GET` | `/api/admin/stats` | ADMIN | Full city KPIs |
| `GET` | `/api/admin/health-score` | ADMIN | City health score |
| `POST` | `/api/admin/users` | ADMIN | Create authority account |

Full Swagger docs at `/swagger-ui.html` when backend is running.

<br />

---

## 🔐 Auth Flow

```
POST /api/auth/login  →  { accessToken, refreshToken, role, wardId, ... }
         ↓
sessionStorage.setItem("authUser", JSON.stringify(user))
         ↓
Axios interceptor reads accessToken → adds Authorization: Bearer <token>
         ↓
Route guard reads role → redirects if wrong role
```

Three roles, three dashboards, zero cross-access.

<br />

---

## 🤖 Gemini Fallback Chain

The AI never goes down from your user's perspective:

```java
private static final List<String> MODEL_FALLBACK_CHAIN = List.of(
    "gemini-2.5-flash",   // primary — best quality
    "gemini-2.0-flash",   // fallback #1
    "gemini-1.5-flash"    // fallback #2
);
```

If a model returns `503` or `429`, the next one is tried instantly. All three models need to be simultaneously unavailable before the user sees an error — which has never happened in testing.

<br />

---

## 📸 Screenshots

<details>
<summary><b>🏠 Landing Page</b></summary>
<br />

![Landing](./docs/screenshots/landing.png)

</details>

<details>
<summary><b>📋 Report Flow</b></summary>
<br />

![Report](./docs/screenshots/report.png)

</details>

<details>
<summary><b>🗺️ Live Map</b></summary>
<br />

![Map](./docs/screenshots/map.png)

</details>

<details>
<summary><b>📍 Complaint Tracker</b></summary>
<br />

![Track](./docs/screenshots/track.png)

</details>

<details>
<summary><b>👷 Ward Officer Dashboard</b></summary>
<br />

![Officer](./docs/screenshots/officer.png)

</details>

<details>
<summary><b>👑 Admin God View</b></summary>
<br />

![Admin](./docs/screenshots/admin.png)

</details>

<br />

---

## 🗺️ Roadmap

- [ ] Push notifications (FCM)
- [ ] Mobile app (React Native)
- [ ] Gujarati voice input for complaints
- [ ] SLA breach auto-escalation
- [ ] Public leaderboard of most responsive wards
- [ ] WhatsApp bot integration
- [ ] Offline-first PWA support

<br />

---

## 🤝 Contributing

Contributions are welcome. This is built for Vadodara but the architecture works for any Indian municipal corporation.

```bash
# Fork → Branch → PR
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

Please open an issue first for major changes.

<br />

---

## 👨‍💻 Built By

<div align="center">

Built with obsession in **Vadodara, Gujarat 🇮🇳**

*Every pothole reported is a problem solved.*
*Every complaint tracked is a citizen heard.*
*Every resolution is a city that works.*

<br />

**If this helped you — drop a ⭐ on the repo. It means everything.**

<br />

[![GitHub stars](https://img.shields.io/github/stars/yourusername/voxa?style=for-the-badge&color=00D4FF)](https://github.com/yourusername/voxa)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/voxa?style=for-the-badge&color=A78BFA)](https://github.com/yourusername/voxa/fork)

</div>

<br />

---

<div align="center">
<sub>
VOXA · Vadodara Municipal Corporation · Built with React, Spring Boot, and a lot of chai ☕
</sub>
</div>
