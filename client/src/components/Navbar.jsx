import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getWishlist } from "../services/api";

function Navbar() {
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);

  // Sync wishlist count dynamically on mount and whenever custom event fires
  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        const items = await getWishlist();
        setWishlistCount(Array.isArray(items) ? items.length : 0);
      } catch {
        // Silently retain last known count if network is briefly unavailable
      }
    };

    fetchWishlistCount();

    // Listen for custom wishlist change events from cards or details page
    window.addEventListener("wishlist-updated", fetchWishlistCount);
    return () => window.removeEventListener("wishlist-updated", fetchWishlistCount);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-transform active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 shadow-md shadow-amber-500/20">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-amber-400">
             
            </span>
            <span className="-mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Movie Discovery App
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
              isActive("/")
                ? "bg-slate-800 text-amber-400 shadow-sm"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Discover</span>
          </Link>

          <Link
            to="/wishlist"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
              isActive("/wishlist")
                ? "bg-slate-800 text-rose-400 shadow-sm"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/20 px-1.5 text-xs font-semibold text-rose-400 ring-1 ring-rose-500/40">
                {wishlistCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
