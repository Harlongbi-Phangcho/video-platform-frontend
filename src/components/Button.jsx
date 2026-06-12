import React from "react";

function Button({
  children,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`
        px-5
        py-2
        rounded-full
        bg-red-600
        hover:bg-red-700
        text-white
        font-medium
        transition
        duration-200
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;