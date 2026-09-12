import axios from "axios";

// Generate or retrieve persistent anonymous client ID from localStorage
// Fulfills the requirement for persistent wishlist across sessions without user accounts/auth
const getOrCreateClientId = () => {
  const STORAGE_KEY = "movie_discovery_client_id";
  try {
    let clientId = localStorage.getItem(STORAGE_KEY);
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(STORAGE_KEY, clientId);
    }
    return clientId;
  } catch {
    return "anonymous_client";
  }
};

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

// Automatically inject anonymous client ID on all requests
API.interceptors.request.use((config) => {
  config.headers["x-client-id"] = getOrCreateClientId();
  return config;
});

/**
 * Fetch movies by category or sorting order with pagination.
 */
export const getMovies = async ({ category = "popular", sortBy, page = 1 } = {}) => {
  const params = { page };
  if (category) params.category = category;
  if (sortBy) params.sortBy = sortBy;

  const response = await API.get("/movies", { params });
  return response.data;
};

/**
 * Search movies by text query with optional AbortSignal to cancel stale requests.
 */
export const searchMovies = async (query, page = 1, signal = null) => {
  const response = await API.get("/movies/search", {
    params: {
      query,
      page,
    },
    signal,
  });
  return response.data;
};

/**
 * Fetch detailed movie information by movie ID.
 */
export const getMovieDetails = async (id) => {
  const response = await API.get(`/movies/${id}`);
  return response.data;
};

/**
 * Fetch current client's saved wishlist movies.
 */
export const getWishlist = async () => {
  const response = await API.get("/wishlist");
  return response.data;
};

/**
 * Add a movie to the client's wishlist.
 */
export const addToWishlist = async (movie) => {
  const payload = {
    movieId: movie.id || movie.movieId,
    title: movie.title,
    posterPath: movie.posterPath || movie.poster_path || null,
    releaseDate: movie.releaseDate || movie.release_date || "Release date unavailable",
    rating: movie.rating || movie.vote_average || 0,
  };

  const response = await API.post("/wishlist", payload);

  // Dispatch browser event so header badge and cards update immediately
  window.dispatchEvent(new CustomEvent("wishlist-updated"));

  return response.data;
};

/**
 * Remove a movie from the client's wishlist.
 */
export const removeFromWishlist = async (movieId) => {
  const response = await API.delete(`/wishlist/${movieId}`);

  // Dispatch browser event so header badge and cards update immediately
  window.dispatchEvent(new CustomEvent("wishlist-updated"));

  return response.data;
};

export default API;