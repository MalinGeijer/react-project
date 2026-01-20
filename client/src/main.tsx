// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { FavoriteProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CartProvider>
      <FavoriteProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </FavoriteProvider>
    </CartProvider>
  </React.StrictMode>
);
