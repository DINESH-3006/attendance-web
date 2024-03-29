import React from "react";
import { useState } from "react";
import {
  FcAddDatabase,
  FcCheckmark,
  FcSearch,
  FcViewDetails,
} from "react-icons/fc";
import { MenuIcon, XIcon } from "lucide-react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import AttendancePage from "./AttendancePage";
import StudentReportPage from "./StudentReports";
import PendingAttendancePage from "./PendingAttendancePage";
import StudentSearch from "./components/StudentSearch";
// import SideBar from "./demo";

const routes = [
  {
    name: "Mark Attendance",
    icon: FcCheckmark,
    path: "/teacher/attendance",
  },
  {
    name: "Students Report",
    icon: FcViewDetails,
    path: "/teacher/studentreport",
  },
  {
    name: "Pending Attendance",
    icon: FcAddDatabase,
    path: "/teacher/pendingattendance",
  },
  {
    name: "Student Record",
    icon: FcSearch,
    path: "/teacher/studentrecord",
  },
];

const Layout = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <div
        className={`flex flex-col transition-width duration-300 ${
          collapsed ? "w-20" : "w-60"
        } space-y-4 border-r border-solid bg-white py-4 font-semibold shadow-lg`}
      >
        <div className="flex justify-between items-center px-3">
          <Link to="/dashboard">
            <div className="flex items-center cursor-pointer">
              {!collapsed && <h1 className="ml-4 text-2xl font-bold">PSNA</h1>}
            </div>
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-full bg-white mr-3 p-2 text-black hover:bg-gray-700 focus:outline-none"
          >
            {collapsed ? (
              <MenuIcon className="h-4 w-4" />
            ) : (
              <XIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="mt-10"></div>
        <div className="flex-1 px-3 py-2 space-y-1">
          {routes.map((route) => (
            <Link key={route.name} to={route.path}>
              <div
                className={`group flex items-center w-full mt-2 cursor-pointer justify-start rounded-lg p-3 text-sm transition hover:bg-blue-100 ${
                  pathname === route.path
                    ? "bg-blue-200 text-black"
                    : "hover:text-black"
                } transition-colors duration-200`}
              >
                {route.icon && (
                  <route.icon className="mr-2 h-5 w-5" aria-hidden="true" />
                )}
                {!collapsed && route.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <Routes>
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="studentreport" element={<StudentReportPage />} />
          <Route path="pendingattendance" element={<PendingAttendancePage />} />
          <Route path="studentrecord" element={<StudentSearch />} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
