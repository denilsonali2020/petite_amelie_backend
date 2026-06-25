import crypto from "crypto";

// Genera 6 números aleatorios seguros
export const generateToken = () => 
  crypto.randomInt(100000, 999999).toString();