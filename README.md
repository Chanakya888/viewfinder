# Viewfinder

Instant photo feedback for shoots. The photographer captures a shot and it appears on everyone else's screen in real time — no crowding around the camera, no AirDropping, no passing the phone around.

## How it works

1. Photographer opens the app and starts a session
2. A shareable link is generated — send it to whoever is on the shoot
3. Everyone opens the link on their phone or tablet
4. Every shot the photographer takes appears on all their screens instantly

## Stack

- **Frontend** — React + TypeScript, Vite
- **Backend** — Node.js + Express + Socket.IO, TypeScript
- **Real-time** — WebSockets via Socket.IO

## Running locally

**Backend**

```bash
cd server
npm install
npm start
```

**Frontend**

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and expects the backend on `http://localhost:3001`. You can configure these via a `.env` file:

```
VITE_SERVER_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
```

## Notes

- Photos are never stored — they pass through the server in memory and are gone once delivered
- Sessions last until the photographer ends them or disconnects
- Works across any device with a browser

---

from the desk of [Chanakya Kilaru](https://chanakyakilaru.com)
