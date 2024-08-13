import CreateRoomWindow from "../../components/CreateRoomWindow";

export function CreateRoom() {
  return <CreateRoomWindow />;
}

export async function createRoomLoader() {
  try {
    const res = await fetch("/api/rooms", {
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
