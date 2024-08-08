import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/auth/hook";

export default function ProtectedRoutes() {
  const { loading, user } = useAuthContext();

  if (loading) {
    return;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
}
