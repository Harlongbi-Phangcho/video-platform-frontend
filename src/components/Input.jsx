import React, { forwardRef, useId } from "react";

const Input = forwardRef(
  ({ label, type = "text", placeholder, className = "", ...props }, ref) => {
    const id = useId();
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            {" "}
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
           ${className}`}
          {...props}
        />
      </div>
    );
  },
);

export default Input;
