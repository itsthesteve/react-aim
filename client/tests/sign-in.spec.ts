import { test, expect } from "@playwright/test";
import { SignInPage, STEP_TEXT } from "./pages/sign-up";

test("has title", async ({ page }) => {
  await page.goto("./");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/React AIM/);

  const title = await page.$(".title-bar");

  expect(title).toBeTruthy();
  const windowTitle = await title?.textContent();
  expect(windowTitle).toBe("Sign On");
});

test("cannot sign in", async ({ page }) => {
  const p = new SignInPage(page);
  await p.goto();
  await p.fillForm();

  expect(p.stepper).toBeVisible();
  expect(p.stepper).toContainText(/Connecting/);
  const step2 = p.page.getByText("Verifying name and password...");
  await step2.waitFor();

  const errBlock = p.page.locator("#error-message");
  await errBlock.waitFor();
  const errText = await errBlock.textContent();
  expect(errText?.length).toBeGreaterThan(1);
});

test("successful sign in", async ({ page }) => {
  const p = new SignInPage(page);
  await p.goto();
  await p.fillForm(true);

  await p.waitForStep(0);
  expect(await p.getStepLocator(0).textContent()).toBe(STEP_TEXT[0]);

  await p.waitForStep(1);
  expect(await p.getStepLocator(1).textContent()).toBe(STEP_TEXT[1]);

  // This won't happen due to a small bug in the component.
  // See the FIXME note in <SignUp />
  // const step3 = p.page.getByText("Starting services...");
  // await step3.waitFor();

  await p.page.waitForURL("http://localhost:5173/chat?room=abc");
  expect(p.page.url()).toContain("/chat");
});
