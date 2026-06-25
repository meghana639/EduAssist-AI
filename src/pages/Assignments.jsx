import { useEffect, useState } from "react";  //useState is used to store the data of that changes and useEffect runs code automatically
import {
  collection,   //selects the fireabase collection
  getDocs,  //reads documents from firebase
  addDoc      //adds documents to firebase
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";  //imports the database from firebaseConfig.js

function Assignments() {  //creates assignments page

  const [assignments, setAssignments] = useState([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");

  const currentUser =
    localStorage.getItem("email");  // login the mail

  const fetchAssignments = async () => {  //loads assignments from firestore

    try {

      const querySnapshot =
        await getDocs(   //reads all assignments from firebase
          collection(db, "assignments")
        );

      const data =
        querySnapshot.docs.map(
          (doc) => ({  //converts them into js objects
            id: doc.id,
            ...doc.data(),
          })
        );

      console.log(
        "Current User:",  //for debugging whether the localstorage return the correct email or not
        currentUser
      );

      console.log(
        "Firebase Data:",  // to verify firebase returning the correct data
        data
      );

      const filteredData =
        data.filter(   //filter is used to filter all the assignmets that are present to give only the user assignments
          (item) =>
            item.studentEmail ===  //filters and give the data of the current user only
            currentUser
        );

      console.log(
        "Filtered Data:",  // to verify the filter is working correctly or not
        filteredData
      );

      setAssignments(
        filteredData  //before assignments were empty now they are filled with the filtered data
      );

    } catch (error) {

      console.error(
        "Error fetching assignments:",  //above is about fetching the assignments if there is a error then it catches it and returns error
        error
      );

    }

  };

  useEffect(() => {   //useeffect runs code automatically when the page loads

    fetchAssignments();

  }, []);  //[] empty dependency array means it runs only once when the component mounts 
//without [] it would cause infinite loop
  
  const saveAssignment = async () => {  // if is done when the add assignment is done

    if (
      !title ||
      !subject ||
      !deadline   //if the above data is not there then it gives alert to fill in all the details
    ) {

      alert(
        "Please fill all fields"
      );

      return;

    }

    try {

      await addDoc(
        collection(db, "assignments"),  //it means insert into the assignments collection in firebase
        {
          title,
          subject,
          deadline,

          status: "Pending",

          createdAt:
            new Date()  //get new date and time
              .toISOString()  //to covert into the standard form
              .split("T")[0],// split them into two parts and take the first part only which contains the date

          studentEmail:
            currentUser,
        }
      );

      alert(
        "Assignment Added!"
      );

      setTitle("");
      setSubject("");  //used to fetch another new assignment
      setDeadline("");

      fetchAssignments();

    } catch (error) {

      console.error(
        "Error saving assignment:",
        error
      );

    }

  };

  return (

    <div className="container mt-4">  

      <h1>
        Assignments
      </h1>

      <div className="card p-4 shadow mt-3">

        <h4>
          Add Assignment
        </h4>

        <input
          className="form-control mb-3"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        <input
          className="form-control mb-3"
          placeholder="Subject"
          value={subject}
          onChange={(e) =>
            setSubject(
              e.target.value
            )
          }
        />

        <input
          type="date"
          className="form-control mb-3"
          value={deadline}
          onChange={(e) =>
            setDeadline(
              e.target.value
            )
          }
        />

        <button
          className="btn btn-primary"
          onClick={saveAssignment}
        >
          Add Assignment
        </button>

      </div>

      <div className="card p-4 shadow mt-4">

        <h4>
          My Assignments
        </h4>

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

              assignments.map(
                (item) => (

                  <tr key={item.id}>

                    <td>
                      {item.title}
                    </td>

                    <td>
                      {item.subject}
                    </td>

                    <td>
                      {item.deadline}
                    </td>

                    <td>
                      {item.status}
                    </td>

                    <td>
                      {item.createdAt}
                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan="5"
                  className="text-center"
                >

                  No assignments found

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default Assignments;