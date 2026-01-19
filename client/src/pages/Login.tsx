
import { useState, type FormEvent } from "react";
import { loginUser, createUser } from "./../utils/indexUtils";


export default function Login() {
  // Controlled form states
  const [isRegistered, setIsRegistered] = useState(true); // Shows login form by default
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Async form submission handler, takes FormEvent as parameter
  // Prevents default form submission behavior, i.e page reload
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate password match on registration
    if (!isRegistered && password !== confirmPassword) {
      setMessage("Lösenorden matchar inte");
      return;
    }

    // Try to login or register user
    try {
      if (isRegistered) {
        // LOGIN
        const data = await loginUser(email, password);
        localStorage.setItem("token", data.token);
        setMessage(`Inloggad som ${data.user.first_name}`);
        setEmail("");
        setPassword("");
      } else {
        // REGISTER
        await createUser({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        });
        setMessage("Konto skapat! Du kan nu logga in.");
        setIsRegistered(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    // Catch and display any errors
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Serverfel, försök igen senare");
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

      {message && <p className="mt-2">{message}</p>}

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
