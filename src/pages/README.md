# Pages

This directory contains all the page components for the "Will You Be My Valentine?" application.

## Routing Structure

The application uses React Router with the following routes:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | OriginPage | Landing page for explorers - displays introduction and CTA to create Valentine |
| `/create` | CreateValentinePage | Valentine creation interface - form to enter sender/receiver names |
| `/v/:id` | ReceiverPage | Valentine display and answer interface - shows question to receiver |
| `/r/:token` | ResultsPage | Private results view for sender - shows if receiver answered yes/no |
| `*` | NotFoundPage | 404 error page for invalid routes |

## Page Components

### OriginPage
- **Route:** `/`
- **Purpose:** Landing page for explorers
- **Features:**
  - Introduction message with playful copy
  - Prominent "Create Valentine" CTA button
  - Footer with creator attribution
  - Tracks `origin_view` event (when analytics is integrated)
- **Requirements:** 1.1, 1.2, 1.3, 12.1, 12.2, 12.4

### CreateValentinePage
- **Route:** `/create`
- **Purpose:** Valentine creation interface
- **Features:**
  - Input field for receiver name (required)
  - Input field for sender name (optional)
  - Form validation
  - Submit button
  - Will trigger native share on success (to be implemented)
- **Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 15.3

### ReceiverPage
- **Route:** `/v/:id`
- **Purpose:** Valentine display and answer interface
- **Features:**
  - Displays personalized Valentine question with receiver name
  - Shows sender name (if provided) or "Someone" (anonymous)
  - YES button (standard behavior)
  - NO button (will have dodging behavior)
  - Answer submission
  - Post-answer feedback screen (to be implemented)
  - Tracks `receiver_opened` event (when analytics is integrated)
- **Requirements:** 4.1, 4.2, 4.3, 4.4, 4.6, 5.1-5.7, 6.1-6.6

### ResultsPage
- **Route:** `/r/:token`
- **Purpose:** Private results view for sender
- **Features:**
  - Token validation
  - Warning screen before reveal
  - Result display (YES/NO/Pending)
  - Appropriate copy based on answer
  - CTA to create another Valentine
  - Tracks `result_viewed` event (when analytics is integrated)
- **Requirements:** 7.1-7.7, 8.1-8.4, 15.2

### NotFoundPage
- **Route:** `*` (catch-all)
- **Purpose:** 404 error page
- **Features:**
  - Friendly error message with playful tone
  - CTA to return to home
  - CTA to create a Valentine
- **Requirements:** 15.1, 15.2

## Implementation Status

✅ **Completed:**
- Routing structure with React Router
- All route components created
- Basic page layouts with Tailwind CSS
- 404 error page
- Navigation between pages

🚧 **To Be Implemented:**
- Valentine data fetching and display
- Form submission and validation
- DodgingButton component integration
- Share interface integration
- Analytics event tracking
- Post-answer feedback screens
- Result reveal logic
- Error handling for invalid IDs/tokens

## Notes

- All pages use a consistent layout with gradient background and centered content
- Footer with creator attribution is included on all pages
- Pages are responsive and mobile-friendly (Tailwind CSS)
- TODO comments indicate where future functionality will be integrated
- All pages maintain the playful, flirty tone specified in requirements
