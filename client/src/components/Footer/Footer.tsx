// src/components/Footer/Footer.tsx
import { useState, useEffect } from 'react';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import { SITE_TITLE } from '../../config/site';
import type { Product_T } from '../../utils/types';

export default function Footer() {
  const [products, setProducts] = useState<Product_T[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Hämta produkter för Shopping
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const uniqueProductNames = Array.from(new Set(products.map(p => p.name)));

  const toggleSection = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  return (
    <footer className="siteFooter bg-base-surface p-6">
      {/* Sociala ikoner */}
      <div className="flex justify-center gap-4 mb-6">
        <a href="https://instagram.com" target="_blank"><Instagram /></a>
        <a href="https://facebook.com" target="_blank"><Facebook /></a>
        <a href="https://linkedin.com" target="_blank"><Linkedin /></a>
      </div>

      {/* Accordion / Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shopping */}
        <div>
          <h3
            className="md:cursor-auto cursor-pointer font-bold mb-2"
            onClick={() => toggleSection('shopping')}
          >
            Shopping
          </h3>
          <ul className={`${openSection === 'shopping' ? 'block' : 'hidden'} md:block`}>
            {uniqueProductNames.map(name => (
              <li key={name} className="text-sm mb-1">{name}</li>
            ))}
          </ul>
        </div>

        {/* Mina sidor */}
        <div>
          <h3
            className="md:cursor-auto cursor-pointer font-bold mb-2"
            onClick={() => toggleSection('minasidor')}
          >
            Mina sidor
          </h3>
          <ul className={`${openSection === 'minasidor' ? 'block' : 'hidden'} md:block`}>
            <li className="text-sm mb-1"><a href="/login">Login</a></li>
            <li className="text-sm mb-1"><a href="/cart">Kundvagn</a></li>
            <li className="text-sm mb-1"><a href="/favorites">Favoriter</a></li>
          </ul>
        </div>

        {/* Kundservice */}
        <div>
          <h3
            className="md:cursor-auto cursor-pointer font-bold mb-2"
            onClick={() => toggleSection('kundservice')}
          >
            Kundservice
          </h3>
          <ul className={`${openSection === 'kundservice' ? 'block' : 'hidden'} md:block`}>
            <li className="text-sm mb-1"><a href="/contact">Kontakt</a></li>
            <li className="text-sm mb-1"><a href="/faq">FAQ</a></li>
            <li className="text-sm mb-1"><a href="/shipping">Frakt</a></li>
            <li className="text-sm mb-1"><a href="/payment">Betalning</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <p className="text-center mt-6 text-sm text-black">
        &copy; {new Date().getFullYear()} {SITE_TITLE}
      </p>
    </footer>
  );
}

