import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  role: "admin" | "warden" | "student" | null;
  loading: boolean;
  userData: any | null;
  logout: () => Promise<void>;
  loginAs: (userId: string, targetRole: "admin" | "warden" | "student") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  userData: null,
  logout: async () => {},
  loginAs: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "warden" | "student" | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check - we are manually controlling login through loginAs for demo
    setLoading(false);
  }, []);

  const loginAs = (userId: string, targetRole: "admin" | "warden" | "student") => {
    // Generate a demo uid based on userId or targetRole
    const uid = userId ? `demo-${userId.toLowerCase().replace(/\W+/g, '-')}` : `demo-${targetRole}`;
    setUser({ 
      uid: uid,
      email: targetRole + "@hostelwise.com", 
      displayName: userId || (targetRole.charAt(0).toUpperCase() + targetRole.slice(1))
    } as User);
    setRole(targetRole);
    setUserData({ 
      name: userId || (targetRole.charAt(0).toUpperCase() + targetRole.slice(1)), 
      role: targetRole, 
      email: targetRole + "@hostelwise.com",
      userId: userId
    });
  };

  const logout = async () => {
    setUser(null);
    setRole(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, userData, logout, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
