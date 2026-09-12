const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

// GET /api/wishlist - Retrieve client wishlist
router.get("/", getWishlist);

// POST /api/wishlist - Add movie to wishlist
router.post("/", addToWishlist);

// DELETE /api/wishlist/:movieId - Remove movie from wishlist
router.delete("/:movieId", removeFromWishlist);

module.exports = router;
