"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type UserRole = "donor" | "hospital" | null;

interface UserData {
  firstName?: string;
  lastName?: string;
  hospitalName?: string;
  role: UserRole;
  email: string;
  isSubmitted?: boolean;
  dob?: string;
  age?: number;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  userRole: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ role: UserRole; isSubmitted: boolean }>;
  register: (email: string, password: string, role: UserRole, userData: Partial<UserData>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data() as UserData;
        setUserData(data);
        setUserRole(data?.role || null);
      } else {
        setUserData(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, role: UserRole, userData: Partial<UserData>) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      role,
      email
    });
    setUserRole(role);
  };

  const login = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.data() as UserData;
    const role = data?.role || null;
    setUserRole(role);
    return { role, isSubmitted: data?.isSubmitted || false };
  };

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (userData) {
      await setDoc(doc(db, "users", user!.uid), {
        ...userData,
        ...data
      });
      setUserData({ ...userData, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, userRole, loading, login, register, logout, updateUserData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 