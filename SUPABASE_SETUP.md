# Supabase Setup Guide

## 1. Create a Supabase Project
- Go to [https://app.supabase.com/](https://app.supabase.com/) and sign in.
- Click **New Project**.
- Fill in the project name, password, and select a region.
- Wait for the project to initialize.

## 2. Get API Keys
- In your Supabase project, go to **Project Settings > API**.
- Copy the **Project URL** and **anon public key**.

## 3. Configure Authentication
- Go to **Authentication > Providers**.
- Enable **Email** authentication.
- (Optional) Set up SMTP for production email sending.

## 4. Add Environment Variables
- In your project root, create a `.env.local` file:
  ```
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- Replace with your actual values.

## 5. (Optional) Set Up Database Tables
- Use the Supabase dashboard's SQL editor to create tables as needed for your app.

## 6. Test Locally
- Run `npm run dev` and verify authentication works.
