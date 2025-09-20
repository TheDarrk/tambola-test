# 🚀 Deployment Guide for Aloha X Tombola Game

## Vercel Deployment (Recommended)

### Option 1: GitHub Integration (Automatic)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Aloha X Tombola Game"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration
   - Deploy!

### Option 2: Vercel CLI (Manual)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Start backend server**
   ```bash
   python main.py
   ```

3. **Start frontend server**
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

## Environment Variables

For production deployment, you may want to set:

```env
NODE_ENV=production
API_BASE_URL=https://your-domain.vercel.app/api
CORS_ORIGINS=https://your-domain.vercel.app
```

---

Your Aloha X Tombola game is now ready for deployment! 🚀
