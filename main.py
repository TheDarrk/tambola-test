import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional

app = FastAPI(title="Tombola Game API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://*.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameConfig(BaseModel):
    player_count: int

class GameState(BaseModel):
    game_id: str
    player_count: int
    tickets: List[List[List[int]]]
    called_numbers: List[int]
    current_number: Optional[int]
    game_status: str
    winner: Optional[int]

games: Dict[str, GameState] = {}

def generate_random_ticket():
    import random
    ticket = []
    number_ranges = [
        [1, 10], [11, 20], [21, 30],
        [31, 40], [41, 50], [51, 60],
        [61, 70], [71, 80], [81, 90]
    ]
    for section in range(3):
        section_numbers = []
        for col in range(3):
            start, end = number_ranges[section * 3 + col]
            column_numbers = random.sample(range(start, end + 1), 5)
            section_numbers.extend(column_numbers)
        ticket.append(section_numbers)
    return ticket

def generate_game_numbers():
    number_ranges = [
        [1, 10], [11, 20], [21, 30],
        [31, 40], [41, 50], [51, 60],
        [61, 70], [71, 80], [81, 90]
    ]
    called_numbers = []
    for start, end in number_ranges:
        range_numbers = random.sample(range(start, end + 1), min(2, end - start + 1))
        called_numbers.extend(range_numbers)
    while len(called_numbers) < 15:
        range_idx = random.randint(0, len(number_ranges) - 1)
        start, end = number_ranges[range_idx]
        num = random.randint(start, end)
        if num not in called_numbers:
            called_numbers.append(num)
    called_numbers = called_numbers[:15]
    random.shuffle(called_numbers)
    return called_numbers

@app.get("/")
async def root():
    return {"message": "Tombola Game API", "status": "running"}

@app.post("/api/start-game")
async def start_game(config: GameConfig):
    if config.player_count < 3 or config.player_count > 5:
        raise HTTPException(status_code=400, detail="Player count must be between 3 and 5")
    game_id = f"game_{random.randint(1000, 9999)}"
    tickets = []
    for _ in range(config.player_count):
        ticket = generate_random_ticket()
        tickets.append(ticket)
    called_numbers = generate_game_numbers()
    game_state = GameState(
        game_id=game_id,
        player_count=config.player_count,
        tickets=tickets,
        called_numbers=called_numbers,
        current_number=None,
        game_status="waiting",
        winner=None
    )
    games[game_id] = game_state
    return {
        "game_id": game_id,
        "player_count": config.player_count,
        "tickets": tickets,
        "message": "Game created successfully"
    }

@app.get("/api/game/{game_id}")
async def get_game(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = games[game_id]
    return {
        "game_id": game.game_id,
        "player_count": game.player_count,
        "tickets": game.tickets,
        "current_number": game.current_number,
        "game_status": game.game_status,
        "winner": game.winner,
        "called_numbers_count": len([n for n in game.called_numbers if n != game.current_number]) if game.current_number else 0
    }

@app.post("/api/game/{game_id}/start")
async def start_calling_numbers(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = games[game_id]
    if game.game_status != "waiting":
        raise HTTPException(status_code=400, detail="Game already started or finished")
    game.game_status = "active"
    return {"message": "Game started", "total_numbers": len(game.called_numbers)}

@app.get("/api/game/{game_id}/next-number")
async def get_next_number(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = games[game_id]
    if game.game_status != "active":
        raise HTTPException(status_code=400, detail="Game is not active")
    current_index = 0
    if game.current_number is not None:
        try:
            current_index = game.called_numbers.index(game.current_number) + 1
        except ValueError:
            current_index = 0
    if current_index >= len(game.called_numbers):
        game.game_status = "finished"
        return {
            "number": None,
            "is_finished": True,
            "all_numbers": game.called_numbers,
            "message": "All numbers called"
        }
    next_number = game.called_numbers[current_index]
    game.current_number = next_number
    return {
        "number": next_number,
        "position": current_index + 1,
        "total": len(game.called_numbers),
        "is_finished": False
    }

@app.get("/api/game/{game_id}/all-numbers")
async def get_all_called_numbers(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = games[game_id]
    return {
        "called_numbers": game.called_numbers,
        "current_number": game.current_number,
        "game_status": game.game_status
    }

@app.post("/api/game/{game_id}/check-winner")
async def check_winner(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = games[game_id]
    called_so_far = []
    if game.current_number is not None:
        current_index = game.called_numbers.index(game.current_number)
        called_so_far = game.called_numbers[:current_index + 1]
    return {
        "called_numbers": called_so_far,
        "total_called": len(called_so_far),
        "target_numbers": game.called_numbers,
        "game_status": game.game_status,
        "message": "Players must manually check their tickets"
    }

@app.get("/api/random-numbers")
async def get_random_numbers(count: int = 15):
    if count < 1 or count > 90:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 90")
    numbers = random.sample(range(1, 91), count)
    return {"numbers": sorted(numbers)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
