import React, { useState } from "react";
import { api } from "../api/axios";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button } from "../components/index.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice.js";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post("/users/login", {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        dispatch(login(response.data.data.user));
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      // Safe access — handles network errors where error.response is undefined
      console.error(error?.response?.data);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition rounded-full font-semibold text-white"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-400 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-400 hover:text-red-300 transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;