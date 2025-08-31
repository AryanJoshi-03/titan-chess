import copy

# Copy the chess logic from the main file
def is_within_boundaries(row,col):
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
                valid_moves.append((new_row,new_col))
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
                valid_moves.append((new_row,new_col))
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
                valid_moves.append((new_row,new_col))
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

# Test the chess logic
def test_chess_logic():
    # Create a simple board
    board = [[None] * 8 for _ in range(8)]
    
    # Test pawn movement
    pawn = Piece('pawn', 'white', (6, 0))
    board[6][0] = pawn
    
    moves = pawn.get_moves(board)
    print(f"White pawn at (6,0) can move to: {moves}")
    
    # Test knight movement
    knight = Piece('knight', 'white', (7, 1))
    board[7][1] = knight
    
    moves = knight.get_moves(board)
    print(f"White knight at (7,1) can move to: {moves}")
    
    # Test bishop movement
    bishop = Piece('bishop', 'white', (7, 2))
    board[7][2] = bishop
    
    moves = bishop.get_moves(board)
    print(f"White bishop at (7,2) can move to: {moves}")
    
    print("Chess logic test completed!")

if __name__ == "__main__":
    test_chess_logic() 