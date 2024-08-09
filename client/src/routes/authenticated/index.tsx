import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../store";
import { AuthState } from "../../store/auth";

export default function AuthenticatedRoute() {
  const { loading, user } = useSelector<RootState, AuthState>((state) => state.auth);

  if (loading) {
    console.log("Loading auth...");
    return;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
}
