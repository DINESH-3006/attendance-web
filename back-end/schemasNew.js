const mongoose = require("mongoose");

// SUBJECT SCHEMA
const subjectSchema = new mongoose.Schema({
  name: String,
  code: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  class: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
});

const Subject = mongoose.model("Subjects", subjectSchema);

// CLASS SCHEMA
const classSchema = new mongoose.Schema({
  name: String,
  year: Number,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  teacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
});

const Class = mongoose.model("Class", classSchema);
// TEACHER SCHEMA
const teacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subjects" }],
  timetable: [{ type: mongoose.Schema.Types.ObjectId, ref: "Timetable" }],
  class: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
});

const Teacher = mongoose.model("Teacher", teacherSchema);

// TUTOR SCHEMA
const tutorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

const Tutor = mongoose.model("Tutor", tutorSchema);

// STUDENT SCHEMA
const studentSchema = new mongoose.Schema({
  name: String,
  rollno: String,
  regno: String,
  email: String,
  password: String,
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subjects" }],
});

const Student = mongoose.model("Student", studentSchema);

// ADMIN SCHEMA
const adminSchema = new mongoose.Schema({
  // Add relevant fields for admin
});

const Admin = mongoose.model("Admin", adminSchema);

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  date: { type: Date, default: Date.now },
  attendance: [
    {
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status: [{ type: Boolean, default: false }],
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" },
    },
  ],
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

// TIME TABLE SCHEMA
const timetableSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  days: [
    {
      name: String,
      periods: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" }, // Period 1
        { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" }, // Period 2
        { type: mongoose.Schema.Types.ObjectId, ref: "Subjects" }, // Period 3
      ],
    },
    // ... Add more days as needed
  ],
});

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = {
  Class,
  Subject,
  Teacher,
  Tutor,
  Student,
  Admin,
  Attendance,
  Timetable,
};
