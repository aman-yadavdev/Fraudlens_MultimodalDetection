import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../api/client";

/**
 * Redirects to /login with returnUrl if user is not logged in.
 * Use for routes that require authentication (e.g. /result, /dashboard).
 */
export default function ProtectedRoute({ children }) {
	const location = useLocation();
	const token = getToken();

	if (!token) {
		const returnUrl = location.pathname + location.search;
		return <Navigate to={returnUrl ? `/login?redirect=${encodeURIComponent(returnUrl)}` : "/login"} replace state={{ from: location }} />;
	}

	return children;
}
