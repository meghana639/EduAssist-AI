import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

function Complaints() {

  const role =
    localStorage.getItem("role");

  const currentUser =
    localStorage.getItem("email");

  const [complaints, setComplaints] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [anonymous, setAnonymous] =
    useState(false);

  useEffect(() => {

    fetchComplaints();

  }, []);

  const fetchComplaints = async () => {

    try {

      const querySnapshot =
        await getDocs(
          collection(db, "complaints")
        );

      const data =
        querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      if (role === "faculty") {

        setComplaints(data);

      } else {

        const filtered =
          data.filter(
            (item) =>
              item.studentEmail ===
              currentUser
          );

        setComplaints(filtered);

      }

    } catch (error) {

      console.error(
        "Error fetching complaints:",
        error
      );

    }

  };

  const saveComplaint = async () => {

    if (
      !title ||
      !category ||
      !description
    ) {

      alert(
        "Please fill all fields"
      );

      return;

    }

    try {

      await addDoc(
        collection(db, "complaints"),
        {
          title,
          category,
          description,

          anonymous,

          status: "Open",

          studentEmail:
            currentUser
        }
      );

      alert(
        "Complaint Submitted!"
      );

      setTitle("");
      setCategory("");
      setDescription("");
      setAnonymous(false);

      fetchComplaints();

    } catch (error) {

      console.error(
        "Error saving complaint:",
        error
      );

    }

  };

  const resolveComplaint =
    async (id) => {

      try {

        await updateDoc(
          doc(
            db,
            "complaints",
            id
          ),
          {
            status:
              "Resolved"
          }
        );

        alert(
          "Complaint Resolved!"
        );

        fetchComplaints();

      } catch (error) {

        console.error(
          "Error updating complaint:",
          error
        );

      }

    };

  return (

    <div className="container mt-4">

      <h1>
        Anonymous Complaint Portal
      </h1>

      {/* Student Form */}

      {role === "student" && (

        <div className="card p-4 shadow mt-3">

          <h4>
            Submit Complaint
          </h4>

          <input
            className="form-control mb-3"
            placeholder="Complaint Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <select
            className="form-select mb-3"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >

            <option value="">
              Select Category
            </option>

            <option>
              Hostel
            </option>

            <option>
              Classroom
            </option>

            <option>
              Faculty
            </option>

            <option>
              Lab
            </option>

            <option>
              Transport
            </option>

            <option>
              Other
            </option>

          </select>

          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          ></textarea>

          <div className="form-check mb-3">

            <input
              className="form-check-input"
              type="checkbox"
              checked={anonymous}
              onChange={(e) =>
                setAnonymous(
                  e.target.checked
                )
              }
            />

            <label className="form-check-label">

              Submit Anonymously

            </label>

          </div>

          <button
            className="btn btn-danger"
            onClick={saveComplaint}
          >
            Submit Complaint
          </button>

        </div>

      )}

      {/* Complaint List */}

      <div className="card p-4 shadow mt-4">

        <h4>
          Complaint List
        </h4>

        <table className="table table-bordered table-striped">

          <thead>

            <tr>

              <th>Title</th>

              <th>Category</th>

              <th>Description</th>

              <th>Status</th>

              <th>Anonymous</th>

              {role === "faculty" && (
                <th>Action</th>
              )}

            </tr>

          </thead>

          <tbody>

            {complaints.length > 0 ? (

              complaints.map(
                (item) => (

                  <tr key={item.id}>

                    <td>
                      {item.title}
                    </td>

                    <td>
                      {item.category}
                    </td>

                    <td>
                      {item.description}
                    </td>

                    <td>

                      {item.status}

                    </td>

                    <td>

                      {item.anonymous
                        ? "Yes"
                        : "No"}

                    </td>

                    {role === "faculty" && (

                      <td>

                        {item.status ===
                        "Resolved" ? (

                          <span className="badge bg-success">

                            Resolved

                          </span>

                        ) : (

                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              resolveComplaint(
                                item.id
                              )
                            }
                          >

                            Mark Resolved

                          </button>

                        )}

                      </td>

                    )}

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan={
                    role ===
                    "faculty"
                      ? 6
                      : 5
                  }
                  className="text-center"
                >

                  No complaints found

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default Complaints;