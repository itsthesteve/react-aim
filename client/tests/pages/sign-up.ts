import { Locator, Page } from "@playwright/test";

const USERNAME = "imauser";
const BAD_PWD = "aaaaaaa";
const GOOD_PWD = "123123";
export const STEP_TEXT = [
  "Connecting...",
  "Verifying name and password...",
  "Starting services...",
];

export class SignInPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submitBtn: Locator;
  stepper: Locator;
  errBlock: Locator;

  constructor(readonly page: Page) {
    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.submitBtn = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto("./");
    console.log(this.username);
  }

  async fillForm(accurate: boolean = false) {
    await this.username.fill(USERNAME);
    await this.password.fill(accurate ? GOOD_PWD : BAD_PWD);
    await this.submitBtn.click();

    this.stepper = this.page.locator("[data-step]");
    await this.stepper.waitFor();
  }

  async waitForStep(step: number) {
    const el = this.getStepLocator(step);
    return await el.waitFor();
  }

  getStepLocator(step: number) {
    return this.page.getByText(STEP_TEXT[step]);
  }
}
