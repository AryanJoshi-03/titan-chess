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
    page_title="TitanChess - Play Against AI",
    page_icon="♔",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        text-align: center;
        color: #2E8B57;
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        text-align: center;
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    .chess-board {
        background: transparent;
        border-radius: 0px;
        padding: 10px;
        box-shadow: none;
        border: 3px solid #8B4513;
        display: inline-block;
    }
    .game-info {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    /* Custom button styling for chess squares */
    .stButton > button {
        width: 60px !important;
        height: 60px !important;
        font-size: 36px !important;
        border: 1px solid #8B4513 !important;
        border-radius: 0px !important;
        margin: 0px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
        font-weight: bold !important;
        transition: all 0.2s ease !important;
        padding: 0 !important;
        min-height: 60px !important;
        min-width: 60px !important;
    }
    
    .stButton > button:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
    }
    
    /* Dark squares - use a more specific selector */
    .stButton:nth-of-type(odd) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    /* Ensure proper spacing between squares */
    .stButton {
        margin: 0 !important;
        padding: 0 !important;
        width: 60px !important;
        height: 60px !important;
    }
    
    /* Override Streamlit's default button styling */
    .stButton > button[kind="secondary"] {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    .stButton:nth-of-type(odd) > button[kind="secondary"] {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    /* Force alternating colors for chess board pattern */
    /* Row 1: Light, Dark, Light, Dark, Light, Dark, Light, Dark */
    .stButton:nth-of-type(1) > button, .stButton:nth-of-type(3) > button, 
    .stButton:nth-of-type(5) > button, .stButton:nth-of-type(7) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    .stButton:nth-of-type(2) > button, .stButton:nth-of-type(4) > button, 
    .stButton:nth-of-type(6) > button, .stButton:nth-of-type(8) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    /* Row 2: Dark, Light, Dark, Light, Dark, Light, Dark, Light */
    .stButton:nth-of-type(9) > button, .stButton:nth-of-type(11) > button, 
    .stButton:nth-of-type(13) > button, .stButton:nth-of-type(15) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    .stButton:nth-of-type(10) > button, .stButton:nth-of-type(12) > button, 
    .stButton:nth-of-type(14) > button, .stButton:nth-of-type(16) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    /* Continue pattern for all 8 rows... */
    /* Row 3: Light, Dark, Light, Dark, Light, Dark, Light, Dark */
    .stButton:nth-of-type(17) > button, .stButton:nth-of-type(19) > button, 
    .stButton:nth-of-type(21) > button, .stButton:nth-of-type(23) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    .stButton:nth-of-type(18) > button, .stButton:nth-of-type(20) > button, 
    .stButton:nth-of-type(22) > button, .stButton:nth-of-type(24) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    /* Row 4: Dark, Light, Dark, Light, Dark, Light, Dark, Light */
    .stButton:nth-of-type(25) > button, .stButton:nth-of-type(27) > button, 
    .stButton:nth-of-type(29) > button, .stButton:nth-of-type(31) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    .stButton:nth-of-type(26) > button, .stButton:nth-of-type(28) > button, 
    .stButton:nth-of-type(30) > button, .stButton:nth-of-type(32) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    /* Row 5: Light, Dark, Light, Dark, Light, Dark, Light, Dark */
    .stButton:nth-of-type(33) > button, .stButton:nth-of-type(35) > button, 
    .stButton:nth-of-type(37) > button, .stButton:nth-of-type(39) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    .stButton:nth-of-type(34) > button, .stButton:nth-of-type(36) > button, 
    .stButton:nth-of-type(38) > button, .stButton:nth-of-type(40) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    /* Row 6: Dark, Light, Dark, Light, Dark, Light, Dark, Light */
    .stButton:nth-of-type(41) > button, .stButton:nth-of-type(43) > button, 
    .stButton:nth-of-type(45) > button, .stButton:nth-of-type(47) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    .stButton:nth-of-type(42) > button, .stButton:nth-of-type(44) > button, 
    .stButton:nth-of-type(46) > button, .stButton:nth-of-type(48) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    /* Row 7: Light, Dark, Light, Dark, Light, Dark, Light, Dark */
    .stButton:nth-of-type(49) > button, .stButton:nth-of-type(51) > button, 
    .stButton:nth-of-type(53) > button, .stButton:nth-of-type(55) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
    
    .stButton:nth-of-type(50) > button, .stButton:nth-of-type(52) > button, 
    .stButton:nth-of-type(54) > button, .stButton:nth-of-type(56) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    /* Row 8: Dark, Light, Dark, Light, Dark, Light, Dark, Light */
    .stButton:nth-of-type(57) > button, .stButton:nth-of-type(59) > button, 
    .stButton:nth-of-type(61) > button, .stButton:nth-of-type(63) > button {
        background-color: #B58863 !important;
        color: #F0D9B5 !important;
    }
    
    .stButton:nth-of-type(58) > button, .stButton:nth-of-type(60) > button, 
    .stButton:nth-of-type(62) > button, .stButton:nth-of-type(64) > button {
        background-color: #F0D9B5 !important;
        color: #B58863 !important;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<h1 class="main-header">♔ TitanChess</h1>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Elite AI Chess Platform - Play against Stockfish-powered AI</p>', unsafe_allow_html=True)

# Import all the chess logic from the main file
# (We'll copy the essential functions here for the web version)

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

    # Possible knight moves relative to rows, col
    possible_moves = [(-2, -1), (-2, 1), (-1, -2), (-1, 2), (2, -1), (2, 1), (1, 2), (1, -2)]

    # Adjusting coordinates accordingly
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
    if not is_in_check(board, color):
        return False
    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece and piece.color == color:
                valid_moves = piece.get_moves(board, last_move)
                for move in valid_moves:
                    temp_board = copy.deepcopy(board)
                    temp_piece = temp_board[row][col]
                    temp_piece.update_position(move)
                    temp_board[move[0]][move[1]] = temp_piece
                    temp_board[row][col] = None
                    if not is_in_check(temp_board, color):
                        return False
    return True

def is_stalemate(board, color):
    if is_in_check(board, color):
        return False

    for row in range(8):
        for col in range(8):
            piece = board[row][col]
            if piece and piece.color == color:
                valid_moves = piece.get_moves(board)
                for move in valid_moves:
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

def initialize_board():
    """Initialize the chess board with pieces in starting positions"""
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

def get_valid_moves(piece, board, last_move=None):
    """Get valid moves for a piece (excluding moves that put own king in check)"""
    moves = piece.get_moves(board, last_move)
    legal_moves = []
    for move in moves:
        if is_legal_move(board, piece, move, last_move):
            legal_moves.append(move)
    return legal_moves

# Initialize session state
if 'board' not in st.session_state:
    st.session_state.board = initialize_board()
    st.session_state.turn = 'white'
    st.session_state.last_move = None
    st.session_state.selected_piece = None
    st.session_state.game_over = False

# Create two columns
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown('<div class="chess-board">', unsafe_allow_html=True)
    st.subheader("♔ Chess Board")
    
    # Create a visual chess board using Streamlit columns with proper styling
    # Create 8 rows of the chess board
    for row in range(8):
        # Create 8 columns for this row
        cols = st.columns(8)
        
        for col in range(8):
            with cols[col]:
                piece = st.session_state.board[row][col]
                
                # Determine square color (same as your Python version)
                is_light_square = (row + col) % 2 == 0
                square_color = "#F0D9B5" if is_light_square else "#B58863"
                
                # Check if this square is selected or a valid move
                button_style = ""
                if st.session_state.selected_piece == (row, col):
                    square_color = "#FFFF00"
                    button_style = "border: 3px solid #FFD700 !important; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5) !important;"
                elif st.session_state.selected_piece:
                    selected_row, selected_col = st.session_state.selected_piece
                    selected_piece = st.session_state.board[selected_row][selected_col]
                    valid_moves = get_valid_moves(selected_piece, st.session_state.board, st.session_state.last_move)
                    if (row, col) in valid_moves:
                        square_color = "#90EE90"
                        button_style = "border: 2px solid #00AA00 !important; box-shadow: 0 0 5px rgba(0, 170, 0, 0.3) !important;"
                
                piece_symbol = get_piece_symbol(piece)
                
                # Create button with custom styling
                button_key = f"square_{row}_{col}"
                
                # Use st.button with custom CSS
                if st.button(
                    piece_symbol, 
                    key=button_key,
                    help=f"Square {chr(97 + col)}{8 - row}",
                    use_container_width=True
                ):
                    if not st.session_state.game_over:
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
                                    
                                    st.session_state.last_move = ((selected_row, selected_col), (row, col))
                                    st.session_state.turn = 'black'
                                    
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
    
    # New game button
    if st.button("🔄 New Game", use_container_width=True):
        st.session_state.board = initialize_board()
        st.session_state.turn = 'white'
        st.session_state.last_move = None
        st.session_state.selected_piece = None
        st.session_state.game_over = False
        st.rerun()
    
    st.markdown('</div>', unsafe_allow_html=True)

# Simple AI move (random for now - can be enhanced later)
if st.session_state.turn == 'black' and not st.session_state.game_over:
    # Simple random AI move
    import random
    
    # Get all possible moves for black
    all_moves = []
    for row in range(8):
        for col in range(8):
            piece = st.session_state.board[row][col]
            if piece and piece.color == 'black':
                valid_moves = get_valid_moves(piece, st.session_state.board, st.session_state.last_move)
                for move in valid_moves:
                    all_moves.append(((row, col), move))
    
    if all_moves:
        # Choose a random move
        from_pos, to_pos = random.choice(all_moves)
        piece = st.session_state.board[from_pos[0]][from_pos[1]]
        
        # Make the move
        st.session_state.board[to_pos[0]][to_pos[1]] = piece
        st.session_state.board[from_pos[0]][from_pos[1]] = None
        piece.update_position(to_pos)
        
        st.session_state.last_move = (from_pos, to_pos)
        st.session_state.turn = 'white'
        
        # Check for game over
        if is_checkmate(st.session_state.board, st.session_state.turn):
            st.session_state.game_over = True
            st.error("Checkmate! White loses!")
        elif is_in_check(st.session_state.board, st.session_state.turn):
            st.warning("White is in check!")
        
        st.rerun()

# Footer
st.markdown("---")
st.markdown("**TitanChess** - Built with Python, Streamlit, and AI Engine")
