const CATEGORIES = [
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top Rated" },
  { id: "now_playing", label: "Now Playing" },
  { id: "upcoming", label: "Upcoming" },
];

const SORT_OPTIONS = [
  { id: "", label: "Default Order" },
  { id: "popularity.desc", label: "Most Popular" },
  { id: "vote_average.desc", label: "Highest Rated" },
  { id: "primary_release_date.desc", label: "Newest Release" },
];

function FilterBar({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id && !selectedSort;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              disabled={disabled}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all sm:text-sm ${
                isSelected
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sort By Dropdown */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-select"
          className="text-xs font-medium text-slate-400 whitespace-nowrap"
        >
          Sort by:
        </label>
        <div className="relative">
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value)}
            disabled={disabled}
            className={`appearance-none rounded-lg border border-slate-800 bg-slate-900 py-1.5 pr-8 pl-3 text-xs font-medium text-slate-200 transition-colors focus:border-amber-500 focus:outline-none sm:text-sm ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-slate-700"
            }`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
