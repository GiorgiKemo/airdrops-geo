# MongoDB to Supabase Migration Guide

This guide explains how to migrate your Airdrops.geo application from MongoDB to Supabase.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Get your Supabase URL and service key from the project settings

## Migration Steps

### 1. Set up Supabase Tables

Run the SQL script in `supabase_schema.sql` to create all the necessary tables, indexes, and policies in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase_schema.sql`
4. Paste into the SQL Editor and run the script

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

### 3. Migrate Data from MongoDB to Supabase

Run the migration script to transfer all your data from MongoDB to Supabase:

```bash
cd server
node migrations/migrate-to-supabase.js
```

This script will:
- Connect to both MongoDB and Supabase
- Transfer all users, airdrops, password reset tokens, views, and tracking data
- Log the migration progress

### 4. Verify the Migration

After the migration is complete:

1. Check the logs for any errors
2. Verify that all data has been transferred correctly by checking the Supabase tables
3. Test the application with Supabase by setting `USE_SUPABASE=true` in your `.env` file

### 5. Switch to Supabase

Once you've verified that everything is working correctly:

1. Set `USE_SUPABASE=true` in your `.env` file
2. Restart your server

The application will now use Supabase instead of MongoDB.

## Troubleshooting

If you encounter any issues during the migration:

1. Check the server logs for error messages
2. Verify that your Supabase URL and service key are correct
3. Make sure all the required tables exist in your Supabase project
4. Check that the data was transferred correctly

## Reverting to MongoDB

If you need to revert to MongoDB:

1. Set `USE_SUPABASE=false` in your `.env` file
2. Restart your server

The application will switch back to using MongoDB.

## Additional Notes

- The migration script preserves all relationships between data
- User passwords remain hashed and secure during the migration
- The application code is designed to work with both MongoDB and Supabase without any changes to the API endpoints
