const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");

// Persistent local storage path for graceful fallback if MongoDB daemon is not running locally
const FALLBACK_DIR = path.join(__dirname, "../data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "wishlist-storage.json");

// Ensure fallback directory exists
if (!fs.existsSync(FALLBACK_DIR)) {
  fs.mkdirSync(FALLBACK_DIR, { recursive: true });
}

const readFallbackData = () => {
  try {
    if (!fs.existsSync(FALLBACK_FILE)) return [];
    const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error("Error reading fallback wishlist data:", err.message);
    return [];
  }
};

const writeFallbackData = (data) => {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing fallback wishlist data:", err.message);
  }
};

/**
 * Checks whether MongoDB is actively connected and ready.
 */
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Extracts client identifier from request headers or query.
 */
const getClientId = (req) => {
  return req.headers["x-client-id"] || req.query.clientId || "anonymous-client";
};

/**
 * Get all wishlist items for the current client.
 */
const getWishlist = async (req, res) => {
  try {
    const clientId = getClientId(req);

    if (isDbConnected()) {
      const wishlistItems = await Wishlist.find({ clientId }).sort({ addedAt: -1 }).lean();
      return res.json(wishlistItems);
    }

    // Fallback persistent storage if MongoDB is offline
    const allItems = readFallbackData();
    const clientItems = allItems
      .filter((item) => item.clientId === clientId)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return res.json(clientItems);
  } catch (error) {
    console.error("Wishlist fetch error:", error.message);
    res.status(500).json({
      message: "Unable to load wishlist right now. Please try again.",
    });
  }
};

/**
 * Add a movie to the wishlist.
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

    if (isDbConnected()) {
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
    }

    // Fallback persistent storage if MongoDB is offline
    const allItems = readFallbackData();
    const existingIndex = allItems.findIndex(
      (item) => item.clientId === clientId && item.movieId === numericMovieId
    );

    if (existingIndex !== -1) {
      return res.status(409).json({
        message: "Movie is already in your wishlist.",
        item: allItems[existingIndex],
      });
    }

    const newItem = {
      _id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      movieId: numericMovieId,
      title: title.trim(),
      posterPath: posterPath || null,
      releaseDate: releaseDate || "Release date unavailable",
      rating: typeof rating === "number" ? rating : 0,
      addedAt: new Date().toISOString(),
    };

    allItems.push(newItem);
    writeFallbackData(allItems);

    return res.status(201).json(newItem);
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
 * Remove a movie from the wishlist by movieId.
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

    if (isDbConnected()) {
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
    }

    // Fallback persistent storage if MongoDB is offline
    const allItems = readFallbackData();
    const itemIndex = allItems.findIndex(
      (item) => item.clientId === clientId && item.movieId === numericMovieId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Movie not found in wishlist.",
      });
    }

    allItems.splice(itemIndex, 1);
    writeFallbackData(allItems);

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
