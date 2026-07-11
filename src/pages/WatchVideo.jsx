import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
  FiBookmark,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Button, Input } from "../components/index";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

function WatchVideo() {
  const { videoId } = useParams(); // get videoId from URL params
 const currentUser = useSelector((state) => state.auth.user); // get current user from Redux store
  // video data
  const [video, setVideo] = useState(null);

  // like state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // page loading / error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // description expand toggle
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // comments state
  const [comments, setComments] = useState([]); // current loaded comments
  const [commentsPage, setCommentsPage] = useState(1); // current page number
  const [hasMore, setHasMore] = useState(true); // whether more pages exist
  const [commentsLoading, setCommentsLoading] = useState(false); // loading next page
  const [commentSubmitting, setCommentSubmitting] = useState(false); // posting a comment
  const COMMENTS_LIMIT = 10; // comments per page

  //edit comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // subscription state
  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // comment form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch Comment
  // append: true = add to existing list (load more), false = replace list (refresh)
  const fetchComments = async (page = 1, append = false) => {
    setCommentsLoading(true);
    try {
      const res = await api.get(
        `/comments/${videoId}?page=${page}&limit=${COMMENTS_LIMIT}`,
      );
      const newComments = res.data.data;

      // if append, spread previous comments + new ones; otherwise replace
      setComments((prev) => (append ? [...prev, ...newComments] : newComments));

      // if API returned fewer than limit, there are no more pages
      setHasMore(newComments.length === COMMENTS_LIMIT);
    } catch (error) {
      console.error(error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Fetch Video
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/videos/${videoId}`);
        const videoData = res.data.data;
        setVideo(videoData);

        setLiked(videoData?.isLike ?? false);
        setLikesCount(videoData?.likesCount ?? 0);

        setSubscribed(videoData?.isSubscribed ?? false);
        setSubscribersCount(videoData?.subscribersCount ?? 0);

        // fetch first page of comments alongside video
        await fetchComments(1);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load video.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  // Load More Comments
  const handleLoadMore = () => {
    const nextPage = commentsPage + 1;
    setCommentsPage(nextPage);
    fetchComments(nextPage, true); // append = true so existing comments stay
  };

  // update count immediately, revert on error
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

  // Toggle Subscription
  // Math.max prevents subscriber count going below 0
  const handleSubscribe = async () => {
    if (!video?.owner?._id) return;
    setSubscriptionLoading(true);
    try {
      const res = await api.post(`/subscriptions/c/${video.owner._id}`);
      const subscribedNow = res.data.data.subscribed;
      setSubscribed(subscribedNow);
      setSubscribersCount((prev) =>
        subscribedNow ? prev + 1 : Math.max(prev - 1, 0),
      );
      toast.success(
        subscribedNow ? "Subscribed successfully" : "Unsubscribed successfully",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update subscription",
      );
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Post Comment
  const onCommentSubmit = async (data) => {
    setCommentSubmitting(true);
    try {
      await api.post(`/comments/${videoId}`, { content: data.content });
      toast.success("Comment added");
      reset(); // clear the input field

      // reset to page 1 and refresh comment list so new comment appears at top
      setCommentsPage(1);
      fetchComments(1, false); // append = false → replace list

      // optimistically increment comment count in video state
      setVideo((prev) =>
        prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev,
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  // start editing comment
  const handleEditStart = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  // cancel editing
  const handleEditCancel = (comment) => {
    setEditingCommentId(null);
    setEditContent("");
  };

  //handle submit
  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    setEditSubmitting(true);
    try {
      await api.patch(`/comments/c/${commentId}`, { content: editContent });
      toast.success("Comment updated");

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editContent } : c,
        ),
      );

      setEditingCommentId(null);
      setEditContent("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update comment");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteCommentId = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await api.delete(`/comments/c/${commentId}`);
      toast.success("Comment deleted");
      setComments((prev) => prev.filter((c) => c._id !== commentId));

      setVideo((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: Math.max((prev.commentsCount || 1) - 1, 0),
            }
          : prev,
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  //Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3">
        <FaSpinner className="text-red-500 text-4xl animate-spin" />
        <p className="text-zinc-400">Loading video...</p>
      </div>
    );
  }

  //  Error State
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
        
        {/* ── Left column: video + details ── */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            <video
              src={videoFile}
              poster={video.thumbnail} // shows thumbnail before user hits play
              controls
              className="w-full h-full object-contain"
            />
          </div>

          {/* Video title */}
          <h1 className="text-xl font-semibold mt-4 leading-snug">{title}</h1>

          {/* Meta row: channel info + action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
            <div className="flex items-center gap-3">
              {/* Owner avatar with initial fallback */}
              <Link to={`/channel/${owner?.username}`}>
                {owner?.avatar ? (
                  <img
                    src={owner?.avatar}
                    alt={owner?.username}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm border border-zinc-700">
                    {owner?.username?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
              </Link>

              <div>
                {/* Channel link */}
                <Link
                  to={`/channel/${owner?.username}`}
                  className="text-sm font-medium hover:text-red-400 transition"
                >
                  {owner?.username}
                </Link>

                {/* Subscriber count — plural handled */}
                <p className="text-xs text-zinc-500 mt-0.5">
                  {subscribersCount.toLocaleString()}{" "}
                  {subscribersCount === 1 ? "subscriber" : "subscribers"}
                </p>

                {/* View count + upload time */}
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <FiEye size={12} />
                  {views?.toLocaleString()} views ·{" "}
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Subscribe / Unsubscribe button */}
              <button
                onClick={handleSubscribe}
                disabled={subscriptionLoading}
                className={`ml-2 px-4 py-1 rounded-full text-sm font-medium transition
                  ${subscriptionLoading ? "opacity-60 cursor-not-allowed" : ""}
                  ${
                    subscribed
                      ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
              >
                {/* Show "..." while request is in flight */}
                {subscriptionLoading
                  ? "..."
                  : subscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </button>
            </div>

            {/* Like / dislike / share / save buttons */}
            <div className="flex items-center gap-2">
              {/* Like button — red when liked, dark when not */}
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

          {/* Description — clamped to 2 lines, expandable */}
          <div className="mt-4 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed">
            <p className={descriptionExpanded ? "" : "line-clamp-2"}>
              {description}
            </p>
            {/* Only show toggle if description is long enough to clamp */}
            {description?.length > 150 && (
              <button
                onClick={() => setDescriptionExpanded((prev) => !prev)}
                className="text-white font-medium mt-2 hover:text-red-400 transition text-xs"
              >
                {descriptionExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* ── Comments section ── */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Comments ({video.commentsCount ?? comments.length})
            </h3>

            {/* Add comment form */}
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
              {/* Disabled while posting to prevent duplicate submissions */}
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

            {/* Scrollable comments list */}
            <div className="h-96 overflow-y-auto pr-2 space-y-5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {/* Empty state */}
              {comments.length === 0 && !commentsLoading ? (
                <p className="text-zinc-500">No comments yet.</p>
              ) : (
                <>
                  {/* Comment list */}
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      {/* Commenter avatar with initial fallback */}
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
                        {/* Username + relative time */}
                        <div className="flex items-center justify-between gap-2">
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

                          {/* Edit/delete — only shown to comment owner */}
                          {currentUser?.username ===
                            comment.owner?.username && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                               {editingCommentId !== comment._id && (
                                <>
                                <button
                                    onClick={() => handleEditStart(comment)}
                                    className="text-zinc-500 hover:text-white transition p-1"
                                    title="Edit comment"
                                  >
                                    <FiEdit2 size={13} />
                                  </button>
                                   <button
                                    onClick={() => handleDeleteCommentId(comment._id)}
                                    disabled={deletingCommentId === comment._id}
                                    className="text-zinc-500 hover:text-red-400 transition p-1 disabled:opacity-50"
                                    title="Delete comment"
                                  >
                                    {deletingCommentId === comment._id ? (
                                      <FaSpinner size={13} className="animate-spin" />
                                    ) : (
                                      <FiTrash2 size={13} />
                                    )}
                                  </button>
                                </>
                               )}
                            </div>
                          )}
                        </div>

                         {/* Comment content or edit input */}
                        {editingCommentId === comment._id ? (
                          // edit mode — show input with save/cancel
                          <div className="mt-1 flex gap-2">
                            <input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-red-500 transition"
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditSubmit(comment._id)}
                              disabled={editSubmitting}
                              className="text-green-400 hover:text-green-300 transition disabled:opacity-50 p-1"
                              title="Save"
                            >
                              {editSubmitting ? (
                                <FaSpinner size={13} className="animate-spin" />
                              ) : (
                                <FiCheck size={16} />
                              )}
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="text-zinc-400 hover:text-white transition p-1"
                              title="Cancel"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          // normal mode — show comment text
                          <p className="text-zinc-300 mt-1 text-sm">{comment.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Load more button — hidden when no more pages or currently loading */}
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

                  {/* Spinner while fetching next page */}
                  {commentsLoading && comments.length > 0 && (
                    <div className="flex justify-center py-3">
                      <FaSpinner className="text-red-500 animate-spin" />
                    </div>
                  )}

                  {/* End of comments message — shown when all pages loaded */}
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


        {/* ── Right column: recommended videos placeholder ── */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
            Up next
          </h2>
          {/* Skeleton placeholders — replace with real data when API supports it */}
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
