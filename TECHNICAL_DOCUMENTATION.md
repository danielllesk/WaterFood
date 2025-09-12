# Technical Documentation

## Step 1 — Environment and Repo Hygiene
- What was added
  - `.gitignore`
  - `.env.example` (Firebase, Google Places, app config)
  - Initial README updates
- How it works
  - `.gitignore` prevents committing local/build/secrets artifacts
  - `.env.example` lists all required env vars; copy to `.env`
- Why we added it
  - Establish clean repo hygiene and a clear setup path for collaborators

## Step 2 — Terminology Refactor (Movies → Restaurants)
- What was added/changed
  - UI copy and component props switched to restaurant domain
  - Type updates in `app/types.ts`:
    - `UserWatched` → `UserAteAt`
    - `Movie` → `Restaurant`
    - IDs switched to `restaurantID` where applicable
  - Buttons and profile components updated (watched → ate at)
- How it works
  - Components read/write `ateAt` and `favourites` arrays in Firestore user docs
  - UI reflects “Ate At” and “Restaurants” across navigation and cards
- Why we added it
  - Align the app with the restaurant logging use case before wiring new data sources

## Step 3 — Restaurant Data Model + Caching Layer
- What was added
  - `GET /api/place/[id]` API route (Next.js route handler)
  - `GET /api/search` API route
  - Firestore collections: `restaurants`, `cached_searches`, `broke_boy_monitor`
- How it works
  - Place Details
    - Check Firestore `restaurants/{place_id}`
      - If fresh (lastFetched < PLACE_DETAILS_TTL_DAYS), return cached
      - Else, enforce broke boy limitation (monthly counter in `broke_boy_monitor`), call Google Places, persist fresh copy, return
  - Search
    - Normalize query + location; look up `cached_searches/{queryHash}`
      - If fresh (lastFetched < SEARCH_CACHE_TTL_DAYS), return cached
      - Else, enforce broke boy limitation, call Places Autocomplete, cache normalized results, return
  - Broke boy limitation
    - Monthly usage tracked in `broke_boy_monitor/monthly_usage.counters.totalRequests`
    - When usage >= SAFE_MONTHLY_GOOGLE_REQUESTS, API returns 429 with friendly message
- Why we added it
  - Minimize external calls and stay within the broke boy limitation while keeping the app responsive via cached responses

## Step 4 — Search & Autocomplete UX
- What was added
  - `RestaurantSearchInput` component with debounced autocomplete
  - Updated `SearchInputDesktop` and `SearchInputMobile` to use new component
  - Keyboard navigation (arrow keys, enter, escape) for suggestions
  - Click-outside-to-close behavior
- How it works
  - 500ms debounced search calls to `/api/search` (prevents rapid API calls while typing)
  - Shows up to 5 restaurant suggestions in dropdown
  - Caches search results in `cached_searches` collection (7-day TTL)
  - Clicking suggestion navigates to `/restaurant/{place_id}`
  - Enter without selection navigates to `/results?searchTerm=...`
- Why we added it
  - Provide smooth restaurant discovery UX while respecting broke boy limitation through aggressive caching
