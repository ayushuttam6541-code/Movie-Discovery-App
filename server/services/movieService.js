const axios = require("axios");

// Allow configuring base URL via environment variable with fallback to api.tmdb.org
// (api.tmdb.org is TMDB's alternate official domain which avoids ISP connection resets in certain regions)
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.tmdb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

/**
 * Normalizes movie data into a clean, predictable shape for the frontend.
 * Safely handles missing data fields (missing posters, overviews, ratings, dates).
 */
const normalizeMovie = (movie) => {
  if (!movie || typeof movie !== "object") return null;

  return {
    id: movie.id,
    title: movie.title || movie.original_title || "Untitled",
    overview: movie.overview && movie.overview.trim() ? movie.overview.trim() : "No overview available.",
    posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
    backdropPath: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
    releaseDate: movie.release_date || "Release date unavailable",
    rating: typeof movie.vote_average === "number" ? Number(movie.vote_average.toFixed(1)) : 0,
    voteCount: movie.vote_count || 0,
    popularity: movie.popularity || 0,
    // Genre IDs may be present in list view, or full objects in details view
    genres: Array.isArray(movie.genres) ? movie.genres.map((g) => g.name) : [],
  };
};

/**
 * Normalizes full movie details including runtime and production attributes.
 */
const normalizeMovieDetails = (movie) => {
  const base = normalizeMovie(movie);
  if (!base) return null;

  return {
    ...base,
    tagline: movie.tagline || "",
    runtime: typeof movie.runtime === "number" && movie.runtime > 0 ? movie.runtime : null,
    status: movie.status || "Unknown",
    originalLanguage: movie.original_language ? movie.original_language.toUpperCase() : "N/A",
    budget: movie.budget || 0,
    revenue: movie.revenue || 0,
  };
};

/**
 * Fetch movies by category or sorting order.
 * Supports categories: popular, top_rated, now_playing, upcoming.
 * Supports sorting: popularity.desc, vote_average.desc, primary_release_date.desc.
 */
const getMovies = async ({ category = "popular", sortBy, page = 1 }) => {
  const validCategories = ["popular", "top_rated", "now_playing", "upcoming"];
  const safePage = Math.max(1, Number(page) || 1);

  let response;

  // If a specific sort order is requested, use TMDB /discover/movie
  if (sortBy) {
    const discoverParams = {
      page: safePage,
      sort_by: sortBy,
    };

    // When sorting by rating, require at least 100 votes to avoid skew from 1-vote movies
    if (sortBy.startsWith("vote_average")) {
      discoverParams["vote_count.gte"] = 100;
    }

    response = await tmdb.get("/discover/movie", { params: discoverParams });
  } else {
    // Otherwise use the standard TMDB category endpoints
    const endpoint = validCategories.includes(category) ? category : "popular";
    response = await tmdb.get(`/movie/${endpoint}`, {
      params: { page: safePage },
    });
  }

  const { results = [], page: currentPage, total_pages, total_results } = response.data;

  return {
    page: currentPage,
    totalPages: Math.min(total_pages || 1, 500), // TMDB caps discover/category pagination at 500 pages
    totalResults: total_results || 0,
    results: results.map(normalizeMovie).filter(Boolean),
  };
};

/**
 * Search movies by text query with pagination.
 */
const searchMovies = async (query, page = 1) => {
  const safePage = Math.max(1, Number(page) || 1);

  const response = await tmdb.get("/search/movie", {
    params: {
      query: query.trim(),
      page: safePage,
      include_adult: false,
    },
  });

  const { results = [], page: currentPage, total_pages, total_results } = response.data;

  return {
    page: currentPage,
    totalPages: Math.min(total_pages || 1, 500),
    totalResults: total_results || 0,
    results: results.map(normalizeMovie).filter(Boolean),
  };
};

/**
 * Fetch full movie details by TMDB movie ID.
 */
const getMovieDetails = async (movieId) => {
  const response = await tmdb.get(`/movie/${movieId}`);
  return normalizeMovieDetails(response.data);
};

module.exports = {
  getMovies,
  searchMovies,
  getMovieDetails,
};