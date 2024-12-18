import { unwrapResult } from "@reduxjs/toolkit";
import { ChangeEventHandler, FormEventHandler, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactAimHeader from "~/components/ReactAimHeader";
import XPWindow from "~/components/XPWindow";
import { AppDispatch } from "~/store";
import { getAuthState } from "~/store/auth";
import { signInAction } from "~/store/auth/sign-in";
import { DEFAULT_ROOM } from "~/types/room";

const processingSteps = [
  { step: 1, text: "Connecting..." },
  { step: 2, text: "Verifying name and password..." },
  { step: 3, text: "Starting services..." },
];

const StatusBar = () => {
  return <p className="status-bar-field text-center">Version 0.1.0</p>;
};

export function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch() as AppDispatch;
  // TODO: reduce number of useStates
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [step, setStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);

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
    <XPWindow title="Sign on" statusBar={<StatusBar />}>
      <>
        <ReactAimHeader />
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
                <a href="/" onClick={() => alert("todo, sorry :(")} className="mt-1 inline-block">
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
      </>
    </XPWindow>
  );
}
