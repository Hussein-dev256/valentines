# Service Layer

This directory contains the API service layer for the Valentine application. The service layer provides a clean abstraction over Supabase database operations.

## Structure

```
services/
├── api.service.ts          # Base API utilities (error handling, retry logic)
├── valentine.service.ts    # Valentine CRUD operations
├── analytics.service.ts    # Event tracking
└── index.ts               # Central export point
```

## Services

### Valentine Service

Handles all Valentine-related operations:

- `createValentine(senderName, receiverName)` - Create a new Valentine instance
- `getValentine(id)` - Retrieve Valentine data by ID
- `submitAnswer(id, answer)` - Submit YES/NO answer
- `getResult(token)` - Get result by result token

### Analytics Service

Handles event tracking:

- `trackEvent(eventType, valentineId?, metadata?)` - Track a single event
- `trackEvents(events)` - Track multiple events in batch

Event types:
- `origin_view` - User views the landing page
- `valentine_created` - New Valentine created
- `receiver_opened` - Receiver opens Valentine link
- `answered_yes` - Receiver answers YES
- `answered_no` - Receiver answers NO
- `result_viewed` - Sender views result
- `share_triggered` - Native share triggered
- `share_fallback` - Clipboard fallback used

### API Service

Base utilities used by other services:

- `ApiError` - Custom error class for API errors
- `withRetry()` - Retry function with exponential backoff
- `handleSupabaseError()` - Convert Supabase errors to ApiError

## Usage

```typescript
import { createValentine, trackEvent, EventTypes } from '@/services';

// Create a Valentine
const result = await createValentine('Alice', 'Bob');
console.log(result.public_url); // Share this URL

// Track an event
await trackEvent(EventTypes.VALENTINE_CREATED, result.valentine_id);
```

## Error Handling

All service functions use automatic retry with exponential backoff (3 attempts by default). Errors are wrapped in `ApiError` instances with helpful messages.

```typescript
try {
  await submitAnswer(valentineId, 'yes');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.message);
    console.error(error.statusCode);
  }
}
```

## Configuration

The service layer uses environment variables for Supabase configuration:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These should be set in `.env.local` (see `.env.example` for template).
