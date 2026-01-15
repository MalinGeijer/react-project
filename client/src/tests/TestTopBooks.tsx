import { useEffect, useState } from 'react';

interface NYTBook {
  title: string;
  author: string;
  primary_isbn13: string;
  rank: number;
}

interface NYTResponse {
  results: {
    books: NYTBook[];
  };
}

export default function TestTopBooks() {
  const [data, setData] = useState<NYTResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'n1jJGwAQrDMg2JGCLFfIgvarP8Tfkidh';

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${API_KEY}`
        );
        if (!res.ok) throw new Error('Fel vid hämtning');
        const json = (await res.json()) as NYTResponse;
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Laddar…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <pre style={{ whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
