import { expect, test } from "@playwright/test";
import { SignUpPage, userCases } from "./pages/sign-up";

let sp: SignUpPage;
test.beforeEach(async ({ page }) => {
  sp = new SignUpPage(page);
  await sp.goto();
});

test("it loads", async () => {
  expect(sp.form).toBeTruthy();
});

test("allows user in", async () => {
  await sp.goto();
  const goodUser = userCases.shift()!;
  await sp.fillForm(goodUser);
  await sp.page.waitForURL("http://localhost:5173/chat?room=abc");
  expect(sp.page.url()).toContain("/chat");
});

// test("disallows bad attempts", async ({ page }) => {
//   for (let i = 0; i < userCases.length; i++) {
//     await sp.fillForm(userCases[i]);
//     const errDiv = await sp.getErrDiv();
//     const errText = await errDiv.textContent();
//     expect(errText?.length).toBeGreaterThan(0);
//   }
// });
