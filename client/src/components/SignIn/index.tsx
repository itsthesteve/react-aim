import { ChangeEventHandler, FormEventHandler, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/auth/hook";
import styles from "./signin.module.css";
import { DEFAULT_ROOM } from "../../types/room";

const processingSteps = [
  { step: 1, text: "Connecting..." },
  { step: 2, text: "Verifying name and password..." },
  { step: 3, text: "Starting services..." },
];

export function SignIn() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  // TODO: reduce number of useStates
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [step, setStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  // After signing up, the form redirects here with the username in the search params
  // as a prefill for the username field to log in.
  const usernameFromSignup = new URLSearchParams(window.location.search).get("username") || "";

  const randSleep = (step: number) => {
    const rand = 500 + Math.round(Math.random() * 1000);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setStep(() => step);
        resolve();
      }, rand);
    });
  };

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
    setSubmitted(true);
    await randSleep(0);
    await randSleep(1);

    try {
      await login(creds);
    } catch (e) {
      console.warn("Unable to login", e);
      setSubmitted(() => false);
      setErr("Incorrect login credentials");
      return;
    }

    await randSleep(2);
    // Navigate to the global default room by default
    // In the future, this value can be retrieved and set dynamically
    navigate("/chat?room=" + DEFAULT_ROOM, { replace: true });
  };

  return (
    <>
      <div className="window">
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
                  {err && (
                    <>
                      <p className="text-red-700">{err}</p>
                    </>
                  )}
                  <button type="submit">Sign on</button>
                </footer>
              </form>
            </>
          ) : (
            <div className="text-center py-2 flex flex-col gap-2">
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
