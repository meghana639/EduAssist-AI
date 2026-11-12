
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

function Navbar({ role }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setError("");
    setLoggingOut(true);

    try {
      await signOut(auth);

      localStorage.removeItem("role");
      localStorage.removeItem("email");

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">

        <Link className="navbar-brand" to="/">
          EduAssist AI
        </Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-center">

            <li className="nav-item">
              <Link className="nav-link" to="/">
                Dashboard
              </Link>
            </li>

            {/* Assignments are available only to students */}
            {role === "student" && (
              <li className="nav-item">
                <Link className="nav-link" to="/assignments">
                  Assignments
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link" to="/complaints">
                Complaints
              </Link>
            </li>

            {/* Display the verified role */}
            <li className="nav-item">
              <span className="nav-link text-warning fw-bold">
                {role === "faculty" ? "Faculty" : "Student"}
              </span>
            </li>

            <li className="nav-item ms-3">
              <button
                className="btn btn-light btn-sm"
                onClick={logout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>

          </ul>
        </div>

        {error && (
          <span className="text-white ms-3">
            {error}
          </span>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
