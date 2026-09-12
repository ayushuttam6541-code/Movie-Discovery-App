import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieDetails, getWishlist, addToWishlist, removeFromWishlist } from "../services/api";
import { MovieDetailsSkeleton } from "../components/LoadingSkeleton";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inWishlist, setInWishlist] = useState(false);
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const [movieData, wishlistItems] = await Promise.all([
          getMovieDetails(id),
          getWishlist().catch(() => []),
        ]);

        if (!isMounted) return;

        setMovie(movieData);

        // Check if currently saved in wishlist
        const exists = Array.isArray(wishlistItems)
          ? wishlistItems.some((item) => Number(item.movieId) === Number(id))
          : false;
        setInWishlist(exists);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.status === 404
            ? "The requested movie could not be found."
            : "Unable to load movie details. Please check your network and try again."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleWishlistToggle = async () => {
    if (!movie || isProcessingWishlist) return;
    setIsProcessingWishlist(true);

    try {
      if (inWishlist) {
        await removeFromWishlist(movie.id);
        setInWishlist(false);
      } else {
        await addToWishlist(movie);
        setInWishlist(true);
      }
    } catch (err) {
      console.error("Wishlist toggle error on details page:", err);
    } finally {
      setIsProcessingWishlist(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return <MovieDetailsSkeleton />;
  }

  if (error || !movie) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10">
          <h1 className="text-xl font-bold text-white">Movie Unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">{error || "Movie not found"}</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-6 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
          >
            ← Return to Discovery
          </button>
        </div>
      </main>
    );
  }

  // Format runtime into hours and minutes (e.g. 148m -> 2h 28m)
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  const releaseYear = movie.releaseDate
    ? movie.releaseDate.split("-")[0]
    : "N/A";

  return (
    <div className="relative min-h-screen">
      {/* Backdrop Header with Gradient Overlay */}
      {movie.backdropPath && (
        <div className="absolute inset-x-0 top-0 h-[450px] overflow-hidden">
          <img
            src={movie.backdropPath}
            alt={movie.title}
            className="h-full w-full object-cover opacity-20 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0f19]/80 to-[#0b0f19]" />
        </div>
      )}

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Back Navigation Button */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Movies</span>
        </button>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {/* Movie Poster */}
          <div className="flex flex-col items-center">
            <div className="aspect-[2/3] w-full max-w-[340px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60">
              {movie.posterPath && !imgError ? (
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-slate-500">
                  <span className="text-sm font-medium">No Poster Available</span>
                </div>
              )}
            </div>

            {/* Wishlist Action Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isProcessingWishlist}
              className={`mt-5 flex w-full max-w-[340px] items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold shadow-md transition-all active:scale-95 ${
                inWishlist
                  ? "border border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                  : "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-500/20 hover:from-rose-600 hover:to-rose-700"
              }`}
            >
              <svg
                className={`h-5 w-5 ${isProcessingWishlist ? "animate-spin" : ""}`}
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
              <span>{inWishlist ? "In Your Wishlist (Remove)" : "Add to Wishlist"}</span>
            </button>
          </div>

          {/* Movie Info & Metadata */}
          <div className="flex flex-col justify-between md:col-span-2">
            <div>
              {/* Title & Tagline */}
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="mt-2 text-base italic text-slate-400">
                  "{movie.tagline}"
                </p>
              )}

              {/* Badges / Quick Stats Row */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                {movie.rating > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1 font-bold text-amber-400 ring-1 ring-amber-500/30">
                    <span>★</span>
                    <span>{movie.rating.toFixed(1)}</span>
                    <span className="text-xs font-normal text-amber-400/70">
                      ({movie.voteCount?.toLocaleString()} votes)
                    </span>
                  </div>
                )}

                <div className="rounded-lg bg-slate-800/80 px-3 py-1 font-medium text-slate-300">
                  {releaseYear}
                </div>

                {formattedRuntime && (
                  <div className="rounded-lg bg-slate-800/80 px-3 py-1 font-medium text-slate-300">
                    {formattedRuntime}
                  </div>
                )}

                {movie.originalLanguage && (
                  <div className="rounded-lg bg-slate-800/80 px-3 py-1 font-medium text-slate-300 uppercase">
                    {movie.originalLanguage}
                  </div>
                )}
              </div>

              {/* Genres Pills */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-slate-700/80 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="mt-6 border-t border-slate-800/80 pt-6">
                <h2 className="text-lg font-bold text-slate-200">Overview</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {movie.overview}
                </p>
              </div>

              {/* Additional Metadata Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-3">
                <div>
                  <span className="text-xs font-medium text-slate-500">Release Date</span>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {movie.releaseDate}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Status</span>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {movie.status}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Popularity Score</span>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {Math.round(movie.popularity || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MovieDetails;
