#!/usr/bin/env python3
"""
Setup script for TitanChess
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("Installing Python dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("✅ Python dependencies installed successfully!")

def check_stockfish():
    """Check if Stockfish is installed"""
    try:
        result = subprocess.run(['stockfish', '--help'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ Stockfish is already installed!")
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    print("❌ Stockfish not found. Please install it:")
    print("   macOS: brew install stockfish")
    print("   Windows: Download from https://stockfishchess.org/download/")
    print("   Linux: sudo apt-get install stockfish")
    return False

def main():
    print("🎯 TitanChess Setup")
    print("=" * 50)
    
    # Install Python requirements
    install_requirements()
    
    # Check Stockfish
    stockfish_ok = check_stockfish()
    
    print("\n" + "=" * 50)
    if stockfish_ok:
        print("🎉 Setup complete! You can now run:")
        print("   python3 Chessboard_Implementation.py")
    else:
        print("⚠️  Setup almost complete! Install Stockfish and then run:")
        print("   python3 Chessboard_Implementation.py")

if __name__ == "__main__":
    main()
