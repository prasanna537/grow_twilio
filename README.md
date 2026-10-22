# grow_twilio — WhatsApp Automation Platform

Powered by **WAHA** (WhatsApp HTTP API).

## Services

| Service | Port | Description |
|---|---|---|
| WAHA API | `3010` | WhatsApp REST API (NestJS) |
| WAHA Dashboard | `3001` | Web UI for sessions, chats, webhooks |

## Quick Start

### 1. Start the WAHA API (backend)

```bash
cd waha
node dist/main
```

> Reads config from `waha/.env`. Default API key: `waha-key-123`

### 2. Start the Dashboard (UI)

```bash
cd waha/dashboard
npm run dev
```

Open **http://localhost:3001** in your browser.

## Credentials

| | Value |
|---|---|
| Dashboard | `admin` / `admin123` |
| API Key | `waha-key-123` |
| Swagger UI | http://localhost:3010/api/swagger |

## What you can do

- 📱 **Connect WhatsApp** — Create a session, scan QR code
- 💬 **View Chats** — Browse messages and conversation history
- 📤 **Send Messages** — Manual or via REST API for automation
- 🔗 **Webhooks** — Get real-time events pushed to your endpoint
- 📖 **API Docs** — Full Swagger at `/api/swagger`
