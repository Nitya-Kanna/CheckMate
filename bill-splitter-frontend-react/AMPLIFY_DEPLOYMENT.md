# 🚀 Deploy to AWS Amplify - Complete Guide

## ✅ **Easiest Method: GitHub + Amplify Console** (Recommended)

### **Step 1: Push to GitHub** (2 minutes)

```bash
cd bill-splitter-react

# Initialize git if not already done
git init
git add .
git commit -m "Ready for Amplify deployment"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bill-splitter-react.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy via Amplify Console** (3 minutes)

1. **Open AWS Amplify Console**
   - Go to: https://console.aws.amazon.com/amplify/
   - Region: **ap-southeast-1** (Singapore) - same as your API

2. **Click "New app" → "Host web app"**

3. **Connect GitHub**
   - Select: **GitHub**
   - Click "Authorize AWS Amplify"
   - Select repository: `bill-splitter-react`
   - Select branch: `main`
   - Click "Next"

4. **Configure Build Settings**
   
   Amplify auto-detects Vite. Verify these settings:
   
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
   
   Click "Next"

5. **Review and Deploy**
   - App name: `TNG-Bill-Splitter`
   - Click "Save and deploy"

6. **Wait for Build** ⏱️
   - Provision: ~30 seconds
   - Build: ~2 minutes
   - Deploy: ~30 seconds
   - **Total: ~3 minutes**

7. **Get Your URL** 🎉
   - You'll get: `https://main.xxxxxx.amplifyapp.com`
   - Click the URL to test your app!

---

## 🔄 **Alternative: Amplify CLI** (No GitHub needed)

### **Step 1: Install Amplify CLI**

```bash
npm install -g @aws-amplify/cli

# Configure with your AWS credentials
amplify configure
```

### **Step 2: Initialize Amplify**

```bash
cd bill-splitter-react

amplify init
# ? Enter a name for the project: billsplitter
# ? Enter a name for the environment: prod
# ? Choose your default editor: Visual Studio Code
# ? Choose the type of app: javascript
# ? What javascript framework: react
# ? Source Directory Path: src
# ? Distribution Directory Path: dist
# ? Build Command: npm run build
# ? Start Command: npm run dev
# ? Do you want to use an AWS profile? Yes
# ? Please choose the profile: default
```

### **Step 3: Add Hosting**

```bash
amplify add hosting

# ? Select the plugin module to execute: Hosting with Amplify Console
# ? Choose a type: Manual deployment
```

### **Step 4: Build and Deploy**

```bash
npm run build
amplify publish

# Your app will be deployed!
# URL: https://prod.xxxxxx.amplifyapp.com
```

---

## 📦 **Alternative: Manual ZIP Upload** (Quickest for testing)

### **Step 1: Build the App**

```bash
cd bill-splitter-react
npm run build
```

### **Step 2: Create ZIP**

```bash
cd dist
zip -r ../bill-splitter-app.zip .
cd ..
```

### **Step 3: Upload to Amplify**

1. Go to: https://console.aws.amazon.com/amplify/
2. Click "New app" → "Deploy without Git provider"
3. App name: `TNG-Bill-Splitter`
4. Environment name: `production`
5. Method: **Drag and drop**
6. Drag `bill-splitter-app.zip` or browse to select it
7. Click "Save and deploy"

**Done!** You'll get a URL in ~1 minute.

---

## 🔧 **Post-Deployment Configuration**

### **Enable HTTPS (Already enabled by default)**
✅ Amplify provides free SSL certificates automatically

### **Custom Domain (Optional)**

1. In Amplify Console → Your App → "Domain management"
2. Click "Add domain"
3. Enter your domain (e.g., `billsplit.yourdomain.com`)
4. Follow DNS configuration steps
5. Wait for SSL certificate (5-10 minutes)

### **Environment Variables (If needed)**

If you need to add environment variables:

1. Amplify Console → Your App → "Environment variables"
2. Add variables:
   - `VITE_API_URL`: `https://fs05jjlase.execute-api.ap-southeast-1.amazonaws.com`
3. Redeploy

---

## 🎯 **What You Get**

✅ **Automatic HTTPS** - Free SSL certificate  
✅ **Global CDN** - Fast loading worldwide  
✅ **Auto-scaling** - Handles any traffic  
✅ **CI/CD** - Auto-deploy on git push (GitHub method)  
✅ **Free Tier** - 1000 build minutes/month, 15 GB served/month  

---

## 📱 **Testing Your Deployed App**

Once deployed, test these features:

1. **Home Screen** - Should load with TNG styling
2. **Receipts List** - Click "View All Receipts"
3. **Bill Splitting** - Click "Split Bill" → Upload receipt
4. **AI Parsing** - Enter "zin ate nasi lemak, lisa ate pizza"
5. **Payment Requests** - Complete the flow

---

## 🐛 **Troubleshooting**

### **Build Fails**

```bash
# Check build locally first
cd bill-splitter-react
npm install
npm run build

# If successful, the issue is in Amplify config
```

### **API Not Working**

- Check CORS in API Gateway
- Verify API URL in `src/services/api.js`
- Check browser console for errors

### **404 on Refresh**

Add this to Amplify Console → Rewrites and redirects:

```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$)([^.]+$)/>
Target: /index.html
Type: 200 (Rewrite)
```

---

## 💰 **Cost Estimate**

**AWS Amplify Pricing:**
- Build: $0.01 per build minute
- Hosting: $0.15 per GB served
- **Free Tier:** 1000 build minutes + 15 GB/month

**Typical Monthly Cost:**
- Small app: **$0** (within free tier)
- Medium traffic: **$5-10/month**

---

## 🚀 **Quick Commands Reference**

```bash
# Build locally
npm run build

# Preview build
npm run preview

# Deploy with Amplify CLI
amplify publish

# Update deployment
git push origin main  # (if using GitHub)

# View logs
amplify console  # Opens Amplify Console
```

---

## ✅ **Next Steps After Deployment**

1. ✅ Test all features on live URL
2. ✅ Share URL with team/users
3. ✅ Set up custom domain (optional)
4. ✅ Monitor usage in Amplify Console
5. ✅ Set up alerts for errors

---

**Your app is now live! 🎉**

Need help? Check the [Amplify Documentation](https://docs.amplify.aws/)
