import { useEffect, useState } from 'react';

interface GoogleBookImageLinks {
  thumbnail?: string;
}

interface GoogleVolumeInfo {
  title: string;
  authors?: string[];
  imageLinks?: GoogleBookImageLinks;
}

interface GoogleItem {
  id: string;
  volumeInfo: GoogleVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleItem[];
}

export default function TestGoogleBooks({ isbn }: { isbn: string }) {
  const [data, setData] = useState<GoogleBooksResponse | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      const json = (await res.json()) as GoogleBooksResponse;
      setData(json);
    }
    load();
  }, [isbn]);

  return (
    <pre style={{ whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
