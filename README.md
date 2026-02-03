# 🚀 Real-Time API Health & Performance Monitor

A full-stack monitoring system that tracks **uptime, latency, and failure streaks** of APIs and websites in real time.  
Built to demonstrate **backend systems thinking**, **cold-start awareness**, and **production-style monitoring logic**.

---

## 🧠 Why this project exists

Most beginner monitoring projects:
- alert on a single failure ❌
- ignore cold starts ❌
- rely on manual testing ❌

This project intentionally solves those problems by:
- tolerating cold starts
- using consecutive-failure logic
- separating monitoring, analytics, and UI concerns

---

## ✨ Features

### 🔍 Monitoring
- Periodic health checks using a background script
- Tracks:
  - HTTP status
  - response time
  - uptime %
  - failure streaks

### 🚨 Smart Failure Detection
- **Consecutive failure threshold**
- Avoids false alerts caused by sleeping backends
- Per-service alert enable/disable toggle

### 📊 Analytics
- Average uptime per service
- Average latency per service
- Historical logs stored in PostgreSQL

### 🖥 Frontend Dashboard
- Add / delete services via UI
- Live service cards
- Failure streak visibility
- Alert toggle per service

---

## 🏗 System Architecture

GitHub Actions (cron)
↓
Monitoring Script (Python)
↓
Flask API (Railway)
↓
PostgreSQL (Supabase)
↓
React Dashboard

---

## 🧩 Tech Stack

### Backend
- Python
- Flask
- SQLAlchemy
- PostgreSQL (Supabase)
- Gunicorn

### Frontend
- React (Vite)
- Axios
- Tailwind CSS

### Monitoring
- Python requests
- GitHub Actions (cron jobs)

---

## 📦 Database Schema

### `monitored_services`
| Column | Type | Description |
|------|------|-------------|
| id | int | Primary key |
| name | text | Service name |
| url | text | Endpoint URL |
| is_active | bool | Monitoring enabled |
| consecutive_failures | int | Failure streak |
| alert_enabled | bool | Alerts toggle |
| created_at | timestamp | Created time |

### `health_logs`
| Column | Type | Description |
|------|------|-------------|
| id | int | Primary key |
| service_id | int | FK → monitored_services |
| status_code | int | HTTP response |
| response_time_ms | int | Latency |
| is_up | bool | Status |
| checked_at | timestamp | Check time |

---

## 🚦 Cold-Start Aware Logic (Important)

Free platforms (Render / Railway) **sleep on inactivity**.

To avoid false alerts:
- The system **does not alert on the first failure**
- Alerts trigger only after **N consecutive failures**

Example:

- 1st failure → ignored (cold start)
- 2nd failure → ignored
- 3rd failure → flagged as outage

This mimics real production monitoring systems.

---

## 🔁 Monitoring Flow

1. GitHub Actions runs every X minutes
2. Monitoring script:
   - fetches active services
   - pings each service
   - records latency + status
3. Failure streak:
   - resets on success
   - increments on failure
4. Alert triggers only if:
   - streak ≥ threshold
   - alerts are enabled for that service

---

## ▶️ Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

# 🌍 Deployed URLs

Backend API:
https://real-time-apihealthandperformancemonitor-production.up.railway.app

Frontend Dashboard:
(add your deployed frontend URL here)

---

# 🛣 Future Improvements

- Email / Slack notifications
- Latency charts (time-series)
- Service grouping (projects / personal)
- Authentication
- Rate-limit detection

---

# 👨‍💻 Author

Built by Vikram
Focused on backend systems, monitoring, and scalable architectures.