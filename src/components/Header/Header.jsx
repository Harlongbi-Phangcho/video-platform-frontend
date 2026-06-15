import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import toast from "react-hot-toast";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { logout as autLogout } from "../../store/authSlice";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      dispatch(autLogout());
      toast.success("Logout successful");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    // create header along with logo and navigation links
    <header className="bg-zinc-950 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white">
          MyTube
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full px-5 py-3 rounded-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none focus:border-red-500"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button>Login</Button>
              </Link>

              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/upload">
                <Button>Upload</Button>
              </Link>

              <div className="flex items-center gap-2">
                <img
                  src={user?.avatar}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <span className="text-zinc-300 text-sm">{user?.username}</span>
              </div>

              <Button onClick={handleLogout}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
