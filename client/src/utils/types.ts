// TODO: Replace with interface
export type Product_T = {
  id: number;
  name: string;
  brand: string;
  price: number;
  image_url: string;
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

export type PredictionResult = {
  model?: string;
  label?: number;
  predicted_digit?: number;
  confidence?: number;
  probabilities?: number[];
  info?: string;
  error?: string;
}
