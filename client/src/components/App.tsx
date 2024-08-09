import { Outlet } from "react-router-dom";
import { AuthProvider } from "../context/auth/context";

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
