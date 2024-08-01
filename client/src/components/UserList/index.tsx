import styles from "./styles.module.css";

export default function UserList() {
  return (
    <>
      <aside className={`${styles.userList} [grid-area:users] flex flex-col`}>
        <div className="mt-2 grow flex flex-col">
          <header className="pb-2 pl-1">Users</header>
          <ul className={`list-none m-0 p-0 bg-white grow ${styles.borderWindow}`}>
            <li className={`${styles.userEntry} p-1`}>user1234</li>
            <li className={`${styles.userEntry} p-1`}>user5934934</li>
          </ul>
        </div>
      </aside>
    </>
  );
}
