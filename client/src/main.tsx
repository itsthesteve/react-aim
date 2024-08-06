import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/auth/context";
import "./index.css";
import ProtectedRoutes from "./routes/protected";

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
        element: <ProtectedRoutes />,
        children: [
          {
            path: "/chat",
            async lazy() {
              const { chatRouteLoader, ChatRoute } = await import("./routes/chat");
              return {
                loader: chatRouteLoader,
                Component: ChatRoute,
              };
            },
          },
          {
            path: "/create-room",
            async lazy() {
              const { CreateRoom, createRoomLoader } = await import("./routes/create-room");
              return { loader: createRoomLoader, Component: CreateRoom };
            },
          },
        ],
      },
      {
        path: "",
        async lazy() {
          const { SignIn } = await import("./components/SignIn");
          return {
            Component: SignIn,
          };
        },
      },
      {
        path: "/sign-up",
        async lazy() {
          const { SignUp } = await import("./routes/sign-up");
          return {
            Component: SignUp,
          };
        },
      },
    ],
  },
]);

// Strict mode is messing with the websocket as it opens/closes too quickly
// TODO: Figure that out and reinstate strict mode
// <React.StrictMode>
ReactDOM.createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
