import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";
import { FiX, FiList, FiCheck, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function AddToPlaylist({ videoId, onClose }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null); // which playlist is being added to
  const [addedIds, setAddedIds] = useState(new Set()); // which playlists already have this video

  // fetch user's playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/playlists/user/${currentUser._id}`);
        setPlaylists(res.data.data ?? []);

        // check which playlists already contain this video
        const alreadyAdded = new Set(
          res.data.data
            .filter((p) =>
              p.videos?.some((v) =>
                typeof v === "object" ? v._id === videoId : v === videoId
              )
            )
            .map((p) => p._id)
        );
        setAddedIds(alreadyAdded);
      } catch (err) {
        toast.error("Failed to load playlists");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [currentUser._id, videoId]);

  // add video to playlist
  const handleAdd = async (playlistId) => {
    setAddingId(playlistId);
    try {
      await api.patch(`/playlists/add/${videoId}/${playlistId}`);
      setAddedIds((prev) => new Set([...prev, playlistId]));
      toast.success("Added to playlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to playlist");
    } finally {
      setAddingId(null);
    }
  };

  // remove video from playlist
  const handleRemove = async (playlistId) => {
    setAddingId(playlistId);
    try {
      await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(playlistId);
        return next;
      });
      toast.success("Removed from playlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove from playlist");
    } finally {
      setAddingId(null);
    }
  };

  return (
    // backdrop
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={onClose} // close when clicking backdrop
    >
      <div
        className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800 space-y-4"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from firing inside modal
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Save to playlist</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Playlist list */}
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <FaSpinner className="text-red-500 animate-spin" />
            <p className="text-zinc-400 text-sm">Loading playlists...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <FiList size={32} className="mx-auto text-zinc-700 mb-2" />
            <p className="text-sm">No playlists yet</p>
            <p className="text-xs mt-1">Create one on your profile page</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {playlists.map((playlist) => {
              const isAdded = addedIds.has(playlist._id);
              const isLoading = addingId === playlist._id;

              return (
                <button
                  key={playlist._id}
                  onClick={() =>
                    isAdded
                      ? handleRemove(playlist._id)
                      : handleAdd(playlist._id)
                  }
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition disabled:opacity-50 ${
                    isAdded
                      ? "bg-red-600/20 border border-red-600/40"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    {/* Playlist thumbnail or icon */}
                    <div className="w-10 h-7 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                      {playlist.videos?.[0]?.thumbnail ? (
                        <img
                          src={playlist.videos[0].thumbnail}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiList size={12} className="text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {playlist.videos?.length ?? 0} videos
                      </p>
                    </div>
                  </div>

                  {/* Status icon */}
                  {isLoading ? (
                    <FaSpinner size={14} className="animate-spin text-zinc-400" />
                  ) : isAdded ? (
                    <FiCheck size={16} className="text-red-400" />
                  ) : (
                    <FiPlus size={16} className="text-zinc-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddToPlaylist;