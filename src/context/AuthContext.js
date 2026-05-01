import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "./firebaseConfig";
import { signOut as firebaseSignOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

const normalizeRole = (role) =>
  role ? role.toUpperCase() : "CITIZEN";

const safeParse = (str) => {
  try {
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

const STORAGE_USER_KEY  = "user_data";
const STORAGE_TOKEN_KEY = "user_token";

// ─── TODO: REMOVE BEFORE PRODUCTION ──────────────────────────────────────────
const DEV_MOCK_USER = {
  id: "dev-123",
  name: "Test Officer",
  role: "POLICE",
  token: "dev-token",
  email: "officer@test.com",
  email_verified: true,        // ← bypasses email verification gate
};
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  // TODO: REMOVE DEV BYPASS — change both back to useState(null)
  const [user,    setUser]    = useState(DEV_MOCK_USER);
  const [token,   setToken]   = useState("dev-token");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // TODO: REMOVE DEV BYPASS — uncomment this block when done
        // const [savedUser, savedToken] = await AsyncStorage.multiGet([
        //   STORAGE_USER_KEY,
        //   STORAGE_TOKEN_KEY,
        // ]);
        // const parsedUser  = safeParse(savedUser[1]);
        // const parsedToken = savedToken[1];
        // if (parsedUser && parsedToken) {
        //   setUser(parsedUser);
        //   setToken(parsedToken);
        // }
      } catch (e) {
        console.error("[AuthContext] Failed to restore session:", e);
      } finally {
        setLoading(false); // ← must always run or app spins forever
      }
    };

    restoreSession();
  }, []);

  const signIn = useCallback(async (userData, accessToken) => {
    try {
      setLoading(true);
      const normalizedUser = {
        ...userData,
        role: normalizeRole(userData.role),
      };
      await AsyncStorage.multiSet([
        [STORAGE_USER_KEY,  JSON.stringify(normalizedUser)],
        [STORAGE_TOKEN_KEY, accessToken],
      ]);
      setUser(normalizedUser);
      setToken(accessToken);
    } catch (e) {
      console.error("[AuthContext] signIn error:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (auth?.currentUser) {
        await firebaseSignOut(auth);
      }
      await AsyncStorage.multiRemove([STORAGE_USER_KEY, STORAGE_TOKEN_KEY]);
    } catch (e) {
      console.error("[AuthContext] signOut error:", e);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  const updateUser = useCallback(async (updatedData) => {
    try {
      const merged = { ...user, ...updatedData };
      setUser(merged);
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error("[AuthContext] updateUser error:", e);
    }
  }, [user]);

  const switchRole = useCallback(async (targetRole = null) => {
    if (!user) return false;
    try {
      const newRole = targetRole
        ? targetRole.toUpperCase()
        : user.role === "RESPONDER" ? "CITIZEN" : "RESPONDER";

      if (auth?.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { role: newRole }, { merge: true });
      }

      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
      return true;
    } catch (e) {
      console.error("[AuthContext] switchRole error:", e);
      throw e;
    }
  }, [user]);

  const authValue = useMemo(
    () => ({
      user,
      token,
      loading,
      role: user?.role || "CITIZEN",
      signIn,
      signOut,
      logout: signOut,
      updateUser,
      switchRole,
    }),
    [user, token, loading, signIn, signOut, updateUser, switchRole]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}