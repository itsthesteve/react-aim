import { Locator, Page } from "@playwright/test";

export class SignUpPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly passwordVerify: Locator;
  readonly submitBtn: Locator;
  readonly errBlock: Locator;
  readonly form: Locator;

  constructor(readonly page: Page) {
    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.passwordVerify = page.locator('input[name="verifyPassword"]');
    this.submitBtn = page.locator('button[type="submit"]');
    this.form = page.locator("form");
  }

  async goto() {
    await this.page.goto("./sign-up");
    await this.form.waitFor();
    return this.form;
  }

  async fillForm({
    username,
    password,
    verifyPassword,
  }: {
    username: string;
    password: string;
    verifyPassword: string;
  }) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.passwordVerify.fill(verifyPassword);
    await this.submitBtn.click();
  }

  async getErrDiv() {
    const div = this.page.locator("#err-text");
    await div.waitFor();
    return div;
  }
}

// Used in the test suite
const goodUser = {
  username: "imauser",
  password: "123123",
  verifyPassword: "123123",
};

const badUser_verify = {
  ...goodUser,
  verifyPassword: "abc123",
};

const badUser_username = {
  ...goodUser,
  username: "     a",
};

const badUser_password = {
  ...goodUser,
  password: "1",
  verifyPassword: "1",
};

export const userCases = [goodUser, badUser_verify, badUser_username, badUser_password];
