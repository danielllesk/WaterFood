# WaterFood - Social Restaurant Discovery Platform

## Project's Scope

- **TRANSFORMATION IN PROGRESS**: Converting from Letterboxd clone to restaurant-focused social platform
- Social restaurant logging and discovery app for Waterloo region
- Search, save and review restaurants using Google Places API with aggressive caching
- Implement Google Auth using Firebase Auth and store all users' information in Firestore DB
- Stay within 10,000 Google Places API requests/month (broke boy limitation) through intelligent caching
- **Original**: Forked from [ClonnerboxD Letterboxd Clone](https://github.com/janaiscoding/letterboxd-clone)

## Development Status

**Currently in Sprint 0**: Environment setup and documentation
- ✅ Created `.gitignore` and `.env.example`
- ✅ Set up technical documentation
- 🔄 Testing baseline functionality
- 📋 Next: Sprint 1 - Terminology refactoring (movies → restaurants)

### Original Demo (Letterboxd Clone)

![Gif preview of the Clonnerboxd](./assets/clonnerboxd-preview-desktop.gif)

![Gif preview of the Clonnerboxd on mobile](./assets/clonnerboxd-mobile-preview.gif)

## Getting Started

### Installing and running

```
git clone https://github.com/janaiscoding/letterboxd-clone.git
cd letterboxd-clone
npm install
```

### Prerequisites for running your own version

1. **Firebase Setup**: Create a new project from [Firebase Console](https://console.firebase.google.com/u/0/)
2. **Google Places API**: Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
3. **Environment Variables**: Copy `.env.example` to `.env` and fill in your keys

```bash
cp .env.example .env
```

Required environment variables:
- Firebase configuration (for authentication and database)
- Google Places API key (for restaurant data)
- App configuration (broke boy limitation limits, cache TTL)

See `.env.example` for complete list of required variables.

```
npm run dev
```

## Project Details & Description

### Current State (Letterboxd Clone)
- On **Homepage** you can see the current popular movies, fetched from [The Movie Database](https://www.themoviedb.org/).
- On **Profile** you can see what movies you liked and watched, as well as your most recent reviews.
- On **Films** page you can filter by different browsing categories: years, ratings and genres!
- On **Members** you can see all the currently registered users and their info. You can see their profiles as well.
- On **Reviews** you can see all the reviews on the platform.
- On **Settings** you can edit your display name and your bio (which will update your profile).
- In the navbar you can **search** for any movie to add to your collection.

### Planned Features (WaterFood)
- **Restaurant Discovery**: Search and discover restaurants in Waterloo region
- **Social Logging**: Log "Ate At" restaurants, maintain "To Try" lists
- **Dual Ratings**: Display both Google ratings and community app ratings
- **Social Feed**: Follow users and see their restaurant activity
- **Trending**: Discover popular restaurants based on community activity
- **Caching**: Intelligent caching to stay within Google Places API broke boy limitation

# Built with

## Technologies

- ReactJs, Javascript, TypeScript, Next.js
- CSS3, TailwindCSS
- HTML5

## Tools Used

- Visual Studio Code
- npm package manager
- Linux Terminal
- Git and Github

## Sources, Materials, Copyright

- **Original**: This was a [Letterboxd](https://letterboxd.com/) website replica
- **Original API**: [The Movie Database](https://www.themoviedb.org/)
- **New API**: [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
- **Transformation**: Converting to restaurant-focused social platform for Waterloo region

## Development Roadmap

See `PLAN.md` for detailed implementation roadmap and `TECHNICAL_DOCUMENTATION.md` for development journal.
