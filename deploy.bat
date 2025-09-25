@echo off
echo 📦 Building the project...
call npm run build

echo 🚀 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment complete!
