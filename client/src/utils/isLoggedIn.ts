export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem("token"));
}
