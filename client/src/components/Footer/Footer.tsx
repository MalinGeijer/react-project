// src/components/Footer/Footer.tsx
import { useState, useEffect } from 'react';
import { SITE_TITLE } from '../../config/site';
import { SocialIcon } from '../SocialIcon/SocialIcon';
import type { Product_T } from '../../utils/types';
import { log } from '../../utils/logger';

export default function Footer() {
  const [products, setProducts] = useState<Product_T[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    fetch('/api/products')
      // Best practice to check if the response is ok
      .then(res => {
        // Debug logging
        log(`Status: ${res.status} (${res.statusText})`);
        log('Headers:', [...res.headers]);  // Header contents
        log('URL:', res.url);               // URL that responded
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        log('JSON data:', data);
        setProducts(data)
      })
      // Catch network or parsing errors
      .catch(err => console.error(err));
  }, []);

  // Extract unique product names for the Shopping accordion
  // .map creates a new array with just the names
  // Set removes duplicates
  // Array.from converts the Set back to an array
  const uniqueProductNames = Array.from(new Set(products.map(p => p.name)));

  // Toggle accordion sections
  const toggleSection = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  return (
    <footer className="siteFooter bg-base-surface p-6">
      {/* Social icons */}
      <div className="flex justify-center gap-4 mb-6">
        <a href="https://instagram.com" target="_blank"><SocialIcon name="instagram" className="w-6 h-6" /></a>
        <a href="https://facebook.com" target="_blank"><SocialIcon name="facebook" className="w-6 h-6" /></a>
      </div>

      {/* Accordion / Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

