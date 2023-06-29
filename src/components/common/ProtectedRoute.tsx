import { Navigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import React from "react";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const authToken = useAuthStore((state) => state.authToken);

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
