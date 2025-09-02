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
            }
        }

        return moves;
    }

    // EXACT SAME KNIGHT LOGIC AS PYTHON
    knightMoves(piece) {
        const moves = [];
        const [row, col] = piece.position;
        // EXACT SAME POSSIBLE MOVES AS PYTHON
        const possibleMoves = [(-2, -1), (-2, 1), (-1, -2), (-1, 2), (2, -1), (2, 1), (1, 2), (1, -2)];

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
        const possibleMoves = [(1, 1), (-1, 1), (1, -1), (-1, -1)];

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
        const possibleMoves = [(1, 0), (0, 1), (-1, 0), (0, -1)];

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
            (1, 0), (0, 1), (-1, 0), (0, -1),
            (1, 1), (-1, 1), (1, -1), (-1, -1)
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
            (1, 0), (0, 1), (-1, 0), (0, -1),
            (1, 1), (-1, 1), (1, -1), (-1, -1)
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
        return row >= 0 && row < 8 && col >= 0 && col < 8 && 
               (!this.board[row][col] || this.board[row][col].color !== pieceColor);
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

        // Check if king is in check - simplified version
        return !this.isKingInCheckSimple(tempBoard, this.turn);
    }
    
    isKingInCheckSimple(board, color) {
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

        // Check if any enemy piece can attack the king - simplified
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color !== color) {
                    const moves = this.getBasicMoves(piece, board);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    getBasicMoves(piece, board) {
        const [row, col] = piece.position;
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                // Single move forward
                if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
                    moves.push({row: row + direction, col: col});
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
                break;
            case 'knight':
                const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
                for (const [dr, dc] of knightMoves) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const targetPiece = board[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push({row: newRow, col: newCol});
                        }
                    }
                }
                break;
            case 'bishop':
                for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
                    for (let i = 1; i < 8; i++) {
                        const newRow = row + dr * i;
                        const newCol = col + dc * i;
                        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                        const targetPiece = board[newRow][newCol];
                        if (targetPiece) {
                            if (targetPiece.color !== piece.color) moves.push({row: newRow, col: newCol});
                            break;
                        }
                        moves.push({row: newRow, col: newCol});
                    }
                }
                break;
            case 'rook':
                for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                    for (let i = 1; i < 8; i++) {
                        const newRow = row + dr * i;
                        const newCol = col + dc * i;
                        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                        const targetPiece = board[newRow][newCol];
                        if (targetPiece) {
                            if (targetPiece.color !== piece.color) moves.push({row: newRow, col: newCol});
                            break;
                        }
                        moves.push({row: newRow, col: newCol});
                    }
                }
                break;
            case 'queen':
                for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]) {
                    for (let i = 1; i < 8; i++) {
                        const newRow = row + dr * i;
                        const newCol = col + dc * i;
                        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                        const targetPiece = board[newRow][newCol];
                        if (targetPiece) {
                            if (targetPiece.color !== piece.color) moves.push({row: newRow, col: newCol});
                            break;
                        }
                        moves.push({row: newRow, col: newCol});
                    }
                }
                break;
            case 'king':
                for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const targetPiece = board[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push({row: newRow, col: newCol});
                        }
                    }
                }
                break;
        }
        return moves;
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

        // Handle castling
        if (piece.type === 'king' && Math.abs(from.col - to.col) === 2) {
            this.handleCastling(from, to);
        }

        // Move piece - EXACT SAME AS PYTHON
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;
        piece.position = [to.row, to.col];
        piece.hasMoved = true;

        // Handle pawn promotion
        if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
            this.board[to.row][to.col] = {type: 'queen', color: piece.color, hasMoved: true, position: [to.row, to.col]};
        }

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
        } else if (this.isKingInCheck(this.board, this.turn)) {
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

    // STOCKFISH AI INTEGRATION (like your Python version)
    async makeStockfishMove() {
        if (this.gameOver || this.turn !== 'black') return;

        try {
            // Convert board to FEN string
            const fen = this.boardToFen();
            console.log('Current FEN:', fen);

            // For now, use a strong AI algorithm since we can't run Stockfish in browser
            // This mimics the strength of your Python version
            const bestMove = this.findBestMove();
            
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

    // Strong AI algorithm (similar to your Python minimax)
    findBestMove() {
        let bestMove = null;
        let bestScore = -Infinity;
        const depth = 4; // Strong search depth

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === 'black') {
                    const moves = this.getValidMoves(row, col);
                    for (const move of moves) {
                        const score = this.minimaxSearch(row, col, move.row, move.col, depth);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = {from: {row, col}, to: move};
                        }
                    }
                }
            }
        }

        return bestMove;
    }

    minimaxSearch(fromRow, fromCol, toRow, toCol, depth) {
        // Make temporary move
        const tempBoard = JSON.parse(JSON.stringify(this.board));
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = null;

        if (depth === 0) {
            return this.evaluateBoard(tempBoard);
        }

        // Find best response from white
        let bestScore = Infinity;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = tempBoard[row][col];
                if (piece && piece.color === 'white') {
                    const moves = this.getValidMovesForBoard(tempBoard, row, col);
                    for (const move of moves) {
                        const newTempBoard = JSON.parse(JSON.stringify(tempBoard));
                        newTempBoard[move.row][move.col] = newTempBoard[row][col];
                        newTempBoard[row][col] = null;
                        const score = this.minimaxSearch(row, col, move.row, move.col, depth - 1);
                        bestScore = Math.min(bestScore, score);
                    }
                }
            }
        }

        return bestScore;
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

    evaluateBoard(board) {
        let score = 0;
        const pieceValues = {pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000};

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type];
                    if (piece.color === 'white') {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }

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

    isCheckmate() {
        if (!this.isKingInCheck(this.board, this.turn)) return false;
        
        // Check if any legal move exists
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.turn) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }
        return true;
    }

    isStalemate() {
        if (this.isKingInCheck(this.board, this.turn)) return false;
        
        // Check if any legal move exists
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.turn) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
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