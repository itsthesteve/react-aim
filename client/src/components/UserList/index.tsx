import styles from "./styles.module.css";

export default function UserList() {
  return (
    <>
      <aside className="bg-zinc-900 p-4 [grid-area:users]">
        <ul>
          <li>user1234</li>
          <li>user5934934</li>
        </ul>
      </aside>
    </>
  );
}
