# TitanChess - Elite AI Chess Platform

A professional chess application built with Python and Pygame, featuring Stockfish AI integration and complete chess rule implementation.

## 🎯 Features

- **Complete Chess Engine**: Full implementation of all chess rules including castling, en passant, and pawn promotion
- **Stockfish AI Integration**: Play against a world-class chess engine
- **Professional UI**: Beautiful chess board with actual piece images
- **Real-time Game Status**: Visual feedback for check, checkmate, and game states
- **Advanced Chess Logic**: Legal move validation, check detection, and game state management

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Stockfish chess engine

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AryanJoshi-03/titan-chess.git
   cd titan-chess
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Stockfish:**
   - **macOS**: `brew install stockfish`
   - **Windows**: Download from [stockfishchess.org](https://stockfishchess.org/download/)
   - **Linux**: `sudo apt-get install stockfish`

4. **Run the application:**
   ```bash
   python3 Chessboard_Implementation.py
   ```

## 🎮 How to Play

- **Click** on a piece to select it
- **Click** on a valid destination square to move
- **Green highlights** show valid moves
- **Yellow highlight** shows selected piece
- Play against the Stockfish AI engine

## 🛠️ Technical Implementation

### Core Technologies
- **Python 3.11**: Main programming language
- **Pygame**: Game engine and graphics rendering
- **Stockfish**: Chess engine integration via python-chess
- **FEN Notation**: Board state representation
- **UCI Protocol**: Chess engine communication

### Key Features
- **Minimax Algorithm**: AI move generation with alpha-beta pruning
- **Piece-Square Tables**: Advanced position evaluation
- **Legal Move Validation**: Complete chess rule enforcement
- **Game State Management**: Check, checkmate, and stalemate detection

## 📁 Project Structure

```
titan-chess/
├── Chessboard_Implementation.py  # Main chess application
├── pieces/                       # Chess piece images
│   ├── white-*.png
│   └── black-*.png
├── requirements.txt              # Python dependencies
└── README.md                    # This file
```

## 🎯 Resume Highlights

This project demonstrates:
- **Advanced Python Programming**: Object-oriented design, complex algorithms
- **Game Development**: Pygame graphics, user interaction, game loops
- **AI Integration**: Stockfish engine integration, minimax algorithm
- **Chess Engine Development**: Complete rule implementation, position evaluation
- **Software Engineering**: Clean code architecture, modular design

## 🔧 Development

Built by Aryan Joshi as a demonstration of advanced Python programming, game development, and AI integration skills.

## 📄 License

This project is open source and available under the MIT License.