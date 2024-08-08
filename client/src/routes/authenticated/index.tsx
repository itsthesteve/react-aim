import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/auth/hook";

export default function AuthenticatedRoute() {
  const { loading, user } = useAuthContext();

  if (loading) {
    return;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
}
