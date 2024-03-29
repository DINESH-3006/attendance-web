import React from "react";
import { useParams } from "react-router-dom";

const LateAttendancePage = () => {
  const { classId, subjectId } = useParams();
  console.log(classId, subjectId);
  return <h1>Dinesh</h1>;
};

export default LateAttendancePage;
