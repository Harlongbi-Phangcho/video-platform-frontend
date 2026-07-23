import React from "react";
import { api } from "../api/axios";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Input } from "../components";
import toast from "react-hot-toast";
import { FiUploadCloud } from "react-icons/fi";
import { useSelector } from "react-redux";
import { FaSpinner } from "react-icons/fa";

const MAX_THUMBNAIL_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function EditVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  // page state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  // watch thumbnail file input for live preview
  const thumbnailFile = watch("thumbnail");

  // Live thumbnail preview with memory leak fix
  useEffect(() => {
    const file = thumbnailFile?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);

    return () => URL.revokeObjectURL(url); // cleanup blob URL
  }, [thumbnailFile]);

  useEffect(() => {
    const fetchVideoData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/videos/${videoId}`);
        const videoData = res.data.data;

        // Populate form with existing video data
        reset({
          title: videoData.title,
          description: videoData.description,
        });

        // show existing thumbnail if available
        if (videoData.thumbnailUrl) {
          setThumbnailPreview(videoData.thumbnailUrl);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch video data. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [videoId]);

   // Validate thumbnail
  const validateThumbnail = (fileList) => {
    if (!fileList || fileList.length === 0) return true; // Thumbnail is optional
    const file = fileList[0];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
      return "Only JPG, PNG, or WEBP images are allowed";
    if (file.size > MAX_THUMBNAIL_SIZE_MB * 1024 * 1024)
      return `Thumbnail must be smaller than ${MAX_THUMBNAIL_SIZE_MB}MB`;
    return true;
  };
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        if(data.thumbnail?.[0]) {
            formData.append("thumbnail", data.thumbnail[0]);
        }

        await api.patch(`/videos/${videoId}`, formData)
        toast.success("Video updated successfully!");
        navigate(`/dashboard`);
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update video. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-4xl animate-spin" />
        <p className="text-zinc-400">Loading video...</p>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-red-400 text-lg">{error}</p>
        <Button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div div className="flex items-center gap-3 mb-8">
          <FiUploadCloud className="text-red-500 text-3xl" />
          <div>
            <h1 className="text-3xl font-bold">Edit Video</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Update your video details
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <Input
                label="Title"
                placeholder="Enter a title"
                disabled={isSubmitting}
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Title must be under 100 characters",
                  },
                })}
              />
              {errors.title && (
                <p className="text-red-400 text-xs">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-sm text-zinc-300 mb-1">
                Description
              </label>
              <textarea
                rows="5"
                placeholder="Describe your video..."
                disabled={isSubmitting}
                className="w-full bg-zinc-800 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500 transition text-white placeholder:text-zinc-500 disabled:opacity-50 resize-none"
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                })}
              />
              {errors.description && (
                <p className="text-red-400 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <label className="block text-sm text-zinc-300">
                Thumbnail{" "}
                <span className="text-zinc-500 text-xs">
                  (optional — keep existing if not changed)
                </span>
              </label>

              {/* Current / preview thumbnail */}
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full aspect-video object-cover rounded-xl border border-zinc-700"
                />
              )}

              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                disabled={isSubmitting}
                {...register("thumbnail", {
                  validate: validateThumbnail,
                })}
              />
              {errors.thumbnail && (
                <p className="text-red-400 text-xs">
                  {errors.thumbnail.message}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition rounded-full font-semibold"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditVideo;
