import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/auth/hook";

export default function ProtectedRoutes() {
  const { loading, user } = useAuthContext();
  console.log("Protected route", loading, user);
  if (loading) {
    return;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
}
