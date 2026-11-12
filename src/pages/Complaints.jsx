
import { useCallback, useEffect, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

function Complaints({ role }) {
  const [complaints, setComplaints] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Load complaints based on the verified user role.
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Please log in again.");
      }

      if (role === "faculty") {
        // Faculty can see complaints, but not ownership records.
        const snapshot = await getDocs(
          collection(db, "complaints")
        );

        setComplaints(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      } else if (role === "student") {
        // Students can only list their own ownership records.
        const ownershipQuery = query(
          collection(db, "complaintOwnership"),
          where("studentId", "==", user.uid)
        );

        const ownershipSnapshot = await getDocs(ownershipQuery);

        const results = await Promise.all(
          ownershipSnapshot.docs.map(async (ownership) => {
            const complaintSnapshot = await getDoc(
              doc(db, "complaints", ownership.id)
            );

            if (!complaintSnapshot.exists()) {
              return null;
            }

            return {
              id: complaintSnapshot.id,
              ...complaintSnapshot.data(),
            };
          })
        );

        setComplaints(results.filter(Boolean));
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Students submit a complaint and private ownership
  // record together using an atomic Firestore batch.
  const saveComplaint = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !category || !cleanDescription) {
      alert("Please fill all fields.");
      return;
    }

    const user = auth.currentUser;

    if (!user || role !== "student") {
      alert("Only signed-in students can submit complaints.");
      return;
    }

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const complaintRef = doc(collection(db, "complaints"));

      const ownershipRef = doc(
        db,
        "complaintOwnership",
        complaintRef.id
      );

      const complaintData = {
        title: cleanTitle,
        category,
        description: cleanDescription,
        anonymous,
        status: "Open",
      };

      // Anonymous complaints never store student identity
      // in the faculty-visible complaints collection.
      if (!anonymous) {
        if (!user.email) {
          throw new Error("Your account has no email address.");
        }

        complaintData.studentEmail = user.email;
      }

      const batch = writeBatch(db);

      batch.set(complaintRef, complaintData);

      batch.set(ownershipRef, {
        studentId: user.uid,
      });

      await batch.commit();

      alert("Complaint submitted successfully!");

      setTitle("");
      setCategory("");
      setDescription("");
      setAnonymous(false);

      await fetchComplaints();
    } catch (err) {
      console.error("Error submitting complaint:", err);

      setError(
        err.message || "Unable to submit complaint."
      );
    } finally {
      setSaving(false);
    }
  };

  // Faculty can resolve or reopen a complaint.
  const changeComplaintStatus = async (id, currentStatus) => {
    if (role !== "faculty" || updatingId) {
      return;
    }

    const newStatus =
      currentStatus === "Resolved" ? "Open" : "Resolved";

    const confirmed = window.confirm(
      newStatus === "Resolved"
        ? "Are you sure you want to mark this complaint as resolved?"
        : "Are you sure you want to reopen this complaint?"
    );

    if (!confirmed) return;

    setUpdatingId(id);
    setError("");

    try {
      await updateDoc(doc(db, "complaints", id), {
        status: newStatus,
      });

      await fetchComplaints();

      alert(
        newStatus === "Resolved"
          ? "Complaint resolved successfully!"
          : "Complaint reopened successfully!"
      );
    } catch (err) {
      console.error("Error updating complaint:", err);

      setError(
        err.message || "Unable to update complaint."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Anonymous Complaint Portal</h1>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      {/* STUDENT COMPLAINT FORM */}
      {role === "student" && (
        <div className="card p-4 shadow mt-3">
          <h4>Submit Complaint</h4>

          <input
            className="form-control mb-3"
            placeholder="Complaint Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="form-select mb-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Hostel">Hostel</option>
            <option value="Classroom">Classroom</option>
            <option value="Faculty">Faculty</option>
            <option value="Lab">Lab</option>
            <option value="Transport">Transport</option>
            <option value="Other">Other</option>
          </select>

          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="anonymousComplaint"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />

            <label
              className="form-check-label"
              htmlFor="anonymousComplaint"
            >
              Submit Anonymously
            </label>
          </div>

          <button
            className="btn btn-danger"
            onClick={saveComplaint}
            disabled={saving}
          >
            {saving ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      )}

      {/* COMPLAINT LIST */}
      <div className="card p-4 shadow mt-4">
        <h4>
          {role === "student"
            ? "My Complaints"
            : "Complaint List"}
        </h4>

        {loading ? (
          <p>Loading complaints...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Anonymous</th>

                  {role === "faculty" && (
                    <>
                      <th>Submitted By</th>
                      <th>Action</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.description}</td>

                      <td>
                        <span
                          className={
                            item.status === "Resolved"
                              ? "badge bg-success"
                              : "badge bg-warning text-dark"
                          }
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>{item.anonymous ? "Yes" : "No"}</td>

                      {role === "faculty" && (
                        <>
                          <td>
                            {item.anonymous
                              ? "Anonymous"
                              : item.studentEmail || "Unknown"}
                          </td>

                          <td>
                            <button
                              className={
                                item.status === "Resolved"
                                  ? "btn btn-warning btn-sm"
                                  : "btn btn-success btn-sm"
                              }
                              onClick={() =>
                                changeComplaintStatus(
                                  item.id,
                                  item.status
                                )
                              }
                              disabled={updatingId !== null}
                            >
                              {updatingId === item.id
                                ? "Updating..."
                                : item.status === "Resolved"
                                ? "Reopen Complaint"
                                : "Mark Resolved"}
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={role === "faculty" ? 7 : 5}
                      className="text-center"
                    >
                      No complaints found
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

export default Complaints;
