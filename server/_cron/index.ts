import { db } from "../data/index.ts";

// Every 3 days
Deno.cron("task1", "0 0 */3 * *", async () => {
  console.log("Cleaning DB of absent entries");
  try {
    const list = await Array.fromAsync(db.list({ prefix: ["presence"] }));

    const deletions = list
      .filter((entry) => entry.value === "absent")
      .map((entry) => db.delete(entry.key));

    console.log("Found", deletions.length, "entries to delete");

    if (!deletions.length) {
      return console.warn("Nothing to delete.");
    }

    await Promise.all(deletions);
  } catch (e) {
    console.warn("Error deleting absent entries:", e);
  }
});
