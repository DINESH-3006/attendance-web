import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./LoginForm";
// import TimetablePage from "./TimeTablePage";
import StudentList from "./StudentList";
import UnauthorizedPage from "./UnauthorizedPage";
import Layout from "./TimeTablePage";
// import LateAttendancePage from "./LateAttendance";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        {/* <Route path="/timetable" element={<TimetablePage />} /> */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/studentlist/:subjectId/:classId"
          element={<StudentList />}
        />
        <Route path="/teacher/*" element={<Layout />} />
        <Route
          path="/teacher/attendance/late/:classId/:subjectId/:date"
          element={<StudentList />}
        />
      </Routes>
    </Router>
  );
};

export default App;

// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Link,
//   Outlet,
// } from "react-router-dom";

// // Component for the Attendance page
// const AttendancePage = () => (
//   <div>
//     <h2>Apple</h2>
//   </div>
// );

// // Component for the StudentReport page
// const StudentReportPage = () => (
//   <div>
//     <h2>Ball</h2>
//   </div>
// );

// // Component for the navigation bar
// const NavBar = () => (
//   <nav style={{ display: "flex", flexDirection: "column", width: "200px" }}>
//     <Link
//       to="/attendance"
//       style={{ marginBottom: "10px", padding: "10px", cursor: "pointer" }}
//     >
//       Attendance
//     </Link>
//     <Link to="/studentreport" style={{ padding: "10px", cursor: "pointer" }}>
//       StudentReport
//     </Link>
//   </nav>
// );

// // Main App component
// const App = () => (
//   <Router>
//     <div style={{ display: "flex" }}>
//       <NavBar />

//       <div style={{ marginLeft: "220px", padding: "20px" }}>
//         {/* Use Routes and Route components to define the page content */}
//         <Routes>
//           <Route path="/attendance" element={<AttendancePage />} />
//           <Route path="/studentreport" element={<StudentReportPage />} />
//         </Routes>
//       </div>
//     </div>
//   </Router>
// );

// export default App;
