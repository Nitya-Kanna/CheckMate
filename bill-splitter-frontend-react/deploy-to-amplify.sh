#!/bin/bash

# 🚀 Quick Deploy to AWS Amplify
# This script helps you deploy your React app to AWS Amplify

set -e

echo "🎯 TNG Bill Splitter - Amplify Deployment Helper"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from bill-splitter-react directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the app
echo "🔨 Building the app..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
cd dist
zip -r ../bill-splitter-app.zip . > /dev/null 2>&1
cd ..

echo "✅ Created bill-splitter-app.zip"
echo ""

# Show next steps
echo "🎉 Ready to deploy!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "Option 1: Manual Upload (Easiest)"
echo "  1. Go to: https://console.aws.amazon.com/amplify/"
echo "  2. Click 'New app' → 'Deploy without Git provider'"
echo "  3. Upload: bill-splitter-app.zip"
echo "  4. Click 'Save and deploy'"
echo ""
echo "Option 2: GitHub + Auto-deploy (Recommended for production)"
echo "  1. Push code to GitHub:"
echo "     git init"
echo "     git add ."
echo "     git commit -m 'Ready for deployment'"
echo "     git remote add origin YOUR_GITHUB_REPO_URL"
echo "     git push -u origin main"
echo ""
echo "  2. Go to: https://console.aws.amazon.com/amplify/"
echo "  3. Click 'New app' → 'Host web app'"
echo "  4. Connect your GitHub repository"
echo "  5. Amplify will auto-deploy on every push!"
echo ""
echo "Option 3: Amplify CLI"
echo "  npm install -g @aws-amplify/cli"
echo "  amplify init"
echo "  amplify add hosting"
echo "  amplify publish"
echo ""
echo "📁 Deployment package: bill-splitter-app.zip"
echo "📊 Package size: $(du -h bill-splitter-app.zip | cut -f1)"
echo ""
echo "🔗 Your API endpoint: https://fs05jjlase.execute-api.ap-southeast-1.amazonaws.com"
echo ""
echo "✨ Happy deploying!"

