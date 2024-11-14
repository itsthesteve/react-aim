import { CSSProperties, ReactNode, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDraggable, usePresence } from "~/hooks";
import { AppDispatch } from "~/store";
import { logoutAction } from "~/store/auth/sign-in";
import styles from "./styles.module.css";

interface XPWindowProps {
  children: ReactNode;
  title: string;
  statusBar?: ReactNode;
  className?: string;
}

export default function XPWindow({ children, statusBar, title, className }: XPWindowProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const { x, y } = useDraggable(elRef);
  const dispatch = useDispatch() as AppDispatch;
  const presenceLogout = usePresence();
  const navigate = useNavigate();

  const logout = async () => {
    presenceLogout();
    await dispatch(logoutAction());
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{ "--x": x + "px", "--y": y + "px" } as CSSProperties}
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
