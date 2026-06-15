import { use, useEffect, useState } from "react";
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
      } catch (error) {
        console.log("No user logged in");
      } finally {
        setLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <FaSpinner className="text-red-500 text-5xl animate-spin" />
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
      
        <Route
          path="/upload"
          element={
            <AuthLayout>
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
      </Route>

      <Route path="/watch/:videoId" element={<WatchVideo />}>

      </Route>
    </Routes>
  );
}

export default App;
