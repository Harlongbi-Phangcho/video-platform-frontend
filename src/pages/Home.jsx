import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";



function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const getAllVideos = async () => {
      try {
        const res = await api.get("/videos");
        setVideos(res.data.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getAllVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-5xl animate-spin" />
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      {/* Hero Section */}
      <section className="px-6 py-14 text-center">
        <h1 className="text-5xl font-bold">Watch. Upload. Share.</h1>
        <p className="text-zinc-400 mt-4 text-lg">
          Discover videos from creators around the world
        </p>
        <button className="mt-6 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 transition">
          Explore Videos
        </button>
      </section>
      

      {/* Video Grid */}
      <section className="px-6 pb-10">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <p className="text-xl">No videos found</p>
            <p className="text-sm mt-2">Be the first to upload!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {videos.map((video) => (
              <Card
                key={video._id}
                id={video._id}
                thumbnail={video.thumbnail}
                avatar={video.ownerDetails.avatar}
                title={video.title}
                channelName={video.ownerDetails.username}
                views={video.views}
                uploadedAt={video.updatedAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;