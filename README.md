# 后宫管理系统 — Deployment Guide

## Files
- server.js         — Express backend
- package.json      — Dependencies
- public/index.html — Main tracker page
- public/form.html  — Add new concubine page

## Deploy to Render + MongoDB Atlas

### Step 1: MongoDB Atlas (free, no credit card)
1. Go to https://mongodb.com/atlas and create a free account
2. Create a free M0 cluster
3. Security > Database Access > Add a database user (save the username/password)
4. Security > Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0)
5. Deployment > Connect > Drivers > copy the connection string
   - It looks like: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   - Replace <password> with your actual password

### Step 2: Push to GitHub
1. Create a new repo on GitHub
2. Push all these files to it

### Step 3: Render
1. Go to https://render.com and create a free account
2. New > Web Service > Connect your GitHub repo
3. Settings:
   - Build Command: npm install
   - Start Command: node server.js
4. Environment Variables > Add:
   - Key:   MONGO_URI
   - Value: your MongoDB connection string from Step 1
5. Click Deploy

### Adding more users/passwords
Edit VALID_PASSWORDS in server.js:
  const VALID_PASSWORDS = ["0902", "1234", "5678"];

Each password gets its own isolated data in MongoDB.
