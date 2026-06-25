import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {

    if (!email || !password) {

      alert("Please enter email and password");

      return;

    }

    localStorage.setItem("role", role);
    localStorage.setItem("email", email);

    navigate("/");
    window.location.reload();

  };

  return (

    <div className="container mt-5">

      <div
        className="card p-4 shadow mx-auto"
        style={{ maxWidth: "450px" }}
      >

        <h2 className="text-center">
          EduAssist AI
        </h2>

        <p className="text-center">
          Academic Tracking & Student Support Platform
        </p>

        <label className="mb-2">
          Login As
        </label>

        <select
          className="form-select mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">
            Student
          </option>

          <option value="faculty">
            Faculty
          </option>
        </select>

        <input
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="btn btn-primary"
          onClick={handleLogin}
        >
          Login
        </button>

      </div>

    </div>

  );
}

export default Login;