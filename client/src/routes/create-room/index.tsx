import CreateRoomWindow from "../../components/CreateRoomWindow";

export function CreateRoom() {
  return <CreateRoomWindow />;
}

export async function createRoomLoader() {
  try {
    const res = await fetch("http://localhost:9000/rooms", {
      method: "GET",
      credentials: "include",
    });
    const { userRooms } = await res.json();
    return userRooms;
  } catch (e) {
    console.warn("Error getting rooms");
    return [];
  }
}
