import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWishlist } from "../services/api";
import MovieCard from "../components/MovieCard";
import { MovieGridSkeleton } from "../components/LoadingSkeleton";

function Wishlist() {
  const [wishlistMovies, setWishlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWishlist();
      setWishlistMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your wishlist right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleWishlistToggle = (movieId, isAdded) => {
    if (!isAdded) {
      setWishlistMovies((prev) =>
        prev.filter((m) => (m.id || m.movieId) !== movieId)
      );
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Your saved collection of films to watch later.
          </p>
        </div>

        {wishlistMovies.length > 0 && (
          <span className="inline-flex w-fit items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300">
            {wishlistMovies.length} {wishlistMovies.length === 1 ? "Movie" : "Movies"} Saved
          </span>
        )}
      </div>

      {/* Content States */}
      {loading ? (
        <MovieGridSkeleton count={5} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-900/40 bg-rose-950/20 p-12 text-center">
          <h2 className="text-lg font-bold text-white">Error Loading Wishlist</h2>
          <p className="mt-1 text-sm text-slate-400">{error}</p>
          <button
            type="button"
            onClick={fetchWishlist}
            className="mt-4 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
          >
            Retry
          </button>
        </div>
      ) : wishlistMovies.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/80 text-rose-400/80">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Your wishlist is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Explore our curated catalog and tap the heart icon on any movie to save it here for later.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Discover Movies</span>
          </Link>
        </div>
      ) : (
        /* Grid of Wishlist items */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {wishlistMovies.map((movie) => (
            <MovieCard
              key={movie._id || movie.movieId}
              movie={{
                id: movie.movieId,
                title: movie.title,
                posterPath: movie.posterPath,
                releaseDate: movie.releaseDate,
                rating: movie.rating,
              }}
              isWishlisted={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default Wishlist;
