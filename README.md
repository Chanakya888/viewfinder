# 📷 Viewfinder

**Stream photos to anyone, instantly.**

Open a session, share the link, and every photo you take appears on their screen the moment you snap it. No app, no video call, no waiting.

**[viewfinder.chanakyakilaru.com](https://viewfinder.chanakyakilaru.com)**

---

## How it works

1. Open Viewfinder and start a session
2. Share the link with whoever needs to see
3. Start shooting — every photo appears on their screen instantly

That's it. Sessions are temporary. Nothing is saved or stored anywhere.

---

## Stack

- **Frontend** — React + TypeScript, Vite
- **Backend** — Node.js + Express + Socket.IO
- **Deployed** — Railway (single deployment, Express serves the built frontend)

---

## Running locally

**Backend**

```bash
cd server
npm install
npm run dev
```

**Frontend**

```bash
npm install
npm run dev
```

Create a `.env` file at the root:

```
VITE_SERVER_URL=http://localhost:3001
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3001`.

---

## Privacy

Photos are never saved. They stream through the server in real time and are gone the moment they're delivered. Sessions delete themselves when the shooter disconnects.

---

from the desk of [Chanakya Kilaru](https://chanakyakilaru.com)
