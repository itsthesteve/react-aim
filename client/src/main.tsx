import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatRoute from "./routes/chat";
import "./index.css";
import SignIn from "./components/SignIn";
import { AuthProvider } from "./context/auth/context";
import SignUp from "./routes/sign-up";

const router = createBrowserRouter([
  {
    path: "/chat",
    element: <ChatRoute />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/",
    element: <SignIn />,
  },
]);

// Strict mode is messing with the websocket as it opens/closes too quickly
// TODO: Figure that out and reinstate strict mode
// <React.StrictMode>
ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
