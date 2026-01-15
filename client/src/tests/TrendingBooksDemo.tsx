import { useEffect, useState } from 'react';

interface NYTBook {
  title: string;
  author: string;
  primary_isbn13: string;
  rank: number;
}

interface NYTResponse {
  results: { books: NYTBook[] };
}

interface GoogleBooksImageLinks {
  thumbnail?: string;
}

interface GoogleBooksVolumeInfo {
  imageLinks?: GoogleBooksImageLinks;
}

interface GoogleBooksItem {
  volumeInfo: GoogleBooksVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleBooksItem[];
}

export default function TrendingBooksDemo() {
  const [books, setBooks] = useState<NYTBook[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});

  const API_KEY = 'n1jJGwAQrDMg2JGCLFfIgvarP8Tfkidh';

  useEffect(() => {
    async function load() {
      // 1. Hämta NYT-listan
      const nytRes = await fetch(
        `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${API_KEY}`
      );
      const nytJson = (await nytRes.json()) as NYTResponse;
      const nytBooks = nytJson.results.books;
      setBooks(nytBooks);

      // 2. Hämta omslag via Google Books
      const coverMap: Record<string, string> = {};

      for (const book of nytBooks) {
        const isbn = book.primary_isbn13;

        const googleRes = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
        );
        const googleJson = (await googleRes.json()) as GoogleBooksResponse;

        const img =
          googleJson.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ??
          'https://via.placeholder.com/128x200?text=No+Cover';

        coverMap[isbn] = img;
      }

      setCovers(coverMap);
    }

    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Trending Books (NYT Hardcover Fiction)</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 20,
        }}>
        {books.map((b) => (
          <div key={b.primary_isbn13} style={{ textAlign: 'center' }}>
            <img
              src={covers[b.primary_isbn13]}
              alt={b.title}
              style={{ width: 120, borderRadius: 4 }}
            />
            <h4>{b.title}</h4>
            <p style={{ fontSize: 12, opacity: 0.7 }}>{b.author}</p>
            <p style={{ fontSize: 12 }}>Rank #{b.rank}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
