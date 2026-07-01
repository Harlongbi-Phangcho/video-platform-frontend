import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useForm } from "react-hook-form";
import { Input, Button } from "../components/index.js";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login as authLogin } from "../store/authSlice.js";
import { useNavigate } from "react-router-dom";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE_MB = 5;


function EditProfile() {
  const user = useSelector((state) => state.auth.user);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
    },
  });

  // Live preview for avatar
  const avatarFile = watch("avatar");
  const coverFile = watch("coverImage");

  //Avatar
  useEffect(() => {
    const file = avatarFile?.[0];
    if (!file) {
      setAvatarPreview(user?.avatar ?? null); // restore original on clear
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    // Cleanup: revoke the previous blob URL when file changes or component unmounts
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  //coverImage
  useEffect(() => {
    const file = coverFile?.[0];
    if (!file) {
      setCoverPreview(user?.coverImage ?? null); // restore original on clear
      return;
    }
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    // Cleanup: revoke the previous blob URL when file changes or component unmounts
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  //Validate image
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

  //on submit
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 1 — update account details
      const detailRes = await api.patch("/users/update-account", {
        fullName: data.fullName,
        email: data.email,
      });
      dispatch(authLogin(detailRes.data.data));

      // 2 - update avatar
      if (data.avatar?.[0]) {
        const formData = new FormData();
        formData.append("avatar", data.avatar[0]);
        const avatarRes = await api.patch("/users/avatar", formData);
        dispatch(authLogin(avatarRes.data.data));
      }

      // 3- update coverImage
      if (data.coverImage?.[0]) {
        const formData = new FormData();
        formData.append("coverImage", data.coverImage[0]);
        const coverRes = await api.patch("/users/cover-image", formData);
        dispatch(authLogin(coverRes.data.data));
      }

      toast.success("Profile updated successfully");
      navigate(`/channel/${user?.username}`);
    } catch (error) {
      console.error(error?.response?.data);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Update your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1">
            <Input
              label="Full Name"
              placeholder="John Doe"
              disabled={isSubmitting}
              {...register("fullName", {
                required: "Full name is required",
                minLength: { value: 2, message: "At least 2 characters" },
              })}
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              {...register("email", {
                required: "Email is required",
                minLength: { value: 2, message: "At least 2 characters" },
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
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
              <div className="flex-1 ">
                <Input
                  label="Avatar"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  disabled={isSubmitting}
                  {...register("avatar", {
                    validate: (files) => validateImage(files, false),
                  })}
                />
              </div>
            </div>
            {errors.avatar && (
              <p className="text-red-400 text-xs">{errors.avatar.message}</p>
            )}
          </div>

          {/* Cover image with preview */}
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover Image preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-red-500"
                />
              )}
              <div className="flex-1 ">
                <Input
                  label="CoverImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  disabled={isSubmitting}
                  {...register("coverImage", {
                    validate: (files) => validateImage(files, false),
                  })}
                />
              </div>
            </div>
            {errors.coverImage && (
              <p className="text-red-400 text-xs">
                {errors.coverImage.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition rounded-full font-semibold text-white"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => navigate(`/channel/${user?.username}`)}
            className="w-full py-2 text-sm text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
