import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { useAuthContext } from "../../context/auth/hook";
import { useNavigate } from "react-router-dom";

export function SignUp() {
  const { signUp } = useAuthContext();
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: "", password: "", verifyPassword: "" });

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
    const success = await signUp(creds);

    if (success) {
      navigate("/?username=" + creds.username);
    }
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
          <form className="w-full py-4" onSubmit={onSubmit}>
            <label htmlFor="username" className="px-2 flex flex-col gap-1 items-stretch">
              <span>Username</span>
              <input name="username" onChange={(e) => updateForm(e)} />
            </label>

            <label htmlFor="password" className="px-2 flex flex-col gap-1 items-stretch mt-4">
              <span>Password</span>
              <input name="password" type="password" onChange={(e) => updateForm(e)} />
            </label>

            <label htmlFor="verifyPassword" className="px-2 flex flex-col gap-1 items-stretch mt-4">
              <span>Verify password</span>
              <input name="verifyPassword" type="password" onChange={(e) => updateForm(e)} />
            </label>

            <footer className="mt-4 text-center">
              <button>Create account</button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}
