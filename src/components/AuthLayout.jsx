import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

function AuthLayout({ children, authentication = true }) {

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (authentication && !isAuthenticated) {
    return (
        <Navigate to="/login" />
    )
  }

  if (!authentication && isAuthenticated) {
    return (
        <Navigate to="/" />
    )
  }

  return children
}

export default AuthLayout;
