import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WatchVideo from "./pages/WatchVideo";
import Layout from "./layout/Layout";
import { useDispatch } from "react-redux";
import { api } from "./api/axios";
import { login as authLogin } from "./store/authSlice";
import { FaSpinner } from "react-icons/fa";
import AuthLayout from "./components/AuthLayout";
import UploadVideo from "./pages/UploadVideo";
import Profile from "./pages/Profile";

// Simple inline 404 — move to pages/NotFound.jsx if it grows
function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="text-zinc-400 text-lg">Page not found</p>
      <a href="/" className="mt-2 text-red-400 hover:text-red-300 transition">
        Go home
      </a>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await api.get("/users/current-user");
        if (response.data.success) {
          dispatch(authLogin(response.data.data));
        }
      } catch {
        // Silently ignore — user simply isn't logged in
      } finally {
        setLoading(false);
      }
    };
    getCurrentUser();
  }, [dispatch]); // dispatch added to dependency array

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-5xl animate-spin" />
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        {/* Watch video inside Layout so the header is visible */}
        <Route path="/watch/:videoId" element={<WatchVideo />} />

        <Route
          path="/upload"
          element={
            <AuthLayout authentication={true}>
              <UploadVideo />
            </AuthLayout>
          }
        />

        <Route
          path="/login"
          element={
            <AuthLayout authentication={false}>
              <Login />
            </AuthLayout>
          }
        />

        <Route
          path="/register"
          element={
            <AuthLayout authentication={false}>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/channel"
          element={
            <AuthLayout authentication={true}>
              <Profile />
            </AuthLayout>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;