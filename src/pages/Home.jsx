import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../api/axios";
import { FaSpinner } from "react-icons/fa";


function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllVideos = async () => {
      try {
        const res = await api.get("/videos");
        setVideos(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getAllVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <FaSpinner className="text-red-500 text-5xl animate-spin" />
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  console.log(videos)
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

      {/* Categories */}
      <section className="px-8 mb-8">
        <div className="flex gap-3 overflow-x-auto">
          {[
            "All",
            "Music",
            "Gaming",
            "Education",
            "Coding",
            "Sports",
            "News",
          ].map((item) => (
            <button
              key={item}
              className="px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 whitespace-nowrap"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Video Grid */}
      <section className="px-6 pb-10">
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
      </section>
    </div>
  );
}

export default Home;
