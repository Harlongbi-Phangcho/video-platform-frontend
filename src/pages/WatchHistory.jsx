import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import Card from "../components/Card";


function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/history");
        setHistory(res.data.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <FaSpinner className="text-red-500 text-3xl animate-spin" />
        <p className="text-zinc-400">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-400 py-20">{error}</p>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2 text-zinc-500">
        <FiClock size={40} className="text-zinc-700" />
        <p className="text-lg">No watch history yet</p>
        <p className="text-sm">Videos you watch will appear here</p>
      </div>
    );
  }

  

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
      {history.map((video) => (
        <Card
          key={video._id}
          id={video._id}
          thumbnail={video.thumbnail}
          avatar={video.owner?.avatar}
          title={video.title}
          channelName={video.owner?.username}
          views={video.views}
          uploadedAt={video.updatedAt}
        />
      ))}
    </div>
  );
}

export default WatchHistory;