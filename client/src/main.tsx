import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import SignIn from "./components/SignIn";
import { AuthProvider } from "./context/auth/context";
import "./index.css";
import ChatRoute from "./routes/chat";
import SignUp from "./routes/sign-up";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        path: "/chat",
        element: <ChatRoute />,
      },
      {
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        path: "",
        element: <SignIn />,
      },
    ],
  },
]);

// Strict mode is messing with the websocket as it opens/closes too quickly
// TODO: Figure that out and reinstate strict mode
// <React.StrictMode>
ReactDOM.createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
