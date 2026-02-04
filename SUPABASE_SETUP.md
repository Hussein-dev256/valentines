# Supabase Frontend Setup

This document describes the Supabase client setup for the Valentine application frontend.

## ✅ Completed Setup

### 1. Dependencies Installed

- `@supabase/supabase-js` (v2.94.0) - Official Supabase JavaScript client

### 2. Environment Configuration

**Files Created:**
- `.env.local` - Local environment variables (not committed to git)
- `.env.example` - Template for environment variables (committed to git)

**Required Environment Variables:**
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase Client Configuration

**Location:** `src/lib/supabase.ts`

**Features:**
- Environment variable validation
- Configured for anonymous access (no auth required)
- Centralized client instance
- Error handling for missing configuration

### 4. TypeScript Types

**Location:** `src/types/database.types.ts`

**Includes:**
- Database table types (`Valentine`, `ResultToken`, `AnalyticsEvent`)
- API request/response types
- Type-safe status enums
- Supabase database schema type

### 5. Service Layer Structure

**Location:** `src/services/`

**Services Created:**

#### `valentine.service.ts`
- `createValentine(senderName, receiverName)` - Create new Valentine
- `getValentine(id)` - Retrieve Valentine data
- `submitAnswer(id, answer)` - Submit YES/NO answer
- `getResult(token)` - Get result by token

#### `analytics.service.ts`
- `trackEvent(eventType, valentineId?, metadata?)` - Track events
- `trackEvents(events)` - Batch event tracking
- Fire-and-forget pattern (non-blocking)

#### `api.service.ts`
- `ApiError` - Custom error class
- `withRetry()` - Automatic retry with exponential backoff
- `handleSupabaseError()` - Error conversion utility

### 6. Project Structure

```
valentine-app/
├── .env.local                    # Local environment variables
├── .env.example                  # Environment template
└── src/
    ├── lib/
    │   ├── supabase.ts          # Supabase client instance
    │   └── README.md            # Library documentation
    ├── services/
    │   ├── api.service.ts       # Base API utilities
    │   ├── valentine.service.ts # Valentine operations
    │   ├── analytics.service.ts # Event tracking
    │   ├── index.ts             # Service exports
    │   └── README.md            # Service documentation
    └── types/
        ├── database.types.ts    # Database schema types
        └── index.ts             # Type exports
```

## 🔧 Configuration Steps

To complete the setup, you need to:

1. **Get Supabase Credentials:**
   - Go to your Supabase project dashboard
   - Navigate to: Project Settings → API
   - Copy the Project URL
   - Copy the anon/public API key

2. **Update `.env.local`:**
   ```bash
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

## 📝 Usage Examples

### Creating a Valentine

```typescript
import { createValentine, trackEvent, EventTypes } from '@/services';

try {
  const result = await createValentine('Alice', 'Bob');
  console.log('Valentine URL:', result.public_url);
  console.log('Result URL:', result.result_url);
  
  // Track the creation
  await trackEvent(EventTypes.VALENTINE_CREATED, result.valentine_id);
} catch (error) {
  console.error('Failed to create Valentine:', error);
}
```

### Getting Valentine Data

```typescript
import { getValentine } from '@/services';

try {
  const valentine = await getValentine(valentineId);
  console.log('Receiver:', valentine.receiver_name);
  console.log('Sender:', valentine.sender_name || 'Anonymous');
  console.log('Status:', valentine.status);
} catch (error) {
  console.error('Failed to get Valentine:', error);
}
```

### Submitting an Answer

```typescript
import { submitAnswer, trackEvent, EventTypes } from '@/services';

try {
  await submitAnswer(valentineId, 'yes');
  await trackEvent(EventTypes.ANSWERED_YES, valentineId);
  console.log('Answer submitted!');
} catch (error) {
  console.error('Failed to submit answer:', error);
}
```

### Viewing Results

```typescript
import { getResult } from '@/services';

try {
  const result = await getResult(resultToken);
  console.log('Status:', result.status);
  console.log('Created:', result.created_at);
  console.log('Answered:', result.answered_at || 'Not yet answered');
} catch (error) {
  console.error('Invalid result token:', error);
}
```

## 🔒 Security

- **RLS Policies:** The backend uses Row Level Security to control access
- **Anonymous Key:** Safe to expose in frontend (RLS policies restrict operations)
- **Result Tokens:** Provide private access control for viewing results
- **No Authentication:** App works without user accounts

## ✨ Features

- **Automatic Retry:** All API calls retry up to 3 times with exponential backoff
- **Error Handling:** Consistent error handling with helpful messages
- **Type Safety:** Full TypeScript support for all operations
- **Analytics:** Non-blocking event tracking
- **Validation:** Input validation and environment variable checks

## 🧪 Testing

Build verification:
```bash
npm run build
```

The build should complete successfully with no TypeScript errors.

## 📚 Next Steps

With the Supabase client setup complete, you can now:

1. Implement the routing structure (Task 3.1)
2. Create UI components (Tasks 3.2-3.6)
3. Integrate services into components
4. Add error handling and loading states
5. Implement the DodgingButton component (Task 4)

## 🐛 Troubleshooting

**Error: Missing VITE_SUPABASE_URL**
- Check that `.env.local` exists
- Verify the variable name starts with `VITE_`
- Restart the dev server after adding variables

**Error: Invalid API key**
- Verify you copied the anon/public key (not the service role key)
- Check for extra spaces or newlines in the key

**TypeScript errors**
- Run `npm run build` to check for type errors
- Ensure all imports use the correct paths
- Check that types are exported from `@/types`

## 📖 Documentation

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Service Layer README](./src/services/README.md)
- [Library README](./src/lib/README.md)
