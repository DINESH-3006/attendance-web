import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { useTeacherStore as Teacher } from "./hooks/use-teacher";
// const moment = require("moment-timezone");
// import { setDate } from "date-fns";

const CenteredToastContainer = styled(ToastContainer)`
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
`;

const StudentList = () => {
  const { teacherid } = Teacher();
  const [students, setStudents] = useState([]);
  const { subjectId, classId, date } = useParams();
  const [attendance, setAttendance] = useState([]); // State to store attendance status
  // const [dateState, setDateState] = useState();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/subject/students/${subjectId}/${classId}`
        );
        // Sort the students array based on regno
        const sortedStudents = response.data.sort((a, b) =>
          a.regno.localeCompare(b.regno)
        );
        setStudents(sortedStudents);

        // Initialize the attendance state with false for each student
        setAttendance(Array(sortedStudents.length).fill(false));
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    if (subjectId && classId) {
      fetchStudents();
    }
  }, [subjectId, classId, date]);

  const handleCheckboxChange = (index) => {
    // Toggle the attendance status for the selected student
    const updatedAttendance = [...attendance];
    updatedAttendance[index] = !updatedAttendance[index];
    setAttendance(updatedAttendance);
  };

  // FOR SUBMITTING ATTENDANCE
  // const handleAttendanceSubmit = async () => {
  //   try {
  //     if (!date || date === null) {
  //       setDateState(new Date());
  //     } else {
  //       setDateState(new Date(date));
  //     }
  //     console.log("Date", dateState);
  //     for (let i = 0; i < students.length; i++) {
  //       const studentId = students[i]._id;
  //       const classId = students[i].class;
  //       if (dateState) {
  //         const response = await axios.post(
  //           "http://localhost:3001/updateAttendance",
  //           {
  //             dateState,
  //             teacherid,
  //             studentId,
  //             classId,
  //             subjectId,
  //             attendanceStatus: attendance[i],
  //           }
  //         );

  //         console.log(
  //           `Attendance updated for student ${studentId}:`,
  //           response.data
  //         );
  //       }
  //     }

  //     console.log("All attendance updated successfully!");
  //     toast.success("Attendance submitted successfully");
  //   } catch (error) {
  //     console.error("Error updating attendance:", error);
  //     toast.error("Server error!");
  //   }

  const handleAttendanceSubmit = async () => {
    try {
      console.log("NAVIGATION SUCCESSFULL", date);
      const formattedDate = date
        ? new Date(date).toISOString()
        : new Date().toISOString();
      console.log("DATE @ FRONT END", formattedDate);
      for (let i = 0; i < students.length; i++) {
        const studentId = students[i]._id;
        const classId = students[i].class;

        const response = await axios.post(
          "http://localhost:3001/updateAttendance",
          {
            dateState: formattedDate, // Ensure that the date is in ISO string format
            teacherid,
            studentId,
            classId,
            subjectId,
            attendanceStatus: attendance[i],
          }
        );

        console.log(
          `Attendance updated for student ${studentId}:`,
          response.data
        );
      }

      console.log("All attendance updated successfully!");
      toast.success("Attendance submitted successfully");
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Server error!");
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mt-8 mb-6 text-center text-gray-400 border-b-2 border-gray-200 pb-2">
        STUDENT LIST
      </h2>
      <table className="w-1/2 mx-auto border border-collapse border-spacing-5">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2">#</th>
            <th className="py-2">Roll No</th>
            <th className="py-2">Reg No</th>
            <th className="py-2">Student Name</th>
            <th className="py-2">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr
              key={student._id}
              className={index % 2 === 0 ? "bg-gray-100" : ""}
            >
              <td className="py-2">{index + 1}</td>
              <td className="py-2">{student.rollno}</td>
              <td className="py-2">{student.regno}</td>
              <td className="py-2">{student.name}</td>
              <td className="py-2">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    id={`attendance-${index}`}
                    checked={attendance[index]}
                    onChange={() => handleCheckboxChange(index)}
                    className="mx-2"
                  />
                  <label htmlFor={`attendance-${index}`}>Present</label>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-center">
        <button
          className="bg-green-500 text-white py-2 px-4 mt-4 rounded-md cursor-pointer"
          onClick={handleAttendanceSubmit}
        >
          Submit Attendance
        </button>
      </div>
      <CenteredToastContainer autoClose={3000} />
    </div>
  );
};

export default StudentList;
