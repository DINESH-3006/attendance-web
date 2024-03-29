import React, { useState } from "react";
import axios from "axios";

const UploadExcelForm = () => {
  const [file, setFile] = useState(null);
  const [classId, setClassId] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClassIdChange = (e) => {
    setClassId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("classId", classId);
    formData.append("excelFile", file);

    try {
      const response = await axios.post(
        "http://localhost:3001/admin/uploadStudentList",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <label>
        Class ID:
        <input type="text" value={classId} onChange={handleClassIdChange} />
      </label>
      <br />
      <label>
        Excel File:
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
      </label>
      <br />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadExcelForm;
