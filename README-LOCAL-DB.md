# Local PostgreSQL Setup for Development

This guide explains how to set up and use a local PostgreSQL database for development instead of Supabase.

## Why Use a Local Database?

- **Speed**: Local development is faster with a local database
- **No internet required**: Work offline without needing Supabase connection
- **Independent**: Changes you make won't affect your production database
- **Simpler debugging**: Easier to inspect and modify the database directly

## Prerequisites

1. **PostgreSQL installed locally**
   - For macOS: `brew install postgresql` (using Homebrew)
   - For Windows: Download from [PostgreSQL website](https://www.postgresql.org/download/windows/)
   - For Linux: Use your package manager (e.g., `apt install postgresql`)

2. **PostgreSQL running**
   - Make sure your PostgreSQL service is running
   - macOS: `brew services start postgresql`
   - Windows: PostgreSQL service should be running in Services
   - Linux: `sudo systemctl start postgresql`

## Setup Instructions

### Option 1: Automatic Setup

We've created a script to automatically set up your local PostgreSQL database:

```bash
npm run db:setup-local
```

The script will:
1. Prompt for your PostgreSQL credentials
2. Create the database if it doesn't exist
3. Update your `.env.local` file with the correct connection string
4. Run Prisma migrations to set up the database schema

### Option 2: Manual Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE bourbon_buddy;
   ```

2. Update your `.env.local` file to include:
   ```
   LOCAL_DATABASE_URL="postgresql://username:password@localhost:5432/bourbon_buddy"
   ```
   Replace `username` and `password` with your PostgreSQL credentials.

3. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Verifying Your Setup

1. After setup, you can verify your database connection by visiting:
   ```
   http://localhost:3000/api/db-check
   ```

2. This will show:
   - If you're connected to a local or remote database
   - The current connection status
   - The number of users in your database
   - The environment (development/production)

## Using Both Local and Remote Databases

The application is now configured to:
1. Use your local PostgreSQL database in development mode
2. Use Supabase in production mode

This configuration is handled automatically - you don't need to change any code!

## Sample Data

If you want to populate your local database with sample data:

```bash
npm run seed
```

This will create test users and other data for development.

## Troubleshooting

### Database Connection Issues

If you encounter connection issues:

1. Make sure PostgreSQL is running
2. Verify your credentials in `.env.local`
3. Check if another service is using port 5432
4. Try restarting your PostgreSQL service

### Schema Issues

If your schema is out of date:

```bash
npx prisma migrate reset
```

This will reset your database and reapply all migrations.

**Warning**: This will delete all your local data!

## Switching Between Environments

- To force using the Supabase database even in development, remove the `LOCAL_DATABASE_URL` from your `.env.local` file.
- To check which database you're connected to, visit `/api/db-check` endpoint. 