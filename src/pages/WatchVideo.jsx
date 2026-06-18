import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
  FiBookmark,
  FiEye,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

function WatchVideo() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/videos/${videoId}`);
        setVideo(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load video.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-4xl animate-spin" />
        <p className="text-zinc-400">Loading video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-red-400 text-lg">{error}</p>
        <Link
          to="/"
          className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (!video) return null;

  const { videoFile, title, description, views, likesCount, createdAt, owner } = video;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left — video + details */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            <video
              src={videoFile}
              poster={video.thumbnail}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold mt-4 leading-snug">{title}</h1>

          {/* Meta row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
            {/* Channel info */}
            <div className="flex items-center gap-3">
              {owner?.avatar ? (
                <img
                  src={owner.avatar}
                  alt={owner.username}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm border border-zinc-700">
                  {owner?.username?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}

              <div>
                <Link
                  to={`/channel/${owner?.username}`}
                  className="text-sm font-medium hover:text-red-400 transition"
                >
                  {owner?.username}
                </Link>
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <FiEye size={12} />
                  {views?.toLocaleString()} views ·{" "}
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                  })}
                </p> 
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm transition">
                <FiThumbsUp size={15} />
                <span>{likesCount?.toLocaleString() ?? 0}</span>
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm transition">
                <FiThumbsDown size={15} />
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm transition">
                <FiShare2 size={15} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm transition">
                <FiBookmark size={15} />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed">
            <p className={descriptionExpanded ? "" : "line-clamp-2"}>
              {description}
            </p>
            {description?.length > 150 && (
              <button
                onClick={() => setDescriptionExpanded((prev) => !prev)}
                className="text-white font-medium mt-2 hover:text-red-400 transition text-xs"
              >
                {descriptionExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        {/* Right — recommended videos placeholder */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
            Up next
          </h2>

          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-40 aspect-video bg-zinc-800 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                  <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WatchVideo;
