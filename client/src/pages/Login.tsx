import { useState, type FormEvent } from "react";

// Login and Registration component
export default function Auth() {
  const [isRegistered, setIsRegistered] = useState(true); // Default view is login
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Handle form submission. Async function, takes FormEvent as event parameter
  const handleSubmit = async (e: FormEvent) => {
    // Prevent default form submission behavior, i.e., page reload
    e.preventDefault();

    // Check if passwords match during registration
    if (!isRegistered && password !== confirmPassword) {
      setMessage("Lösenorden matchar inte");
      return;
    }

    // Try-catch block for error handling during fetch requests
    try {
      // When registered, perform login
      if (isRegistered) {
        // Fetch request to Flask-AppBuilder login endpoint, wait for Promise
        const res = await fetch("/api/login_customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        // Here is the response I Promised earlier
        const data = await res.json();
        // Debugging log
        console.log("Response data:", data);

        // If response is ok, the login was successful
        if (res.ok) {
          setMessage(`Inloggad som ${data.user.first_name}`);
          // Save token to stay logged in (localStorage survives page reloads and browser restarts)
          localStorage.setItem("token", data.token);
          setEmail("");
          setPassword("");
        } else {
          setMessage(data.message || "Fel email eller lösenord");
        }
      } else {
        // REGISTER
        const res = await fetch("/api/create_customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            username: email,
            is_active: true,
            roles: ["Public"],
            groups: [],
          }),
        });
        const data = await res.json();

        if (res.ok) {
          setMessage("Konto skapat! Du kan nu logga in.");
          setIsRegistered(true); // byt direkt till login
          setFirstName("");
          setLastName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        } else {
          setMessage(data.message || "Något gick fel vid registrering");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Serverfel, försök igen senare");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-base-muted">
        {isRegistered ? "Logga in" : "Skapa Kundkonto"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isRegistered && (
          <>
            <input
              type="text"
              placeholder="Förnamn"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="p-2 border border-black rounded text-base-muted"
            />
            <input
              type="text"
              placeholder="Efternamn"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="p-2 border border-black rounded text-base-muted"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border border-black rounded text-base-muted"
        />

        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border border-black rounded text-base-muted"
        />

        {!isRegistered && (
          <input
            type="password"
            placeholder="Bekräfta lösenord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="p-2 border border-black rounded text-base-muted"
          />
        )}

        <button
          type="submit"
          className="p-2 bg-base-surface border border-base-border text-black rounded hover:bg-base-hover transition"
        >
          {isRegistered ? "Logga in" : "Skapa konto"}
        </button>
      </form>

      {message && <p className={`mt-2`}>{message}</p>}

      <p className="mt-4 text-sm text-base-muted">
        {isRegistered ? "Inte registrerad?" : "Har du redan konto?"}{" "}
        <button
          onClick={() => {
            setIsRegistered(!isRegistered);
            setMessage("");
          }}
          className="text-blue-400 underline"
        >
          {isRegistered ? "Skapa konto" : "Logga in"}
        </button>
      </p>
    </div>
  );
}
