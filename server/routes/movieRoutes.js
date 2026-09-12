const express = require("express");
const {
  getMovies,
  searchMoviesController,
  getMovieDetails,
} = require("../controllers/movieController");

const router = express.Router();

// GET /api/movies - Discover movies with optional category, sort, and pagination
router.get("/", getMovies);

// GET /api/movies/search - Search movies by query
router.get("/search", searchMoviesController);

// GET /api/movies/:id - Get full details for a single movie
router.get("/:id", getMovieDetails);

module.exports = router;