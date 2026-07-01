import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Card from "../components/Card";

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 12;

  // reset and fetch fresh results whenever query changes
  useEffect(() => {
    if (!query.trim()) return;
    setVideos([]);
    setPage(1);
    setHasMore(true);
    fetchVideos(1, false);
  }, [query]);

  const fetchVideos = async (pageNum = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/videos`, {
        params: {
          query,
          page: pageNum,
          limit: LIMIT,
        },
      });
      const newVideos = res.data.data ?? [];
      setVideos((prev) => (append ? [...prev, ...newVideos] : newVideos));
      setHasMore(newVideos.length === LIMIT);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed.");
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(nextPage, true);
  };

  // ── Empty query state ──
  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <FiSearch size={48} className="text-zinc-700" />
        <p className="text-lg">Search for videos</p>
      </div>
    );
  }

  // ── Loading state (first load only) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-4xl animate-spin" />
        <p className="text-zinc-400">Searching...</p>
      </div>
    );
  }

  // ── Error state ──
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Result header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold">
            Results for{" "}
            <span className="text-red-400">"{query}"</span>
          </h1>
          {videos.length > 0 && (
            <p className="text-zinc-500 text-sm mt-1">
              {videos.length} video{videos.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {/* No results */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
            <FiSearch size={48} className="text-zinc-700" />
            <p className="text-lg">No videos found for "{query}"</p>
            <p className="text-sm">Try different keywords</p>
            <Link
              to="/"
              className="mt-2 px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition"
            >
              Browse all videos
            </Link>
          </div>
        ) : (
          <>
            {/* Video grid */}
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
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore && (
                    <FaSpinner className="animate-spin text-red-500" />
                  )}
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}

            {/* End of results */}
            {!hasMore && videos.length > 0 && (
              <p className="text-center text-zinc-600 text-sm mt-10">
                No more results for "{query}"
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Search;