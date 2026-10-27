# Setup (macOS, no Docker)

## 1. Prerequisites
```bash
brew install node            # Node 18+ (check: node -v)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
mongosh --eval "db.runCommand({ ping: 1 })"    # should print { ok: 1 }
```

## 2. Why port 5001
macOS Monterey and later uses port 5000 for AirPlay Receiver, so the API runs on **5001**. If you prefer 5000, disable it in System Settings > General > AirDrop & Handoff > AirPlay Receiver. Otherwise leave it at 5001.

## 3. Project init
```bash
mkdir smart-todo && cd smart-todo
mkdir server client docs
```
Server:
```bash
cd server && npm init -y
npm i express mongoose cors helmet morgan dotenv express-validator
npm i -D nodemon
```
Add to `server/package.json`: `"scripts": { "dev": "nodemon src/server.js", "start": "node src/server.js", "seed": "node src/seed.js" }`

Client:
```bash
cd ../client
npm create vite@latest . -- --template react
npm i axios react-router-dom date-fns recharts
npm i -D tailwindcss @tailwindcss/vite
```
Follow Tailwind's current Vite instructions (add the `@tailwindcss/vite` plugin and `@import "tailwindcss";` in `index.css`).

## 4. Environment files
`server/.env`
```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smart-todo
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```
`client/.env`
```
VITE_API_URL=/api
```
Add `.env` and `node_modules` to `.gitignore`. Commit a `server/.env.example`.

## 5. Run
```bash
# terminal 1
cd server && npm run seed && npm run dev      # http://localhost:5001/api/health
# terminal 2
cd client && npm run dev                      # http://localhost:5173
```

## 6. Troubleshooting
| Problem | Fix |
|---|---|
| `ECONNREFUSED 27017` | `brew services restart mongodb-community` |
| `EADDRINUSE :5001` | `lsof -i :5001` then `kill -9 <PID>` |
| CORS error | Check `CLIENT_ORIGIN` in `server/.env` and the Vite proxy |
| Apple Silicon issues | Use the Homebrew arm64 install; avoid Rosetta terminals |
