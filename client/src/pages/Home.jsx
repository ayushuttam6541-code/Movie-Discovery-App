import { useState, useEffect, useRef, useCallback } from "react";
import { getMovies, searchMovies, getWishlist } from "../services/api";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import { MovieGridSkeleton } from "../components/LoadingSkeleton";

function Home() {
  const [movies, setMovies] = useState([]);
  const [category, setCategory] = useState("popular");
  const [sortBy, setSortBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [wishlistMovieIds, setWishlistMovieIds] = useState(new Set());

  // Ref tracking current active request ID to ignore stale responses
  // Prevents race conditions when user rapidly clicks filters or types
  const currentRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Fetch client wishlist movie IDs to highlight wishlisted cards
  const fetchWishlistIds = useCallback(async () => {
    try {
      const items = await getWishlist();
      if (Array.isArray(items)) {
        const idSet = new Set(items.map((item) => item.movieId));
        setWishlistMovieIds(idSet);
      }
    } catch {
      // Fallback silently if offline
    }
  }, []);

  useEffect(() => {
    fetchWishlistIds();
    window.addEventListener("wishlist-updated", fetchWishlistIds);
    return () => window.removeEventListener("wishlist-updated", fetchWishlistIds);
  }, [fetchWishlistIds]);

  // Primary data fetcher: resets list on search/filter/sort changes
  const fetchMoviesData = useCallback(
    async (targetPage = 1, append = false) => {
      // Cancel prior in-flight search request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const requestId = ++currentRequestIdRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      try {
        let data;
        if (searchQuery.trim()) {
          data = await searchMovies(searchQuery.trim(), targetPage, controller.signal);
        } else {
          data = await getMovies({ category, sortBy, page: targetPage });
        }

        // Ignore response if a newer request was dispatched while this was in flight
        if (requestId !== currentRequestIdRef.current) {
          return;
        }

        const newResults = data.results || [];
        setTotalPages(data.totalPages || 1);
        setPage(targetPage);

        setMovies((prev) => (append ? [...prev, ...newResults] : newResults));
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          // Request was deliberately canceled due to newer user action; do nothing
          return;
        }

        if (requestId === currentRequestIdRef.current) {
          setError(
            err.response?.data?.message ||
              "Unable to load movies right now. Please check your network and try again."
          );
        }
      } finally {
        if (requestId === currentRequestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [category, sortBy, searchQuery]
  );

  // Trigger fresh fetch whenever search, category, or sort changes
  useEffect(() => {
    fetchMoviesData(1, false);
  }, [fetchMoviesData]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // When searching, sort and category stay in state but search takes visual priority
  };

  const handleCategorySelect = (newCategory) => {
    setCategory(newCategory);
    setSortBy(""); // Reset sort to view category defaults
    setSearchQuery(""); // Clear search to return to discovery
  };

  const handleSortSelect = (newSort) => {
    setSortBy(newSort);
    setSearchQuery(""); // Sorting applies to discovery catalog
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading && !loadingMore) {
      fetchMoviesData(page + 1, true);
    }
  };

  const handleWishlistToggle = (movieId, isAdded) => {
    setWishlistMovieIds((prev) => {
      const updated = new Set(prev);
      if (isAdded) {
        updated.add(movieId);
      } else {
        updated.delete(movieId);
      }
      return updated;
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Hero / Header Section */}
      <section className="mb-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {searchQuery ? (
              <>
                Search Results for{" "}
                <span className="text-amber-400">"{searchQuery}"</span>
              </>
            ) : (
              "Discover Movies"
            )}
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Explore popular blockbusters, top-rated masterpieces, and upcoming releases.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} initialValue={searchQuery} />

        {/* Categories & Sorting (Visible when not actively searching) */}
        {!searchQuery && (
          <FilterBar
            selectedCategory={category}
            onSelectCategory={handleCategorySelect}
            selectedSort={sortBy}
            onSelectSort={handleSortSelect}
            disabled={loading}
          />
        )}
      </section>

      {/* Content States */}
      {loading ? (
        <MovieGridSkeleton count={10} />
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-900/40 bg-rose-950/20 p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Unable to Load Movies</h2>
          <p className="mt-1 max-w-md text-sm text-slate-400">{error}</p>
          <button
            type="button"
            onClick={() => fetchMoviesData(1, false)}
            className="mt-5 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95"
          >
            Try Again
          </button>
        </div>
      ) : movies.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">No Movies Found</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            {searchQuery
              ? `We couldn't find any movies matching "${searchQuery}". Try searching for something else.`
              : "No movies are available for this category right now."}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="mt-5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Clear Search & Browse All
            </button>
          )}
        </div>
      ) : (
        /* Movies Grid */
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard
                key={`${movie.id}-${movie.title}`}
                movie={movie}
                isWishlisted={wishlistMovieIds.has(movie.id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>

          {/* Load More Section / Large Result Sets Continuation */}
          {page < totalPages && (
            <div className="flex flex-col items-center justify-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-6 py-3 text-sm font-semibold text-slate-100 shadow-md transition-all hover:border-amber-500/50 hover:bg-slate-800 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Loading more movies...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Movies</span>
                    <span className="text-xs text-slate-400">
                      (Page {page} of {totalPages})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default Home;