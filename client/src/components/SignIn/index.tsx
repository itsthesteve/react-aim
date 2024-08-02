import { ChangeEventHandler, FormEventHandler, useState } from "react";
import styles from "./signin.module.css";

export default function SignIn() {
  const [creds, setCreds] = useState({ username: "", password: "" });

  const updateForm: ChangeEventHandler = (e) => {
    const t = e.target as HTMLFormElement;
    setCreds((prev) => {
      return { ...prev, [t.name]: t.value };
    });
  };

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    console.log("Signing on", creds);
  };

  return (
    <>
      <div className={`window ${styles.windowContainer}`}>
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
          <form className="my-4 px-2" onSubmit={onSubmit}>
            <div>
              <label htmlFor="username" className="flex flex-col gap-1 items-stretch">
                <span className="font-bold">Username</span>
                <input name="username" onChange={updateForm}></input>
              </label>
              <a href="/" className="mt-1 inline-block">
                Get a screen name
              </a>
            </div>

            <div className="my-4">
              <label htmlFor="username" className="flex flex-col gap-1 items-stretch">
                <span className="font-bold">Password</span>
                <input
                  name="password"
                  type="password"
                  className="h-auto"
                  onChange={updateForm}></input>
              </label>
              <a href="/" className="mt-1 inline-block">
                Forgot password?
              </a>
            </div>

            <footer>
              <button type="submit">Sign on</button>
            </footer>
          </form>
        </div>
        <div className="status-bar mx-0">
          <p className="status-bar-field text-center">Version 0.1.0</p>
        </div>
      </div>
    </>
  );
}
