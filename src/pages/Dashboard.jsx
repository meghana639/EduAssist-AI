
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

function Dashboard({ role }) {
  const [assignments, setAssignments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !role) return;

    let active = true;
    let unsubscribeAssignments = () => {};
    let unsubscribeComplaints = () => {};

    setLoading(true);
    setError("");
    setAssignments([]);
    setComplaints([]);

    if (role === "student") {
      const assignmentQuery = query(
        collection(db, "assignments"),
        where("studentId", "==", user.uid)
      );

      unsubscribeAssignments = onSnapshot(
        assignmentQuery,
        (snapshot) => {
          if (active) {
            setAssignments(
              snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }))
            );
          }
        },
        (err) => {
          console.error("Assignment dashboard error:", err);
          if (active) setError("Unable to load assignments.");
        }
      );

      const ownershipQuery = query(
        collection(db, "complaintOwnership"),
        where("studentId", "==", user.uid)
      );

      unsubscribeComplaints = onSnapshot(
        ownershipQuery,
        async (snapshot) => {
          try {
            const results = await Promise.all(
              snapshot.docs.map(async (item) => {
                const complaint = await getDoc(
                  doc(db, "complaints", item.id)
                );

                return complaint.exists()
                  ? { id: complaint.id, ...complaint.data() }
                  : null;
              })
            );

            if (active) {
              setComplaints(results.filter(Boolean));
              setLoading(false);
            }
          } catch (err) {
            console.error("Complaint dashboard error:", err);
            if (active) {
              setError("Unable to load complaints.");
              setLoading(false);
            }
          }
        },
        (err) => {
          console.error("Ownership dashboard error:", err);
          if (active) {
            setError("Unable to load complaints.");
            setLoading(false);
          }
        }
      );
    }

    if (role === "faculty") {
      unsubscribeComplaints = onSnapshot(
        collection(db, "complaints"),
        (snapshot) => {
          if (active) {
            setComplaints(
              snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }))
            );
            setLoading(false);
          }
        },
        (err) => {
          console.error("Faculty dashboard error:", err);
          if (active) {
            setError("Unable to load complaints.");
            setLoading(false);
          }
        }
      );
    }

    return () => {
      active = false;
      unsubscribeAssignments();
      unsubscribeComplaints();
    };
  }, [role]);

  const totalAssignments = assignments.length;

  const pending = assignments.filter(
    (item) => item.status === "Pending"
  );

  const completed = assignments.filter(
    (item) => item.status === "Completed"
  );

  const totalComplaints = complaints.length;

  const openComplaints = complaints.filter(
    (item) => item.status === "Open"
  ).length;

  const resolvedComplaints = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const priorityAssignment =
    [...pending].sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    )[0]?.title || "No Pending Assignments";

  return (
    <div className="container mt-4">
      <h1>EduAssist AI</h1>

      <p>AI-Powered Academic Tracking & Student Support Platform</p>

      <p>
        Logged in as: <strong>{role === "faculty" ? "Faculty" : "Student"}</strong>
      </p>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading && <p>Loading dashboard...</p>}

      {role === "faculty" ? (
        <>
          <div className="row g-3">
            {[
              ["Total Complaints", totalComplaints],
              ["Open Complaints", openComplaints],
              ["Resolved Complaints", resolvedComplaints],
            ].map(([label, value]) => (
              <div className="col-md-4" key={label}>
                <div className="card p-3 shadow h-100">
                  <h5>{label}</h5>
                  <h2>{value}</h2>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-4 shadow">
            <div className="card-body">
              <h4>👨‍🏫 Faculty Dashboard</h4>
              <p>Review student complaints and resolve issues.</p>
              <ul>
                <li>View all complaints</li>
                <li>Mark complaints resolved</li>
                <li>Monitor open and resolved complaints</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="row g-3">
            {[
              ["Total Assignments", totalAssignments],
              ["Pending Assignments", pending.length],
              ["Completed Assignments", completed.length],
              ["My Complaints", totalComplaints],
            ].map(([label, value]) => (
              <div className="col-md-3" key={label}>
                <div className="card p-3 shadow h-100">
                  <h5>{label}</h5>
                  <h2>{value}</h2>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3 mt-1">
            {[
              ["Open Complaints", openComplaints],
              ["Resolved Complaints", resolvedComplaints],
            ].map(([label, value]) => (
              <div className="col-md-6" key={label}>
                <div className="card p-3 shadow h-100">
                  <h5>{label}</h5>
                  <h2>{value}</h2>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-4 shadow">
            <div className="card-body">
              <h4>🤖 AI Smart Reminder</h4>
              <p>You have {pending.length} pending assignments.</p>
              <p>
                <strong>Highest Priority:</strong>
                <br />
                {priorityAssignment}
              </p>
              <p>
                <strong>Suggested Plan:</strong>
                <br />
                {pending.length > 0
                  ? `Complete ${priorityAssignment} first, then continue with remaining assignments.`
                  : "You have no pending assignments."}
              </p>
            </div>
          </div>

          <div className="card mt-4 shadow">
            <div className="card-body">
              <h4>📈 AI Workload Analysis</h4>
              <p>
                You have {pending.length} pending assignments and{" "}
                {openComplaints} open complaints.
              </p>
              <p>
                <strong>
                  Workload Level:{" "}
                  {pending.length >= 5
                    ? "High"
                    : pending.length >= 3
                    ? "Medium"
                    : "Low"}
                </strong>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
