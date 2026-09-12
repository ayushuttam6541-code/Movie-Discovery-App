import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWishlist, removeFromWishlist } from "../services/api";

function MovieCard({ movie, isWishlisted = false, onWishlistToggle }) {
  const navigate = useNavigate();
  const [inWishlist, setInWishlist] = useState(isWishlisted);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sync state if parent props change
  if (isWishlisted !== inWishlist && !isProcessing) {
    setInWishlist(isWishlisted);
  }

  // Extract release year safely
  const releaseYear = movie.releaseDate
    ? movie.releaseDate.split("-")[0]
    : "N/A";

  const handleCardClick = () => {
    navigate(`/movie/${movie.id || movie.movieId}`);
  };

  const handleWishlistClick = async (e) => {
    // Crucial: prevent click from triggering card navigation to details
    e.stopPropagation();

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (inWishlist) {
        await removeFromWishlist(movie.id || movie.movieId);
        setInWishlist(false);
        if (onWishlistToggle) onWishlistToggle(movie.id || movie.movieId, false);
      } else {
        await addToWishlist(movie);
        setInWishlist(true);
        if (onWishlistToggle) onWishlistToggle(movie.id || movie.movieId, true);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-amber-500/5"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        {movie.posterPath && !imgError ? (
          <img
            src={movie.posterPath}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-slate-500">
            <svg
              className="mb-2 h-10 w-10 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">No Poster Available</span>
          </div>
        )}

        {/* Wishlist Toggle Button (Overlay) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isProcessing}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
            inWishlist
              ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30"
              : "bg-slate-950/70 text-slate-300 hover:bg-slate-900 hover:text-rose-400"
          }`}
        >
          <svg
            className={`h-4 w-4 transition-transform ${isProcessing ? "animate-spin" : ""}`}
            fill={inWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Rating Badge */}
        {movie.rating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-md ring-1 ring-white/10">
            <span>★</span>
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <h2
          title={movie.title}
          className="line-clamp-2 text-sm font-semibold tracking-tight text-slate-100 transition-colors group-hover:text-amber-400"
        >
          {movie.title}
        </h2>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{releaseYear}</span>
          {movie.genres && movie.genres.length > 0 && (
            <span className="max-w-[100px] truncate text-slate-500">
              {movie.genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;