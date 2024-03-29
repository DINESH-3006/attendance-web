import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTeacherStore as Teacher } from "./hooks/use-teacher";

const StudentReport = () => {
  // State for the selected values
  const { teacherid } = Teacher();
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState();
  const [subjectId, setSubjectId] = useState(null);
  const [studentids, setStudentIDS] = useState(null);
  const [attendanceResults, setAttendanceResults] = useState([]);

  // Options for the dropdowns
  const [yearOptions, setYearOption] = useState([]);
  const [classOptions, setClassOption] = useState([]);
  const [subjectOptions, setSubjectOption] = useState([]);

  useEffect(() => {
    const getSubjectOption = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/subject/name/${teacherid}`
        );
        setSubjectOption(response.data.subjectNames);
      } catch (err) {
        console.log(err);
      }
    };
    getSubjectOption();
  }, [teacherid]);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/class/name/${teacherid}`
        );

        if (response.data.classNamesAndYears) {
          const { classNamesAndYears } = response.data;

          // Extract class names and years into separate arrays
          const classNames = classNamesAndYears.map(
            (classInfo) => classInfo.name
          );
          const years = classNamesAndYears.map((classInfo) => classInfo.year);

          // Update state variables
          setClassOption(classNames);
          setYearOption(years);
        }
      } catch (error) {
        console.error("Error fetching class data:", error.message);
        // Handle error
      }
    };
    fetchClassData();
  }, [teacherid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get Class ID
        if (selectedClass !== "" && selectedYear !== 0) {
          console.log("SELECTED YEAR", selectedYear);
          console.log("SELECTED CLASS", selectedClass);
          const classResponse = await axios.get(
            `http://localhost:3001/teacher/class/${selectedYear}/${selectedClass}`
          );
          const fetchedClassId = classResponse.data.classId?._id;
          if (!fetchedClassId) {
            console.error("Class not found");
            setStudents([]); // Set students to empty array
            return;
          }
          setClassId(fetchedClassId);
        }
        // Get Subject ID
        if (selectedSubject !== "") {
          console.log("SELECTED SUBJECT", selectedSubject);
          const subjectResponse = await axios.get(
            `http://localhost:3001/teacher/subject/${selectedSubject}`
          );

          // Check if subjectResponse.data is defined before accessing _id
          if (subjectResponse.data) {
            const fetchedSubjectId = subjectResponse.data.subject?._id;
            if (!fetchedSubjectId) {
              console.error("Subject not found");
              setStudents([]); // Set students to empty array
              return;
            }
            setSubjectId(fetchedSubjectId);

            // Get Students
            if (subjectId != null && classId != null) {
              const studentsResponse = await axios.get(
                `http://localhost:3001/subject/students/${subjectId}/${classId}`
              );
              setStudents(studentsResponse.data);
            }
          } else {
            console.error("Subject not found");
            setStudents([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setStudents([]);
      }
    };

    fetchData();
  }, [selectedYear, selectedClass, selectedSubject, subjectId, classId]);

  useEffect(() => {
    const fetchStudentIds = async () => {
      try {
        if (subjectId !== null && classId !== null) {
          const response = await axios.get(
            `http://localhost:3001/students/id/${subjectId}/${classId}`
          );
          setStudentIDS(response.data);
        }
      } catch (error) {
        console.error("Error fetching student IDs:", error);
        throw error;
      }
    };
    fetchStudentIds();
  }, [subjectId, classId]);

  useEffect(() => {
    const studentPercentage = async () => {
      try {
        await axios
          .post("http://localhost:3001/attendancePercentage", {
            classId: classId,
            subjectId: subjectId,
            studentIds: studentids,
          })
          .then((response) => {
            setAttendanceResults(response.data);
          });
      } catch (err) {
        console.log(err);
      }
    };
    if (studentids !== null) studentPercentage();
  }, [studentids, classId, subjectId]);

  return (
    <React.Fragment>
      <div className="flex justify-between max-w-700 mx-10">
        <div className="mr-30">
          <label className="flex items-center">
            Year:
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="ml-2 p-2 border rounded-md"
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mr-30">
          <label className="flex items-center">
            Class:
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="ml-2 p-2 border rounded-md"
            >
              <option value="">Select Class</option>
              {classOptions.map((classItem) => (
                <option key={classItem} value={classItem}>
                  {classItem}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mr-30">
          <label className="flex items-center">
            Subject:
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="ml-2 p-2 border rounded-md"
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mt-10 mb-4 text-center text-gray-400 border-b-2 border-gray-200 pb-2">
          STUDENT LIST
        </h2>
        {students.length > 0 ? (
          <table className="w-full border border-collapse border-spacing-5">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">Roll No</th>
                <th className="py-2">Reg No</th>
                <th className="py-2">Student Name</th>
                <th className="py-2">Classes Attended</th>
                <th className="py-2">Total Classes</th>
                <th className="py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const attendanceData = attendanceResults.find(
                  (data) => data.studentId === student._id
                ) || { classesAttended: 0, totalClasses: 0, percentage: 0 };

                // Determine the text color based on the percentage
                const textColor =
                  attendanceData.percentage < 70 ? "text-blue-500" : "";

                return (
                  <tr
                    key={student._id}
                    className={index % 2 === 0 ? "bg-gray-100" : ""}
                  >
                    <td className="py-2 text-center">{index + 1}</td>
                    <td className="py-2 text-center">{student.rollno}</td>
                    <td className="py-2 text-center">{student.regno}</td>
                    <td className="py-2 text-center">{student.name}</td>
                    <td
                      className="py-2 text-center"
                      style={{ textAlign: "center" }}
                    >
                      {attendanceData.classesAttended}
                    </td>
                    <td className="py-2" style={{ textAlign: "center" }}>
                      {attendanceData.totalClasses}
                    </td>
                    <td
                      className={`py-2 ${textColor}`}
                      style={{ textAlign: "center" }}
                    >
                      {Math.floor(attendanceData.percentage)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No Records Found</p>
        )}
      </div>
    </React.Fragment>
  );
};

export default StudentReport;
