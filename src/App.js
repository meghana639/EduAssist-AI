
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase/firebaseConfig";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Complaints from "./pages/Complaints";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        setRole(null);
        setProfileError("");

        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(firebaseUser);

        try {
          const profileRef = doc(db, "users", firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);

          if (!active || auth.currentUser?.uid !== firebaseUser.uid) {
            return;
          }

          if (!profileSnap.exists()) {
            setProfileError("Your user profile was not found.");
            return;
          }

          const profile = profileSnap.data();

          if (
            profile.role !== "student" &&
            profile.role !== "faculty"
          ) {
            setProfileError("Your account has an invalid role.");
            return;
          }

          setRole(profile.role);
        } catch (error) {
          if (active) {
            setProfileError("Unable to load your user profile.");
          }
        } finally {
          if (active && auth.currentUser?.uid === firebaseUser.uid) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h3>Loading EduAssist AI...</h3>
      </div>
    );
  }

  const isLoggedIn = Boolean(user && role);

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar role={role} />}

      {user && !role && (
        <div className="container mt-4">
          <div className="alert alert-danger">
            {profileError || "Your account is not authorized."}
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => auth.signOut()}
          >
            Sign out
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/" replace />
              : user
                ? null
                : <Login />
          }
        />

        <Route
          path="/"
          element={
            isLoggedIn
              ? <Dashboard role={role} />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/assignments"
          element={
            role === "student"
              ? <Assignments />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/complaints"
          element={
            isLoggedIn
              ? <Complaints role={role} />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
