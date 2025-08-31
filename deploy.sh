#!/bin/bash

# TitanChess GitHub Pages Deployment Script
# This script automates the deployment process to GitHub Pages

echo "♔ TitanChess Deployment Script"
echo "================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: TitanChess web chess game"
fi

# Get repository URL from user
echo ""
echo "🌐 Please enter your GitHub repository URL (e.g., https://github.com/username/titanchess):"
read repo_url

if [ -z "$repo_url" ]; then
    echo "❌ Repository URL is required. Exiting."
    exit 1
fi

# Add remote origin
echo "🔗 Adding remote origin..."
git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"

# Create and switch to gh-pages branch
echo "🌿 Creating gh-pages branch..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Add all files
echo "📁 Adding files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy TitanChess to GitHub Pages"

# Push to gh-pages branch
echo "🚀 Pushing to GitHub..."
git push origin gh-pages

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository: $repo_url"
echo "2. Click Settings → Pages"
echo "3. Set Source to 'Deploy from a branch'"
echo "4. Select 'gh-pages' branch"
echo "5. Click Save"
echo ""
echo "🎮 Your chess game will be live at:"
echo "   https://$(echo $repo_url | sed 's|https://github.com/||' | sed 's|/.*||').github.io/$(echo $repo_url | sed 's|.*/||')"
echo ""
echo "🔗 Add this link to your resume!" 