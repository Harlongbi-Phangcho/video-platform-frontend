import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { api } from "../api/axios";
import Card from "../components/Card";

function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 10;

  const fetchLikedVideos = async (pageNum= 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await api.get(`/likes/videos?page=${pageNum}&limit=${LIMIT}`);
        const videoData = res.data.data;
        setVideos((prevVideos) => append ? [...prevVideos, ...videoData] : videoData);
        setHasMore(videoData.length === LIMIT);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load liked videos.");
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos(1);
  }, []);

const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLikedVideos(nextPage, true);
  }


  

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <FaSpinner className="text-red-500 text-3xl animate-spin" />
        <p className="text-zinc-400">Loading liked videos...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-400 py-20">{error}</p>;
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2 text-zinc-500">
        <FiHeart size={40} className="text-zinc-700" />
        <p className="text-lg">No liked videos yet</p>
        <p className="text-sm">Videos you like will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map((video) => (
          <Card
            key={video._id}
            id={video._id}
            thumbnail={video.thumbnail}
            avatar={video.ownerDetails?.avatar}
            title={video.title}
            channelName={video.ownerDetails?.username}
            views={video.views}
            uploadedAt={video.updatedAt}
          />
        ))}
      </div>

       {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore && <FaSpinner className="animate-spin text-red-500" />}
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

       {/* End message */}
      {!hasMore && videos.length > 0 && (
        <p className="text-center text-zinc-600 text-sm">
          No more liked videos
        </p>
      )}
    </div>
  );
  }


export default LikedVideos;
