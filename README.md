# Tiny Collab 🚀

A real-time collaborative code editor built for speed and simplicity.

![Tiny Collab](https://img.shields.io/badge/Status-Active-success)

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit the same document efficiently using CRDTs (Yjs).
- **Code Execution**: Run your code instantly in the browser. Supports **JavaScript, TypeScript, Python, Java, and C#**.
- **Room System**: Create dynamic rooms by simple URL navigation or using the built-in room switcher.
- **Modern UI**: Sleek, VS Code-inspired Dark Theme.
- **Monaco Editor**: Powered by the same engine as VS Code for a premium editing experience.

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **React 19**: UI Framework.
- **Vite**: Ultra-fast build tool.
- **Monaco Editor** (`@monaco-editor/react`): The code editor component.
- **Yjs** & **y-monaco**: For shared state management and editor binding.
- **WebSocket** (`y-websocket`): For communicating with the synchronization server.
- **Piston API**: External API used for executing code safely in a sandboxed environment.

### Backend (`/backend`)
- **Node.js**: Runtime environment.
- **ws**: Lightweight WebSocket library.
- **Yjs**: Handles the conflict-free replication of data on the server side.
- **In-Memory Storage**: Room state is currently held in memory.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tiny-collab
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs on ws://localhost:1234
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173`. 
   - Share the URL to collaborate.
   - Type a new room name in the top bar to switch rooms.

## 📂 Project Structure

```
tiny-collab/
├── backend/          # Node.js WebSocket Server
│   ├── server.mjs    # Main server logic (Room handling, Yjs sync)
│   └── package.json
└── frontend/         # React + Vite Client
    ├── src/
    │   ├── App.tsx   # Main UI & Logic (Editor, Terminal, State)
    │   ├── styles.css# Dark Theme & Layout styles
    │   └── ws-yjs.ts # WebSocket provider helper
    └── package.json
```

## 🔌 API Usage

**Code Execution** is handled by sending code to the public [Piston API](https://github.com/engineer-man/piston).
- Endpoint: `https://emkc.org/api/v2/piston/execute`
- Method: `POST`

## 🔮 Roadmap (Future Features)

- [ ] **User Authentication**: Sign up/Login (GitHub/Google Auth) to save your snippets.
- [ ] **Cloud Persistence**: Save documents to a database (MongoDB/PostgreSQL) instead of in-memory only.
- [ ] **Multi-File Support**: Sidebar file explorer to manage multiple files in one room.
- [ ] **In-Room Chat**: Text or voice chat to communicate with collaborators.
- [ ] **Interactive Terminal**: Real input support for running programs (e.g., `input()`).
- [ ] **Custom Themes**: Allow users to switch between Light/Dark/High Contrast themes.

---
*Built with ❤️ by Aman*
