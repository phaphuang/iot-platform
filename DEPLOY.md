# Deploying the IoT Platform to Vercel

This guide will help you deploy the IoT Platform educational lab to Vercel for easy sharing and access.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. Node.js and npm installed
3. Vercel CLI (optional but recommended)

## Option 1: Deploy using Vercel CLI (Recommended)

### 1. Install the Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to your Vercel account

```bash
vercel login
```

### 3. Deploy the application

Navigate to the project directory and run:

```bash
npm run deploy
```

Alternatively, you can use the provided deployment scripts:
- On Windows: `deploy.bat`
- On Unix-based systems: `./deploy.sh` (make it executable first with `chmod +x deploy.sh`)

### 4. Configure project settings (first-time deployment)

The Vercel CLI will ask you a few questions:
- Set up and deploy: **Yes**
- Which scope to deploy to: Choose your account or team
- Link to existing project: **No** (for first-time deployment)
- Project name: Enter a name (e.g., iot-platform)
- Directory: `.` (current directory)
- Override settings: **No**

## Option 2: Deploy via Vercel Dashboard

### 1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

### 2. Log in to Vercel Dashboard

Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)

### 3. Create a new project

- Click "New Project"
- Import your Git repository
- Configure project settings:
  - Framework preset: Create React App
  - Root directory: `.` (leave as is)
  - Build command: `npm run build`
  - Output directory: `build`
  - Install command: `npm install`

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment

After deployment, Vercel will provide you with a URL for your application (e.g., https://iot-platform.vercel.app).

You can configure a custom domain in the Vercel dashboard if needed.

## Troubleshooting

- **Client-side routing issues**: The `vercel.json` file is configured to handle React Router paths.
- **Build failures**: Check the build logs in the Vercel dashboard.
- **Environment variables**: If you add any environment variables, make sure to add them in the Vercel dashboard.

## Automatic Deployments

Once set up with a Git repository, Vercel will automatically deploy your application whenever you push changes to your repository.

## Need Help?

If you encounter any issues, check the [Vercel documentation](https://vercel.com/docs) or submit an issue on the project repository.
