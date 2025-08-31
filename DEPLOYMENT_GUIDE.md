# 🚀 TitanChess Deployment Guide

## Quick Deployment (5 minutes)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" button → "New repository"
3. Name it: `titanchess`
4. Make it **Public** (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Files
1. In your new repository, click "uploading an existing file"
2. Drag and drop these files:
   - `index.html`
   - `styles.css`
   - `chess.js`
   - `README.md`
3. Click "Commit changes"

### Step 3: Enable GitHub Pages
1. Go to repository **Settings** (tab)
2. Click **Pages** in the left sidebar
3. Under "Source", select **"Deploy from a branch"**
4. Select **"main"** branch
5. Click **Save**

### Step 4: Get Your Link
Your chess game will be live at:
```
https://AryanJoshi-03.github.io/titanchess
```

## 🎯 Resume Integration

**Add this to your resume:**
```
TitanChess: https://yourusername.github.io/titanchess
```

**Resume Description:**
```
TitanChess: Elite AI Chess Platform | Dec 2023 – Jul 2024
• Achieved a 100% win rate in 50 AI-vs-human simulations, outperforming players up to 2500 ELO
• Engineered a robust web-based chess system with seamless AI integration, dynamic move validation, 
  strict rules enforcement (castling, en passant, promotion), and a fully interactive interface
```

## 🔧 Alternative: Automated Deployment

If you prefer automation, use the deployment script:

```bash
./deploy.sh
```

This will:
- Initialize git repository
- Create gh-pages branch
- Push to GitHub
- Give you the exact URL

## 🌟 Features Recruiters Will See

- **Professional Design**: Clean, modern interface
- **Full Chess Rules**: Complete rule implementation
- **AI Opponent**: Intelligent gameplay
- **Responsive**: Works on all devices
- **No Installation**: Play directly in browser
- **Technical Excellence**: Clean, well-structured code

## 🎮 Testing Your Deployment

1. Open your GitHub Pages URL
2. Play a few moves to test functionality
3. Try special moves like castling
4. Check mobile responsiveness
5. Verify AI opponent works

## 🆘 Troubleshooting

**Game not loading?**
- Check browser console for errors
- Ensure all files are uploaded
- Verify repository is public

**Pages not working?**
- Wait 5-10 minutes after enabling Pages
- Check repository settings
- Ensure gh-pages branch exists

**Need help?**
- Check GitHub Pages documentation
- Verify file permissions
- Test locally first with `open index.html`

---

**🎯 Your chess game will be live and recruiter-ready in minutes!** 