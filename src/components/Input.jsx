import React, { forwardRef, useId } from "react";

const Input = forwardRef(
  ({ label, type = "text", placeholder, className = "", ...props }, ref) => {
    const id = useId();
    return (
      <div className={`input-container ${className}`}>
        {label && (
          <label htmlFor={id} className="input-label">
            {" "}
            {label}
          </label>
        )}
        <input
         type={type}
          id={id}
          placeholder={placeholder}
          ref={ref}
          className={`input-field ${className}`}
          {...props}
          />
      </div>
    );
  },
);

export default Input;
