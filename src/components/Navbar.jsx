import { Link } from "react-router-dom";

function Navbar() {

  const role =
    localStorage.getItem("role");

  const logout = () => {

    localStorage.removeItem("role");
    localStorage.removeItem("email");

    window.location.href = "/login";

  };

  return (

    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">

      <div className="container">

        <Link
          className="navbar-brand"
          to="/"
        >
          EduAssist AI
        </Link>

        <div className="collapse navbar-collapse">

          <ul className="navbar-nav ms-auto">

            {/* Dashboard */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/"
              >
                Dashboard
              </Link>

            </li>

            {/* Student Only */}

            {role === "student" && (

              <li className="nav-item">

                <Link
                  className="nav-link"
                  to="/assignments"
                >
                  Assignments
                </Link>

              </li>

            )}

            {/* Both Student & Faculty */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/complaints"
              >
                Complaints
              </Link>

            </li>

            {/* Role Badge */}

            <li className="nav-item">

              <span
                className="nav-link text-warning"
              >
                {role === "faculty"
                  ? "Faculty"
                  : "Student"}
              </span>

            </li>

            {/* Logout */}

            <li className="nav-item ms-3">

              <button
                className="btn btn-light btn-sm"
                onClick={logout}
              >
                Logout
              </button>

            </li>

          </ul>

        </div>

      </div>

    </nav>

  );
}

export default Navbar;