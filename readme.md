# tune-match

Interactive installation where visitors stand in physical zones to answer questions. Zone detection happens via blob tracking in TouchDesigner. Based on their answers, visitors receive a music genre result.

```
TouchDesigner → ws-server → tune-match (Next.js) → browser
```

## How it works

A question is projected on screen. The visitor walks into one of four physical zones to select their answer. After standing in a zone for 2 seconds, the answer is confirmed and the next question appears. At the end, the visitor receives a music genre result.

Zone to answer mapping:

| Zone   | Answer index |
| ------ | ------------ |
| top    | 0            |
| right  | 1            |
| bottom | 2            |
| left   | 3            |

## Project structure

```
tune-match-project/
├── tune-match/        # Next.js frontend + API
└── ws-server/         # WebSocket relay server
```

## Requirements

- Node.js 18+
- PostgreSQL database

## Getting started

Both servers must run simultaneously. Open two terminals.

**Terminal 1 — WebSocket server**

```bash
cd ws-server
npm install
npm run dev
```

**Terminal 2 — Next.js app**

```bash
cd tune-match
npm install
```

Create a `.env` file in `tune-match/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tune-match"
```

Set up the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the app:

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

---

## tune-match (Next.js)

Frontend and API for the quiz. Connects to the WebSocket server to receive zone data and confirms answers after a 2 second dwell time.

### Project structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── answers/route.ts    # POST — submit answers, returns result genre
│   │   ├── genres/route.ts     # GET  — all genres
│   │   └── questions/route.ts  # GET  — all questions with answer options
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main quiz page
├── components/
│   └── design/
│       └── logo.tsx
├── core/
│   ├── hooks/
│   │   └── useZoneDwell.ts     # WebSocket connection + dwell timer logic
│   └── modules/
│       ├── answers/types.ts    # ResultGenre, AnswersResponse, GenreScore
│       ├── questions/types.ts  # Question, AnswerOption, QuestionsResponse
│       └── zones/types.ts      # Zone, ZoneMessage, ZONE_TO_INDEX, ZONES
└── lib/
    └── prisma.ts
```

### API

**`GET /api/questions`** — returns all questions with answer options.

**`POST /api/answers`** — accepts answer option IDs, returns result genre.

```json
{ "answerOptionIds": ["id1", "id2", "id3"] }
```

**`GET /api/genres`** — returns all genres.

---

## ws-server (WebSocket relay)

Receives zone data from TouchDesigner and broadcasts it to all connected browsers. No logic — pure relay.

### Message format

```json
{ "type": "zone_update", "zone": "top" }
{ "type": "zone_update", "zone": null }
```

Valid zone values: `"top"`, `"right"`, `"bottom"`, `"left"`, `null`.

### TouchDesigner setup

Add a **WebSocket Out CHOP** and configure:

- **Host:** `localhost`
- **Port:** `3001`

Send zone updates via a Python Script DAT:

```python
import json

zones = {
    "top":    op("zone_top")[0],
    "right":  op("zone_right")[0],
    "bottom": op("zone_bottom")[0],
    "left":   op("zone_left")[0],
}

active = next((z for z, v in zones.items() if v > 0.5), None)

msg = json.dumps({ "type": "zone_update", "zone": active })
op("websocket1").sendText(msg)
```

### Testing without TouchDesigner

```bash
npx wscat -c ws://localhost:3001
```

Then type:

```json
{"type":"zone_update","zone":"top"}
{"type":"zone_update","zone":null}
```

## Start tracking python env

```bash
cd /Users/maarten/Files/DEV4/dev-4-tunematch/tracking
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
