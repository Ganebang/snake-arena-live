# How to Access Snake Arena Live in Codespaces

## ✅ Option 1: Access via Codespace Port Forwarding (RECOMMENDED)

The application is **already running** via Docker on port 80!

### Steps to Access:
1. Look at the **bottom panel** of VS Code for the **"PORTS"** tab
2. Find **port 80** in the list
3. Click the **🌐 globe icon** or right-click → **"Open in Browser"**
4. This will open the app in your browser at a URL like:
   ```
   https://<your-codespace-name>-80.app.github.dev
   ```

### Check Services Status:
```bash
docker-compose ps
```

### View Logs:
```bash
docker-compose logs -f app
```

---

## 🔧 Option 2: Run Locally (Without Docker)

If you prefer to run the backend and frontend separately for development:

### 1. Stop Docker (if running):
```bash
docker-compose down
```

### 2. Install Dependencies:
```bash
make install
```

### 3. Initialize Database:
```bash
make db-init
```

### 4. Run Both Backend + Frontend:
```bash
make dev
```

This will start:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:8080

In Codespaces, these will be auto-forwarded. Check the PORTS tab for the forwarded URLs.

---

## 🎮 Testing the Multiplayer Feature

Once you access the application:

1. **Sign Up / Log In** with any email/password
2. **Start a game** on the home page
3. **Open a second tab** to the same URL
4. **Navigate to "Spectate"** page
5. **You should see yourself** as a live player with real-time updates!

---

## 🐛 Troubleshooting

### Can't find the PORTS tab?
- Press `Ctrl+J` (or `Cmd+J` on Mac) to open the bottom panel
- Look for the "PORTS" tab next to "TERMINAL" and "PROBLEMS"

### Port not forwarded?
- In the PORTS tab, click "Forward a Port" and enter `80`
- Set visibility to "Public" if needed

### Want to see API directly?
- Backend API docs: https://<your-codespace-name>-80.app.github.dev/api/v1/docs
- Or if running locally: http://localhost:8000/docs

### Docker issues?
Rebuild from scratch:
```bash
docker-compose down -v
docker-compose up -d --build
```
