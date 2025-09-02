import streamlit as st
import numpy as np
import copy
import chess
import chess.engine

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

# Streamlit UI
st.set_page_config(page_title="TitanChess - AI Chess Engine", layout="wide")

st.title("♔ TitanChess - Elite AI Chess Platform")
st.markdown("**Play against a Stockfish-powered AI chess engine**")

# Initialize session state
if 'board' not in st.session_state:
    st.session_state.board = initialize_board()
    st.session_state.turn = 'white'
    st.session_state.last_move = None
    st.session_state.selected_piece = None
    st.session_state.game_over = False
    st.session_state.move_history = []

# Create two columns
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Chess Board")
    
    # Create the chess board
    board_container = st.container()
    
    # Display board as a grid of buttons
    for row in range(8):
        cols = st.columns(8)
        for col in range(8):
            with cols[col]:
                piece = st.session_state.board[row][col]
                square_color = "lightblue" if (row + col) % 2 == 0 else "lightgray"
                
                if piece:
                    piece_symbol = {
                        'pawn': '♟', 'rook': '♜', 'knight': '♞', 
                        'bishop': '♝', 'queen': '♛', 'king': '♚'
                    }[piece.piece_type]
                    piece_display = f"{piece_symbol}"
                else:
                    piece_display = ""
                
                if st.button(piece_display, key=f"square_{row}_{col}", 
                           help=f"Row {row}, Col {col}"):
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
                                    
                                    # Record move
                                    move_notation = f"{chr(97 + selected_col)}{8 - selected_row} → {chr(97 + col)}{8 - row}"
                                    st.session_state.move_history.append(f"{len(st.session_state.move_history) + 1}. {move_notation}")
                                    
                                    st.session_state.last_move = ((selected_row, selected_col), (row, col))
                                    st.session_state.turn = 'black' if st.session_state.turn == 'white' else 'white'
                                    
                                    # Check for game over
                                    if is_in_check(st.session_state.board, st.session_state.turn):
                                        st.session_state.game_over = True
                                        st.success(f"Checkmate! {st.session_state.turn} loses!")
                                    
                                st.session_state.selected_piece = None
                                st.rerun()

with col2:
    st.subheader("Game Info")
    st.write(f"**Current Turn:** {st.session_state.turn.title()}")
    
    if st.session_state.selected_piece:
        row, col = st.session_state.selected_piece
        piece = st.session_state.board[row][col]
        st.write(f"**Selected:** {piece.piece_type.title()} at {chr(97 + col)}{8 - row}")
        
        valid_moves = get_valid_moves(piece, st.session_state.board, st.session_state.last_move)
        st.write(f"**Valid moves:** {len(valid_moves)}")
        for move in valid_moves[:5]:  # Show first 5 moves
            st.write(f"• {chr(97 + move[1])}{8 - move[0]}")
        if len(valid_moves) > 5:
            st.write(f"... and {len(valid_moves) - 5} more")
    
    st.subheader("Move History")
    for move in st.session_state.move_history[-10:]:  # Show last 10 moves
        st.write(move)
    
    if st.button("New Game"):
        st.session_state.board = initialize_board()
        st.session_state.turn = 'white'
        st.session_state.last_move = None
        st.session_state.selected_piece = None
        st.session_state.game_over = False
        st.session_state.move_history = []
        st.rerun()

# AI Move (simplified for demo)
if st.session_state.turn == 'black' and not st.session_state.game_over:
    st.info("🤖 AI is thinking...")
    # Here you would add your Stockfish AI logic
    # For now, just switch turns
    st.session_state.turn = 'white'
    st.rerun()
