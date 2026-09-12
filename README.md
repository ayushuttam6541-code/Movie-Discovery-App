# Movie Discovery App

A full-stack movie discovery application built with **React, Node.js, Express, TMDB API, and MongoDB**.

The application allows users to discover movies, search for movies, explore movie details, sort and browse results, and maintain a persistent wishlist.

## Features

* Discover popular movies without searching
* Search movies using keywords
* Browse movies with pagination
* Sort and filter movie results
* View detailed movie information
* Add and remove movies from wishlist
* Persistent wishlist using MongoDB
* Responsive design for desktop, tablet, and mobile
* Loading states and skeleton UI
* Empty states for unavailable results
* Error handling with retry-friendly UI
* Backend API abstraction using Node.js and Express
* TMDB API key securely stored on the backend
* Client communicates with the Node.js backend instead of calling TMDB directly

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* Axios
* MongoDB
* Mongoose
* dotenv
* CORS

### External API

* TMDB API

## Project Structure

```text
movie-discovery-app/
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── MovieCard.jsx
│       │   ├── SearchBar.jsx
│       │   ├── FilterBar.jsx
│       │   └── LoadingSkeleton.jsx
│       │
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── MovieDetails.jsx
│       │   └── Wishlist.jsx
│       │
│       ├── services/
│       │   └── api.js
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/
│   ├── controllers/
│   │   ├── movieController.js
│   │   └── wishlistController.js
│   │
│   ├── routes/
│   │   ├── movieRoutes.js
│   │   └── wishlistRoutes.js
│   │
│   ├── models/
│   │   └── Wishlist.js
│   │
│   ├── services/
│   │   └── movieService.js
│   │
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Architecture

The application follows a simple client-server architecture:

```text
React Frontend
      │
      ▼
Node.js + Express Backend
      │
      ├──────────────► TMDB API
      │
      └──────────────► MongoDB
                         │
                         ▼
                    Wishlist Data
```

The frontend does not communicate directly with TMDB. All movie API requests go through the Node.js backend.

This keeps the TMDB API key private and provides a single place for request handling and error management.

## API Endpoints

### Movies

```text
GET /api/movies
```

Returns popular/discoverable movies.

```text
GET /api/movies?page=1
```

Returns movies for a specific page.

```text
GET /api/movies/search?query=batman&page=1
```

Searches for movies using the provided query.

```text
GET /api/movies/:id
```

Returns details for a specific movie.

### Wishlist

```text
GET /api/wishlist
```

Returns saved wishlist movies.

```text
POST /api/wishlist
```

Adds a movie to the wishlist.

```text
DELETE /api/wishlist/:movieId
```

Removes a movie from the wishlist.

## Data Model

Only the required movie information is stored in MongoDB rather than storing the complete TMDB response.

Example wishlist document:

```text
{
  movieId,
  title,
  posterPath,
  releaseDate,
  rating,
  addedAt
}
```

This keeps the database lightweight while allowing the wishlist to remain persistent.

## Environment Variables

Create a `.env` file inside the `server` directory:

```env
TMDB_API_KEY=your_tmdb_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

The `.env` file should not be committed to GitHub.

## Installation

Clone the repository:

```bash
git clone <your-github-repository-url>
cd movie-discovery-app
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

## Run the Application

### Start Backend

Inside the `server` directory:

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

### Start Frontend

Inside the `client` directory:

```bash
npm run dev
```

Frontend will normally run on:

```text
http://localhost:5173
```

## Technical Decisions

### Why React?

React provides a component-based structure that makes the application easier to maintain and extend.

### Why Node.js + Express?

Express provides a lightweight backend layer between the React frontend and the external movie API.

It also allows API keys and external API communication to remain on the server.

### Why MongoDB?

MongoDB is used for persistent wishlist storage.

The application does not store all TMDB movie data. Only the information required for wishlist functionality is stored.

### Why Axios?

Axios is used for communication between:

* React → Node.js backend
* Node.js backend → TMDB API

### Why Tailwind CSS?

Tailwind CSS provides a responsive utility-based styling system and helps maintain consistent UI styling across the application.

## Performance and Error Handling

The application considers common real-world scenarios such as:

* Slow API responses
* Failed API requests
* Empty search results
* Missing movie posters
* Long movie titles
* Large result sets
* Pagination
* Loading states
* Unexpected external API responses

The backend also uses request timeouts when communicating with TMDB so that a slow external service does not leave requests hanging indefinitely.

## Wishlist Persistence

Wishlist data is stored in MongoDB rather than only in browser local storage.

This means wishlist data can remain available after closing and reopening the application.

Authentication is intentionally not included because it is not required by the assignment.

## Assumptions

* Users do not need to create an account.
* TMDB is used as the external movie data provider.
* MongoDB is used only for persistent wishlist data.
* TMDB API availability and rate limits are external dependencies.
* Movie information displayed in the application comes from TMDB.

## Limitations

* The application depends on the availability of the TMDB API.
* TMDB API rate limits may affect requests.
* No user authentication is implemented.
* The wishlist is designed for the assignment's anonymous-user use case.

## AI Usage

AI tools were used during development for:

* Understanding implementation approaches
* Debugging development issues
* Reviewing code structure
* Generating and refining UI ideas
* Improving error handling and edge-case coverage
* Assisting with documentation

All generated code was reviewed, tested, and adapted to the requirements of the application.

## Future Improvements

Possible future improvements include:

* User authentication and individual wishlists
* Advanced genre and rating filters
* Infinite scrolling
* Movie recommendations
* Caching frequently requested movie data
* Improved API rate-limit handling
* Automated testing
* Production deployment with CI/CD
* More detailed movie recommendations based on user preferences

## License

This project was created as a full-stack internship assignment and is intended for educational and demonstration purposes.

Movie data and images are provided by TMDB.
