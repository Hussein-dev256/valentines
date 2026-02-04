# Library

This directory contains core library modules and configurations.

## Modules

### supabase.ts

Initializes and exports the Supabase client instance used throughout the application.

**Features:**
- Environment variable validation
- Configured for anonymous access (no auth required)
- Centralized client instance

**Usage:**
```typescript
import { supabase } from '@/lib/supabase';

// Use the client directly (though services are preferred)
const { data, error } = await supabase
  .from('valentines')
  .select('*')
  .eq('id', valentineId);
```

**Note:** In most cases, you should use the service layer (`@/services`) instead of accessing the Supabase client directly. The service layer provides error handling, retry logic, and a cleaner API.

## Configuration

The Supabase client requires these environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous (public) key

Set these in `.env.local` (copy from `.env.example`).

## Security

The application uses Supabase Row Level Security (RLS) policies to control data access. The anonymous key is safe to expose in the frontend because:

1. RLS policies restrict what operations can be performed
2. No authentication is required for the app's functionality
3. Result tokens provide private access control for viewing results
