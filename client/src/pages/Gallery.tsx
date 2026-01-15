import { useEffect, useState } from 'react';

/* Interface i samma fil */
interface GalleryImage {
  id: number;
  media_url: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data: GalleryImage[]) => setImages(data))
      .catch((err) => console.error('Error fetching images:', err));
  }, []);

  return (
    <div className="mx-auto grid gap-2 p-2
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="aspect-square overflow-hidden rounded-md"
        >
          <img
            src={image.media_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
