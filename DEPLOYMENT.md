# Deployment Guide: GitHub Pages

I have pre-configured your project for deployment! Follow these steps to put your app online.

## 1. Create a Repository on GitHub
1. Go to [GitHub.com/new](https://github.com/new).
2. Name the repository: **`expense-tracker`** (This is important! If you name it something else, you must update `vite.config.js`).
3. Make it **Public** (required for free GitHub Pages).
4. Do **not** initialize with README, .gitignore, or License (we already have them).
5. Click **Create repository**.

## 2. Connect and Push Code
Run the following commands in your terminal (copy and paste one by one):

```bash
# Stage all files
git add .

# Commit your changes
git commit -m "Initial commit - Ready for deployment"

# Link to your new GitHub repository
# REPLACE 'YOUR_USERNAME' with your actual GitHub username!
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git

# Push your code to the main branch
git push -u origin master
```
*(Note: If the last command fails, try `git push -u origin main`)*

## 3. Deploy the App
Once your code is on GitHub, run this single command in your terminal:

```bash
npm run deploy
```

This script will:
1. Build your app.
2. Upload the production build to a `gh-pages` branch.
3. Automatically publish it.

## 4. Enable GitHub Pages (If not automatic)
1. Go to your Repository Settings > **Pages**.
2. Source: **Deploy from a branch**.
3. Branch: **gh-pages** / **(root)**.
4. Click **Save**.

Your app will be live at: `https://YOUR_USERNAME.github.io/expense-tracker/`
