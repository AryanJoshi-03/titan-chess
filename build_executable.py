#!/usr/bin/env python3
"""
Build script to create a standalone executable of TitanChess
Requires PyInstaller: pip install pyinstaller
"""

import subprocess
import sys
import os

def install_pyinstaller():
    """Install PyInstaller if not already installed"""
    try:
        import PyInstaller
        print("✅ PyInstaller is already installed!")
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✅ PyInstaller installed successfully!")

def build_executable():
    """Build the executable"""
    print("Building TitanChess executable...")
    
    # PyInstaller command
    cmd = [
        "pyinstaller",
        "--onefile",                    # Single executable file
        "--windowed",                   # No console window (optional)
        "--name=TitanChess",           # Executable name
        "--add-data=pieces:pieces",     # Include pieces folder
        "--icon=pieces/white-king.png", # Use king as icon (if exists)
        "Chessboard_Implementation.py"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("✅ Executable built successfully!")
        print("📁 Find it in the 'dist' folder")
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        return False
    
    return True

def main():
    print("🔨 TitanChess Executable Builder")
    print("=" * 50)
    
    # Install PyInstaller
    install_pyinstaller()
    
    # Build executable
    if build_executable():
        print("\n🎉 Build complete!")
        print("📁 Executable location: dist/TitanChess")
        print("🚀 You can now distribute this standalone executable!")
    else:
        print("\n❌ Build failed. Check the error messages above.")

if __name__ == "__main__":
    main()
