import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Strict mode is messing with the websocket as it opens/closes too quickly
// TODO: Figure that out and reinstate strict mode
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  // </React.StrictMode>,
  <App />
);
