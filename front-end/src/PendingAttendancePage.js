import React, { useState, useEffect } from "react";
import { useTeacherStore as Teacher } from "./hooks/use-teacher";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
const moment = require("moment-timezone");

const PendingAttendancePage = () => {
  const navigate = useNavigate();
  // State for the selected values
  const { teacherid } = Teacher();
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  // const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState();
  const [subjectId, setSubjectId] = useState(null);
  // const [studentids, setStudentIDS] = useState(null);
  // const [attendanceResults, setAttendanceResults] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dates, setDates] = useState([]);

  // Options for the dropdowns
  const [yearOptions, setYearOption] = useState([]);
  const [classOptions, setClassOption] = useState([]);
  const [subjectOptions, setSubjectOption] = useState([]);

  const maxDate = moment.tz(new Date(), "Asia/Kolkata").toDate();

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
            }
            setSubjectId(fetchedSubjectId);

            // Get Students
            if (subjectId != null && classId != null) {
              // const studentsResponse = await axios.get(
              //   `http://localhost:3001/subject/students/${subjectId}/${classId}`
              // );
              // setStudents(studentsResponse.data);

              // GETTING THE MISSING DATES
              const collectDates = await axios.post(
                "http://localhost:3001/attendance/pending",
                {
                  teacherId: teacherid,
                  fromDate: fromDate,
                  toDate: toDate,
                  classId: classId,
                  subjectId: subjectId,
                }
              );
              console.log("Dates", collectDates.data);
              setDates(collectDates.data);
            }
          } else {
            console.error("Subject not found");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    selectedYear,
    selectedClass,
    selectedSubject,
    subjectId,
    classId,
    fromDate,
    toDate,
    teacherid,
  ]);

  // NAVIGATE TO ATTENDANCE PAGE WITH DATE,CLASS ID,SUBJECT ID
  const handleButtonClick = (date) => {
    // Assuming you want to navigate to "/teacher/attendance/late" with parameters
    const url = `/teacher/attendance/late/${classId}/${subjectId}/${date}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col justify-around p-2">
      <div className="mb-2">
        <h2 className="text-md font-semibold">Attendance Report</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center mb-1">
          <label htmlFor="fromDate" className="mr-1 text-xs">
            From Date:
          </label>
          <DatePicker
            id="fromDate"
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            maxDate={maxDate}
            className="border border-gray-300 rounded px-1 py-1 text-xs"
          />
        </div>

        <div className="flex items-center mb-1">
          <label htmlFor="toDate" className="mr-1 text-xs">
            To Date:
          </label>
          <DatePicker
            id="toDate"
            selected={toDate}
            onChange={(date) => setToDate(date)}
            maxDate={maxDate}
            className="border border-gray-300 rounded px-1 py-1 text-xs"
          />
        </div>

        <div className="flex items-center mb-1 mr-2">
          <label htmlFor="year" className="mr-1 text-xs">
            Year:
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded px-1 py-1 text-xs"
          >
            <option value="">Select Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center mb-1 mr-2">
          <label htmlFor="class" className="mr-1 text-xs">
            Class:
          </label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded px-1 py-1 text-xs"
          >
            <option value="">Select Class</option>
            {classOptions.map((classItem) => (
              <option key={classItem} value={classItem}>
                {classItem}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center mb-1">
          <label htmlFor="subject" className="mr-1 text-xs">
            Subject:
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-gray-300 rounded px-1 py-1 text-xs"
          >
            <option value="">Select Subject</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>
      <h2 className="text-3xl font-bold mt-8 mb-4 text-center text-gray-400 border-b-2 border-gray-200 pb-2">
        Date List
      </h2>

      <div className="flex flex-wrap -mx-2">
        {dates.map((date, index) => (
          <div key={index} className="w-1/5 p-2">
            <button
              className="relative w-full h-28 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-200 hover:text-black shadow-md transform hover:scale-110 transition-transform"
              onClick={() => handleButtonClick(new Date(date))}
            >
              <div className="absolute inset-0 bg-blue-600 opacity-0 transition-opacity"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-bold">
                <div>{format(new Date(date), "dd-MM-yyyy")}</div>
                <div className="text-gray-500">
                  {format(new Date(date), "EEE")}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingAttendancePage;
