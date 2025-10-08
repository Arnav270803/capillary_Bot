# Capillary Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5-orange.svg)](https://vitejs.dev/)

## Overview

Capillary Bot is a simple, AI-powered chatbot designed to help developers and users quickly navigate and understand CapillaryTech's documentation. Whether you're new to their APIs, onboarding processes, or features like InTouch trackers and customer management, this bot pulls relevant info from official docs and delivers clear, structured answers with code snippets and citations.

Think of it as your personal docs assistant: Ask "How do I authenticate with the API?" and get a step-by-step response with examples—no more digging through pages. It's built for ease, using free tools and a Retrieval-Augmented Generation (RAG) setup to keep answers accurate and grounded in real docs.

This project was thrown together as a weekend hack to streamline CapillaryTech queries, but it's production-ready for personal use or small teams.

## Features

- **Smart Query Handling**: Type a question, get a formatted response with numbered steps, bullet points, code examples (JS/Python), and source links.
- **RAG-Powered**: Scrapes and embeds CapillaryTech docs for relevant context—avoids AI hallucinations.
- **Responsive UI**: Clean React chat interface with auto-scroll, Markdown rendering, and loading spinners.
- **Free & Fast**: Uses OpenRouter's free Mistral model for quick responses (1-3s).
- **Offline-Ready Docs**: Pre-scraped JSON means it works without internet after setup.

## Tech Stack

- **Backend**: Node.js + Express (server), Axios (API calls), Math.js (vector math placeholder).
- **Frontend (Client)**: React 19 + Vite (fast bundler/dev server), Tailwind CSS (utility-first styling), React Markdown (response rendering), React Toastify (notifications).
- **RAG Pipeline**: Python scripts for scraping (BeautifulSoup) and embedding (Sentence Transformers).
- **AI**: OpenRouter API (Mistral Small 3 free tier).
- **Other**: dotenv (env vars), CORS (frontend comms).

## Quick Setup

### Prerequisites
- Node.js (v18+) and Python 3.8+ (for scrapers).
- Free OpenRouter API key: Sign up at [openrouter.ai](https://openrouter.ai) and grab your key.

### 1. Clone the Repo
```bash
git clone https://github.com/Arnav270803/capillary_Bot.git
cd capillary_Bot
```

### 2. Install Dependencies
- **Backend**:
  ```bash
  cd backend
  npm install
  ```
- **Client (Frontend)**:
  ```bash
  cd ../client
  npm install
  ```

### 3. Configure Env Files
- **Backend** (`backend/.env`—create from `.env.example` if needed):
  ```
  OPENROUTER_API_KEY=your_key_here
  YOUR_SITE_URL=http://localhost:5173
  YOUR_SITE_NAME=Capillary Bot
  PORT=5000
  ```
- **Client** (`client/.env`—create from `.env.example`):
  ```
  VITE_API_URL=http://localhost:5000/chat
  ```

### 4. Run Scrapers (One-Time Setup)
From project root (install Python deps first: `pip install requests beautifulsoup4 sentence-transformers`):
```bash
python backend/scripts/scrape_docs.py  # Fetches and chunks docs
python backend/scripts/embed_chunks.py  # Adds embeddings for better search
```
This generates `backend/scraped_docs.json` and `embedded_docs.json`—run if files are missing.

### 5. Start the Servers
- **Backend** (new terminal): `cd backend && npm start` (runs on http://localhost:5000—check `/health` in browser).
- **Client**: `cd client && npm run dev` (opens http://localhost:5173—chat away!).

Test: Ask "How do I authenticate?"—should get a structured reply. If errors, check console for API key issues.

## Usage

1. Open the client URL.
2. Type a query (e.g., "Explain customer segments").
3. Send—bot thinks, responds with Markdown (headers, lists, code).
4. Citations link back to docs.

## Project Structure
```
capillary_Bot/
├── backend/          # Express server + RAG
│   ├── scripts/      # Python scrapers
│   │   ├── scrape_docs.py
│   │   └── embed_chunks.py
│   ├── server.js     # Routes, retrieval, AI
│   ├── package.json
│   ├── scraped_docs.json (auto-gen)
│   └── embedded_docs.json (auto-gen)
├── client/           # React + Vite frontend
│   ├── public/       # Static assets
│   ├── src/          # Source code
│   │   ├── assets/   # Images/icons
│   │   ├── components/
│   │   │   └── CapillaryBot.jsx  # Main chat UI
│   │   ├── App.jsx   # Root component
│   │   ├── index.css # Global styles
│   │   └── main.jsx  # Entry point
│   ├── .env          # Frontend env
│   ├── index.html    # Vite template
│   ├── package.json
│   └── vite.config.js # Vite config
└── README.md         # This file
```

## Contributing

Fork, tweak (e.g., add vector search), PR. Ideas: Dark mode, more models, or deploy to Vercel/Netlify.

## License

MIT—fork away, just shoutout if you build on it. Questions? Hit issues. 🚀