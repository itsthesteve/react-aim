import { useEffect, useState } from "react";

type Room = {
  id: string;
  name: string;
  created: string;
  creator: string;
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("/api/rooms", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((result) => {
        setRooms(result);
      });
  }, []);

  return (
    <section className="container mx-auto">
      <header>Rooms</header>
      <div className="space-y-2 pt-4">
        {rooms.map((room: Room) => {
          return (
            <div key={room.id} className="p-2 border border-slate-200">
              <div className="flex gap-2 items-center">
                <input type="checkbox" name="room[]" value={room.id} />
                <span>{room.name}</span>
              </div>
              <span className="text-xs text-slate-600">
                Created by <small className="text-xs font-bold text-blue-700">{room.creator}</small>{" "}
                on {room.created}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
