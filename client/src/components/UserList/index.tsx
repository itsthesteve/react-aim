export default function UserList() {
  return (
    <>
      <aside className="[grid-area:users] flex flex-col mt-3">
        <section className="tabs h-full">
          <menu role="tablist" aria-label="Sample Tabs">
            <button role="tab" aria-selected="true" aria-controls="tab-A">
              Rooms
            </button>
            <button role="tab" aria-controls="tab-B">
              Users
            </button>
          </menu>
          <article role="tabpanel" id="tab-A" className="h-full p-0 border-none">
            <ul className="tree-view h-full">
              <li>
                <details>
                  <summary>Global (1)</summary>
                  <ul>
                    <li className="font-bold">abc</li>
                  </ul>
                </details>
              </li>
              <li>
                <details>
                  <summary>Your rooms (1)</summary>
                  <ul>
                    <li>xXSlayerXx</li>
                  </ul>
                </details>
              </li>
            </ul>
          </article>
          <article hidden role="tabpanel" id="tab-B" className="h-full p-0">
            <ul className="h-full p-0 list-none">
              <li className="p-1 hover:bg-slate-200">userdata</li>
            </ul>
          </article>
        </section>
      </aside>
    </>
  );
}
