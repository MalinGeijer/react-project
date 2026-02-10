import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) navigate('/admin');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent form from refreshing the page
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // adminToken is a hardcoded "true" flag stored in localStorage,
        // so anyone can grant themselves admin by setting that value manually!!
        localStorage.setItem('adminToken', 'true');
        setError('');
        navigate('/admin');
      } else {
        setError(data.error || 'Fel användarnamn eller lösenord');
      }
    } catch (err) {
      console.error(err);
      setError('Kunde inte logga in just nu');
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-6">
        <h2 className="text-xl font-bold">Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className=" p-2 rounded text-base-muted"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className=" p-2 rounded text-base-muted"
        />
        <button type="submit" className="bg-base-surface text-white p-2 rounded">
          Logga in
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
