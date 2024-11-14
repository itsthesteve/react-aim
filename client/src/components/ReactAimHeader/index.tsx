import AimGuyLarge from "~/assets/aimguy-256.png";

export default function ReactAimHeader() {
  return (
    <header className="bg-blue-700 w-40 aspect-square text-center font-sans font-bold flex flex-col text-white justify-between p-4 mt-1">
      <img className="self-end" src={AimGuyLarge} width="112" height="122" />
      React Instant Messenger
    </header>
  );
}
