import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Input } from "../components";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

function UploadVideo() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("thumbnail", data.thumbnail[0]);
      formData.append("videoFile", data.videoFile[0]);

      const response = await api.post("/videos", formData);
      toast.success("Video upload successful");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto bg-zinc-900 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">Upload Video</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* title */}
          <Input
            label="Title"
            placeholder="Enter Title"
            {...register("title", { required: true })}
          />

          {/* description */}
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              rows="5"
              className="w-full bg-zinc-800 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500"
              {...register("description", {
                required: true,
              })}
            />
          </div>

          {/* thumbnail */}
          <div>
            <label>Thumbnail</label>
            <Input
              type="file"
              accept="image/*"
              {...register("thumbnail", { required: true })}
            />
          </div>

          {/* video */}
          <div>
            <label>Video</label>
            <Input
              type="file"
              accept="video/*"
              {...register("videoFile", { required: true })}
            />
          </div>

          {/* Upload button */}
          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Video"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideo;
