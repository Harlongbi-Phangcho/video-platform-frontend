import React from "react";

function Card({ thumbnail, title, channelName, views, uploadedAt, avatar }) {
  return (
    // create card to show diffrent video
    <div className="w-full cursor-pointer rounded-xl overflow-hidden hover:bg-zinc-900 transition p-2">
      {/* thumbnail */}
      <div className="aspect-video rounded-xl overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* content */}
      <div className="flex mt-3 gap-3">
        
      {/* avatar */}
      <img
        src={avatar}
        alt={channelName}
        className="w-10 h-10 rounded-full object-cover"
      />

      {/* Video info */}
        <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-white line-clamp-2">{title}</h3>
            <p className="text-sm text-zinc-400">{channelName}</p>
            <div className="text-sm text-zinc-400 flex gap-2">
                <span>{views} views</span>
                <span className="mx-1">•</span>
                <span>{uploadedAt}</span>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
