import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";

const DEMO_NAMES: Record<"admin" | "warden" | "student", Record<string, string>> = {
  admin: {
    default: "Admin Manager",
  },
  warden: {
    default: "Warden Aisha",
  },
  student: {
    "2220": "Aarav Sharma",
    "2201": "Nisha Gupta",
    "2215": "Rohan Patel",
    default: "Student User",
  },
};

const resolveDemoName = (userId: string, targetRole: "admin" | "warden" | "student") => {
  const normalizedId = userId.trim();
  const roleMap = DEMO_NAMES[targetRole];

  if (normalizedId && roleMap[normalizedId]) {
    return roleMap[normalizedId];
  }

  if (normalizedId) {
    return targetRole === "student" ? `Student ${normalizedId}` : normalizedId;
  }

  return roleMap.default;
};

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
    const resolvedName = resolveDemoName(userId, targetRole);
    const uid = userId ? `demo-${userId.toLowerCase().replace(/\W+/g, '-')}` : `demo-${targetRole}`;

    setUser({
      uid,
      email: `${targetRole}@hostelwise.com`,
      displayName: resolvedName,
    } as User);

    setRole(targetRole);
    setUserData({
      name: resolvedName,
      role: targetRole,
      email: `${targetRole}@hostelwise.com`,
      userId: userId,
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
