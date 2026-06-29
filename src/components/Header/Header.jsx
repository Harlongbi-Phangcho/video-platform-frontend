import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import toast from "react-hot-toast";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { logout as authLogout } from "../../store/authSlice";
import { FiSearch, FiUpload, FiLogOut } from "react-icons/fi";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/users/logout");
      dispatch(authLogout());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fallback avatar using the user's initials
  const avatarFallback = user?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-white whitespace-nowrap flex-shrink-0"
        >
          My<span className="text-red-500">Tube</span>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl hidden sm:flex"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-5 pr-12 py-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none focus:border-red-500 transition"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Register</Button>
              </Link>
            </>
          ) : (
            <>
              {/* Upload */}
              <Link to="/upload">
                <Button variant="ghost" className="flex items-center gap-1.5">
                  <FiUpload size={15} />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </Link>

              {/* Avatar + username */}
              <Link
                to={`/channel/${user?.username}`}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt={user?.username}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold border border-zinc-700">
                    {avatarFallback}
                  </div>
                )}
                <span className="text-zinc-300 text-sm hidden md:block">
                  {user?.username}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-zinc-400 hover:text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Logout"
                aria-label="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search row */}
      <form onSubmit={handleSearch} className="sm:hidden mt-3">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full pl-5 pr-12 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none focus:border-red-500 transition"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
            aria-label="Search"
          >
            <FiSearch size={18} />
          </button>
        </div>
      </form>
    </header>
  );
}

export default Header;
