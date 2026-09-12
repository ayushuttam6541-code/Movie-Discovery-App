const Wishlist = require("../models/Wishlist");

/**
 * Extracts client identifier from request headers or query.
 */
const getClientId = (req) => {
  return req.headers["x-client-id"] || req.query.clientId || "anonymous-client";
};

/**
 * Get all wishlist items for the current client from MongoDB.
 */
const getWishlist = async (req, res) => {
  try {
    const clientId = getClientId(req);
    const wishlistItems = await Wishlist.find({ clientId }).sort({ addedAt: -1 }).lean();
    return res.json(wishlistItems);
  } catch (error) {
    console.error("Wishlist fetch error:", error.message);
    res.status(500).json({
      message: "Unable to load wishlist right now. Please try again.",
    });
  }
};

/**
 * Add a movie to the wishlist in MongoDB.
 * Prevents duplicates per client.
 */
const addToWishlist = async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { movieId, title, posterPath, releaseDate, rating } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        message: "movieId and title are required to add to wishlist.",
      });
    }

    const numericMovieId = Number(movieId);

    const existing = await Wishlist.findOne({ clientId, movieId: numericMovieId });
    if (existing) {
      return res.status(409).json({
        message: "Movie is already in your wishlist.",
        item: existing,
      });
    }

    const newWishlistItem = await Wishlist.create({
      clientId,
      movieId: numericMovieId,
      title: title.trim(),
      posterPath: posterPath || null,
      releaseDate: releaseDate || "Release date unavailable",
      rating: typeof rating === "number" ? rating : 0,
    });

    return res.status(201).json(newWishlistItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Movie is already in your wishlist.",
      });
    }

    console.error("Wishlist add error:", error.message);
    res.status(500).json({
      message: "Unable to add movie to wishlist. Please try again.",
    });
  }
};

/**
 * Remove a movie from the wishlist by movieId in MongoDB.
 */
const removeFromWishlist = async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { movieId } = req.params;

    if (!movieId || isNaN(Number(movieId))) {
      return res.status(400).json({
        message: "Invalid movieId parameter",
      });
    }

    const numericMovieId = Number(movieId);

    const deleted = await Wishlist.findOneAndDelete({
      clientId,
      movieId: numericMovieId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Movie not found in wishlist.",
      });
    }

    return res.json({
      message: "Movie removed from wishlist successfully.",
      movieId: numericMovieId,
    });
  } catch (error) {
    console.error("Wishlist remove error:", error.message);
    res.status(500).json({
      message: "Unable to remove movie from wishlist. Please try again.",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
