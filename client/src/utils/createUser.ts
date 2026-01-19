import type { User } from "./types";

/**
 * Skapar en ny användare på backend
 * @param user Objektdatan från formulär: first_name, last_name, email, password
 * @returns Promise med backend-data
 */
export async function createUser(user: Pick<User, "first_name" | "last_name" | "email" | "password">) {
  const body: User = {
    ...user,
    username: user.email, // hårdkodat
    is_active: true,
    roles: ["Public"],
    groups: [],
  };

  const res = await fetch("/api/create_customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registrering misslyckades");
  }

  return data;
}
