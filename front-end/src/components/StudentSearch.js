import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTeacherStore as Teacher } from "../hooks/use-teacher";
const moment = require("moment-timezone");

const maxDate = moment.tz(new Date(), "Asia/Kolkata").toDate();
const StudentSearch = () => {
  const { teacherid } = Teacher();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [studentRegNo, setStudentRegNo] = useState("");
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");

  const [classId, setClassId] = useState();
  const [studentId, setStudentID] = useState("");
  const [dates, setDates] = useState([]);

  //OPTIONS FOR DROP DOWN
  const [yearOptions, setYearOption] = useState([]);
  const [classOptions, setClassOption] = useState([]);

  const [flattenedData, setFlattenedData] = useState([]);

  // FETCHING THE NAME AND YEAR OF THE CLASSES FOR DYNAMIC RENDERING OF DROP DOWN

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

  // FETCHING OF CLASS ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get Class ID
        if (selectedClass !== "" && selectedYear !== 0) {
          const classResponse = await axios.get(
            `http://localhost:3001/teacher/class/${selectedYear}/${selectedClass}`
          );
          const fetchedClassId = classResponse.data.classId?._id;
          if (!fetchedClassId) {
            console.error("Class not found");
          }
          setClassId(fetchedClassId);
          console.log(classId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedYear, selectedClass, classId, fromDate, toDate, teacherid]);

  // FETCHING OF RECORDS OF A STUDENT BW THE GIVEN RANGE OF DATES
  useEffect(() => {
    const fetchData = async () => {
      try {
        let newFlattenedDataArray = [];

        for (const date of dates) {
          if (date) {
            // const formattedDate = date.toISOString().split("T")[0];
            const formattedDate = new Date(date).toISOString();
            console.log("FRONT END DATES", formattedDate);
            const response = await axios.post(
              "http://localhost:3001/attendance-details",
              {
                date: formattedDate,
                studentId: studentId._id,
                classId: classId,
              }
            );

            if (Array.isArray(response.data) && response.data.length > 0) {
              // Append the response data to the array
              // newFlattenedDataArray = [
              //   ...newFlattenedDataArray,
              //   ...response.data,
              // ];
              newFlattenedDataArray.push(response.data);
            } else {
              // If no records found, push an empty array
              newFlattenedDataArray.push([]);
            }
          }
        }

        // Update flattenedData with the new array
        await setFlattenedData(() => newFlattenedDataArray);
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      }
    };

    if (dates.length > 0) {
      fetchData();
    }
  }, [dates, studentId, classId]);

  console.log(flattenedData);
  // GETTING THE STUDENT ID AND GET THE GIVEN RANGE OF DATES
  const handleSubmit = () => {
    // GETTING THE STUDENT ID FOR GET THE DATE WISE ATTENDANCE REPORT
    const getStudentId = async () => {
      const response = await axios.post(
        "http://localhost:3001/get-student-info",
        {
          regno: studentRegNo,
        }
      );
      setStudentID(response.data);
      console.log(response.data);
    };

    if (studentRegNo !== "") getStudentId();

    // GET DATES BW FROM AND TO DATE

    const generateDateArray = async () => {
      const generatedDates = [];

      // Assuming fromDate and toDate are in the format "YYYY-MM-DD"
      const startDate = moment.tz(fromDate, "Asia/Kolkata");
      const endDate = moment.tz(toDate, "Asia/Kolkata");

      let currentDate = startDate.clone();

      while (currentDate.isSameOrBefore(endDate, "day")) {
        generatedDates.push(currentDate.toDate());
        currentDate.add(1, "days");
      }

      await setDates(generatedDates);
    };

    generateDateArray();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">From Date:</label>
          <DatePicker
            className="w-full px-3 py-2 border rounded"
            selected={fromDate}
            maxDate={maxDate}
            onChange={(date) => {
              setFromDate(date);
            }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">To Date:</label>
          <DatePicker
            className="w-full px-3 py-2 border rounded"
            selected={toDate}
            maxDate={maxDate}
            onChange={(date) => {
              setToDate(date);
            }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Student ID:
          </label>
          <input
            type="text"
            value={studentRegNo}
            onChange={(e) => {
              setStudentRegNo(e.target.value);
            }}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4 mr-4">
          <label className="block text-sm font-semibold mb-1">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Class</option>
            {classOptions.map((classItem) => (
              <option key={classItem} value={classItem}>
                {classItem}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-10">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="mb-10">
        {studentId && (
          <div className="bg-white p-4 rounded shadow-md text-center">
            <h3 className="text-xl font-semibold mb-2">Student Information</h3>
            <div className="flex flex-row justify-around">
              <p className="mb-2">
                <span className="font-semibold">Name:</span> {studentId.name}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Email:</span> {studentId.email}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Roll No:</span>{" "}
                {studentId.rollno}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Reg No:</span> {studentRegNo}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap -mx-4">
        {(() => {
          const elements = [];

          for (let i = 0; i < dates.length; i++) {
            elements.push(
              <div className="w-full md:w-1/3 px-4 mb-4" key={i}>
                <div className="bg-white bg-opacity-50 p-6 rounded-lg shadow-md flex-1 hover:bg-gray-100 hover:scale-110 transition-transform">
                  <p className="font-bold">{dates[i].toDateString()}</p>
                  {flattenedData[i] && flattenedData[i].length > 0 ? (
                    flattenedData[i].map((element, j) => (
                      <div className="border-t-2 border-gray-300" key={j}>
                        {element.status.map((status, k) => (
                          <div
                            className="border-t-1 border-blue-200 w-full md:w-60 flex justify-around flex-shrink-0"
                            key={k}
                          >
                            <p className="font-medium text-gray-600">
                              {element.subjectName}
                            </p>
                            {status ? (
                              <p className="text-green-600 font-medium">
                                Present
                              </p>
                            ) : (
                              <p className="text-red-600 font-medium">Absent</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="border-t-2 border-grey-200 w-full md:w-60 flex justify-around">
                      <p className="font-medium text-gray-600">
                        No Record Found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return elements;
        })()}
      </div>
    </div>
  );
};

export default StudentSearch;
