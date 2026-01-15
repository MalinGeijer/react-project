import { useState } from 'react';

export default function TestPython() {
  const [name, setName] = useState('Malin');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  async function handleSend() {
    const res = await fetch('http://localhost:5000/echo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setResponseMessage(data.message ?? JSON.stringify(data));
  }

  return (
    <div>
      <h2>Test communication with python-server</h2>

      <label>
        <span>Enter your name: </span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <button onClick={handleSend}>Send to python-server</button>

      {responseMessage && <p>Response from python-server: {responseMessage}</p>}
    </div>
  );
}
