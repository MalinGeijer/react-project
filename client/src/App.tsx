import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout/Layout';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import Play from './pages/Play';
import Login from './pages/Login';
import Product from './pages/Product';
import Favorites from './pages/Favorites';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/gallery', element: <Gallery /> },
      { path: '/blog', element: <Blog /> },
      { path: '/play', element: <Play /> },
      { path: '/login', element: <Login /> },
      { path: '/favorites', element: <Favorites /> },

      // Produktsida
      { path: '/product/:id', element: <Product /> },

      // 404 – alltid sist
      { path: '*', element: <h2>404 – Page not found</h2> },
    ],
  },
]);


export default function App() {
  return <RouterProvider router={router} />;
}
