// src/components/Footer/Footer.tsx

import { SITE_TITLE } from '../../config/site';

export default function Footer() {
  return (
    <footer className="siteFooter">
      Instagram - Facebook - LinkedIn
      <br />
      Shopping - Categories
      <br />
      MyPages - Login - MyCart
      <br />
      CustomerService - Contact - FAQ - ShippingInfo - PaymentInfo
      <p>
        &copy; {new Date().getFullYear()} {SITE_TITLE}
      </p>
    </footer>
  );
}
