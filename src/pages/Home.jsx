import React from "react";
import Card from "../components/Card"

function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">

      {/* Hero Section */}
      <section className="px-6 py-14 text-center">

        <h1 className="text-5xl font-bold">
          Watch. Upload. Share.
        </h1>

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

          <Card
            thumbnail="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
            avatar="https://i.pravatar.cc/100"
            title="Build Full Stack YouTube Clone"
            channelName="Code World"
            views="20K"
            uploadedAt="2 days ago"
          />

          <Card
            thumbnail="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            avatar="https://i.pravatar.cc/101"
            title="React Hook Form Complete Guide"
            channelName="Frontend Master"
            views="15K"
            uploadedAt="5 days ago"
          />

          <Card
            thumbnail="https://images.unsplash.com/photo-1516116216624-53e697fedbea"
            avatar="https://i.pravatar.cc/102"
            title="Node.js Authentication Tutorial"
            channelName="Backend Pro"
            views="30K"
            uploadedAt="1 week ago"
          />
        </div>
      </section>
    </div>
  );
}

export default Home;