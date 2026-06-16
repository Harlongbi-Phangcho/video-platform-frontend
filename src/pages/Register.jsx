import React, { useState } from "react";
import { api } from "../api/axios";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button } from "../components/index.js";
import toast from "react-hot-toast";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Live preview for avatar
  const avatarFile = watch("avatar");
  const avatarPreview =
    avatarFile?.[0] ? URL.createObjectURL(avatarFile[0]) : null;

  const validateImage = (fileList, required = true) => {
    if (!fileList || fileList.length === 0) {
      return required ? "This field is required" : true;
    }
    const file = fileList[0];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG, or WEBP images are allowed";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be smaller than ${MAX_FILE_SIZE_MB}MB`;
    }
    return true;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("avatar", data.avatar[0]);
      if (data.coverImage?.[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }

      const response = await api.post("/users/register", formData);

      if (response.data.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      console.error(error?.response?.data);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create an account</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Join and start sharing videos today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1">
            <Input
              label="Full Name"
              placeholder="John Doe"
              disabled={isLoading}
              {...register("fullName", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs">{errors.fullName.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <Input
              label="Username"
              placeholder="johndoe123"
              disabled={isLoading}
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "Username must be at least 3 characters" },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Only letters, numbers, and underscores allowed",
                },
              })}
            />
            {errors.username && (
              <p className="text-red-400 text-xs">{errors.username.message}</p>
            )}
          </div>

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
              <p className="text-red-400 text-xs">{errors.email.message}</p>
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
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Avatar with preview */}
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-red-500"
                />
              )}
              <div className="flex-1">
                <Input
                  label="Avatar"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  disabled={isLoading}
                  {...register("avatar", {
                    validate: (files) => validateImage(files, true),
                  })}
                />
              </div>
            </div>
            {errors.avatar && (
              <p className="text-red-400 text-xs">{errors.avatar.message}</p>
            )}
          </div>

          {/* Cover Image (optional) */}
          <div className="space-y-1">
            <Input
              label="Cover Image (optional)"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              disabled={isLoading}
              {...register("coverImage", {
                validate: (files) => validateImage(files, false),
              })}
            />
            {errors.coverImage && (
              <p className="text-red-400 text-xs">{errors.coverImage.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition rounded-full font-semibold text-white"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-400 hover:text-red-300 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;