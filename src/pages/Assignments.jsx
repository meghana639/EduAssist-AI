
import { useCallback, useEffect, useState } from "react";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

function Assignments() {
  const [assignments, setAssignments] = useState([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  // Fetch assignments belonging to the logged-in student.
  const fetchAssignments = useCallback(async () => {
    if (!userId) {
      setAssignments([]);
      setError("Please log in to view assignments.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const assignmentsQuery = query(
        collection(db, "assignments"),
        where("studentId", "==", userId)
      );

      const snapshot = await getDocs(assignmentsQuery);

      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);

      setError(
        "Unable to load assignments. Check database permissions."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load assignments when the logged-in student changes.
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Save a new assignment.
  const saveAssignment = async () => {
    if (!title.trim() || !subject.trim() || !deadline) {
      setError("Please fill all fields.");
      return;
    }

    const user = auth.currentUser;

    if (!user?.uid || !user?.email) {
      setError("Please log in again.");
      return;
    }

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      await addDoc(collection(db, "assignments"), {
        title: title.trim(),
        subject: subject.trim(),
        deadline,
        status: "Pending",
        createdAt: new Date().toISOString().split("T")[0],
        studentEmail: user.email,
        studentId: user.uid,
      });

      setTitle("");
      setSubject("");
      setDeadline("");

      await fetchAssignments();
    } catch (err) {
      console.error("Error saving assignment:", err);

      setError(
        "Unable to save assignment. Check database permissions."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Assignments</h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card p-4 shadow mt-3">
        <h4>Add Assignment</h4>

        <input
          className="form-control mb-3"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="form-control mb-3"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          type="date"
          className="form-control mb-3"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={saveAssignment}
          disabled={saving}
        >
          {saving ? "Saving..." : "Add Assignment"}
        </button>
      </div>

      <div className="card p-4 shadow mt-4">
        <h4>My Assignments</h4>

        {loading ? (
          <p>Loading assignments...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>

              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.subject}</td>
                      <td>{item.deadline}</td>
                      <td>{item.status}</td>
                      <td>{item.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Assignments;
