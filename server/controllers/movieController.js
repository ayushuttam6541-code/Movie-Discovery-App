const movieService = require("../services/movieService");

/**
 * Handles movie discovery with category, sorting, and pagination.
 */
const getMovies = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const category = req.query.category || "popular";
    const sortBy = req.query.sortBy || undefined;

    const moviesData = await movieService.getMovies({ category, sortBy, page });

    res.json(moviesData);
  } catch (error) {
    console.error("Movie discovery error:", error.response?.data?.status_message || error.message);

    res.status(error.response?.status || 500).json({
      message: "Unable to load movies right now. Please try again.",
    });
  }
};

/**
 * Handles movie search by title with debounce support on client and safe fallback.
 */
const searchMoviesController = async (req, res) => {
  try {
    const { query } = req.query;
    const page = Number(req.query.page) || 1;

    // Gracefully handle empty or whitespace search queries without crashing
    if (!query || !query.trim()) {
      return res.json({
        page: 1,
        totalPages: 0,
        totalResults: 0,
        results: [],
      });
    }

    const searchData = await movieService.searchMovies(query, page);

    res.json(searchData);
  } catch (error) {
    console.error("Movie search error:", error.response?.data?.status_message || error.message);

    res.status(error.response?.status || 500).json({
      message: "Unable to search movies right now. Please try again.",
    });
  }
};

/**
 * Handles fetching full details for a single movie by ID.
 */
const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate movie ID format
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid movie ID provided",
      });
    }

    const movie = await movieService.getMovieDetails(id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.json(movie);
  } catch (error) {
    console.error(`Movie details error for ID ${req.params.id}:`, error.response?.data?.status_message || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.status(error.response?.status || 500).json({
      message: "Unable to fetch movie details. Please try again.",
    });
  }
};

module.exports = {
  getMovies,
  searchMoviesController,
  getMovieDetails,
};