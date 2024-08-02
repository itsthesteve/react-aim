import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatRoute from "./routes/chat";
import "./index.css";
import SignIn from "./components/SignIn";

const router = createBrowserRouter([
  {
    path: "/chat",
    element: <ChatRoute />,
  },
  {
    path: "/",
    element: <SignIn />,
  },
]);

// Strict mode is messing with the websocket as it opens/closes too quickly
// TODO: Figure that out and reinstate strict mode
// <React.StrictMode>
ReactDOM.createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
