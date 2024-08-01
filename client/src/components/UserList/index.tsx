import styles from "./styles.module.css";

export default function UserList() {
  return (
    <>
      <aside className={`${styles.userList} bg-white [grid-area:users]`}>
        <ul className="list-none m-0 p-0">
          <li className={`${styles.userEntry} p-1`}>user1234</li>
          <li className={`${styles.userEntry} p-1`}>user5934934</li>
        </ul>
      </aside>
    </>
  );
}
