const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const xlsx = require("xlsx");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const port = 3001;

const mongoose = require("mongoose");
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Replace with your actual connection string
const uri = "mongodb://localhost:27017/student";

// Remove the useNewUrlParser and useUnifiedTopology options
// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "teacher", "tutor", "student"],
    required: true,
  },
  // Additional user details like email, contact, etc.
});

const User = mongoose.model("User", userSchema);

const timetableSchema = new mongoose.Schema({
  teacherId: { type: String, ref: "User", required: true },
  // Assuming a 6x7 matrix for days and hours
  timetable: [
    [{ type: String, ref: "Class" }], // Represents classes for each day and hour
    // ... (repeat for 5 more days)
  ],
});

const Timetable = mongoose.model("Timetable", timetableSchema);

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  classCode: { type: String, required: true, unique: true },
  teacherId: { type: String, ref: "User" }, // Reference to the teacher in charge of the class
  tutorId: { type: String, ref: "User" }, // Reference to the tutor in charge of the class
  // Other class details like room number, etc.
});

const Class = mongoose.model("Class", classSchema);

const attendanceSchema = new mongoose.Schema({
  classId: { type: String, ref: "Class", required: true },
  date: { type: Date, default: Date.now },
  // For simplicity, assuming a boolean to mark attendance (true for present, false for absent)
  attendance: [
    {
      studentId: { type: String, ref: "User" },
      status: { type: Boolean, default: false },
    },
  ],
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

const studentListSchema = new mongoose.Schema({
  classId: { type: String, ref: "Class", required: true },
  students: [
    {
      studentId: { type: String, ref: "User" },
      firstName: String,
      lastName: String,
      email: String,
      contact: String,
    },
  ],
});

const StudentList = mongoose.model("StudentList", studentListSchema);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/admin/uploadStudentList", async (req, res) => {
  try {
    const { classId } = req.body;
    const excelFile = req.files.excelFile;

    // Read the Excel file
    const workbook = xlsx.read(excelFile.data, { type: "buffer" });

    // Assuming the first sheet contains student details
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert the sheet to JSON
    const studentsData = xlsx.utils.sheet_to_json(sheet);

    // Transform the data to the desired format
    const students = studentsData.map((studentData) => ({
      studentId: studentData["Student ID"],
      firstName: studentData["First Name"],
      lastName: studentData["Last Name"],
      email: studentData["Email"],
      contact: studentData["Contact"],
    }));

    // Update the StudentList collection using $push
    const studentList = await StudentList.findOneAndUpdate(
      { classId },
      { $push: { students: { $each: students } } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, studentList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
