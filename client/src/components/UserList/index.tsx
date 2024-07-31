import styles from "./styles.module.css";

export default function UserList() {
  return (
    <>
      <aside className={styles.userList}>
        <ul>
          <li>user1234</li>
          <li>user5934934</li>
        </ul>
      </aside>
    </>
  );
}
