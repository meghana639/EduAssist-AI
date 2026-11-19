
import { useEffect, useState } from "react";
import {
  demoAssignments,
  demoComplaints,
} from "./demoData";

const STORAGE_KEY = "eduassist_recruiter_demo_v1";

function getInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed.assignments) &&
        Array.isArray(parsed.complaints)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Unable to load demo data:", error);
  }

  return {
    assignments: demoAssignments,
    complaints: demoComplaints,
  };
}

export default function useDemoData() {
  const [data, setData] = useState(getInitialData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Unable to save demo data:", error);
    }
  }, [data]);

  const addAssignment = (assignment) => {
    setData((previous) => ({
      ...previous,
      assignments: [
        ...previous.assignments,
        {
          ...assignment,
          id: crypto.randomUUID(),
          status: "Pending",
        },
      ],
    }));
  };

  const completeAssignment = (id) => {
    setData((previous) => ({
      ...previous,
      assignments: previous.assignments.map((assignment) =>
        assignment.id === id
          ? { ...assignment, status: "Completed" }
          : assignment
      ),
    }));
  };

  const deleteAssignment = (id) => {
    setData((previous) => ({
      ...previous,
      assignments: previous.assignments.filter(
        (assignment) => assignment.id !== id
      ),
    }));
  };

  const addComplaint = (complaint) => {
    setData((previous) => ({
      ...previous,
      complaints: [
        ...previous.complaints,
        {
          ...complaint,
          id: crypto.randomUUID(),
          status: "Open",
        },
      ],
    }));
  };

  const resolveComplaint = (id) => {
    setData((previous) => ({
      ...previous,
      complaints: previous.complaints.map((complaint) =>
        complaint.id === id
          ? { ...complaint, status: "Resolved" }
          : complaint
      ),
    }));
  };

  const resetDemo = () => {
    setData({
      assignments: [...demoAssignments],
      complaints: [...demoComplaints],
    });
  };

  return {
    assignments: data.assignments,
    complaints: data.complaints,
    addAssignment,
    completeAssignment,
    deleteAssignment,
    addComplaint,
    resolveComplaint,
    resetDemo,
  };
}
