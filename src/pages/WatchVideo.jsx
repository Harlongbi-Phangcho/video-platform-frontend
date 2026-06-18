import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
  FiBookmark,
  FiEye,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Button, Input } from "../components/index";
import { useForm } from "react-hook-form";

function WatchVideo() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const COMMENTS_LIMIT = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  
  const fetchComments = async (page = 1, append = false) => {
    setCommentsLoading(true);

    try {
      const res = await api.get(`/comments/${videoId}?page=${page}&limit=${COMMENTS_LIMIT}`);

      const newComments = res.data.data;

      setComments((prev) => (append ? [...prev, ...newComments] : newComments));
      setHasMore(newComments.length === COMMENTS_LIMIT);

    } catch (error) {
      console.error(error);
    } finally {
      setCommentsLoading(false);
    }
  };

  
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/videos/${videoId}`);
        setVideo(res.data.data);
        setLiked(res.data.data?.isLike);
        setLikesCount(res.data.data?.likesCount ?? 0);

        await fetchComments(1); // start at page 1
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load video.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);


  const handleLoadMore = () => {
    const nextPage = commentsPage + 1;
    setCommentsPage(nextPage);
    fetchComments(nextPage, true); // append to existing list
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/likes/toggle/v/${videoId}`);
      const likedNow = res.data.data.liked;

      setLiked(likedNow);
      setLikesCount((prev) => (likedNow ? prev + 1 : prev - 1));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to like the video.");
    }
  };

  const onCommentSubmit = async (data) => {
    setCommentSubmitting(true);
    try {
      await api.post(`/comments/${videoId}`, { content: data.content });
      toast.success("Comment added");

      reset();
      setCommentsPage(1);
      fetchComments(1, false); // refresh from top
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-4xl animate-spin" />
        <p className="text-zinc-400">Loading video...</p>
      </div>
    );
  }

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

  if (!video) return null;

  const { videoFile, title, description, views, createdAt, owner } = video;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left — video + details */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            <video
              src={videoFile}
              poster={video.thumbnail}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold mt-4 leading-snug">{title}</h1>

          {/* Meta row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
            {/* Channel info */}
            <div className="flex items-center gap-3">
              {owner?.avatar ? (
                <img
                  src={owner.avatar}
                  alt={owner.username}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm border border-zinc-700">
                  {owner?.username?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <Link
                  to={`/channel/${owner?.username}`}
                  className="text-sm font-medium hover:text-red-400 transition"
                >
                  {owner?.username}
                </Link>
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <FiEye size={12} />
                  {views?.toLocaleString()} views ·{" "}
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm ${
                  liked
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <FiThumbsUp size={15} />
                <span>{likesCount?.toLocaleString() ?? 0}</span>
              </Button>
              <Button className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm">
                <FiThumbsDown size={15} />
              </Button>
              <Button className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm">
                <FiShare2 size={15} />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm">
                <FiBookmark size={15} />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed">
            <p className={descriptionExpanded ? "" : "line-clamp-2"}>
              {description}
            </p>
            {description?.length > 150 && (
              <button
                onClick={() => setDescriptionExpanded((prev) => !prev)}
                className="text-white font-medium mt-2 hover:text-red-400 transition text-xs"
              >
                {descriptionExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* Add Comments */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Comments ({video.commentsCount})
            </h3>

            <form
              onSubmit={handleSubmit(onCommentSubmit)}
              className="flex gap-3"
            >
              <Input
                placeholder="Add a comment..."
                {...register("content", {
                  required: "Comment cannot be empty",
                  minLength: { value: 1, message: "Comment cannot be empty" },
                })}
              />
              <Button
                type="submit"
                disabled={commentSubmitting}
                className="py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition rounded-full font-semibold text-white"
              >
                {commentSubmitting ? "Posting..." : "Comment"}
              </Button>
            </form>

            {errors.content && (
              <p className="text-red-400 text-xs">{errors.content.message}</p>
            )}

            {/* show comments */}
            {/* Scrollable comments container */}
            <div className="h-96 overflow-y-auto pr-2 space-y-5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {comments.length === 0 && !commentsLoading ? (
                <p className="text-zinc-500">No comments yet.</p>
              ) : (
                <>
                  {comments.map((comment) => {
                    return (
                      <div key={comment._id} className="flex gap-3">
                        {comment.owner?.avatar ? (
                          <img
                            src={comment.owner.avatar}
                            alt={comment.owner.username}
                            className="w-10 h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {comment.owner?.username?.charAt(0).toUpperCase() ??
                              "?"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">
                              {comment.owner?.username}
                            </h4>
                            <span className="text-xs text-zinc-500">
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                {
                                  addSuffix: true,
                                },
                              )}
                            </span>
                          </div>
                          <p className="text-zinc-300 mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Load more comments */}
                  {hasMore && !commentsLoading && (
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleLoadMore}
                        className="bg-zinc-800 text-xs py-2 hover:bg-zinc-700"
                      >
                        Load more comments...
                      </Button>
                    </div>
                  )}

                  {/* Spinner at the bottom while loading next page */}
                  {commentsLoading && comments.length > 0 && (
                    <div className="flex justify-center py-3">
                      <FaSpinner className="text-red-500 animate-spin" />
                    </div>
                  )}

                  {/* End of comments message */}
                  {!hasMore && comments.length > 0 && (
                    <p className="text-center text-zinc-600 text-xs py-2">
                      No more comments
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right — recommended videos placeholder */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
            Up next
          </h2>
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-40 aspect-video bg-zinc-800 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                  <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WatchVideo;
