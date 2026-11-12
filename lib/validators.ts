export const EMAIL_REQUIRED =
  "Please enter the email address which you want to use on the platform";

export const EMAIL_TAKEN = "This email already used, try new one or sign up";

export const PASSWORD_RULE =
  "Use 8+ characters with an uppercase letter, a number, and a symbol.";

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

export function fullName(first: string, last: string) {
  return `${first.trim()} ${last.trim()}`.replace(/\s+/g, " ").trim();
}
