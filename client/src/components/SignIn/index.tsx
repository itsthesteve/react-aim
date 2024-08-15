import { unwrapResult } from "@reduxjs/toolkit";
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../store";
import { getAuthState } from "../../store/auth";
import { signInAction } from "../../store/auth/sign-in";
import { DEFAULT_ROOM } from "../../types/room";
import styles from "./signin.module.css";
import { useDraggable } from "../../hooks/useDraggable";

const processingSteps = [
  { step: 1, text: "Connecting..." },
  { step: 2, text: "Verifying name and password..." },
  { step: 3, text: "Starting services..." },
];

export function SignIn() {
  const elRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch() as AppDispatch;
  // TODO: reduce number of useStates
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [step, setStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { x, y } = useDraggable(elRef);

  useEffect(() => {
    if (!elRef.current) return;
    elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [x, y]);

  const { error } = getAuthState();

  useEffect(() => {
    if (error) {
      setSubmitted(false);
      setStep(0);
    }
  }, [error]);

  // After signing up, the form redirects here with the username in the search params
  // as a prefill for the username field to log in.
  const usernameFromSignup = new URLSearchParams(window.location.search).get("username") || "";

  const randSleep = useCallback(() => {
    let timeout: NodeJS.Timeout;
    const rand = 500 + Math.round(Math.random() * 1000);
    return (step: number) => {
      if (timeout) clearTimeout(timeout);
      return new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          // FIXME: Subtle bug here, resolve is getting called before the setStep
          // is finished, so in this case we never see step 3 when signing in
          setStep(() => step);
          resolve();
        }, rand);
      });
    };
  }, []);

  useEffect(() => {
    // Be sure the state is set correctly if the username is in the search params
    if (usernameFromSignup) {
      setCreds((prev) => ({ ...prev, username: usernameFromSignup }));
    }
  }, [usernameFromSignup]);

  const updateForm: ChangeEventHandler = (e) => {
    const t = e.target as HTMLFormElement;
    setCreds((prev) => {
      return { ...prev, [t.name]: t.value };
    });
  };

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    const sleepFor = randSleep();

    setSubmitted(true);

    await sleepFor(0);
    await sleepFor(1);
    const d = await dispatch(signInAction(creds));

    const result = unwrapResult(d);

    if (result.username) {
      await sleepFor(2);
      navigate("/chat?room=" + DEFAULT_ROOM, { replace: true });
    } else {
      console.warn("Bad request", result);
      setStep(0);
      setSubmitted(() => false);
    }
  };

  return (
    <>
      <div className="window" ref={(el) => (elRef.current = el)}>
        <div className="title-bar">
          <div className="title-bar-text">Sign On</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={() => alert("todo")}></button>
          </div>
        </div>
        <div
          className={`window-body grid ${styles.content}`}
          style={{ background: "rgb(236, 233, 216)" }}>
          <header className="bg-blue-700 aspect-square w-40 text-center font-sans font-bold flex flex-col text-white justify-between p-4">
            <img className="self-end" src="/aimguy.png" width="112" height="122" />
            React Instant Messenger
          </header>
          {!submitted ? (
            <>
              <form className="my-4 px-2" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="username" className="flex flex-col gap-1 items-stretch">
                    <span className="font-bold">Username</span>
                    <input
                      autoFocus
                      autoComplete="off"
                      defaultValue={usernameFromSignup}
                      name="username"
                      onChange={updateForm}></input>
                  </label>
                  <a href="/sign-up" className="mt-1 inline-block">
                    Get a screen name
                  </a>
                </div>

                <div className="my-4">
                  <label htmlFor="username" className="flex flex-col gap-1 items-stretch">
                    <span className="font-bold">Password</span>
                    <input
                      name="password"
                      autoComplete="off"
                      type="password"
                      className="h-auto"
                      onChange={updateForm}></input>
                  </label>
                  <a href="/" className="mt-1 inline-block">
                    Forgot password?
                  </a>
                </div>

                <footer>
                  {error && (
                    <>
                      <p id="error-message" className="text-red-700">
                        {error}
                      </p>
                    </>
                  )}
                  <button type="submit">Sign on</button>
                </footer>
              </form>
            </>
          ) : (
            <div data-step className="text-center py-2 flex flex-col gap-2">
              <span>{creds.username}</span>
              <span>{processingSteps[step]?.text}</span>
            </div>
          )}
        </div>
        <div className="status-bar mx-0">
          <p className="status-bar-field text-center">Version 0.1.0</p>
        </div>
      </div>
    </>
  );
}
