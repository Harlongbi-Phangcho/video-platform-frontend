import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import toast from "react-hot-toast";
import Button from "../Button";
function Header() {
  const navigate = useNavigate();
  const isLoggedIn = true;

  const handleLogout = async () => {
    try {
      const response = await api.post("/users/logout");
      if (response.data.success) {
        toast.success("Logout successful!");
        navigate("/login");
      }
    } catch (error) {
      console.error(error.response.data);
      toast.error(error.response?.data?.message || "Something went wrong");
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
          {!isLoggedIn ? (
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
              <Button>Upload</Button>

              <img
                src="https://i.pravatar.cc/100"
                alt="profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
