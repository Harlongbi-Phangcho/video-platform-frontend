import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../api/axios";
import Card from "../components/Card";
import { FiCalendar, FiUsers, FiVideo } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { FaSpinner } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";

function Profile() {
  const [channel, setChannel] = useState({});
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);

  // get username from URL params — works for viewing any channel
  const { username } = useParams();
 
  // current logged in user — to show edit button if viewing own profile
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const channelRes = await api.get(`/users/c/${username}`)
        const channelData = channelRes.data.data;
        setChannel(channelData);
        
        const videosRes = await api.get(`/videos?userId=${channelData._id}`)
        const videoData = videosRes.data.data;
        setVideos(videoData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-4xl animate-spin" />
        <p className="text-zinc-400">Loading channel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
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

  if (!channel) return null;

  const {
    fullName,
    username: channelUsername,
    avatar,
    coverImage,
    subscriberCount,
    channelsSubscribeToCount,
    createdAt,
  } = channel;

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Cover image */}
      <div className="w-full h-48 md:h-64 bg-zinc-800 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          // gradient fallback if no cover image set
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
          <div className="flex items-end gap-4">
            {/* Avatar with initial fallback */}
            {avatar ? (
              <img
                src={avatar}
                alt={channelUsername}
                className="w-24 h-24 rounded-full object-cover border-4 border-zinc-950"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-600 border-4 border-zinc-950 flex items-center justify-center text-3xl font-bold">
                {fullName?.charAt(0).toUpperCase() ?? "?"}
              </div>
            )}
            <div className="mb-1">
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <p className="text-zinc-400 text-sm">@{channelUsername}</p>
            </div>
          </div>

          {/* Show edit button on own profile, nothing on others */}
          {isOwnProfile && (
            <Link
              to="/settings"
              className="px-6 py-2.5 rounded-full font-semibold text-center text-sm bg-zinc-700 hover:bg-zinc-600 text-white transition"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 text-sm text-zinc-400 mb-8 pb-6 border-b border-zinc-800">
          <span className="flex items-center gap-1.5">
            <FiUsers size={14} className="text-red-500" />
            {subscriberCount?.toLocaleString() ?? 0}{" "}
            {subscriberCount === 1 ? "subscriber" : "subscribers"}
          </span>

          <span className="flex items-center gap-1.5">
            <FiVideo size={14} className="text-red-500" />
            {videos.length} videos
          </span>

          <span className="flex items-center gap-1.5">
            <FiUsers size={14} className="text-zinc-500" />
            {channelsSubscribeToCount?.toLocaleString() ?? 0} subscriptions
          </span>

          <span className="flex items-center gap-1.5">
            <FiCalendar size={14} className="text-red-500" />
            Joined{" "}
            {createdAt &&
              formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Videos grid */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-2">
            <FiVideo size={40} className="text-zinc-700" />
            <p className="text-lg">No videos yet</p>
            {isOwnProfile && (
              <Link
                to="/upload"
                className="mt-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm transition"
              >
                Upload your first video
              </Link>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
              {videos.map((video) => (
                <Card
                  key={video._id}
                  id={video._id}
                  thumbnail={video.thumbnail}
                  avatar={avatar}
                  title={video.title}
                  channelName={channelUsername}
                  views={video.views}
                  uploadedAt={video.updatedAt}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
