import { jwtDecode } from 'jwt-decode';
import CryptoJS from 'crypto-js';
import { ENCRYPTION_KEY } from '../config/constants';

interface JWTPayload {
  exp: number;
  email: string;
  role: string;
}

interface StoredUser {
  email: string;
  hashedPassword: string;
  salt: string;
  role: string;
}

const TOKEN_KEY = 'admin_token';
const USERS_KEY = 'admin_users';

// Generate a random salt
const generateSalt = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => charset[x % charset.length])
    .join('');
};

// Hash password with salt using PBKDF2
const hashPassword = (password: string, salt: string): string => {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  });
  return key.toString();
};

// Encrypt data before storing
const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

// Decrypt stored data
const decrypt = (data: string): string => {
  const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Initialize admin user if none exists
const initializeAdminUser = () => {
  const encryptedUsers = localStorage.getItem(USERS_KEY);
  if (!encryptedUsers) {
    const salt = generateSalt();
    const adminUser: StoredUser = {
      email: 'adam@lawsondigitalgroup.com',
      hashedPassword: hashPassword('admin123', salt),
      salt,
      role: 'admin'
    };
    const users = encrypt(JSON.stringify([adminUser]));
    localStorage.setItem(USERS_KEY, users);
  }
};

// Get stored users
const getUsers = (): StoredUser[] => {
  const encryptedUsers = localStorage.getItem(USERS_KEY);
  if (!encryptedUsers) return [];
  const decryptedUsers = decrypt(encryptedUsers);
  return JSON.parse(decryptedUsers);
};

// Create JWT token
const createToken = (email: string, role: string): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = CryptoJS.HmacSHA256(
    `${encodedHeader}.${encodedPayload}`,
    ENCRYPTION_KEY
  ).toString();
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const login = (email: string, password: string): boolean => {
  try {
    initializeAdminUser();
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) return false;
    
    const hashedAttempt = hashPassword(password, user.salt);
    if (hashedAttempt !== user.hashedPassword) return false;
    
    const token = createToken(email, user.role);
    const encryptedToken = encrypt(token);
    localStorage.setItem(TOKEN_KEY, encryptedToken);
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const register = (email: string, password: string, role: string = 'admin'): boolean => {
  try {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }

    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);
    
    const newUser: StoredUser = {
      email,
      hashedPassword,
      salt,
      role
    };
    
    users.push(newUser);
    const encryptedUsers = encrypt(JSON.stringify(users));
    localStorage.setItem(USERS_KEY, encryptedUsers);
    
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  try {
    const encryptedToken = localStorage.getItem(TOKEN_KEY);
    if (!encryptedToken) return false;

    const token = decrypt(encryptedToken);
    const decoded = jwtDecode<JWTPayload>(token);
    
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getCurrentUser = (): { email: string; role: string } | null => {
  try {
    const encryptedToken = localStorage.getItem(TOKEN_KEY);
    if (!encryptedToken) return null;

    const token = decrypt(encryptedToken);
    const decoded = jwtDecode<JWTPayload>(token);
    
    return {
      email: decoded.email,
      role: decoded.role
    };
  } catch {
    return null;
  }
};

export const changePassword = (email: string, oldPassword: string, newPassword: string): boolean => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) return false;
    
    const user = users[userIndex];
    const hashedOldAttempt = hashPassword(oldPassword, user.salt);
    
    if (hashedOldAttempt !== user.hashedPassword) return false;
    
    const newSalt = generateSalt();
    const newHashedPassword = hashPassword(newPassword, newSalt);
    
    users[userIndex] = {
      ...user,
      hashedPassword: newHashedPassword,
      salt: newSalt
    };
    
    const encryptedUsers = encrypt(JSON.stringify(users));
    localStorage.setItem(USERS_KEY, encryptedUsers);
    
    return true;
  } catch (error) {
    console.error('Password change error:', error);
    return false;
  }
};