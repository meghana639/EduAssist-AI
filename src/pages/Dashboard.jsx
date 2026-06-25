import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function Dashboard() {

  const role =
    localStorage.getItem("role");

  const currentUser =
    localStorage.getItem("email");

  const [totalAssignments, setTotalAssignments] =
    useState(0);

  const [pendingAssignments, setPendingAssignments] =
    useState(0);

  const [completedAssignments, setCompletedAssignments] =
    useState(0);

  const [totalComplaints, setTotalComplaints] =
    useState(0);

  const [priorityAssignment, setPriorityAssignment] =
    useState("No Assignments");

  useEffect(() => {

    fetchDashboardData();

  }, []);

  const fetchDashboardData = async () => {

    try {

      // ASSIGNMENTS

      const assignmentSnapshot =
        await getDocs(
          collection(db, "assignments")
        );

      const assignmentData =
        assignmentSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      const filteredAssignments =
        role === "faculty"
          ? assignmentData
          : assignmentData.filter(
              (item) =>
                item.studentEmail ===
                currentUser
            );

      setTotalAssignments(
        filteredAssignments.length
      );

      const pending =
        filteredAssignments.filter(
          (item) =>
            item.status === "Pending"
        );

      setPendingAssignments(
        pending.length
      );

      const completed =
        filteredAssignments.filter(
          (item) =>
            item.status === "Completed"
        );

      setCompletedAssignments(
        completed.length
      );

      if (pending.length > 0) {

        pending.sort(
          (a, b) =>
            new Date(a.deadline) -
            new Date(b.deadline)
        );

        setPriorityAssignment(
          pending[0].title
        );

      }

      // COMPLAINTS

      const complaintSnapshot =
        await getDocs(
          collection(db, "complaints")
        );

      const complaintData =
        complaintSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      const filteredComplaints =
        role === "faculty"
          ? complaintData
          : complaintData.filter(
              (item) =>
                item.studentEmail ===
                currentUser
            );

      setTotalComplaints(
        filteredComplaints.length
      );

    } catch (error) {

      console.error(
        "Dashboard Error:",
        error
      );

    }

  };

  return (

    <div className="container mt-4">

      <h1>EduAssist AI</h1>

      <p>
        AI-Powered Academic Tracking &
        Student Support Platform
      </p>

      <p>

        Logged in as:

        <strong>

          {" "}
          {role === "faculty"
            ? "Faculty"
            : "Student"}

        </strong>

      </p>

      {/* FACULTY DASHBOARD */}

      {role === "faculty" ? (

        <>

          <div className="row">

            <div className="col-md-6">

              <div className="card p-3 shadow">

                <h5>
                  Total Complaints
                </h5>

                <h2>
                  {totalComplaints}
                </h2>

              </div>

            </div>

            <div className="col-md-6">

              <div className="card p-3 shadow">

                <h5>
                  Faculty Portal
                </h5>

                <h2>
                  Active
                </h2>

              </div>

            </div>

          </div>

          <div className="card mt-4 shadow">

            <div className="card-body">

              <h4>
                👨‍🏫 Faculty Dashboard
              </h4>

              <p>

                Review student
                complaints and
                resolve issues.

              </p>

              <ul>

                <li>
                  View all complaints
                </li>

                <li>
                  Mark complaints
                  resolved
                </li>

                <li>
                  Monitor student
                  issues
                </li>

              </ul>

            </div>

          </div>

        </>

      ) : (

        /* STUDENT DASHBOARD */

        <>

          <div className="row">

            <div className="col-md-3">

              <div className="card p-3 shadow">

                <h5>
                  Total Assignments
                </h5>

                <h2>
                  {totalAssignments}
                </h2>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card p-3 shadow">

                <h5>
                  Pending
                </h5>

                <h2>
                  {pendingAssignments}
                </h2>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card p-3 shadow">

                <h5>
                  Completed
                </h5>

                <h2>
                  {completedAssignments}
                </h2>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card p-3 shadow">

                <h5>
                  Complaints
                </h5>

                <h2>
                  {totalComplaints}
                </h2>

              </div>

            </div>

          </div>

          <div className="card mt-4 shadow">

            <div className="card-body">

              <h4>
                🤖 AI Smart Reminder
              </h4>

              <p>

                You have{" "}
                {pendingAssignments}{" "}
                pending assignments.

              </p>

              <p>

                <strong>
                  Highest Priority:
                </strong>

                <br />

                {priorityAssignment}

              </p>

              <p>

                <strong>
                  Suggested Plan:
                </strong>

                <br />

                Complete{" "}
                {priorityAssignment}{" "}
                first and then
                continue with
                remaining assignments.

              </p>

            </div>

          </div>

          <div className="card mt-4 shadow">

            <div className="card-body">

              <h4>
                📈 AI Workload Analysis
              </h4>

              <p>

                Based on your
                current records,
                you have{" "}
                {pendingAssignments}
                {" "}pending assignments
                and{" "}
                {totalComplaints}
                {" "}active complaints.

              </p>

              <p>

                <strong>

                  Workload Level:

                  {" "}

                  {pendingAssignments >= 5
                    ? "High"
                    : pendingAssignments >= 3
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