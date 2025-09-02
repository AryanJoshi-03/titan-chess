import streamlit as st
import numpy as np
import copy
import chess
import chess.engine
import os
import subprocess
import platform

# Configure Streamlit page
st.set_page_config(
    page_title="TitanChess - Elite AI Chess Platform",
    page_icon="♔",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        text-align: center;
        color: #2E8B57;
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        text-align: center;
        color: #666;
        font-size: 1.2rem;
        margin-bottom: 2rem;
    }
    .chess-board {
        background: linear-gradient(135deg, #DEB887 0%, #8B4513 100%);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .game-info {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .move-history {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        max-height: 400px;
        overflow-y: auto;
    }
    .status-message {
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        font-weight: bold;
    }
    .check-warning {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
    }
    .checkmate-danger {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    .stalemate-info {
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        color: #0c5460;
    }
    /* Custom button styling for chess squares */
    .stButton > button {
        width: 60px !important;
        height: 60px !important;
        font-size: 24px !important;
        border: 1px solid #666 !important;
        border-radius: 4px !important;
        margin: 1px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
        font-weight: bold !important;
        transition: all 0.2s ease !important;
    }
    
    .stButton > button:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
    }
    
    /* Dark squares */
    .stButton > button:nth-child(odd) {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    /* Chess board container */
    .chess-board-container {
        display: flex;
        justify-content: center;
        padding: 20px;
        background: linear-gradient(135deg, #DEB887 0%, #8B4513 100%);
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    
    /* Row styling */
    .stColumns > div {
        margin: 0 !important;
        padding: 0 !important;
    }
</style>
""", unsafe_allow_html=True)

# Your exact chess logic from Chessboard_Implementation.py
def is_within_boundaries(row, col):
    return 0 <= row < 8 and 0 <= col < 8

def is_valid_square(board, row, col, piece_color):
    return 0 <= row < 8 and 0 <= col < 8 and (board[row][col] is None or board[row][col].color != piece_color)

def pawn_moves(board, piece, last_move=None):
    valid_moves = []
    row, col = piece.position
    direction = -1 if piece.color == 'white' else 1
    start_row = 6 if piece.color == 'white' else 1

    # Move forward
    if is_valid_square(board, row + direction, col, piece.color) and board[row + direction][col] is None:
        valid_moves.append((row + direction, col))
        # Check if it's at the starting position and can move two squares
        if row == start_row and is_valid_square(board, row + 2 * direction, col, piece.color) and board[row + direction][col] is None and board[row + 2*direction][col] is None:
            valid_moves.append((row + 2 * direction, col))

    # Capturing moves
    for offset in [-1, 1]:
        capture_col = col + offset
        if 0 <= capture_col < 8:
            capture_square = board[row + direction][capture_col]
            if capture_square and capture_square.color != piece.color:
                valid_moves.append((row + direction, capture_col))
            # En passant
            elif board[row][capture_col] and board[row][capture_col].piece_type == 'pawn' and board[row][capture_col].color != piece.color:
                if piece.color == 'white' and row == 3 or piece.color == 'black' and row == 4:
                    if last_move:
                        last_move_start, last_move_end = last_move
                        if last_move_end == (row, capture_col) and abs(last_move_start[0] - last_move_end[0]) == 2:
                            valid_moves.append((row + direction, capture_col))

    return valid_moves

def knight_moves(board, piece):
    valid_moves = []
    row, col = piece.position
    possible_moves = [(-2, -1), (-2, 1), (-1, -2), (-1, 2), (2, -1), (2, 1), (1, 2), (1, -2)]

    for r, c in possible_moves:
        new_row = row + r
        new_col = col + c
        if is_valid_square(board, new_row, new_col, piece.color):
            valid_moves.append((new_row, new_col))

    return valid_moves

def bishop_moves(board, piece):
    valid_moves = []
    row, col = piece.position
    possible_moves = [(1, 1), (-1, 1), (1, -1), (-1, -1)]

    for r, c in possible_moves:
        new_row = row + r
        new_col = col + c
        while is_valid_square(board, new_row, new_col, piece.color):
            if board[new_row][new_col] is None:
                valid_moves.append((new_row, new_col))
            elif board[new_row][new_col].color != piece.color:
                valid_moves.append((new_row, new_col))
                break
            new_row = new_row + r
            new_col = new_col + c

    return valid_moves

def rook_moves(board, piece):
    valid_moves = []
    row, col = piece.position
    possible_moves = [(1, 0), (0, 1), (-1, 0), (0, -1)]

    for r, c in possible_moves:
        new_row = row + r
        new_col = col + c
        while is_valid_square(board, new_row, new_col, piece.color):
            if board[new_row][new_col] is None:
                valid_moves.append((new_row, new_col))
            elif board[new_row][new_col].color != piece.color:
                valid_moves.append((new_row, new_col))
                break
            new_row = new_row + r
            new_col = new_col + c

    return valid_moves

def queen_moves(board, piece):
    valid_moves = []
    row, col = piece.position
    possible_moves = [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (-1, 1), (1, -1), (-1, -1)]

    for r, c in possible_moves:
        new_row = row + r
        new_col = col + c
        while is_valid_square(board, new_row, new_col, piece.color):
            if board[new_row][new_col] is None:
                valid_moves.append((new_row, new_col))
            elif board[new_row][new_col].color != piece.color:
                valid_moves.append((new_row, new_col))
                break
            new_row = new_row + r
            new_col = new_col + c

    return valid_moves

def king_moves(board, piece):
    valid_moves = []
    row, col = piece.position
    possible_moves = [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (-1, 1), (1, -1), (-1, -1)]

    for r, c in possible_moves:
        new_row = row + r
        new_col = col + c
        if is_valid_square(board, new_row, new_col, piece.color):
            valid_moves.append((new_row, new_col))

    return valid_moves

class Piece:
    def __init__(self, piece_type, color, position):
        self.piece_type = piece_type
        self.color = color
        self.position = position
        self.has_moved = False

    def get_moves(self, board, last_move=None):
        if self.piece_type == 'pawn':
            return pawn_moves(board, self, last_move)
        elif self.piece_type == 'knight':
            return knight_moves(board, self)
        elif self.piece_type == 'bishop':
            return bishop_moves(board, self)
        elif self.piece_type == 'rook':
            return rook_moves(board, self)
        elif self.piece_type == 'queen':
            return queen_moves(board, self)
        elif self.piece_type == 'king':
            return king_moves(board, self)
        else:
            return []
    
    def update_position(self, new_position):
        self.position = new_position
        self.has_moved = True

def is_in_check(board, color):
    king_position = None
    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece and piece.color == color and piece.piece_type == 'king':
                king_position = (row, col)
                break
        if king_position:
            break

    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece and piece.color != color:
                valid_moves = piece.get_moves(board)
                if king_position in valid_moves:
                    return True
    return False

def is_checkmate(board, color):
    """Check if the current player is in checkmate"""
    if not is_in_check(board, color):
        return False
    
    # Check if any move can get out of check
    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece and piece.color == color:
                moves = get_valid_moves(piece, board)
                for move in moves:
                    temp_board = copy.deepcopy(board)
                    temp_piece = temp_board[row][col]
                    temp_piece.update_position(move)
                    temp_board[move[0]][move[1]] = temp_piece
                    temp_board[row][col] = None
                    if not is_in_check(temp_board, color):
                        return False
    return True

def is_stalemate(board, color):
    """Check if the current player is in stalemate"""
    if is_in_check(board, color):
        return False
    
    # Check if any legal move exists
    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece and piece.color == color:
                moves = get_valid_moves(piece, board)
                for move in moves:
                    temp_board = copy.deepcopy(board)
                    temp_piece = temp_board[row][col]
                    temp_piece.update_position(move)
                    temp_board[move[0]][move[1]] = temp_piece
                    temp_board[row][col] = None
                    if not is_in_check(temp_board, color):
                        return False
    return True

def is_legal_move(board, piece, target_position, last_move=None):
    original_position = piece.position
    temp_board = copy.deepcopy(board)
    temp_piece = temp_board[original_position[0]][original_position[1]]
    temp_piece.update_position(target_position)
    temp_board[target_position[0]][target_position[1]] = temp_piece
    temp_board[original_position[0]][original_position[1]] = None
    return not is_in_check(temp_board, piece.color)

def get_valid_moves(piece, board, last_move=None):
    moves = piece.get_moves(board, last_move)
    legal_moves = []
    for move in moves:
        if is_legal_move(board, piece, move, last_move):
            legal_moves.append(move)
    return legal_moves

def can_castle(board, king, rook):
    if king.has_moved or rook.has_moved:
        return False
    if king.color != rook.color:
        return False
    y = king.position[0]
    king_x = king.position[1]
    rook_x = rook.position[1]

    # Check if squares between king and rook are empty
    if rook_x == 0:  # Queen-side castling
        for x in range(1, king_x):
            if board[y][x] is not None:
                return False
    elif rook_x == 7:  # King-side castling
        for x in range(king_x + 1, 7):
            if board[y][x] is not None:
                return False

    # Check if squares the king passes through are under attack
    if rook_x == 0:  # Queen-side castling
        squares_to_check = [(y, king_x), (y, king_x - 1), (y, king_x - 2)]
    elif rook_x == 7:  # King-side castling
        squares_to_check = [(y, king_x), (y, king_x + 1), (y, king_x + 2)]

    for square in squares_to_check:
        if is_square_under_attack(board, square, king.color):
            return False

    return True

def is_square_under_attack(board, square, color):
    enemy_color = 'black' if color == 'white' else 'white'
    for row in board:
        for piece in row:
            if piece and piece.color == enemy_color:
                if square in piece.get_moves(board):
                    return True
    return False

def get_castling_moves(board, king):
    castling_moves = []
    y = king.position[0]
    if king.color == 'white':
        if can_castle(board, king, board[y][0]):
            castling_moves.append((y, 2))  # Queen-side
        if can_castle(board, king, board[y][7]):
            castling_moves.append((y, 6))  # King-side
    elif king.color == 'black':
        if can_castle(board, king, board[y][0]):
            castling_moves.append((y, 2))  # Queen-side
        if can_castle(board, king, board[y][7]):
            castling_moves.append((y, 6))  # King-side
    return castling_moves

# STOCKFISH INTEGRATION - EXACT SAME AS PYTHON VERSION
def get_stockfish_path():
    """Find Stockfish executable path"""
    possible_paths = [
        '/usr/local/bin/stockfish',  # Homebrew on Mac
        '/usr/bin/stockfish',        # Linux
        'stockfish',                 # In PATH
        './stockfish',               # Local directory
    ]
    
    for path in possible_paths:
        try:
            if os.path.exists(path) or path == 'stockfish':
                # Test if it works
                result = subprocess.run([path, 'quit'], 
                                      capture_output=True, text=True, timeout=1)
                return path
        except:
            continue
    
    return None

def board_to_fen(board, turn, castling_rights='KQkq', en_passant='-', halfmove_clock=0, fullmove_number=1):
    """Convert board to FEN string - EXACT SAME AS PYTHON"""
    piece_to_fen = {
        ('white', 'pawn'): 'P',
        ('white', 'rook'): 'R',
        ('white', 'knight'): 'N',
        ('white', 'bishop'): 'B',
        ('white', 'queen'): 'Q',
        ('white', 'king'): 'K',
        ('black', 'pawn'): 'p',
        ('black', 'rook'): 'r',
        ('black', 'knight'): 'n',
        ('black', 'bishop'): 'b',
        ('black', 'queen'): 'q',
        ('black', 'king'): 'k',
    }
    fen_rows = []
    for row in board:
        fen_row = ''
        empty = 0
        for piece in row:
            if piece is None:
                empty += 1
            else:
                if empty > 0:
                    fen_row += str(empty)
                    empty = 0
                fen_row += piece_to_fen[(piece.color, piece.piece_type)]
        if empty > 0:
            fen_row += str(empty)
        fen_rows.append(fen_row)
    fen = '/'.join(fen_rows)
    fen += ' ' + ('w' if turn == 'white' else 'b')
    fen += f' {castling_rights if castling_rights else "-"}'
    fen += f' {en_passant}'
    fen += f' {halfmove_clock} {fullmove_number}'
    return fen

def get_stockfish_move(board, color, castling_rights='KQkq', en_passant='-', halfmove_clock=0, fullmove_number=1):
    """Get move from Stockfish - EXACT SAME AS PYTHON"""
    try:
        fen = board_to_fen(board, color, castling_rights, en_passant, halfmove_clock, fullmove_number)
        board_obj = chess.Board(fen)
        
        stockfish_path = get_stockfish_path()
        if stockfish_path:
            with chess.engine.SimpleEngine.popen_uci(stockfish_path) as engine:
                result = engine.play(board_obj, chess.engine.Limit(time=0.1))
                move = result.move
                return move.uci()  # e.g., 'e2e4'
        else:
            # Fallback to minimax if Stockfish not available
            return get_minimax_move(board, color)
    except Exception as e:
        st.warning(f"Stockfish error: {e}. Using fallback AI.")
        return get_minimax_move(board, color)

def get_minimax_move(board, color):
    """Fallback minimax AI - EXACT SAME AS PYTHON"""
    best_move = None
    best_score = float('-inf') if color == 'white' else float('inf')
    
    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece and piece.color == color:
                moves = get_valid_moves(piece, board)
                for move in moves:
                    temp_board = copy.deepcopy(board)
                    temp_piece = temp_board[row][col]
                    temp_piece.update_position(move)
                    temp_board[move[0]][move[1]] = temp_piece
                    temp_board[row][col] = None
                    
                    score = evaluate_board(temp_board)
                    if color == 'white':
                        if score > best_score:
                            best_score = score
                            best_move = ((row, col), move)
                    else:
                        if score < best_score:
                            best_score = score
                            best_move = ((row, col), move)
    
    if best_move:
        return f"{chr(97 + best_move[0][1])}{8 - best_move[0][0]}{chr(97 + best_move[1][1])}{8 - best_move[1][0]}"
    return None

def evaluate_board(board):
    """Board evaluation - EXACT SAME AS PYTHON"""
    piece_value = {
        'pawn': 100,
        'knight': 320,
        'bishop': 330,
        'rook': 500,
        'queen': 900,
        'king': 20000
    }
    
    score = 0
    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece:
                if piece.color == 'white':
                    score += piece_value[piece.piece_type]
                else:
                    score -= piece_value[piece.piece_type]
    
    return score

def update_fen_state(board, move, piece, turn):
    """Update FEN state variables - EXACT SAME AS PYTHON"""
    global castling_rights, en_passant, halfmove_clock, fullmove_number
    
    # Castling rights
    if piece.piece_type == 'king':
        if piece.color == 'white':
            castling_rights = castling_rights.replace('K', '').replace('Q', '')
        else:
            castling_rights = castling_rights.replace('k', '').replace('q', '')
    
    if piece.piece_type == 'rook':
        if piece.color == 'white':
            if piece.position == (7, 0) or move == (7, 0):
                castling_rights = castling_rights.replace('Q', '')
            if piece.position == (7, 7) or move == (7, 7):
                castling_rights = castling_rights.replace('K', '')
        else:
            if piece.position == (0, 0) or move == (0, 0):
                castling_rights = castling_rights.replace('q', '')
            if piece.position == (0, 7) or move == (0, 7):
                castling_rights = castling_rights.replace('k', '')
    
    if castling_rights == '':
        castling_rights = '-'
    
    # En passant
    if piece.piece_type == 'pawn' and abs(move[0] - piece.position[0]) == 2:
        col = move[1]
        row = (move[0] + piece.position[0]) // 2
        en_passant = chr(col + ord('a')) + str(8 - row)
    else:
        en_passant = '-'
    
    # Halfmove clock
    if piece.piece_type == 'pawn' or board[move[0]][move[1]] is not None:
        halfmove_clock = 0
    else:
        halfmove_clock += 1
    
    # Fullmove number
    if turn == 'black':
        fullmove_number += 1

# Global FEN state variables
castling_rights = 'KQkq'
en_passant = '-'
halfmove_clock = 0
fullmove_number = 1

# Initialize board
def initialize_board():
    board = [
        [Piece('rook', 'black', (0, 0)), Piece('knight', 'black', (0, 1)), Piece('bishop', 'black', (0, 2)), Piece('queen', 'black', (0, 3)), Piece('king', 'black', (0, 4)), Piece('bishop', 'black', (0, 5)), Piece('knight', 'black', (0, 6)), Piece('rook', 'black', (0, 7))],
        [Piece('pawn', 'black', (1, i)) for i in range(8)],
        [None] * 8,
        [None] * 8,
        [None] * 8,
        [None] * 8,
        [Piece('pawn', 'white', (6, i)) for i in range(8)],
        [Piece('rook', 'white', (7, 0)), Piece('knight', 'white', (7, 1)), Piece('bishop', 'white', (7, 2)), Piece('queen', 'white', (7, 3)), Piece('king', 'white', (7, 4)), Piece('bishop', 'white', (7, 5)), Piece('knight', 'white', (7, 6)), Piece('rook', 'white', (7, 7))]
    ]
    return board

def get_piece_symbol(piece):
    """Get Unicode symbol for piece"""
    if not piece:
        return ""
    
    symbols = {
        ('white', 'pawn'): '♙',
        ('white', 'rook'): '♖',
        ('white', 'knight'): '♘',
        ('white', 'bishop'): '♗',
        ('white', 'queen'): '♕',
        ('white', 'king'): '♔',
        ('black', 'pawn'): '♟',
        ('black', 'rook'): '♜',
        ('black', 'knight'): '♞',
        ('black', 'bishop'): '♝',
        ('black', 'queen'): '♛',
        ('black', 'king'): '♚',
    }
    return symbols.get((piece.color, piece.piece_type), "")

def get_chess_notation(piece, from_pos, to_pos, captured_piece=None):
    """Convert move to proper chess notation"""
    from_col, from_row = from_pos[1], from_pos[0]
    to_col, to_row = to_pos[1], to_pos[0]
    
    # Convert to chess notation (a1, b2, etc.)
    from_square = chr(97 + from_col) + str(8 - from_row)
    to_square = chr(97 + to_col) + str(8 - to_row)
    
    # Handle different piece types
    if piece.piece_type == 'pawn':
        if captured_piece:
            # Pawn capture (e.g., exd5)
            notation = from_square[0] + 'x' + to_square
        else:
            # Pawn move (e.g., e4)
            notation = to_square
    else:
        # Other pieces
        piece_letter = piece.piece_type[0].upper()
        if piece_letter == 'K':
            piece_letter = 'K'
        elif piece_letter == 'Q':
            piece_letter = 'Q'
        elif piece_letter == 'R':
            piece_letter = 'R'
        elif piece_letter == 'B':
            piece_letter = 'B'
        elif piece_letter == 'N':
            piece_letter = 'N'
        
        if captured_piece:
            notation = piece_letter + 'x' + to_square
        else:
            notation = piece_letter + to_square
    
    # Add check/checkmate indicators
    # (We'll add this later when we implement proper game state checking)
    
    return notation

def make_ai_move():
    """Make AI move using Stockfish"""
    if st.session_state.turn == 'black' and not st.session_state.game_over:
        with st.spinner("🤖 AI is thinking..."):
            try:
                uci_move = get_stockfish_move(st.session_state.board, st.session_state.turn, 
                                            castling_rights, en_passant, halfmove_clock, fullmove_number)
                
                if uci_move:
                    # Parse UCI move (e.g., 'e2e4')
                    start_col = ord(uci_move[0]) - ord('a')
                    start_row = 8 - int(uci_move[1])
                    end_col = ord(uci_move[2]) - ord('a')
                    end_row = 8 - int(uci_move[3])
                    
                    piece = st.session_state.board[start_row][start_col]
                    target_position = (end_row, end_col)
                    
                    # Move piece
                    piece.update_position(target_position)
                    st.session_state.board[end_row][end_col] = piece
                    st.session_state.board[start_row][start_col] = None
                    
                    # Handle castling
                    if piece.piece_type == 'king' and abs(start_col - end_col) == 2:
                        if end_col == 6:  # King-side castling
                            rook_start_col = 7
                            rook_end_col = 5
                        elif end_col == 2:  # Queen-side castling
                            rook_start_col = 0
                            rook_end_col = 3
                        
                        rook_row = start_row
                        rook = st.session_state.board[rook_row][rook_start_col]
                        st.session_state.board[rook_row][rook_end_col] = rook
                        rook.update_position((rook_row, rook_end_col))
                        st.session_state.board[rook_row][rook_start_col] = None
                    
                    # Update FEN state
                    update_fen_state(st.session_state.board, target_position, piece, 'black')
                    
                    # Record move with proper chess notation
                    from_pos = (start_row, start_col)
                    to_pos = (end_row, end_col)
                    captured_piece = st.session_state.board[end_row][end_col] if st.session_state.board[end_row][end_col] else None
                    move_notation = get_chess_notation(piece, from_pos, to_pos, captured_piece)
                    st.session_state.move_history.append(f"{len(st.session_state.move_history) + 1}. {move_notation}")
                    
                    st.session_state.turn = 'white'
                    
                    # Check game state
                    if is_checkmate(st.session_state.board, st.session_state.turn):
                        st.session_state.game_over = True
                        st.error("Checkmate! White loses!")
                    elif is_in_check(st.session_state.board, st.session_state.turn):
                        st.warning("White is in check!")
                    
                    st.rerun()
                    
            except Exception as e:
                st.error(f"AI move error: {e}")

# Streamlit UI
st.markdown('<h1 class="main-header">♔ TitanChess</h1>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Elite AI Chess Platform - Play against Stockfish-powered AI</p>', unsafe_allow_html=True)

# Initialize session state
if 'board' not in st.session_state:
    st.session_state.board = initialize_board()
    st.session_state.turn = 'white'
    st.session_state.last_move = None
    st.session_state.selected_piece = None
    st.session_state.game_over = False
    st.session_state.move_history = []

# Create two columns
col1, col2 = st.columns([3, 1])

with col1:
    st.markdown('<div class="chess-board">', unsafe_allow_html=True)
    st.subheader("♔ Chess Board")
    
    # Create a proper visual chess board using a single container with styled divs
    board_html = """
    <div style="display: inline-block; border: 3px solid #8B4513; border-radius: 8px; padding: 10px; background: #DEB887; margin: 20px;">
        <div style="display: grid; grid-template-columns: repeat(8, 70px); grid-template-rows: repeat(8, 70px); gap: 2px;">
    """
    
    # Generate the board squares with proper styling
    for row in range(8):
        for col in range(8):
            piece = st.session_state.board[row][col]
            
            # Determine square color (same as your Python version)
            is_light_square = (row + col) % 2 == 0
            square_color = "#F0D9B5" if is_light_square else "#B58863"
            
            # Check if this square is selected or a valid move
            border_style = "2px solid #666"
            if st.session_state.selected_piece == (row, col):
                square_color = "#FFFF00"
                border_style = "3px solid #FFD700"
            elif st.session_state.selected_piece:
                selected_row, selected_col = st.session_state.selected_piece
                selected_piece = st.session_state.board[selected_row][selected_col]
                valid_moves = get_valid_moves(selected_piece, st.session_state.board, st.session_state.last_move)
                if (row, col) in valid_moves:
                    square_color = "#90EE90"
                    border_style = "2px solid #00AA00"
            
            piece_symbol = get_piece_symbol(piece)
            
            # Create clickable square
            board_html += f"""
            <div style="
                background-color: {square_color};
                border: {border_style};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                cursor: pointer;
                user-select: none;
                border-radius: 4px;
                transition: all 0.2s ease;
            " onclick="selectSquare({row}, {col})" 
               onmouseover="this.style.transform='scale(1.05)'" 
               onmouseout="this.style.transform='scale(1)'"
               id="square_{row}_{col}">
                {piece_symbol}
            </div>
            """
    
    board_html += """
        </div>
    </div>
    
    <script>
    function selectSquare(row, col) {
        // Create a hidden input to send data to Streamlit
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'chess_click';
        input.value = row + ',' + col;
        document.body.appendChild(input);
        
        // Trigger a form submission to Streamlit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = window.location.href;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    }
    </script>
    """
    
    st.markdown(board_html, unsafe_allow_html=True)
    
    # Handle square selection using a different approach
    # Create a grid of invisible buttons for each square
    for row in range(8):
        for col in range(8):
            if st.button("", key=f"square_{row}_{col}", help=f"Click square {chr(97 + col)}{8 - row}"):
                if not st.session_state.game_over:
                    piece = st.session_state.board[row][col]
                    
                    if st.session_state.selected_piece is None:
                        # Select piece
                        if piece and piece.color == st.session_state.turn:
                            st.session_state.selected_piece = (row, col)
                            st.rerun()
                    else:
                        # Try to move
                        selected_row, selected_col = st.session_state.selected_piece
                        selected_piece = st.session_state.board[selected_row][selected_col]
                        
                        if piece and piece.color == st.session_state.turn:
                            # Select different piece
                            st.session_state.selected_piece = (row, col)
                            st.rerun()
                        else:
                            # Try to move to this square
                            valid_moves = get_valid_moves(selected_piece, st.session_state.board, st.session_state.last_move)
                            if (row, col) in valid_moves:
                                # Make the move
                                st.session_state.board[row][col] = selected_piece
                                st.session_state.board[selected_row][selected_col] = None
                                selected_piece.update_position((row, col))
                                
                                # Handle castling
                                if selected_piece.piece_type == 'king' and abs(selected_col - col) == 2:
                                    if col > selected_col:  # King-side castling
                                        rook = st.session_state.board[row][7]
                                        if can_castle(st.session_state.board, selected_piece, rook):
                                            st.session_state.board[row][5] = rook
                                            rook.update_position((row, 5))
                                            st.session_state.board[row][7] = None
                                    else:  # Queen-side castling
                                        rook = st.session_state.board[row][0]
                                        if can_castle(st.session_state.board, selected_piece, rook):
                                            st.session_state.board[row][3] = rook
                                            rook.update_position((row, 3))
                                            st.session_state.board[row][0] = None
                                
                                # Record move with proper chess notation
                                from_pos = (selected_row, selected_col)
                                to_pos = (row, col)
                                captured_piece = st.session_state.board[row][col] if st.session_state.board[row][col] else None
                                move_notation = get_chess_notation(selected_piece, from_pos, to_pos, captured_piece)
                                st.session_state.move_history.append(f"{len(st.session_state.move_history) + 1}. {move_notation}")
                                
                                st.session_state.last_move = ((selected_row, selected_col), (row, col))
                                st.session_state.turn = 'black'
                                
                                # Update FEN state
                                update_fen_state(st.session_state.board, (row, col), selected_piece, 'white')
                                
                                # Check for game over
                                if is_checkmate(st.session_state.board, st.session_state.turn):
                                    st.session_state.game_over = True
                                    st.error("Checkmate! Black loses!")
                                elif is_in_check(st.session_state.board, st.session_state.turn):
                                    st.warning("Black is in check!")
                                
                            st.session_state.selected_piece = None
                            st.rerun()
    
    st.markdown('</div>', unsafe_allow_html=True)

with col2:
    st.markdown('<div class="game-info">', unsafe_allow_html=True)
    st.subheader("🎮 Game Info")
    
    # Current turn
    turn_color = "🟢" if st.session_state.turn == 'white' else "🔴"
    st.write(f"**Current Turn:** {turn_color} {st.session_state.turn.title()}")
    
    # Selected piece info
    if st.session_state.selected_piece:
        row, col = st.session_state.selected_piece
        piece = st.session_state.board[row][col]
        st.write(f"**Selected:** {get_piece_symbol(piece)} {piece.piece_type.title()} at {chr(97 + col)}{8 - row}")
        
        valid_moves = get_valid_moves(piece, st.session_state.board, st.session_state.last_move)
        st.write(f"**Valid moves:** {len(valid_moves)}")
        for move in valid_moves[:5]:  # Show first 5 moves
            st.write(f"• {chr(97 + move[1])}{8 - move[0]}")
        if len(valid_moves) > 5:
            st.write(f"... and {len(valid_moves) - 5} more")
    
    # Game status
    if st.session_state.game_over:
        st.markdown('<div class="status-message checkmate-danger">Game Over!</div>', unsafe_allow_html=True)
    elif is_in_check(st.session_state.board, st.session_state.turn):
        st.markdown('<div class="status-message check-warning">⚠️ Check!</div>', unsafe_allow_html=True)
    
    # Move history
    st.subheader("📜 Move History")
    st.markdown('<div class="move-history">', unsafe_allow_html=True)
    for move in st.session_state.move_history[-10:]:  # Show last 10 moves
        st.write(move)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # New game button
    if st.button("🔄 New Game", use_container_width=True):
        st.session_state.board = initialize_board()
        st.session_state.turn = 'white'
        st.session_state.last_move = None
        st.session_state.selected_piece = None
        st.session_state.game_over = False
        st.session_state.move_history = []
        # Reset FEN state
        castling_rights = 'KQkq'
        en_passant = '-'
        halfmove_clock = 0
        fullmove_number = 1
        st.rerun()
    
    st.markdown('</div>', unsafe_allow_html=True)

# AI Move
if st.session_state.turn == 'black' and not st.session_state.game_over:
    make_ai_move()

# Footer
st.markdown("---")
st.markdown("**TitanChess** - Built with Python, Streamlit, and Stockfish AI Engine")