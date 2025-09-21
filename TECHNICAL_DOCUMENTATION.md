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

## Step 5 — Reviews, Ratings, Logs & Favorites
- What was added
  - `POST /api/reviews` - Submit restaurant reviews with rating (1-5 stars)
  - `POST /api/logs` - Add/remove restaurants from "ate at" list
  - `POST /api/favorites` - Add/remove restaurants from favorites (max 4)
  - Updated WatchButton and FavoriteButton to use new APIs
- How it works
  - Reviews: Creates review document, updates restaurant.appRating via transaction, updates user.reviews array
  - Logs: Updates user.ateAt array, increments restaurant.weeklyStats.logs counter
  - Favorites: Updates user.favourites array (enforces 4-item limit), increments restaurant.weeklyStats.favorites counter
  - All operations use Firestore transactions for data consistency
  - Rating aggregation: (oldRating * oldCount + newRating) / (oldCount + 1)
- Why we added it
  - Enable core restaurant logging functionality with proper data consistency
  - Support both Google ratings and community app ratings
  - Track weekly activity for trending calculations
  - Enforce business rules (4 favorites max) at the API level

---

## Step 6 — Google Places API Integration
- What was added
  - Updated homepage (`app/page.tsx`) to use `/api/search` instead of TMDB API
  - Updated restaurant detail page (`app/restaurant/[id]/page.tsx`) to use `/api/place/[id]`
  - Updated restaurants listing page (`app/restaurants/page.tsx`) to use Google Places search
  - Updated search results page (`app/results/page.tsx`) to use Google Places search
  - Fixed URL routing from `/films` to `/restaurants`
- How it works
  - All pages now call our internal API routes which handle Google Places API integration
  - Homepage fetches popular restaurants using search query "restaurants" in Waterloo region
  - Restaurant detail pages fetch full restaurant data using place_id
  - Search results use user's search terms with Google Places Autocomplete
  - All API calls include proper error handling and fallbacks
- Why we added it
  - Replace movie data with actual restaurant data from Google Places
  - Enable real restaurant discovery and search functionality
  - Maintain broke boy limitation through our caching layer
  - Provide accurate restaurant information for the Waterloo region

## Step 7 — Social & Feed Implementation
- What was added
  - Updated `User` type to include `following: string[]`
  - `POST /api/follow` - Follow/unfollow users
  - Updated `ProfileBio` component with follow button
  - Updated sign-in to include `following` and `ateAt` in user doc
  - Added feed writes to `/api/reviews`, `/api/logs`, `/api/favorites`
  - `GET /api/feed` - Fetch feed for user's following
  - `GET /api/trending` - Fetch trending restaurants by appRatingsTotal
  - Added "FEED" to navbar menuLinks
  - Created `/feed` page with feed display and trending fallback
- How it works
  - Following: Users can follow/unfollow others; stored in user.following array
  - Feed: On review/log/favorite actions, write event to feed collection with type, userId, place_id, summary, metadata
  - Feed API: Query feed where userId in following, ordered by timestamp desc
  - Trending: Simple query restaurants ordered by appRatingsTotal desc
  - Feed page: Displays feed events; if empty, shows trending with message
- Why we added it
  - Enable social features for user engagement
  - Provide personalized feed of friends' activities
  - Fallback to trending when feed is empty
  - Complete core social functionality as per plan

## Step 8 — Final Polish & Branding Updates
- What was added/changed
  - Updated all UI text from movie/film terminology to restaurant terminology
  - Changed "CLONNERBOX LETS YOU..." to "FOODBOXD LETS YOU..."
  - Updated letsYouData to reflect restaurant features (visited, to-try list, etc.)
  - Updated LatestNews component with restaurant content and images
  - Updated storiesData with restaurant-focused articles and images
  - Removed Latest News and Recent Stories from homepage as requested
  - Fixed alt text on all images for accessibility
  - Updated navbar logo alt text to "FoodBoxd"
- How it works
  - All user-facing text now reflects restaurant discovery and logging
  - Homepage shows restaurant-specific content and features
  - Images have proper alt text for screen readers
  - Branding is consistent throughout the application
- Why we added it
  - Complete the transformation from movie app to restaurant app
  - Ensure accessibility compliance
  - Polish the user experience with relevant content
  - Remove outdated movie content from homepage
