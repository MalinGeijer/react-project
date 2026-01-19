// This is a JSDoc comment. Run npx typdoc to generate HTML documentation from it.

import type { LoginResponse } from "./types";

/**
 * Logging in a user with given email and password.
 * @param email User email
 * @param password User password
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch("/api/login_customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Fel email eller lösenord");
  }

  return data;
}
