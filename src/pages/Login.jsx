
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Authenticate with Firebase.
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = credential.user;

      // Step 2: Read the trusted role from Firestore.
      const profileSnapshot = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!profileSnapshot.exists()) {
        await signOut(auth);
        setError("User profile not found. Contact the administrator.");
        return;
      }

      const verifiedRole = profileSnapshot.data().role;

      if (
        verifiedRole !== "student" &&
        verifiedRole !== "faculty"
      ) {
        await signOut(auth);
        setError("Your account does not have a valid role.");
        return;
      }

      // Step 3: Ensure the selected role matches Firestore.
      if (verifiedRole !== role) {
        await signOut(auth);
        setError(
          `This account is registered as ${verifiedRole}. Please select the correct role.`
        );
        return;
      }

      // Temporary compatibility with existing pages.
      // Firestore profile remains the trusted role source.
      localStorage.setItem("role", verifiedRole);
      localStorage.setItem("email", user.email || "");

      // Step 4: Open the dashboard.
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);

      // Prevent an authenticated session remaining after
      // an unexpected profile lookup or permission failure.
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("Sign-out error:", signOutError);
        }
      }

      setError("Login failed. Check your credentials or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card p-4 shadow mx-auto"
        style={{ maxWidth: "450px" }}
      >
        <h2 className="text-center">EduAssist AI</h2>

        <p className="text-center">
          Academic Tracking & Student Support Platform
        </p>

        <label className="mb-2">Login As</label>

        <select
          className="form-select mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              handleLogin();
            }
          }}
        />

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;
