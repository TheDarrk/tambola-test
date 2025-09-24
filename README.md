# 🎮 Aloha X - Pixelated Tombola Game

A modern, pixelated-themed Tombola (Housie/Bingo) game built with **Vite + React** frontend and **Python FastAPI** backend. Features real-time number calling, automatic winner detection,achivement of early 5 and early 7, and support for 3-5 players.

## 🌟 Features

- **Pixelated Gaming Theme** - Retro-style UI with modern functionality
- **Real-time Gameplay** - Live number calling with manual and auto modes
- **Multi-Player Support** - 3-5 players with unique tickets
- **Smart Ticket Generation** - Proper Tombola ticket structure (3 sections × 3 columns)
- **Winner Detection** - Automatic full house validation
- **Responsive Design** - Works on desktop and mobile devices

## 🎯 Game Rules

1. **Ticket Structure**: Each player gets a ticket with 15 numbers arranged in:
   - 3 sections (rows)
   - 3 columns per section
   - 5 numbers per section
   - Number ranges: 1-10, 11-20, 21-30, 31-40, 41-50, 51-60, 61-70, 71-80, 81-90

2. **Gameplay**:
   - 15 random numbers are generated from the specified ranges
   - Numbers are called one by one (manually or automatically)
   - Players mark numbers on their tickets as they're called
   - They can have achivements of early 5 early 7
   - First player to mark all called numbers wins!

3. **Winning**: Full House - player who marks all 15 called numbers wins and achive all early achivement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Start Backend Server**
   ```bash
   python main.py
   # Backend runs on http://localhost:8000
   ```

3. **Start Frontend Development Server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 🎮 How to Play

1. **Launch Game** - Click "LAUNCH GAME" on the landing page
2. **Select Players** - Choose 3, 4, or 5 players
3. **Start Game** - Click "START GAME" to begin number calling
4. **Mark Numbers** - Click numbers on your ticket as they're called
5. **Win Condition** - First player to mark all called numbers wins!

### Game Modes

- **Manual Mode**: Click "NEXT NUMBER" to call numbers one by one
- **Auto Mode**: Numbers are called automatically every 3 seconds

## 📁 Project Structure

```
aloha-x-tombola/
├── main.py                 # FastAPI backend application
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel deployment configuration
├── package.json           # Node.js dependencies
├── vite.config.js         # Vite configuration
├── index.html             # HTML entry point
└── src/
    ├── main.jsx           # React app entry point
    ├── App.jsx            # Main app component
    ├── index.css          # Global styles with pixelated theme
    └── components/
        ├── LandingPage.jsx      # Welcome screen
        ├── PlayerSelection.jsx  # Player count selection
        ├── GameScreen.jsx       # Main game interface
        └── WinnerScreen.jsx     # Results and winner display
```

## 🔧 API Endpoints

- `GET /` - Health check
- `POST /api/start-game` - Start new game with player count
- `GET /api/game/{game_id}` - Get game state
- `POST /api/game/{game_id}/start` - Begin number calling
- `GET /api/game/{game_id}/next-number` - Get next number
- `GET /api/game/{game_id}/all-numbers` - Get all called numbers

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
python main.py   # Start backend server
```

### Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite for fast development
- CSS with custom pixelated theme
- Responsive design

**Backend:**
- FastAPI (Python)
- Pydantic for data validation
- CORS middleware for frontend integration
- In-memory game state


**Enjoy playing Aloha X Tombola! 🌺🎮**
