import Rooms from "../Rooms";
import Users from "../Users";
import styles from "./styles.module.css";

export default function DashboardHome() {
  return (
    <section className="container mx-auto mt-4 px-4 flex gap-4 items-start">
      <Rooms />
      <Users />
    </section>
  );
}
