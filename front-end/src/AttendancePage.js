import axios from "axios";
import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTeacherStore as Teacher } from "./hooks/use-teacher";

const AttendancePage = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const { timetableData, teacherData } = location.state || {};
  const [timetableData, setTimeTableData] = useState();
  const [teacherData, setTeacherData] = useState();
  const teacherId = teacherData ? teacherData._id : null;
  const { teacherid } = Teacher();
  useEffect(() => {
    const fetchTimeTable = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/teacher/${teacherid}`
        );
        console.log(response.data);
        setTimeTableData(response.data.timetable);
        setTeacherData(response.data.teacher);
      } catch (err) {
        console.log(err);
      }
    };
    fetchTimeTable();
  }, [teacherid]);

  const handleSubject = async (subjectId, teacherId) => {
    try {
      const response1 = await axios.get(
        `http://localhost:3001/intersection/${teacherId}/${subjectId}`
      );
      const classId = response1.data.classId;

      if (subjectId && classId) {
        console.log("AfterNavigationSubjectId", subjectId);
        console.log("AfterNavigationclassId", classId);
        navigate(`/studentlist/${subjectId}/${classId}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mt-8 mb-6 text-center text-gray-400 border-b-2 border-gray-200 pb-2">
        TIME TABLE
      </h2>
      {timetableData && (
        <table className="w-1/2 mx-auto border border-collapse border-spacing-5">
          <thead>
            <tr>
              <th className="py-2">
                <strong>Days</strong>
              </th>
              <th colSpan={3} className="py-2">
                <strong>Subjects</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            {timetableData.map((obj, objIndex) => (
              <React.Fragment key={objIndex}>
                {obj.periods.map((day, dayIndex) => (
                  <tr key={`${objIndex}-${dayIndex}`}>
                    <td className="border py-2">
                      <strong>{day.name}</strong>
                    </td>
                    {day.subjects.map((subject, subjectIndex) => (
                      <td
                        key={`${objIndex}-${dayIndex}-${subjectIndex}`}
                        className="border"
                      >
                        <button
                          className="outline-none border-none bg-white cursor-pointer"
                          onClick={() => handleSubject(subject._id, teacherId)}
                        >
                          <span className="mr-5 px-4 py-2">{subject.name}</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendancePage;
