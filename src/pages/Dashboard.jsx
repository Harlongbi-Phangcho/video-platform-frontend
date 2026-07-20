import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";
import {
  FiEye,
  FiThumbsUp,
  FiUsers,
  FiVideo,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

function Dashboard() {
  const navigate = useNavigate();

  // stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // videos
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  // delete
  const [deletingId, setDeletingId] = useState(null);

  // toggle publish
  const [togglingId, setTogglingId] = useState(null);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboards/stats");
        setStats(res.data.data);
      } catch (err) {
        toast.error("Failed to load stats");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch Videos 
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/dashboards/videos");
        setVideos(res.data.data ?? []);
      } catch (err) {
        toast.error("Failed to load videos");
      } finally {
        setVideosLoading(false);
      }
    };
    fetchVideos();
  }, []);

  //  Delete Video 
  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    setDeletingId(videoId);
    try {
      await api.delete(`/videos/${videoId}`);   
      toast.success("Video deleted");
      // remove from local state — no re-fetch needed
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      // decrement total videos count in stats
      setStats((prev) =>
        prev ? { ...prev, totalVideos: Math.max(prev.totalVideos - 1, 0) } : prev
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle Publish 
  const handleTogglePublish = async (videoId, currentStatus) => {
    setTogglingId(videoId);
    try {
      await api.patch(`/videos/toggle/publish/${videoId}`);
      // flip isPublish in local state
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublish: !currentStatus } : v
        )
      );
      toast.success(currentStatus ? "Video unpublished" : "Video published");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle publish");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link
            to="/upload"
            className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-sm font-semibold transition"
          >
            + Upload Video
          </Link>
        </div>

        {/* ── Stats row ── */}
        {statsLoading ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <FaSpinner className="animate-spin text-red-500" />
            <span>Loading stats...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Videos",
                value: stats?.totalVideos ?? 0,
                icon: FiVideo,
                color: "text-red-500",
              },
              {
                label: "Total Views",
                value: stats?.totalViews ?? 0,
                icon: FiEye,
                color: "text-blue-400",
              },
              {
                label: "Subscribers",
                value: stats?.totalSubscribers ?? 0,
                icon: FiUsers,
                color: "text-green-400",
              },
              {
                label: "Total Likes",
                value: stats?.totalLikes ?? 0,
                icon: FiThumbsUp,
                color: "text-yellow-400",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-zinc-900 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className={`${color} bg-zinc-800 p-3 rounded-xl`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs">{label}</p>
                  <p className="text-2xl font-bold">
                    {value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Videos table ── */}
        <div className="bg-zinc-900 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Videos</h2>
            <span className="text-zinc-500 text-sm">{videos.length} videos</span>
          </div>

          {videosLoading ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <FaSpinner className="text-red-500 text-3xl animate-spin" />
              <p className="text-zinc-400">Loading videos...</p>
            </div> 
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
              <FiVideo size={40} className="text-zinc-700" />
              <p>No videos uploaded yet</p>
              <Link
                to="/upload"
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm transition"
              >
                Upload your first video
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                    <th className="text-left px-6 py-3">Video</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-center px-4 py-3">Views</th>
                    <th className="text-center px-4 py-3">Likes</th>
                    <th className="text-center px-4 py-3">Date</th>
                    <th className="text-center px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {videos.map((video) => (
                    <tr
                      key={video._id}
                      className="hover:bg-zinc-800/50 transition"
                    >
                      {/* Thumbnail + title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-24 aspect-video object-cover rounded-lg flex-shrink-0"
                          />
                          <div>
                            <p className="font-medium line-clamp-2 max-w-xs">
                              {video.title}
                            </p>
                            <p className="text-zinc-500 text-xs mt-1 line-clamp-1">
                              {video.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Publish status toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() =>
                            handleTogglePublish(video._id, video.isPublish)
                          }
                          disabled={togglingId === video._id}
                          className="flex items-center gap-1.5 mx-auto disabled:opacity-50"
                          title={video.isPublish ? "Click to unpublish" : "Click to publish"}
                        >
                          {togglingId === video._id ? (
                            <FaSpinner className="animate-spin text-zinc-400" size={16} />
                          ) : video.isPublish ? (
                            <FiToggleRight size={22} className="text-green-400" />
                          ) : (
                            <FiToggleLeft size={22} className="text-zinc-500" />
                          )}
                          <span
                            className={`text-xs ${
                              video.isPublish ? "text-green-400" : "text-zinc-500"
                            }`}
                          >
                            {video.isPublish ? "Published" : "Unpublished"}
                          </span>
                        </button>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-4 text-center text-zinc-300">
                        {video.views?.toLocaleString() ?? 0}
                      </td>

                      {/* Likes */}
                      <td className="px-4 py-4 text-center text-zinc-300">
                        {video.likeCount?.toLocaleString() ?? 0}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-center text-zinc-500 text-xs whitespace-nowrap">
                        {formatDistanceToNow(new Date(video.createdAt), {
                          addSuffix: true,
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit — navigates to edit page */}
                          <button
                            onClick={() => navigate(`/edit-video/${video._id}`)}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                            title="Edit video"
                          >
                            <FiEdit2 size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(video._id)}
                            disabled={deletingId === video._id}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition disabled:opacity-50"
                            title="Delete video"
                          >
                            {deletingId === video._id ? (
                              <FaSpinner size={14} className="animate-spin" />
                            ) : (
                              <FiTrash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;