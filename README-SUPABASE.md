# MongoDB to Supabase Migration Guide

This guide explains how to migrate your Airdrops.geo application from MongoDB to Supabase.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides a PostgreSQL database, authentication, instant APIs, real-time subscriptions, and storage. It's a great choice for modern web applications.

## Why Migrate from MongoDB to Supabase?

- **SQL Database**: Supabase uses PostgreSQL, which is a powerful relational database with ACID compliance
- **Built-in Authentication**: Supabase provides authentication out of the box
- **Row-Level Security**: Fine-grained access control at the row level
- **Real-time Subscriptions**: Get notified when data changes
- **Storage**: Built-in file storage with security rules
- **Edge Functions**: Run serverless functions close to your users

## Migration Steps

### 1. Set up Supabase

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Get your Supabase URL and service key from the project settings

### 2. Configure Environment Variables

Update your `.env` file to include Supabase configuration:

```
# Database Configuration
# Set USE_SUPABASE=true to use Supabase, false to use MongoDB
USE_SUPABASE=true
MONGODB_URI=your_mongodb_uri
FIX_INDEXES=false

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3. Create Supabase Tables

Run the SQL script in `server/migrations/supabase_schema.sql` to create all the necessary tables, indexes, and policies in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `server/migrations/supabase_schema.sql`
4. Paste into the SQL Editor and run the script

### 4. Migrate Data from MongoDB to Supabase

Run the migration script to transfer all your data from MongoDB to Supabase:

```bash
cd server
node migrations/migrate-to-supabase.js
```

### 5. Test the Application with Supabase

After the migration is complete, test the application with Supabase:

1. Set `USE_SUPABASE=true` in your `.env` file
2. Restart your server
3. Test all functionality to ensure it works correctly

## How It Works

The application is designed to work with both MongoDB and Supabase without any changes to the API endpoints. This is achieved through:

1. **Model Adapters**: Each MongoDB model has a corresponding Supabase adapter
2. **Model Index**: A central index file that selects the appropriate model based on the `USE_SUPABASE` environment variable
3. **Database Connection**: The server initialization code connects to either MongoDB or Supabase based on the environment variable

## Switching Between Databases

You can easily switch between MongoDB and Supabase by changing the `USE_SUPABASE` environment variable:

- `USE_SUPABASE=true`: Use Supabase
- `USE_SUPABASE=false`: Use MongoDB

After changing the environment variable, restart your server for the changes to take effect.

## Troubleshooting

If you encounter any issues during the migration:

1. Check the server logs for error messages
2. Verify that your Supabase URL and service key are correct
3. Make sure all the required tables exist in your Supabase project
4. Check that the data was transferred correctly

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
