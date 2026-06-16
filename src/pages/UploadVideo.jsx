import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Input } from "../components";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi";

const MAX_VIDEO_SIZE_MB = 100;
const MAX_THUMBNAIL_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

function UploadVideo() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Live thumbnail preview
  const thumbnailFile = watch("thumbnail");
  const thumbnailPreview = thumbnailFile?.[0]
    ? URL.createObjectURL(thumbnailFile[0])
    : null;

  const validateImage = (fileList) => {
    if (!fileList || fileList.length === 0) return "Thumbnail is required";
    const file = fileList[0];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
      return "Only JPG, PNG, or WEBP images are allowed";
    if (file.size > MAX_THUMBNAIL_SIZE_MB * 1024 * 1024)
      return `Thumbnail must be smaller than ${MAX_THUMBNAIL_SIZE_MB}MB`;
    return true;
  };

  const validateVideo = (fileList) => {
    if (!fileList || fileList.length === 0) return "Video file is required";
    const file = fileList[0];
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type))
      return "Only MP4, WEBM, OGG, or MOV files are allowed";
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024)
      return `Video must be smaller than ${MAX_VIDEO_SIZE_MB}MB`;
    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("thumbnail", data.thumbnail[0]);
      formData.append("videoFile", data.videoFile[0]);

      await api.post("/videos", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      toast.success("Video uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto bg-zinc-900 rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FiUploadCloud className="text-red-500 text-3xl" />
          <h1 className="text-3xl font-bold">Upload Video</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <Input
              label="Title"
              placeholder="Enter a catchy title"
              disabled={loading}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
                maxLength: { value: 100, message: "Title must be under 100 characters" },
              })}
            />
            {errors.title && (
              <p className="text-red-400 text-xs">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm text-zinc-300 mb-1">Description</label>
            <textarea
              rows="5"
              placeholder="Describe your video..."
              disabled={loading}
              className="w-full bg-zinc-800 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500 transition text-white placeholder:text-zinc-500 disabled:opacity-50 resize-none"
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
              })}
            />
            {errors.description && (
              <p className="text-red-400 text-xs">{errors.description.message}</p>
            )}
          </div>

          {/* Thumbnail with preview */}
          <div className="space-y-2">
            <label className="block text-sm text-zinc-300">Thumbnail</label>
            <div className="flex items-start gap-4">
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-32 h-20 object-cover rounded-lg border border-zinc-700 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  disabled={loading}
                  {...register("thumbnail", { validate: validateImage })}
                />
              </div>
            </div>
            {errors.thumbnail && (
              <p className="text-red-400 text-xs">{errors.thumbnail.message}</p>
            )}
          </div>

          {/* Video file */}
          <div className="space-y-1">
            <label className="block text-sm text-zinc-300">
              Video File{" "}
              <span className="text-zinc-500 text-xs">(MP4, WEBM, MOV — max {MAX_VIDEO_SIZE_MB}MB)</span>
            </label>
            <Input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              disabled={loading}
              {...register("videoFile", { validate: validateVideo })}
            />
            {errors.videoFile && (
              <p className="text-red-400 text-xs">{errors.videoFile.message}</p>
            )}
          </div>

          {/* Upload progress bar */}
          {loading && (
            <div className="space-y-1">
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-zinc-400 text-xs text-right">{uploadProgress}% uploaded</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition rounded-full font-semibold"
          >
            {loading ? `Uploading... ${uploadProgress}%` : "Upload Video"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideo;