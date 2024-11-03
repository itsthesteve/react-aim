import { useEffect, useState } from "react";

type User = {
  username: string;
  versiontimestamp: string;
};

export default function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => setUsers(res));
  }, []);

  return (
    <section className="container mx-auto">
      <header>Users</header>
      <div className="space-y-2 pt-4">
        {users.map((user: User) => {
          return (
            <div key={user.username} className="p-2 border border-slate-200">
              <div className="flex gap-2 items-center">
                <input type="checkbox" name="user[]" value={user.username} />
                <span>{user.username}</span>
              </div>
              <span className="text-xs text-slate-600">{user.versiontimestamp}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
