import { useState, useEffect } from "react";

function SearchBar({ onSearch, initialValue = "" }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Sync internal state if parent resets search
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Debounce search input to prevent rapid, unnecessary backend requests
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search movies by title (e.g. Inception, Avatar, Batman)..."
        className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pr-10 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-inner transition-all focus:border-amber-500 focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
