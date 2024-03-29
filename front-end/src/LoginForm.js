import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTeacherStore as Teacher } from "./hooks/use-teacher";

const LoginForm = () => {
  const { teacherid, setTeacherId } = Teacher();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    console.log(`HariPrasath ${teacherid}`);
  }, [teacherid]);

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3001/teacher/login", {
        email: username,
        password: password,
      });

      console.log("Login successful:" + response.data.teacherid);
      setTeacherId(response.data.teacherid);
      navigate("/teacher/attendance");
    } catch (error) {
      console.error("Login error:", error.message);
      navigate("/unauthorized", { state: { errorMessage: "Unauthorized" } });
    } finally {
      //console.log(`HariPrasath ${id}`);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 shadow-md rounded-lg w-96">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <form>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-600">
                Username:
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-600">
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
