class ChessGame {
    constructor() {
        this.canvas = document.getElementById('chessboard');
        this.ctx = this.canvas.getContext('2d');
        this.squareSize = 50;
        this.selectedPiece = null;
        this.validMoves = [];
        this.turn = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.moveCount = 1;
        
        this.initializeBoard();
        this.setupEventListeners();
        this.drawBoard();
        this.drawPieces();
    }

    initializeBoard() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Initialize pieces
        const pieces = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn']
        ];

        // Place black pieces
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = {
                    type: pieces[row][col],
                    color: 'black',
                    hasMoved: false
                };
            }
        }

        // Place white pieces
        for (let row = 6; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = {
                    type: pieces[7-row][col],
                    color: 'white',
                    hasMoved: false
                };
            }
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
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
                
                // AI move
                setTimeout(() => this.makeAIMove(), 500);
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

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = this.getPieceDirections(piece.type);

        for (const dir of directions) {
            for (let i = 1; i <= (piece.type === 'pawn' ? 1 : 8); i++) {
                const newRow = row + dir.row * i;
                const newCol = col + dir.col * i;

                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece) {
                    moves.push({row: newRow, col: newCol});
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push({row: newRow, col: newCol});
                    }
                    break;
                }

                if (piece.type === 'pawn' || piece.type === 'knight') break;
            }
        }

        // Special moves
        if (piece.type === 'pawn') {
            this.addPawnMoves(moves, row, col, piece);
        } else if (piece.type === 'king') {
            this.addCastlingMoves(moves, row, col, piece);
        }

        return moves.filter(move => this.isLegalMove(row, col, move.row, move.col));
    }

    getPieceDirections(type) {
        switch (type) {
            case 'pawn':
                return [{row: -1, col: 0}]; // White pawns move up
            case 'rook':
                return [{row: 1, col: 0}, {row: -1, col: 0}, {row: 0, col: 1}, {row: 0, col: -1}];
            case 'bishop':
                return [{row: 1, col: 1}, {row: 1, col: -1}, {row: -1, col: 1}, {row: -1, col: -1}];
            case 'queen':
                return [{row: 1, col: 0}, {row: -1, col: 0}, {row: 0, col: 1}, {row: 0, col: -1},
                        {row: 1, col: 1}, {row: 1, col: -1}, {row: -1, col: 1}, {row: -1, col: -1}];
            case 'king':
                return [{row: 1, col: 0}, {row: -1, col: 0}, {row: 0, col: 1}, {row: 0, col: -1},
                        {row: 1, col: 1}, {row: 1, col: -1}, {row: -1, col: 1}, {row: -1, col: -1}];
            case 'knight':
                return [{row: -2, col: -1}, {row: -2, col: 1}, {row: -1, col: -2}, {row: -1, col: 2},
                        {row: 1, col: -2}, {row: 1, col: 2}, {row: 2, col: -1}, {row: 2, col: 1}];
        }
        return [];
    }

    addPawnMoves(moves, row, col, piece) {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Initial two-square move
        if (row === startRow && !this.board[row + direction][col] && !this.board[row + 2 * direction][col]) {
            moves.push({row: row + 2 * direction, col: col});
        }

        // Single square move
        if (!this.board[row + direction][col]) {
            moves.push({row: row + direction, col: col});
        }

        // Diagonal captures
        for (const offset of [-1, 1]) {
            const newCol = col + offset;
            if (newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[row + direction][newCol];
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({row: row + direction, col: newCol});
                }
            }
        }
    }

    addCastlingMoves(moves, row, col, piece) {
        if (piece.hasMoved) return;

        // King-side castling
        if (this.board[row][7] && this.board[row][7].type === 'rook' && !this.board[row][7].hasMoved) {
            if (!this.board[row][5] && !this.board[row][6] && !this.isSquareUnderAttack(row, 5) && !this.isSquareUnderAttack(row, 6)) {
                moves.push({row: row, col: 6});
            }
        }

        // Queen-side castling
        if (this.board[row][0] && this.board[row][0].type === 'rook' && !this.board[row][0].hasMoved) {
            if (!this.board[row][1] && !this.board[row][2] && !this.board[row][3] && !this.isSquareUnderAttack(row, 2) && !this.isSquareUnderAttack(row, 3)) {
                moves.push({row: row, col: 2});
            }
        }
    }

    isLegalMove(fromRow, fromCol, toRow, toCol) {
        // Make temporary move
        const tempBoard = JSON.parse(JSON.stringify(this.board));
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = null;

        // Check if king is in check
        return !this.isKingInCheck(tempBoard, this.turn);
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

        // Check if any enemy piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color !== color) {
                    const moves = this.getBasicMoves(row, col, board);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isSquareUnderAttack(row, col) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color !== this.turn) {
                    const moves = this.getBasicMoves(r, c, this.board);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    movePiece(from, to) {
        const piece = this.board[from.row][from.col];
        const capturedPiece = this.board[to.row][to.col];

        // Handle castling
        if (piece.type === 'king' && Math.abs(from.col - to.col) === 2) {
            this.handleCastling(from, to);
        }

        // Move piece
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;
        piece.hasMoved = true;

        // Handle pawn promotion
        if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
            this.board[to.row][to.col] = {type: 'queen', color: piece.color, hasMoved: true};
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
            this.board[row][5].hasMoved = true;
        } else if (to.col === 2) { // Queen-side
            this.board[row][3] = this.board[row][0];
            this.board[row][0] = null;
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

    makeAIMove() {
        if (this.gameOver || this.turn !== 'black') return;

        // Simple AI: find best capture or random valid move
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

    drawBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * this.squareSize;
                const y = row * this.squareSize;
                const color = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
                
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

        this.ctx.fillStyle = piece.color === 'white' ? '#ffffff' : '#000000';
        this.ctx.strokeStyle = piece.color === 'white' ? '#000000' : '#ffffff';
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
        turnText.textContent = `${this.turn === 'white' ? 'White' : 'Black'}'s Turn`;
    }

    updateGameStatus(status) {
        const gameStatus = document.getElementById('game-status');
        gameStatus.textContent = status;
    }

    updateMoveHistory() {
        const movesList = document.getElementById('moves-list');
        movesList.innerHTML = '';
        
        for (const move of this.moveHistory) {
            const moveDiv = document.createElement('div');
            moveDiv.textContent = move;
            movesList.appendChild(moveDiv);
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
        
        this.drawBoard();
        this.drawPieces();
        this.updateTurnIndicator();
        this.updateGameStatus('');
        this.updateMoveHistory();
    }

    getBasicMoves(row, col, board) {
        const piece = board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = this.getPieceDirections(piece.type);

        for (const dir of directions) {
            for (let i = 1; i <= (piece.type === 'pawn' ? 1 : 8); i++) {
                const newRow = row + dir.row * i;
                const newCol = col + dir.col * i;

                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

                const targetPiece = board[newRow][newCol];
                
                if (!targetPiece) {
                    moves.push({row: newRow, col: newCol});
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push({row: newRow, col: newCol});
                    }
                    break;
                }

                if (piece.type === 'pawn' || piece.type === 'knight') break;
            }
        }

        return moves;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
}); 