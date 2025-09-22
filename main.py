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
    tickets: List[List[List[Optional[int]]]]   # List of tickets → each ticket 2D grid with optional ints
    called_numbers: List[int]
    current_number: Optional[int]
    game_status: str
    winner: Optional[int]
    # Add the new fields for achievements system
    achievements: Optional[Dict[str, List[int]]] = None
    player_points: Optional[List[int]] = None

games: Dict[str, GameState] = {}

def generate_random_ticket():
    import random

    # Define column ranges for the 3 columns across all 9 rows
    column_ranges = [
        # Column 0 ranges by section
        [range(1, 11), range(31, 41), range(61, 71)],      # Col 0: 1-10 (rows 0-2), 31-40 (rows 3-5), 61-70 (rows 6-8)
        # Column 1 ranges by section  
        [range(11, 21), range(41, 51), range(71, 81)],     # Col 1: 11-20 (rows 0-2), 41-50 (rows 3-5), 71-80 (rows 6-8)
        # Column 2 ranges by section
        [range(21, 31), range(51, 61), range(81, 91)]      # Col 2: 21-30 (rows 0-2), 51-60 (rows 3-5), 81-90 (rows 6-8)
    ]

    ticket = []
    used_numbers = set()  # Track all numbers used in ticket to avoid duplicates

    for row_idx in range(9):
        row = [None, None, None]  # 3 columns per row
        
        # Determine which section this row belongs to (A=0, B=1, C=2)
        section_idx = row_idx // 3
        
        # Randomly pick exactly 1 column out of 3 to fill in this row (to ensure 5 numbers per section)
        # But we need to be smarter about distribution - let's ensure exactly 5 numbers per section
        # For now, let's place 1-2 numbers per row randomly
        cols_to_fill = random.sample(range(3), random.randint(1, 2))
        
        for col_idx in range(3):
            if col_idx in cols_to_fill:
                # Get the appropriate range for this column and section
                col_range = column_ranges[col_idx][section_idx]
                
                # Pick a unique number from this range
                possible_numbers = [n for n in col_range if n not in used_numbers]
                if possible_numbers:
                    number = random.choice(possible_numbers)
                    used_numbers.add(number)
                    row[col_idx] = number
        
        ticket.append(row)

    # Now ensure each section has exactly 5 numbers
    for section_idx in range(3):
        start_row = section_idx * 3
        end_row = start_row + 3
        
        # Count current numbers in this section
        section_numbers = []
        for r in range(start_row, end_row):
            for c in range(3):
                if ticket[r][c] is not None:
                    section_numbers.append((r, c))
        
        # Adjust to exactly 5 numbers per section
        if len(section_numbers) > 5:
            # Remove excess numbers randomly
            to_remove = random.sample(section_numbers, len(section_numbers) - 5)
            for r, c in to_remove:
                used_numbers.discard(ticket[r][c])
                ticket[r][c] = None
        elif len(section_numbers) < 5:
            # Add more numbers to reach 5
            empty_positions = []
            for r in range(start_row, end_row):
                for c in range(3):
                    if ticket[r][c] is None:
                        empty_positions.append((r, c))
            
            needed = 5 - len(section_numbers)
            positions_to_fill = random.sample(empty_positions, min(needed, len(empty_positions)))
            
            for r, c in positions_to_fill:
                col_range = column_ranges[c][section_idx]
                possible_numbers = [n for n in col_range if n not in used_numbers]
                if possible_numbers:
                    number = random.choice(possible_numbers)
                    used_numbers.add(number)
                    ticket[r][c] = number

    return ticket  # 9 rows × 3 columns with numbers or None

def generate_game_numbers():
    # Generate all numbers 1-90 for continuous play
    numbers = list(range(1, 91))
    random.shuffle(numbers)
    return numbers

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
        winner=None,
        achievements={"first_five": [], "early_seven": [], "full_house": []},
        player_points=[0] * config.player_count
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

@app.post("/api/game/{game_id}/check-achievements")
async def check_achievements(game_id: str, player_marked: Dict[int, List[int]]):
    """
    Check achievements for all players
    player_marked: {player_index: [list_of_marked_numbers]}
    """
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games[game_id]
    
    # Get all numbers called so far
    called_so_far = []
    if game.current_number is not None:
        try:
            current_index = game.called_numbers.index(game.current_number)
            called_so_far = game.called_numbers[:current_index + 1]
        except ValueError:
            called_so_far = []
    
    called_set = set(called_so_far)
    
    # Initialize achievements if not exists
    if game.achievements is None:
        game.achievements = {"first_five": [], "early_seven": [], "full_house": []}
    if game.player_points is None:
        game.player_points = [0] * game.player_count
    
    new_achievements = []
    game_ended = False
    
    for player_idx, marked_nums in player_marked.items():
        if player_idx >= game.player_count:
            continue
            
        marked_set = set(marked_nums)
        # Only count marked numbers that have actually been called
        valid_marked = marked_set.intersection(called_set)
        
        # Check First Five (5 marked numbers)
        if len(valid_marked) >= 5 and player_idx not in game.achievements["first_five"]:
            game.achievements["first_five"].append(player_idx)
            game.player_points[player_idx] += 50
            new_achievements.append({"type": "first_five", "player": player_idx, "points": 50})
        
        # Check Early Seven (7 marked numbers)
        if len(valid_marked) >= 7 and player_idx not in game.achievements["early_seven"]:
            game.achievements["early_seven"].append(player_idx)
            game.player_points[player_idx] += 100
            new_achievements.append({"type": "early_seven", "player": player_idx, "points": 100})
        
        # Check Full House (all 15 numbers)
        if len(valid_marked) >= 15 and player_idx not in game.achievements["full_house"]:
            game.achievements["full_house"].append(player_idx)
            game.player_points[player_idx] += 200
            new_achievements.append({"type": "full_house", "player": player_idx, "points": 200})
            
            # END GAME when first Full House is achieved
            game.game_status = "finished"
            game.winner = player_idx
            game_ended = True
    
    # Determine final rankings based on points
    player_rankings = []
    for i in range(game.player_count):
        player_rankings.append({"player": i, "points": game.player_points[i]})
    
    player_rankings.sort(key=lambda x: x["points"], reverse=True)
    
    return {
        "new_achievements": new_achievements,
        "achievements": game.achievements,
        "player_points": game.player_points,
        "rankings": player_rankings,
        "game_status": game.game_status,
        "game_ended": game_ended,
        "winner": game.winner if game_ended else None,
        "all_called_numbers": called_so_far
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
