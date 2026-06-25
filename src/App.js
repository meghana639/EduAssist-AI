import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Complaints from "./pages/Complaints";

function App() {

  const role =
    localStorage.getItem("role");

  const isLoggedIn =
    localStorage.getItem("role");

  return (

    <BrowserRouter>

      {isLoggedIn && <Navbar />}

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={
            isLoggedIn
              ? <Dashboard />
              : <Login />
          }
        />

        {/* Student Only */}

        <Route
          path="/assignments"
          element={
            role === "student"
              ? <Assignments />
              : <Dashboard />
          }
        />

        {/* Student + Faculty */}

        <Route
          path="/complaints"
          element={
            isLoggedIn
              ? <Complaints />
              : <Login />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;