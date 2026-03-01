# Deploying to Vercel

## 1. Push Your Code to GitHub
- Make sure your project is committed and pushed to a GitHub repository.

## 2. Import to Vercel
- Go to [https://vercel.com/import](https://vercel.com/import).
- Select your GitHub repo and import it.

## 3. Set Environment Variables
- In the Vercel dashboard, go to your project settings.
- Add the following environment variables (from your `.env.local`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 4. Deploy
- Click **Deploy**.
- Vercel will build and deploy your app automatically.

## 5. Visit Your Site
- After deployment, Vercel will provide a live URL for your app.
