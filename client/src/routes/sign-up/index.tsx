import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpAuthCredentials } from "../../store/auth";

const signUp = async (creds: SignUpAuthCredentials) => {
  const res = await fetch("/api/auth/create", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(creds),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res;
};

export function SignUp() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: "", password: "", verifyPassword: "" });
  const [err, setErr] = useState("");

  const updateForm: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    setCreds((prev) => {
      return {
        ...prev,
        [target.name]: target.value,
      };
    });
  };

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    const res = await signUp(creds);

    if (res.ok) {
      return navigate(`/?username=${creds.username}`);
    }

    const json = await res.json();
    setErr(json.reason);
  };

  return (
    <>
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">Create account</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={() => alert("todo")}></button>
          </div>
        </div>
        <div className="window-body grid place-items-center">
          <header className="bg-blue-700 w-40 aspect-square text-center font-sans font-bold flex flex-col text-white justify-between p-4">
            <img className="self-end" src="/aimguy.png" width="112" height="122" />
            React Instant Messenger
          </header>
          <form noValidate className="w-full py-4" onSubmit={onSubmit}>
            <label htmlFor="username" className="px-2 flex flex-col gap-1 items-stretch">
              <span>Username</span>
              <input
                required
                minLength={2}
                maxLength={32}
                pattern="[a-z0-9_$*#@+\/\\=]+"
                name="username"
                onChange={(e) => updateForm(e)}
              />
            </label>

            <label htmlFor="password" className="px-2 flex flex-col gap-1 items-stretch mt-4">
              <span>Password</span>
              <input
                required
                minLength={8}
                maxLength={1024}
                name="password"
                type="password"
                onChange={(e) => updateForm(e)}
              />
            </label>

            <label htmlFor="verifyPassword" className="px-2 flex flex-col gap-1 items-stretch mt-4">
              <span>Verify password</span>
              <input
                required
                minLength={6}
                maxLength={1024}
                name="verifyPassword"
                type="password"
                onChange={(e) => updateForm(e)}
              />
            </label>

            {err && (
              <div id="err-text" className="p-2 text-red-700">
                {err}
              </div>
            )}

            <footer className="mt-4 text-center">
              <button type="submit">Create account</button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}
