import { ReactNode, useRef } from "react";
import { useDraggable } from "~/hooks/useDraggable";
import styles from "./styles.module.css";

interface XPWindowProps {
  children: ReactNode;
  title: string;
  statusBar?: ReactNode;
  className?: string;
}

export default function XPWindow({ children, statusBar, title, className }: XPWindowProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  // TODO: Not all routes will have a room, either move the loader to the
  // root, or something else.
  // const navigate = useNavigate();
  // const sendLogout = useBeacon();
  const { x, y } = useDraggable(elRef);

  const logout = () => alert("todo");

  // const logout = async () => {
  //   sendLogout();
  //   await fetch("/api/auth/logout", {
  //     method: "POST",
  //     credentials: "include",
  //   });

  //   navigate("/", { replace: true });
  // };

  return (
    <div
      style={{ "--x": x + "px", "--y": y + "px" }}
      className={`window grid ${className ? className : ""} ${styles.windowContainer}`}
      ref={(el) => (elRef.current = el)}>
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Help" onClick={() => alert("todo")}></button>
          <button aria-label="Close" onClick={logout}></button>
        </div>
      </div>
      <div className="window-body my-0 grid">{children}</div>
      {statusBar ? (
        <footer className="status-bar mx-0 px-1">
          <div className="flex">{statusBar}</div>
        </footer>
      ) : null}
    </div>
  );
}
