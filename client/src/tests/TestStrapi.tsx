import { useEffect } from 'react';
export default function TestStrapi() {
  useEffect(() => {
    fetch('http://localhost:1337/api/tests')
      .then((res) => res.json())
      .then((data) => console.log('Strapi says:', data))
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  return (
    <div>
      <h1>Testar kontakt med Strapi...</h1>
      <p>Kolla browserns Console!</p>
    </div>
  );
}
