import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </div>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
  <div className="mx-auto max-w-7xl px-4">
    <p className="flex items-center justify-center gap-2">
      <span className="text-lg">🎬</span>
      <span className="font-semibold text-slate-300">
        Movie Discovery
      </span>
    </p>

    <span className="mt-1 block text-sm text-slate-500">
      Powered by TMDB
    </span>
  </div>
</footer>
      </div>
    </BrowserRouter>
  );
}

export default App;