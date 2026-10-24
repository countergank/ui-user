import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { createUserFormSchema, passwordStrength } from "./create-schema";

const t = i18n.getFixedT(null, "users");

const VALID = {
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  userName: "ada",
  password: "Nx9!mKp2",
  confirmPassword: "Nx9!mKp2",
  role: "user",
};

function errorsFor(values: Record<string, unknown>) {
  const result = createUserFormSchema(t).safeParse(values);

  return result.success ? {} : result.error.flatten().fieldErrors;
}

describe("create user schema", () => {
  it("accepts a valid payload and trims the text fields", () => {
    const result = createUserFormSchema(t).safeParse({
      ...VALID,
      name: "  Ada  ",
      email: " ada@example.com ",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("the valid payload should parse");
    }
    expect(result.data.name).toBe("Ada");
    expect(result.data.email).toBe("ada@example.com");
  });

  it.each(["name", "lastName", "userName"] as const)(
    "requires %s with the localized message",
    (field) => {
      expect(errorsFor({ ...VALID, [field]: "   " })[field]).toEqual([
        t("create.errors.fieldRequired"),
      ]);
    },
  );

  it("rejects a malformed email with the localized message", () => {
    expect(errorsFor({ ...VALID, email: "not-an-email" }).email).toEqual([
      t("create.errors.emailInvalid"),
    ]);
  });

  it("defaults the role to user", () => {
    const { role, ...withoutRole } = VALID;
    void role;

    const result = createUserFormSchema(t).safeParse(withoutRole);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("the payload without role should parse");
    }
    expect(result.data.role).toBe("user");
  });

  it("rejects a role outside the API enum", () => {
    expect(createUserFormSchema(t).safeParse({ ...VALID, role: "owner" }).success).toBe(false);
  });

  it.each([
    ["too short", "Nx9!mKp"],
    ["too long", `${"Nx9!mKp2".repeat(8)}N`],
    ["without a lowercase letter", "NX9!MKP2"],
    ["without an uppercase letter", "nx9!mkp2"],
    ["without a digit", "Nx!mKpwx"],
    ["without a special character", "Nx9mKpwx"],
    ["with consecutive repeated characters", "Nx9!mKKp"],
    ["with a common digit sequence", "Nx9!m123"],
    ["with a common letter sequence", "Nx9!mqwe"],
    ["with another common sequence", "Nx9!masd"],
    ["with a keyboard sequence", "Nx9!mzxc"],
    ["with an alphabetical sequence", "Nx9!mabc"],
  ])("rejects a password that is %s", (_label, password) => {
    expect(errorsFor({ ...VALID, password }).password).toEqual([t("create.errors.weakPassword")]);
  });

  it("accepts any non-alphanumeric character as the required special character", () => {
    expect(
      createUserFormSchema(t).safeParse({
        ...VALID,
        password: "Nx9mKpwx#",
        confirmPassword: "Nx9mKpwx#",
      }).success,
    ).toBe(true);
    expect(
      createUserFormSchema(t).safeParse({
        ...VALID,
        password: "Nx9mKpwxñ",
        confirmPassword: "Nx9mKpwxñ",
      }).success,
    ).toBe(true);
  });

  it("rejects a password whose only missing rule is a non-alphanumeric character", () => {
    expect(errorsFor({ ...VALID, password: "Nx9mKpwx" }).password).toEqual([
      t("create.errors.weakPassword"),
    ]);
  });

  it("accepts passwords at both length boundaries", () => {
    expect(createUserFormSchema(t).safeParse({ ...VALID, password: "Nx9!mKp2" }).success).toBe(
      true,
    );
    expect(
      createUserFormSchema(t).safeParse({
        ...VALID,
        password: "Nx9!mKp2".repeat(8),
        confirmPassword: "Nx9!mKp2".repeat(8),
      }).success,
    ).toBe(true);
  });

  it("accepts a payload whose confirmation matches the password", () => {
    expect(
      createUserFormSchema(t).safeParse({ ...VALID, confirmPassword: "Nx9!mKp2" }).success,
    ).toBe(true);
  });

  it("lands the mismatch on the confirm field only", () => {
    const errors = errorsFor({ ...VALID, confirmPassword: "Nx9!mKp3" });

    expect(errors.confirmPassword).toEqual([t("create.errors.passwordMismatch")]);
    expect(errors.password).toBeUndefined();
  });
});

describe("password strength", () => {
  it.each([
    ["weak", "Nx9!"],
    ["medium", "Nx9mKp2w"],
    ["strong", "Nx9!mKp2"],
  ] as const)("rates the %s band for %s", (band, password) => {
    expect(passwordStrength(password)).toBe(band);
  });
});
