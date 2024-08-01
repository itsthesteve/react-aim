import { memo, useCallback, useEffect, useState } from "react";
import styles from "./style.module.css";

interface Props {
  children: string;
  listener: CallableFunction;
}

function KeyboardSpan({ children, listener }: Props) {
  // If the trap has been set and we're waiting for a command
  const [waiting, setWaiting] = useState(false);

  const keyUpListener = useCallback(
    (e: KeyboardEvent) => {
      if (!children) {
        return;
      }

      // If only the alt key was tapped and not held in combination
      if (e.code.startsWith("Alt") && !e.altKey) {
        console.log("Waiting for command...");
        setWaiting(true);

        window.addEventListener(
          "keydown",
          (e) => {
            const commandChar = children.charAt(0).toLowerCase();
            const cleaned = e.code.toLowerCase().replace("key", "");

            if (cleaned === commandChar) {
              console.log("Firing listener!");

              e.preventDefault();
              setWaiting(false);
              listener();

              return false;
            } else {
              // Cancel the waiting phase as another key was pressed, i.e. enter
              setWaiting(false);
              return true;
            }
          },
          { once: true }
        );
      }
    },
    [children, listener]
  );

  useEffect(() => {
    if (typeof children !== "string") {
      console.warn("KeyboardSpan children must be strings");
      return;
    }

    window.addEventListener("keyup", keyUpListener);

    return () => {
      window.removeEventListener("keyup", keyUpListener);
    };
  }, [listener, children, keyUpListener]);

  return <span className={`${styles.keyboardCtrl} ${waiting && styles.waiting}`}>{children}</span>;
}

export default KeyboardSpan;
