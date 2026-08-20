import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import toast from "react-hot-toast";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { logout as authLogout } from "../../store/authSlice";
import { FiSearch, FiUpload, FiLogOut, FiBarChart2, FiX, FiMenu } from "react-icons/fi";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false)

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setMenuOpen(false);
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
      setMenuOpen(false);
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

        {/* Search  desktop only*/}
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

        {/* Right side desktop */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
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
              
              {/* Dashboard */}
              <Link to="/dashboard" className="sm:block">
                <Button variant="ghost" className="flex items-center gap-1.5">
                  <FiBarChart2 size={15} />
                  <span>Dashboard</span>
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

        {/* Hamburger button — mobile only */}
        <button onClick={() => setMenuOpen((prev) => !prev)}
          className="sm:hidden text-zinc-400 hover:text-white transition"
          aria-label="Toggle menu">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
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

      {/* Mobile menu — shown when hamburger is open */}
      {menuOpen && (
        <div className="sm:hidden mt-3 bg-zinc-900 rounded-xl p-4 flex flex-col gap-1 border border-zinc-800">
           {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
              >
                <FiUser size={18} />
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
              >
                <FiUser size={18} />
                Register
              </Link>
            </>
          ) : (
            <>
            {/* User info at top of menu */}
            <Link
                to={`/channel/${user?.username}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 transition mb-1"
              >
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt={user?.username}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
                    {avatarFallback}
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">{user?.fullName}</p>
                  <p className="text-zinc-400 text-xs">@{user?.username}</p>
                </div>
              </Link>

              {/* Divider */}
              <div className="border-t border-zinc-800 my-1" />

               <Link
                to="/upload"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
              >
                <FiUpload size={18} />
                Upload Video
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
              >
                <FiBarChart2 size={18} />
                Dashboard
              </Link>

              {/* Divider */}
              <div className="border-t border-zinc-800 my-1" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 text-red-400 hover:text-red-300 transition disabled:opacity-50 w-full text-left"
              >
                <FiLogOut size={18} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
