import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";
import { FiList, FiPlus, FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

function Playlists({ userId, isOwnProfile }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // create playlist modal
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // delete
  const [deletingId, setDeletingId] = useState(null);

  // Fetch playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/playlists/user/${userId}`);
        setPlaylists(res.data.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [userId]);

  // Create playlist 
  const handleCreate = async () => {
    if (!createName.trim()) {
      toast.error("Playlist name is required");
      return;
    }
    if (!createDescription.trim()) {
      toast.error("Playlist description is required");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/playlists", {
        name: createName,
        description: createDescription,
      });
      setPlaylists((prev) => [res.data.data, ...prev]);
      setShowCreate(false);
      setCreateName("");
      setCreateDescription("");
      toast.success("Playlist created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  // Delete playlist
  const handleDelete = async (playlistId) => {
    if (!window.confirm("Delete this playlist?")) return;
    setDeletingId(playlistId);
    try {
      await api.delete(`/playlists/${playlistId}`);
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      toast.success("Playlist deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete playlist");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <FaSpinner className="text-red-500 text-3xl animate-spin" />
        <p className="text-zinc-400">Loading playlists...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-400 py-20">{error}</p>;
  }

  return (
    <div className="space-y-6 pb-10">

      {/* Create button — own profile only */}
      {isOwnProfile && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-sm font-semibold transition"
          >
            <FiPlus size={16} />
            New Playlist
          </button>
        </div>
      )}

      {/* Create playlist modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md space-y-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Playlist</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Name</label>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="My favourite videos"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Description</label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="A collection of my favourite videos"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500 transition resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-sm font-semibold transition"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-zinc-500">
          <FiList size={40} className="text-zinc-700" />
          <p className="text-lg">No playlists yet</p>
          {isOwnProfile && (
            <p className="text-sm">Create your first playlist above</p>
          )}
        </div>
      ) : (
        // Playlist grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition group"
            >
              {/* Thumbnail — first video's thumbnail or placeholder */}
              <Link to={`/playlist/${playlist._id}`}>
                <div className="aspect-video bg-zinc-800 overflow-hidden relative">
                  {playlist.videos?.[0]?.thumbnail ? (
                    <img
                      src={playlist.videos[0].thumbnail}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiList size={32} className="text-zinc-600" />
                    </div>
                  )}
                  {/* Video count badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                    {playlist.videos?.length ?? 0} videos
                  </div>
                </div>
              </Link>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/playlist/${playlist._id}`}>
                    <p className="font-medium text-sm line-clamp-1 hover:text-red-400 transition">
                      {playlist.name}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">
                      {playlist.description}
                    </p>
                  </Link>

                  {/* Delete button — own profile only */}
                  {isOwnProfile && (
                    <button
                      onClick={() => handleDelete(playlist._id)}
                      disabled={deletingId === playlist._id}
                      className="text-zinc-500 hover:text-red-400 transition flex-shrink-0 disabled:opacity-50"
                      title="Delete playlist"
                    >
                      {deletingId === playlist._id ? (
                        <FaSpinner size={13} className="animate-spin" />
                      ) : (
                        <FiTrash2 size={13} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlists;