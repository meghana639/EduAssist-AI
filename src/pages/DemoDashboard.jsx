
import { Link } from "react-router-dom";
import {
  demoAssignments,
  demoComplaints,
} from "../demo/demoData";

function DemoDashboard() {
  const pending = demoAssignments.filter(
    (item) => item.status === "Pending"
  );

  const completed = demoAssignments.filter(
    (item) => item.status === "Completed"
  );

  const openComplaints = demoComplaints.filter(
    (item) => item.status === "Open"
  );

  const resolvedComplaints = demoComplaints.filter(
    (item) => item.status === "Resolved"
  );

  const priorityAssignment = [...pending].sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  )[0];

  const stats = [
    ["Total Assignments", demoAssignments.length],
    ["Pending Assignments", pending.length],
    ["Completed Assignments", completed.length],
    ["My Complaints", demoComplaints.length],
  ];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1>EduAssist AI</h1>
          <p className="text-muted mb-0">
            Academic Monitoring & Student Support
          </p>
        </div>

        <span className="badge bg-primary">
          Student Demo Mode
        </span>
      </div>

      <div className="alert alert-info">
        You're exploring a recruiter demo with fictional
        student data. No registration is required.
      </div>

      <h4 className="mb-3">Academic Overview</h4>

      <div className="row g-3">
        {stats.map(([label, value]) => (
          <div className="col-6 col-md-3" key={label}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted mb-2">{label}</p>
                <h2 className="mb-0">{value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-2">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5>Smart Assignment Reminder</h5>
              <p>
                You have <strong>{pending.length}</strong>{" "}
                pending assignments.
              </p>
              <p className="mb-1">
                <strong>Highest Priority:</strong>
              </p>
              <p>
                {priorityAssignment?.title ||
                  "No pending assignments"}
              </p>
              <small className="text-muted">
                Suggested action: Complete the earliest
                pending assignment first.
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5>Workload Analysis</h5>
              <p>
                Pending assignments: {pending.length}
              </p>
              <p>
                Open complaints: {openComplaints.length}
              </p>
              <strong>
                Workload Level:{" "}
                {pending.length >= 5
                  ? "High"
                  : pending.length >= 3
                  ? "Medium"
                  : "Low"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-2">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5>Assignments</h5>
              {demoAssignments.map((item) => (
                <div
                  key={item.id}
                  className="border-bottom py-2"
                >
                  <strong>{item.title}</strong>
                  <div className="small text-muted">
                    {item.subject} | Due: {item.deadline}
                  </div>
                  <span
                    className={`badge ${
                      item.status === "Completed"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5>Complaint Monitoring</h5>
              <p>
                Open: {openComplaints.length} | Resolved:{" "}
                {resolvedComplaints.length}
              </p>

              {demoComplaints.map((item) => (
                <div
                  key={item.id}
                  className="border-bottom py-2"
                >
                  <strong>{item.title}</strong>
                  <div className="small text-muted">
                    {item.category}
                  </div>
                  <span
                    className={`badge ${
                      item.status === "Resolved"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <Link to="/login" className="btn btn-outline-primary">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default DemoDashboard;
