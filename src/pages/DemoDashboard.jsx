
import { useState } from "react";
import { Link } from "react-router-dom";
import useDemoData from "../demo/useDemoData";

function DemoDashboard({ role = "student" }) {
  const {
    assignments,
    complaints,
    addAssignment,
    completeAssignment,
    deleteAssignment,
    addComplaint,
    resolveComplaint,
    resetDemo,
  } = useDemoData();

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");

  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintCategory, setComplaintCategory] = useState("General");

  const pending = assignments.filter(
    (item) => item.status === "Pending"
  );

  const completed = assignments.filter(
    (item) => item.status === "Completed"
  );

  const openComplaints = complaints.filter(
    (item) => item.status === "Open"
  );

  const resolvedComplaints = complaints.filter(
    (item) => item.status === "Resolved"
  );

  const priorityAssignment = [...pending].sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  )[0];

  const handleAddAssignment = (event) => {
    event.preventDefault();

    if (
      !assignmentTitle.trim() ||
      !assignmentSubject.trim() ||
      !assignmentDeadline
    ) {
      return;
    }

    addAssignment({
      title: assignmentTitle.trim(),
      subject: assignmentSubject.trim(),
      deadline: assignmentDeadline,
    });

    setAssignmentTitle("");
    setAssignmentSubject("");
    setAssignmentDeadline("");
  };

  const handleAddComplaint = (event) => {
    event.preventDefault();

    if (!complaintTitle.trim() || !complaintDescription.trim()) {
      return;
    }

    addComplaint({
      title: complaintTitle.trim(),
      description: complaintDescription.trim(),
      category: complaintCategory,
      anonymous: false,
    });

    setComplaintTitle("");
    setComplaintDescription("");
    setComplaintCategory("General");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h1>EduAssist AI</h1>
          <p className="text-muted mb-0">
            Academic Monitoring & Student Support
          </p>
        </div>

        <span className="badge bg-primary">
          {role === "faculty"
            ? "Faculty Demo Mode"
            : "Student Demo Mode"}
        </span>
      </div>

      <div className="alert alert-info">
        Interactive recruiter demo using fictional data.
        Changes are saved only in your browser.
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link
          to="/demo"
          className={`btn ${
            role === "student"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
        >
          Student Demo
        </Link>

        <Link
          to="/demo/faculty"
          className={`btn ${
            role === "faculty"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
        >
          Faculty Demo
        </Link>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => {
            if (window.confirm("Reset all demo data?")) {
              resetDemo();
            }
          }}
        >
          Reset Demo
        </button>

        <Link to="/login" className="btn btn-outline-secondary">
          Back to Login
        </Link>
      </div>

      {role === "student" ? (
        <>
          <h4>Academic Overview</h4>

          <div className="row g-3 mb-4">
            {[
              ["Total Assignments", assignments.length],
              ["Pending Assignments", pending.length],
              ["Completed Assignments", completed.length],
              ["My Complaints", complaints.length],
            ].map(([label, value]) => (
              <div className="col-6 col-md-3" key={label}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted">{label}</p>
                    <h2>{value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5>Smart Assignment Reminder</h5>
                  <p>
                    You have {pending.length} pending assignments.
                  </p>
                  <strong>Highest Priority:</strong>
                  <p>
                    {priorityAssignment?.title ||
                      "No pending assignments"}
                  </p>
                  <small className="text-muted">
                    Complete your earliest pending assignment first.
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5>Workload Analysis</h5>
                  <p>Pending assignments: {pending.length}</p>
                  <p>Open complaints: {openComplaints.length}</p>
                  <strong>
                    Workload:{" "}
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

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4>Add Assignment</h4>

              <form onSubmit={handleAddAssignment}>
                <input
                  className="form-control mb-2"
                  placeholder="Assignment title"
                  value={assignmentTitle}
                  onChange={(e) =>
                    setAssignmentTitle(e.target.value)
                  }
                  required
                />

                <input
                  className="form-control mb-2"
                  placeholder="Subject"
                  value={assignmentSubject}
                  onChange={(e) =>
                    setAssignmentSubject(e.target.value)
                  }
                  required
                />

                <input
                  type="date"
                  className="form-control mb-2"
                  value={assignmentDeadline}
                  onChange={(e) =>
                    setAssignmentDeadline(e.target.value)
                  }
                  required
                />

                <button className="btn btn-success" type="submit">
                  Add Assignment
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4>My Assignments</h4>

              {assignments.length === 0 && (
                <p>No assignments available.</p>
              )}

              {assignments.map((item) => (
                <div
                  key={item.id}
                  className="border-bottom py-3"
                >
                  <h6>{item.title}</h6>
                  <p className="text-muted mb-2">
                    {item.subject} | Due: {item.deadline}
                  </p>

                  <span
                    className={`badge me-2 ${
                      item.status === "Completed"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.status === "Pending" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success me-2"
                      onClick={() => completeAssignment(item.id)}
                    >
                      Mark Completed
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteAssignment(item.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4>Submit Complaint</h4>

              <form onSubmit={handleAddComplaint}>
                <input
                  className="form-control mb-2"
                  placeholder="Complaint title"
                  value={complaintTitle}
                  onChange={(e) =>
                    setComplaintTitle(e.target.value)
                  }
                  required
                />

                <select
                  className="form-select mb-2"
                  value={complaintCategory}
                  onChange={(e) =>
                    setComplaintCategory(e.target.value)
                  }
                >
                  <option>General</option>
                  <option>Lab</option>
                  <option>Classroom</option>
                  <option>Transport</option>
                  <option>Other</option>
                </select>

                <textarea
                  className="form-control mb-2"
                  placeholder="Describe your complaint"
                  value={complaintDescription}
                  onChange={(e) =>
                    setComplaintDescription(e.target.value)
                  }
                  required
                />

                <button className="btn btn-primary" type="submit">
                  Submit Complaint
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4>My Complaints</h4>

              {complaints.map((item) => (
                <div
                  key={item.id}
                  className="border-bottom py-3"
                >
                  <h6>{item.title}</h6>
                  <p className="mb-1">{item.description}</p>

                  <span
                    className={`badge ${
                      item.status === "Resolved"
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
        </>
      ) : (
        <>
          <h4>Faculty Dashboard</h4>

          <div className="row g-3 mb-4">
            {[
              ["Total Complaints", complaints.length],
              ["Open Complaints", openComplaints.length],
              ["Resolved Complaints", resolvedComplaints.length],
            ].map(([label, value]) => (
              <div className="col-md-4" key={label}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5>{label}</h5>
                    <h2>{value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h4>Student Complaints</h4>

              {complaints.map((item) => (
                <div
                  key={item.id}
                  className="border-bottom py-3"
                >
                  <h6>{item.title}</h6>
                  <p>{item.description}</p>

                  <span
                    className={`badge me-3 ${
                      item.status === "Resolved"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.status === "Open" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() => resolveComplaint(item.id)}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DemoDashboard;
