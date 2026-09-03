import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";
import { FiList, FiTrash2 } from "react-icons/fi";
import Card from "../components/Card";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function PlaylistPage() {
  const { playlistId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/playlists/${playlistId}`);
        setPlaylist(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load playlist.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  const handleRemoveVideo = async (videoId) => {
    setRemovingId(videoId);
    try {
      await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      toast.success("Video removed from playlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove video");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-4xl animate-spin" />
        <p className="text-zinc-400">Loading playlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-red-400 text-lg">{error}</p>
        <Link to="/" className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition">
          Go Home
        </Link>
      </div>
    );
  }

  if (!playlist) return null;

  const isOwner = currentUser?.username === playlist.owner?.username;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Playlist header */}
        <div className="flex items-start gap-4">
          <div className="bg-zinc-800 p-4 rounded-xl">
            <FiList size={32} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{playlist.name}</h1>
            <p className="text-zinc-400 text-sm mt-1">{playlist.description}</p>
            <p className="text-zinc-500 text-xs mt-2">
              {playlist.videos?.length ?? 0} videos ·{" "}
              <Link
                to={`/channel/${playlist.owner?.username}`}
                className="hover:text-red-400 transition"
              >
                @{playlist.owner?.username}
              </Link>
            </p>
          </div>
        </div>

        {/* Videos */}
        {playlist.videos?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-zinc-500">
            <FiList size={40} className="text-zinc-700" />
            <p className="text-lg">No videos in this playlist</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {playlist.videos?.map((video) => (
              <div key={video._id} className="relative group">
                <Card
                  id={video._id}
                  thumbnail={video.thumbnail}
                  avatar={video.owner?.avatar}
                  title={video.title}
                  channelName={video.owner?.username}
                  views={video.views}
                  uploadedAt={video.updatedAt}
                />
                {/* Remove button — owner only */}
                {isOwner && (
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    disabled={removingId === video._id}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    title="Remove from playlist"
                  >
                    {removingId === video._id ? (
                      <FaSpinner size={12} className="animate-spin" />
                    ) : (
                      <FiTrash2 size={12} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistPage;