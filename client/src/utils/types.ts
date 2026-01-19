export type Product_T = {
  id: number;
  media_url: string;
  name: string;
  brand: string;
  price: number;
  description: string;
};

export type User = {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;  // Only for createUser
  username: string;   // Hardcoded to email at registration
  is_active: boolean; // Default true
  roles: string[];    // Default ["Public"]
  groups: string[];   // Default []
};

export type LoginResponse = {
  message: string;
  token: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

