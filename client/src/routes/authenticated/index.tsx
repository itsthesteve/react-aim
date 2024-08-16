import { Navigate, Outlet } from "react-router-dom";
import { getAuthState } from "~/store/auth";

export default function AuthenticatedRoute() {
  const { loading, user } = getAuthState();

  if (loading) {
    console.log("Loading auth...");
    return;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
}
