// @ts-nocheck
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactAimHeader from "~/components/ReactAimHeader";
import XPWindow from "~/components/XPWindow";
import { SignUpAuthCredentials } from "~/store/auth";

const signUp = async (creds: SignUpAuthCredentials) => {
  const res = await fetch("/api/auth/create", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(creds),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await res.json();

  return {
    ok: res.ok,
    result,
  };
};

export function SignUp() {
  const [creds, setCreds] = useState({ username: "", password: "", verifyPassword: "" });
  const [errors, setErrors] = useState({ username: [], password: [], verifyPassword: [] });
  const navigate = useNavigate();

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
    const { ok, result } = await signUp(creds);

    if (ok) {
      return navigate(`/?username=${creds.username}`);
    }

    console.log(result.reason.fieldErrors);

    setErrors({
      username: result.reason.fieldErrors.username,
      password: result.reason.fieldErrors.password,
      verifyPassword: result.reason.formErrors,
    });
  };

  return (
    <XPWindow title="Create account">
      <ReactAimHeader />
      <form className="w-full py-4" onSubmit={onSubmit}>
        <label htmlFor="username" className="px-2 flex flex-col gap-1 items-stretch">
          <span>Username</span>
          <input name="username" onChange={(e) => updateForm(e)} />
          <span className="text-xs text-red-700">{errors.username?.[0]?.message}</span>
        </label>

        <label htmlFor="password" className="px-2 flex flex-col gap-1 items-stretch mt-4">
          <span>Password</span>
          <input name="password" type="password" onChange={(e) => updateForm(e)} />
          <span className="text-xs text-red-700">{errors.password?.[0]?.message}</span>
        </label>

        <label htmlFor="verifyPassword" className="px-2 flex flex-col gap-1 items-stretch mt-4">
          <span>Verify password</span>
          <input name="verifyPassword" type="password" onChange={(e) => updateForm(e)} />
          <span className="text-xs text-red-700">{errors.verifyPassword?.[0]?.message}</span>
        </label>

        <footer className="mt-4 text-center">
          <button>Create account</button>
        </footer>
      </form>
    </XPWindow>
  );
}
