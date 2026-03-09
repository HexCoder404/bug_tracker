# BugHive - Bug Tracker

A modern bug tracking application built with React, TypeScript, and Supabase.

## Features

- 🔐 User authentication with Supabase Auth
- 🐛 Create, read, update, and delete bugs
- 💬 Add comments to bugs
- 🏷️ Tag bugs for organization
- 📊 Real-time statistics dashboard
- 🎨 Beautiful dark-themed UI with Tailwind CSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details and wait for it to initialize

#### Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **Anon Key**
3. Update your `.env` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the contents of `supabase.sql` from this project
4. Click **Run**

This will create:
- `bugs` table - stores bug reports
- `comments` table - stores comments on bugs
- Row Level Security (RLS) policies - ensures users can only see their own bugs

### 3. Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

Your app will be live at `your-project.vercel.app`

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthPages.tsx   # Login & Register pages
│   └── Dashboard.tsx   # Main dashboard
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication logic
│   └── BugContext.tsx  # Bug management logic
├── utils/             # Utility functions
├── types.ts           # TypeScript types
├── supabaseClient.ts  # Supabase client setup
└── App.tsx           # Main app component
```

## Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## Security

- Passwords are securely managed by Supabase Auth (never stored in plain text)
- Row Level Security (RLS) ensures users can only access their own data
- Environment variables are used for sensitive credentials

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See `.env.example` for template.

## License

MIT
