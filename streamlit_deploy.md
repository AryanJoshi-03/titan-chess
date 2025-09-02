# 🐍 Deploy Your Python Chess Game to the Web

## Option 1: Streamlit Cloud (FREE & EASIEST)

### Step 1: Install Streamlit
```bash
pip install streamlit chess numpy
```

### Step 2: Test Locally
```bash
streamlit run streamlit_chess.py
```

### Step 3: Deploy to Streamlit Cloud
1. Push your code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect your GitHub account
4. Select your repository
5. Choose `streamlit_chess.py` as main file
6. Deploy!

**Your chess game will be live at:** `https://yourusername-streamlit-chess-app-xyz.streamlit.app`

---

## Option 2: Heroku (FREE with limitations)

### Step 1: Create Procfile
```bash
echo "web: streamlit run streamlit_chess.py --server.port=$PORT --server.address=0.0.0.0" > Procfile
```

### Step 2: Create runtime.txt
```bash
echo "python-3.11.0" > runtime.txt
```

### Step 3: Deploy to Heroku
```bash
heroku create your-chess-app
git add .
git commit -m "Deploy chess game"
git push heroku main
```

---

## Option 3: Railway (FREE tier)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Deploy
```bash
railway login
railway init
railway up
```

---

## Option 4: Render (FREE tier)

1. Connect your GitHub repo to Render
2. Choose "Web Service"
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `streamlit run streamlit_chess.py --server.port=$PORT --server.address=0.0.0.0`

---

## 🎯 **RECOMMENDED: Streamlit Cloud**

**Why Streamlit Cloud is best:**
- ✅ **100% FREE** forever
- ✅ **Zero configuration** needed
- ✅ **Automatic deployments** from GitHub
- ✅ **Custom domain** support
- ✅ **Perfect for chess games**

**Your resume link will be:**
`https://yourusername-streamlit-chess-app-xyz.streamlit.app`

---

## 🚀 **Quick Start (5 minutes):**

1. **Install Streamlit:**
   ```bash
   pip install streamlit
   ```

2. **Test locally:**
   ```bash
   streamlit run streamlit_chess.py
   ```

3. **Push to GitHub:**
   ```bash
   git add streamlit_chess.py requirements.txt
   git commit -m "Add Streamlit chess game"
   git push
   ```

4. **Deploy to Streamlit Cloud:**
   - Go to [share.streamlit.io](https://share.streamlit.io)
   - Connect GitHub → Select repo → Deploy!

**That's it! Your Python chess game is now live on the web!** 🎉
