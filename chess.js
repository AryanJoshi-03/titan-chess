class ChessGame {
    constructor() {
        this.canvas = document.getElementById('chessboard');
        this.ctx = this.canvas.getContext('2d');
        this.squareSize = 100; // Increased to match 800x800 canvas
        this.selectedPiece = null;
        this.validMoves = [];
        this.turn = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.moveCount = 1;
        this.lastMove = null;
        
        this.initializeBoard();
        this.setupEventListeners();
        this.drawBoard();
        this.drawPieces();
        this.updateTurnIndicator();
        this.updateGameStatus('');
        this.updateMoveHistory();
    }

    initializeBoard() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Initialize pieces - EXACTLY like your Python version
        const pieces = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn']
        ];

        // Place black pieces (top rows)
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = {
                    type: pieces[row][col],
                    color: 'black',
                    hasMoved: false,
                    position: [row, col]
                };
            }
        }

        // Place white pieces (bottom rows)
        for (let row = 6; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = {
                    type: pieces[7-row][col],
                    color: 'white',
                    hasMoved: false,
                    position: [row, col]
                };
            }
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }
    }

    handleClick(e) {
        if (this.gameOver || this.turn === 'black') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.squareSize);
        const y = Math.floor((e.clientY - rect.top) / this.squareSize);

        if (x < 0 || x >= 8 || y < 0 || y >= 8) return;

        if (this.selectedPiece) {
            // Try to move piece
            if (this.validMoves.some(move => move.row === y && move.col === x)) {
                this.movePiece(this.selectedPiece, {row: y, col: x});
                this.selectedPiece = null;
                this.validMoves = [];
                this.drawBoard();
                this.drawPieces();
                
                // AI move using Stockfish
                setTimeout(() => this.makeStockfishMove(), 500);
            } else {
                // Select new piece
                this.selectPiece(y, x);
            }
        } else {
            this.selectPiece(y, x);
        }
    }

    selectPiece(row, col) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.turn) {
            this.selectedPiece = {row, col};
            this.validMoves = this.getValidMoves(row, col);
            this.drawBoard();
            this.drawPieces();
            this.drawHighlights();
        }
    }

    // EXACT SAME LOGIC AS YOUR PYTHON VERSION
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.pawnMoves(piece);
                break;
            case 'knight':
                moves = this.knightMoves(piece);
                break;
            case 'bishop':
                moves = this.bishopMoves(piece);
                break;
            case 'rook':
                moves = this.rookMoves(piece);
                break;
            case 'queen':
                moves = this.queenMoves(piece);
                break;
            case 'king':
                moves = this.kingMoves(piece);
                break;
        }

        // Filter moves that don't leave king in check
        return moves.filter(move => this.isLegalMove(row, col, move.row, move.col));
    }

    // EXACT SAME PAWN LOGIC AS PYTHON
    pawnMoves(piece) {
        const moves = [];
        const [row, col] = piece.position;
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Move forward - EXACT SAME AS PYTHON
        if (this.isValidSquare(row + direction, col, piece.color) && !this.board[row + direction][col]) {
            moves.push({row: row + direction, col: col});
            // Check if it's at the starting position and can move two squares
            if (row === startRow && this.isValidSquare(row + 2 * direction, col, piece.color) && 
                !this.board[row + direction][col] && !this.board[row + 2 * direction][col]) {
                moves.push({row: row + 2 * direction, col: col});
            }
        }

        // Capturing moves - EXACT SAME AS PYTHON
        for (const offset of [-1, 1]) {
            const captureCol = col + offset;
            if (captureCol >= 0 && captureCol < 8) {
                const captureSquare = this.board[row + direction][captureCol];
                if (captureSquare && captureSquare.color !== piece.color) {
                    moves.push({row: row + direction, col: captureCol});
                }
                // En passant - EXACT SAME AS PYTHON
                else if (this.board[row][captureCol] && this.board[row][captureCol].type === 'pawn' && 
                        this.board[row][captureCol].color !== piece.color) {
                    if ((piece.color === 'white' && row === 3) || (piece.color === 'black' && row === 4)) {
                        if (this.lastMove) {
                            const [lastMoveStart, lastMoveEnd] = this.lastMove;
                            if (lastMoveEnd[0] === row && lastMoveEnd[1] === captureCol && 
                                Math.abs(lastMoveStart[0] - lastMoveEnd[0]) === 2) {
                                moves.push({row: row + direction, col: captureCol});
                            }
                        }
                    }
                }
            }
        }

        return moves;
    }

    // EXACT SAME KNIGHT LOGIC AS PYTHON
    knightMoves(piece) {
        const moves = [];
        const [row, col] = piece.position;
        // EXACT SAME POSSIBLE MOVES AS PYTHON
        const possibleMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [2, -1], [2, 1], [1, 2], [1, -2]];

        for (const [r, c] of possibleMoves) {
            const newRow = row + r;
            const newCol = col + c;
            if (this.isValidSquare(newRow, newCol, piece.color)) {
                moves.push({row: newRow, col: newCol});
            }
        }

        return moves;
    }

    // EXACT SAME BISHOP LOGIC AS PYTHON
    bishopMoves(piece) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [[1, 1], [-1, 1], [1, -1], [-1, -1]];

        for (const [r, c] of possibleMoves) {
            let newRow = row + r;
            let newCol = col + c;

            while (this.isValidSquare(newRow, newCol, piece.color)) {
                if (!this.board[newRow][newCol]) {
                    moves.push({row: newRow, col: newCol});
                } else if (this.board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    // EXACT SAME ROOK LOGIC AS PYTHON
    rookMoves(piece) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [[1, 0], [0, 1], [-1, 0], [0, -1]];

        for (const [r, c] of possibleMoves) {
            let newRow = row + r;
            let newCol = col + c;

            while (this.isValidSquare(newRow, newCol, piece.color)) {
                if (!this.board[newRow][newCol]) {
                    moves.push({row: newRow, col: newCol});
                } else if (this.board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    // EXACT SAME QUEEN LOGIC AS PYTHON
    queenMoves(piece) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [
            [1, 0], [0, 1], [-1, 0], [0, -1],
            [1, 1], [-1, 1], [1, -1], [-1, -1]
        ];

        for (const [r, c] of possibleMoves) {
            let newRow = row + r;
            let newCol = col + c;

            while (this.isValidSquare(newRow, newCol, piece.color)) {
                if (!this.board[newRow][newCol]) {
                    moves.push({row: newRow, col: newCol});
                } else if (this.board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    // EXACT SAME KING LOGIC AS PYTHON
    kingMoves(piece) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [
            [1, 0], [0, 1], [-1, 0], [0, -1],
            [1, 1], [-1, 1], [1, -1], [-1, -1]
        ];

        for (const [r, c] of possibleMoves) {
            const newRow = row + r;
            const newCol = col + c;
            if (this.isValidSquare(newRow, newCol, piece.color)) {
                moves.push({row: newRow, col: newCol});
            }
        }

        return moves;
    }

    // EXACT SAME VALIDATION LOGIC AS PYTHON
    isValidSquare(row, col, pieceColor) {
        return 0 <= row && row < 8 && 0 <= col && col < 8 && 
               (this.board[row][col] === null || this.board[row][col].color !== pieceColor);
    }

    canCastle(king, rook) {
        if (!rook || rook.type !== 'rook' || rook.hasMoved || rook.color !== king.color) {
            return false;
        }

        const [row, col] = king.position;
        const rookCol = rook.position[1];

        // Check if squares between king and rook are empty
        if (rookCol === 0) { // Queen-side
            for (let c = 1; c < col; c++) {
                if (this.board[row][c]) return false;
            }
        } else if (rookCol === 7) { // King-side
            for (let c = col + 1; c < 7; c++) {
                if (this.board[row][c]) return false;
            }
        }

        return true;
    }

    isLegalMove(fromRow, fromCol, toRow, toCol) {
        // Make temporary move - EXACT SAME AS PYTHON
        const tempBoard = JSON.parse(JSON.stringify(this.board));
        const piece = tempBoard[fromRow][fromCol];
        if (!piece) return false;
        
        tempBoard[toRow][toCol] = piece;
        tempBoard[fromRow][fromCol] = null;
        piece.position = [toRow, toCol]; // Update position in temp board

        // Check if king is in check - EXACT SAME AS PYTHON
        return !this.isInCheck(tempBoard, piece.color);
    }
    
    // EXACT SAME CHECK LOGIC AS PYTHON
    isInCheck(board, color) {
        let kingPosition = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color && piece.type === 'king') {
                    kingPosition = [row, col];
                    break;
                }
            }
            if (kingPosition) break;
        }

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color !== color) {
                    const validMoves = this.getPieceMoves(piece, board);
                    if (validMoves.some(move => move[0] === kingPosition[0] && move[1] === kingPosition[1])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // EXACT SAME PIECE MOVES AS PYTHON
    getPieceMoves(piece, board) {
        switch (piece.type) {
            case 'pawn':
                return this.pawnMovesForBoard(piece, board);
            case 'knight':
                return this.knightMovesForBoard(piece, board);
            case 'bishop':
                return this.bishopMovesForBoard(piece, board);
            case 'rook':
                return this.rookMovesForBoard(piece, board);
            case 'queen':
                return this.queenMovesForBoard(piece, board);
            case 'king':
                return this.kingMovesForBoard(piece, board);
            default:
                return [];
        }
    }

    pawnMovesForBoard(piece, board, lastMove = null) {
        const moves = [];
        const [row, col] = piece.position;
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Move forward
        if (this.isValidSquareForBoard(board, row + direction, col, piece.color) && !board[row + direction][col]) {
            moves.push([row + direction, col]);
            // Check if it's at the starting position and can move two squares
            if (row === startRow && this.isValidSquareForBoard(board, row + 2 * direction, col, piece.color) && 
                !board[row + direction][col] && !board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }

        // Capturing moves
        for (const offset of [-1, 1]) {
            const captureCol = col + offset;
            if (captureCol >= 0 && captureCol < 8) {
                const captureSquare = board[row + direction][captureCol];
                if (captureSquare && captureSquare.color !== piece.color) {
                    moves.push([row + direction, captureCol]);
                }
                // En passant - EXACT SAME AS PYTHON
                else if (board[row][captureCol] && board[row][captureCol].type === 'pawn' && 
                        board[row][captureCol].color !== piece.color) {
                    if ((piece.color === 'white' && row === 3) || (piece.color === 'black' && row === 4)) {
                        if (lastMove) {
                            const [lastMoveStart, lastMoveEnd] = lastMove;
                            if (lastMoveEnd[0] === row && lastMoveEnd[1] === captureCol && 
                                Math.abs(lastMoveStart[0] - lastMoveEnd[0]) === 2) {
                                moves.push([row + direction, captureCol]);
                            }
                        }
                    }
                }
            }
        }

        return moves;
    }

    knightMovesForBoard(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [2, -1], [2, 1], [1, 2], [1, -2]];

        for (const [r, c] of possibleMoves) {
            const newRow = row + r;
            const newCol = col + c;
            if (this.isValidSquareForBoard(board, newRow, newCol, piece.color)) {
                moves.push([newRow, newCol]);
            }
        }

        return moves;
    }

    bishopMovesForBoard(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [[1, 1], [-1, 1], [1, -1], [-1, -1]];

        for (const [r, c] of possibleMoves) {
            let newRow = row + r;
            let newCol = col + c;

            while (this.isValidSquareForBoard(board, newRow, newCol, piece.color)) {
                if (!board[newRow][newCol]) {
                    moves.push([newRow, newCol]);
                } else if (board[newRow][newCol].color !== piece.color) {
                    moves.push([newRow, newCol]);
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    rookMovesForBoard(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [[1, 0], [0, 1], [-1, 0], [0, -1]];

        for (const [r, c] of possibleMoves) {
            let newRow = row + r;
            let newCol = col + c;

            while (this.isValidSquareForBoard(board, newRow, newCol, piece.color)) {
                if (!board[newRow][newCol]) {
                    moves.push([newRow, newCol]);
                } else if (board[newRow][newCol].color !== piece.color) {
                    moves.push([newRow, newCol]);
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    queenMovesForBoard(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

        for (const [r, c] of possibleMoves) {
            let newRow = row + r;
            let newCol = col + c;

            while (this.isValidSquareForBoard(board, newRow, newCol, piece.color)) {
                if (!board[newRow][newCol]) {
                    moves.push([newRow, newCol]);
                } else if (board[newRow][newCol].color !== piece.color) {
                    moves.push([newRow, newCol]);
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    kingMovesForBoard(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

        for (const [r, c] of possibleMoves) {
            const newRow = row + r;
            const newCol = col + c;
            if (this.isValidSquareForBoard(board, newRow, newCol, piece.color)) {
                moves.push([newRow, newCol]);
            }
        }

        return moves;
    }

    isValidSquareForBoard(board, row, col, pieceColor) {
        return 0 <= row && row < 8 && 0 <= col && col < 8 && 
               (board[row][col] === null || board[row][col].color !== pieceColor);
    }

    isKingInCheck(board, color) {
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] && board[row][col].type === 'king' && board[row][col].color === color) {
                    kingPos = {row, col};
                    break;
                }
            }
            if (kingPos) break;
        }

        if (!kingPos) return false;

        // Check if any enemy piece can attack the king - EXACT SAME AS PYTHON
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color !== color) {
                    // Use the piece's actual move generation
                    let moves = [];
                    switch (piece.type) {
                        case 'pawn':
                            moves = this.pawnMovesBasic(piece, board);
                            break;
                        case 'knight':
                            moves = this.knightMovesBasic(piece, board);
                            break;
                        case 'bishop':
                            moves = this.bishopMovesBasic(piece, board);
                            break;
                        case 'rook':
                            moves = this.rookMovesBasic(piece, board);
                            break;
                        case 'queen':
                            moves = this.queenMovesBasic(piece, board);
                            break;
                        case 'king':
                            moves = this.kingMovesBasic(piece, board);
                            break;
                    }
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getBasicMoves(row, col, board) {
        const piece = board[row][col];
        if (!piece) return [];

        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.pawnMovesBasic(piece, board);
                break;
            case 'knight':
                moves = this.knightMovesBasic(piece, board);
                break;
            case 'bishop':
                moves = this.bishopMovesBasic(piece, board);
                break;
            case 'rook':
                moves = this.rookMovesBasic(piece, board);
                break;
            case 'queen':
                moves = this.queenMovesBasic(piece, board);
                break;
            case 'king':
                moves = this.kingMovesBasic(piece, board);
                break;
        }

        return moves;
    }

    // Basic move methods for checking check (no recursion)
    pawnMovesBasic(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const direction = piece.color === 'white' ? -1 : 1;

        // Single square move
        if (row + direction >= 0 && row + direction < 8 && col >= 0 && col < 8) {
            if (!board[row + direction][col]) {
                moves.push({row: row + direction, col: col});
            }
        }

        // Diagonal captures
        for (const offset of [-1, 1]) {
            const newCol = col + offset;
            if (newCol >= 0 && newCol < 8 && row + direction >= 0 && row + direction < 8) {
                const targetPiece = board[row + direction][newCol];
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({row: row + direction, col: newCol});
                }
            }
        }

        return moves;
    }

    knightMovesBasic(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const possibleMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [2, -1], [2, 1], [1, 2], [1, -2]
        ];

        for (const [r, c] of possibleMoves) {
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                }
            }
        }

        return moves;
    }

    bishopMovesBasic(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]];

        for (const [r, c] of directions) {
            let newRow = row + r;
            let newCol = col + c;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (!board[newRow][newCol]) {
                    moves.push({row: newRow, col: newCol});
                } else if (board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    rookMovesBasic(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

        for (const [r, c] of directions) {
            let newRow = row + r;
            let newCol = col + c;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (!board[newRow][newCol]) {
                    moves.push({row: newRow, col: newCol});
                } else if (board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    queenMovesBasic(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const directions = [
            [1, 0], [0, 1], [-1, 0], [0, -1],
            [1, 1], [-1, 1], [1, -1], [-1, -1]
        ];

        for (const [r, c] of directions) {
            let newRow = row + r;
            let newCol = col + c;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (!board[newRow][newCol]) {
                    moves.push({row: newRow, col: newCol});
                } else if (board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                    break;
                } else {
                    break;
                }
                newRow += r;
                newCol += c;
            }
        }

        return moves;
    }

    kingMovesBasic(piece, board) {
        const moves = [];
        const [row, col] = piece.position;
        const directions = [
            [1, 0], [0, 1], [-1, 0], [0, -1],
            [1, 1], [-1, 1], [1, -1], [-1, -1]
        ];

        for (const [r, c] of directions) {
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                }
            }
        }

        return moves;
    }

    movePiece(from, to) {
        const piece = this.board[from.row][from.col];
        const capturedPiece = this.board[to.row][to.col];

        if (!piece) {
            console.error('No piece at source position');
            return;
        }

        // Handle en passant - EXACT SAME AS PYTHON
        if (piece.type === 'pawn' && Math.abs(from.row - to.row) === 1 && Math.abs(from.col - to.col) === 1 && !capturedPiece) {
            // En passant capture
            this.board[from.row][to.col] = null; // Remove the captured pawn
        }

        // Handle castling - EXACT SAME AS PYTHON
        if (piece.type === 'king' && Math.abs(from.col - to.col) === 2) {
            this.handleCastling(from, to);
        }

        // Move piece - EXACT SAME AS PYTHON
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;
        piece.position = [to.row, to.col];
        piece.hasMoved = true;

        // Handle pawn promotion - EXACT SAME AS PYTHON
        if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
            this.board[to.row][to.col] = {type: 'queen', color: piece.color, hasMoved: true, position: [to.row, to.col]};
        }

        // Update last move for en passant - EXACT SAME AS PYTHON
        this.lastMove = [[from.row, from.col], [to.row, to.col]];

        // Record move
        const moveNotation = this.getMoveNotation(from, to, capturedPiece);
        this.moveHistory.push(`${this.moveCount}. ${moveNotation}`);
        this.updateMoveHistory();

        // Check game state
        this.turn = this.turn === 'white' ? 'black' : 'white';
        if (this.turn === 'white') this.moveCount++;

        if (this.isCheckmate()) {
            this.gameOver = true;
            this.updateGameStatus(`Checkmate! ${this.turn === 'white' ? 'Black' : 'White'} wins!`);
        } else if (this.isStalemate()) {
            this.gameOver = true;
            this.updateGameStatus("Stalemate! It's a draw.");
        } else if (this.isInCheck(this.board, this.turn)) {
            this.updateGameStatus(`${this.turn === 'white' ? 'White' : 'Black'} is in check!`);
        } else {
            this.updateGameStatus('');
        }

        this.updateTurnIndicator();
    }

    handleCastling(from, to) {
        const row = from.row;
        if (to.col === 6) { // King-side
            this.board[row][5] = this.board[row][7];
            this.board[row][7] = null;
            this.board[row][5].position = [row, 5];
            this.board[row][5].hasMoved = true;
        } else if (to.col === 2) { // Queen-side
            this.board[row][3] = this.board[row][0];
            this.board[row][0] = null;
            this.board[row][3].position = [row, 3];
            this.board[row][3].hasMoved = true;
        }
    }

    getMoveNotation(from, to, capturedPiece) {
        const piece = this.board[to.row][to.col];
        let notation = '';

        if (piece.type !== 'pawn') {
            notation += piece.type.charAt(0).toUpperCase();
        }

        if (capturedPiece) {
            notation += 'x';
        }

        notation += String.fromCharCode(97 + to.col) + (8 - to.row);

        return notation;
    }

    // STRONG MINIMAX AI (like your Python version)
    async makeStockfishMove() {
        if (this.gameOver || this.turn !== 'black') return;

        try {
            // Use strong minimax AI algorithm - EXACT SAME AS PYTHON
            const bestMove = this.findBestMoveMinimax();
            
            if (bestMove) {
                this.movePiece(bestMove.from, bestMove.to);
                this.drawBoard();
                this.drawPieces();
            }
        } catch (error) {
            console.error('AI move error:', error);
            // Fallback to simple AI
            this.makeSimpleAIMove();
        }
    }

    // EXACT SAME MINIMAX AS PYTHON VERSION
    findBestMoveMinimax() {
        const depth = 3; // Strong search depth
        const [score, bestMove] = this.minimax(this.board, depth, -Infinity, Infinity, false, this.lastMove);
        return bestMove;
    }

    minimax(board, depth, alpha, beta, maximizingPlayer, lastMove) {
        if (depth === 0 || this.isCheckmateForBoard(board, 'white') || this.isCheckmateForBoard(board, 'black')) {
            return [this.evaluateBoard(board), null];
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            let bestMove = null;
            const moves = this.getAllValidMoves(board, 'white', lastMove);
            
            for (const move of moves) {
                const newBoard = this.makeMove(board, move);
                const [eval, _] = this.minimax(newBoard, depth - 1, alpha, beta, false, move);
                if (eval > maxEval) {
                    maxEval = eval;
                    bestMove = move;
                }
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            return [maxEval, bestMove];
        } else {
            let minEval = Infinity;
            let bestMove = null;
            const moves = this.getAllValidMoves(board, 'black', lastMove);
            
            for (const move of moves) {
                const newBoard = this.makeMove(board, move);
                const [eval, _] = this.minimax(newBoard, depth - 1, alpha, beta, true, move);
                if (eval < minEval) {
                    minEval = eval;
                    bestMove = move;
                }
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            return [minEval, bestMove];
        }
    }

    // EXACT SAME HELPER FUNCTIONS AS PYTHON
    getAllValidMoves(board, color, lastMove) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color) {
                    const pieceMoves = this.getValidMovesForBoard(board, row, col, lastMove);
                    for (const move of pieceMoves) {
                        moves.push([[row, col], [move[0], move[1]]]);
                    }
                }
            }
        }
        return moves;
    }

    makeMove(board, move) {
        const [startPos, endPos] = move;
        const newBoard = JSON.parse(JSON.stringify(board));
        const piece = newBoard[startPos[0]][startPos[1]];
        piece.position = [endPos[0], endPos[1]];
        newBoard[endPos[0]][endPos[1]] = piece;
        newBoard[startPos[0]][startPos[1]] = null;
        return newBoard;
    }

    getValidMovesForBoard(board, row, col, lastMove) {
        const piece = board[row][col];
        if (!piece) return [];

        let moves = [];
        switch (piece.type) {
            case 'pawn':
                moves = this.pawnMovesForBoard(piece, board, lastMove);
                break;
            case 'knight':
                moves = this.knightMovesForBoard(piece, board);
                break;
            case 'bishop':
                moves = this.bishopMovesForBoard(piece, board);
                break;
            case 'rook':
                moves = this.rookMovesForBoard(piece, board);
                break;
            case 'queen':
                moves = this.queenMovesForBoard(piece, board);
                break;
            case 'king':
                moves = this.kingMovesForBoard(piece, board);
                break;
        }

        // Filter moves that don't leave king in check
        const legalMoves = [];
        for (const move of moves) {
            if (this.isLegalMoveForBoard(board, row, col, move[0], move[1])) {
                legalMoves.push(move);
            }
        }
        return legalMoves;
    }

    isLegalMoveForBoard(board, fromRow, fromCol, toRow, toCol) {
        const tempBoard = JSON.parse(JSON.stringify(board));
        const piece = tempBoard[fromRow][fromCol];
        if (!piece) return false;
        
        tempBoard[toRow][toCol] = piece;
        tempBoard[fromRow][fromCol] = null;
        piece.position = [toRow, toCol];

        return !this.isInCheckForBoard(tempBoard, piece.color);
    }

    isInCheckForBoard(board, color) {
        let kingPosition = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color && piece.type === 'king') {
                    kingPosition = [row, col];
                    break;
                }
            }
            if (kingPosition) break;
        }

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color !== color) {
                    const validMoves = this.getPieceMovesForBoard(piece, board);
                    if (validMoves.some(move => move[0] === kingPosition[0] && move[1] === kingPosition[1])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getPieceMovesForBoard(piece, board) {
        switch (piece.type) {
            case 'pawn':
                return this.pawnMovesForBoard(piece, board);
            case 'knight':
                return this.knightMovesForBoard(piece, board);
            case 'bishop':
                return this.bishopMovesForBoard(piece, board);
            case 'rook':
                return this.rookMovesForBoard(piece, board);
            case 'queen':
                return this.queenMovesForBoard(piece, board);
            case 'king':
                return this.kingMovesForBoard(piece, board);
            default:
                return [];
        }
    }

    isCheckmateForBoard(board, color) {
        if (!this.isInCheckForBoard(board, color)) return false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMovesForBoard(board, row, col);
                    for (const move of moves) {
                        const tempBoard = JSON.parse(JSON.stringify(board));
                        const tempPiece = tempBoard[row][col];
                        tempPiece.position = [move[0], move[1]];
                        tempBoard[move[0]][move[1]] = tempPiece;
                        tempBoard[row][col] = null;
                        if (!this.isInCheckForBoard(tempBoard, color)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    getValidMovesForBoard(board, row, col) {
        const piece = board[row][col];
        if (!piece) return [];

        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.pawnMovesBasic(piece, board);
                break;
            case 'knight':
                moves = this.knightMovesBasic(piece, board);
                break;
            case 'bishop':
                moves = this.bishopMovesBasic(piece, board);
                break;
            case 'rook':
                moves = this.rookMovesBasic(piece, board);
                break;
            case 'queen':
                moves = this.queenMovesBasic(piece, board);
                break;
            case 'king':
                moves = this.kingMovesBasic(piece, board);
                break;
        }

        return moves;
    }

    // EXACT SAME BOARD EVALUATION AS PYTHON
    evaluateBoard(board) {
        const pieceValue = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };

        // Piece-square tables (same as Python)
        const pawnTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        const knightTable = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];

        const bishopTable = [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ];

        const rookTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0,  5,  5,  0,  0,  0]
        ];

        const queenTable = [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ];

        const kingTable = [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 30, 10,  0,  0, 10, 30, 20]
        ];

        const piecePositionTables = {
            'pawn': pawnTable,
            'knight': knightTable,
            'bishop': bishopTable,
            'rook': rookTable,
            'queen': queenTable,
            'king': kingTable
        };

        let score = 0;
        let mobility = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceScore = pieceValue[piece.type];
                    if (piece.color === 'white') {
                        const positionScore = piecePositionTables[piece.type][row][col];
                        score += pieceScore + positionScore;
                        mobility += this.getValidMovesForBoard(board, row, col).length;
                    } else {
                        const flippedRow = 7 - row;
                        const positionScore = piecePositionTables[piece.type][flippedRow][col];
                        score -= pieceScore + positionScore;
                        mobility -= this.getValidMovesForBoard(board, row, col).length;
                    }
                }
            }
        }

        score += 5 * mobility;
        return score;
    }

    // Fallback simple AI
    makeSimpleAIMove() {
        let bestMove = null;
        let bestScore = -Infinity;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === 'black') {
                    const moves = this.getValidMoves(row, col);
                    for (const move of moves) {
                        const score = this.evaluateMove(row, col, move.row, move.col);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = {from: {row, col}, to: move};
                        }
                    }
                }
            }
        }

        if (bestMove) {
            this.movePiece(bestMove.from, bestMove.to);
            this.drawBoard();
            this.drawPieces();
        }
    }

    evaluateMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        
        let score = 0;
        
        // Piece values
        const pieceValues = {pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 1000};
        
        if (targetPiece) {
            score += pieceValues[targetPiece.type] * 10; // Capture bonus
        }
        
        // Position bonus
        if (piece.type === 'pawn') {
            score += (7 - toRow) * 0.1; // Advance pawns
        }
        
        return score;
    }

    // Convert board to FEN string (for Stockfish integration)
    boardToFen() {
        let fen = '';
        
        for (let row = 0; row < 8; row++) {
            let empty = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    const symbol = piece.type.charAt(0).toUpperCase();
                    fen += piece.color === 'white' ? symbol : symbol.toLowerCase();
                } else {
                    empty++;
                }
            }
            if (empty > 0) {
                fen += empty;
            }
            if (row < 7) fen += '/';
        }
        
        fen += ' b - - 0 1'; // Active color, castling, en passant, halfmove, fullmove
        return fen;
    }

    // EXACT SAME CHECKMATE LOGIC AS PYTHON
    isCheckmate() {
        if (!this.isInCheck(this.board, this.turn)) return false;
        
        // Check if any legal move exists
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.turn) {
                    const moves = this.getValidMoves(row, col);
                    for (const move of moves) {
                        const tempBoard = JSON.parse(JSON.stringify(this.board));
                        const tempPiece = tempBoard[row][col];
                        tempPiece.position = [move.row, move.col];
                        tempBoard[move.row][move.col] = tempPiece;
                        tempBoard[row][col] = null;
                        if (!this.isInCheck(tempBoard, this.turn)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    // EXACT SAME STALEMATE LOGIC AS PYTHON
    isStalemate() {
        if (this.isInCheck(this.board, this.turn)) return false;
        
        // Check if any legal move exists
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.turn) {
                    const moves = this.getValidMoves(row, col);
                    for (const move of moves) {
                        const tempBoard = JSON.parse(JSON.stringify(this.board));
                        const tempPiece = tempBoard[row][col];
                        tempPiece.position = [move.row, move.col];
                        tempBoard[move.row][move.col] = tempPiece;
                        tempBoard[row][col] = null;
                        if (!this.isInCheck(tempBoard, this.turn)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    // BROWN CHESSBOARD LIKE YOUR PYTHON VERSION
    drawBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * this.squareSize;
                const y = row * this.squareSize;
                // EXACT SAME COLORS AS PYTHON: LIGHT_BROWN and DARK_BROWN
                const color = (row + col) % 2 === 0 ? '#DEB887' : '#8B4513';
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
            }
        }
    }

    drawPieces() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    this.drawPiece(piece, row, col);
                }
            }
        }
    }

    drawPiece(piece, row, col) {
        const x = col * this.squareSize + this.squareSize / 2;
        const y = row * this.squareSize + this.squareSize / 2;
        const size = this.squareSize * 0.4;

        // EXACT SAME PIECE STYLE AS PYTHON VERSION
        if (piece.color === 'white') {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
        } else {
            this.ctx.fillStyle = '#000000';
            this.ctx.strokeStyle = '#FFFFFF';
        }
        
        this.ctx.lineWidth = 2;

        switch (piece.type) {
            case 'pawn':
                this.drawPawn(x, y, size);
                break;
            case 'rook':
                this.drawRook(x, y, size);
                break;
            case 'knight':
                this.drawKnight(x, y, size);
                break;
            case 'bishop':
                this.drawBishop(x, y, size);
                break;
            case 'queen':
                this.drawQueen(x, y, size);
                break;
            case 'king':
                this.drawKing(x, y, size);
                break;
        }
    }

    drawPawn(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y - size/3, size/3, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x, y + size/3, size/2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawRook(x, y, size) {
        this.ctx.fillRect(x - size/2, y - size/2, size, size);
        this.ctx.strokeRect(x - size/2, y - size/2, size, size);
        
        // Add battlements
        for (let i = -size/2; i < size/2; i += size/4) {
            this.ctx.fillRect(x + i, y - size/2, size/8, size/8);
        }
    }

    drawKnight(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - size/2, y + size/2);
        this.ctx.lineTo(x - size/3, y - size/3);
        this.ctx.lineTo(x + size/3, y - size/2);
        this.ctx.lineTo(x + size/2, y + size/3);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawBishop(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y - size/3, size/4, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - size/3, y + size/3);
        this.ctx.lineTo(x + size/3, y + size/3);
        this.ctx.lineTo(x, y - size/3);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawQueen(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size/3, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Add crown
        for (let i = -size/3; i <= size/3; i += size/6) {
            this.ctx.fillRect(x + i, y - size/2, size/12, size/6);
        }
    }

    drawKing(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size/3, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Add cross
        this.ctx.fillRect(x - size/8, y - size/2, size/4, size/2);
        this.ctx.fillRect(x - size/3, y - size/4, size/1.5, size/4);
    }

    drawHighlights() {
        if (this.selectedPiece) {
            const x = this.selectedPiece.col * this.squareSize;
            const y = this.selectedPiece.row * this.squareSize;
            
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, this.squareSize, this.squareSize);
        }

        for (const move of this.validMoves) {
            const x = move.col * this.squareSize + this.squareSize / 2;
            const y = move.row * this.squareSize + this.squareSize / 2;
            
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.squareSize / 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    updateTurnIndicator() {
        const turnText = document.getElementById('turn-text');
        if (turnText) {
            turnText.textContent = `${this.turn === 'white' ? 'White' : 'Black'}'s Turn`;
        }
    }

    updateGameStatus(status) {
        const gameStatus = document.getElementById('game-status');
        if (gameStatus) {
            gameStatus.textContent = status;
        }
    }

    updateMoveHistory() {
        const movesList = document.getElementById('moves-list');
        if (movesList) {
            movesList.innerHTML = '';
            
            for (const move of this.moveHistory) {
                const moveDiv = document.createElement('div');
                moveDiv.textContent = move;
                movesList.appendChild(moveDiv);
            }
        }
    }

    newGame() {
        this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.turn = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.moveCount = 1;
        this.lastMove = null;
        
        this.drawBoard();
        this.drawPieces();
        this.updateTurnIndicator();
        this.updateGameStatus('');
        this.updateMoveHistory();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new ChessGame();
        console.log('Chess game initialized successfully with Python logic and Stockfish-style AI!');
    } catch (error) {
        console.error('Error initializing chess game:', error);
    }
}); 